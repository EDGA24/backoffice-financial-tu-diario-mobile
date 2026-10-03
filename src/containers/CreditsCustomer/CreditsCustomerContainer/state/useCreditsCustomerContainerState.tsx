import { useRef, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { useLocation, useNavigate } from 'react-router-dom';
import type { IFormProps } from '@/shared/interfaces/IFormProps';
import type { Aval, Contact, Customers } from '@/types/Customers';
import type { AvalFieldProps } from '@/components/molecules/mobile/AvalField/AvalField';
import { CreationStatus, type Credits } from '@/types/Credits';
import type { LoanSummary } from '@/components/molecules/mobile/DashboardContacTable/DashboardContacTable';
import { get } from 'lodash';
import { useCreditStore, type CustomerSearchResult } from '@/stores/credits.store';
import { useAuthStore } from '@/stores/auth.store';
import { NAV_ROUTES } from '@/shared/constants/navRoutes';
import type { TransactionOverlayStatus } from '@/components/molecules/mobile/TransactionStatusOverlay/TransactionStatusOverlay';
import type { TrackRowState } from '@/components/molecules/mobile/ProcessTracking/ProcessTracking';
import type { FirstChargeErrorStage } from '@/components/molecules/mobile/FirstChargeFlowModal/FirstChargeFlowModal';
import { PaymentCategoryEnum } from '@/shared/constants/PaymentCategoryEnum';
import { openWhatsApp, buildCreditWhatsAppMessage, getChargeFrequencyLabel } from '@/shared/utils/whatsappUtils';

// Cuánto espera el autocomplete de clientes después de la última tecla antes
// de buscar en el backend (evita un request por cada letra).
const CUSTOMER_SEARCH_DEBOUNCE_MS = 300;
// El backend no aplica tope propio en este endpoint — este es el único límite.
const CUSTOMER_SEARCH_LIMIT = 20;
// Mínimo que se muestra el "cargando" aunque el backend responda al instante.
const MIN_LOADING_OVERLAY_MS = 500;
// Cuánto se queda el "¡Operación exitosa!" (overlay genérico) antes de dar
// paso al ticket con el desglose del crédito — sin esto el cambio se sentía
// instantáneo, como si se saltara directo al ticket sin avisar el éxito.
const SUCCESS_FLASH_DURATION_MS = 1300;
// Todo crédito recién creado queda pendiente de aprobación (ver comentario en
// el bloque de éxito de handleOnSaveCredit) — mismo texto en el ticket visual
// y en el mensaje de WhatsApp, para que no queden desincronizados.
const CREDIT_PENDING_STATUS_LABEL = 'En proceso de aprobación';
// Proceso crédito + primer pago (FirstChargeFlowModal): mínimo que se queda
// "activo" cada paso aunque el backend responda al instante (mismo criterio
// que MIN_PAGO_DURATION_MS en RenewalFlowModal), y cuánto se ve el check
// final antes de pasar al ticket.
const MIN_FIRST_CHARGE_STEP_MS = 1800;
const FIRST_CHARGE_DONE_DELAY_MS = 900;

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

interface RenovacionNavigationState {
    modo?: string;
    loan?: LoanSummary;
}


export interface CreditSuccessTicketData {
    customerName: string;
    creditAmount: number;
    chargeAmount: number;
    chargeFrequencyLabel: string;
    chargePeriods: number;
    createdAt: number;
    status: string;
    whatsappPhone: string;
    whatsappMessage: string;
    // Solo se llena si se registró el primer pago (regla con firstCharge).
    firstChargeAmount?: number;
}

// Estado del proceso crédito + primer pago (regla de cobro con firstCharge,
// nuevo o renovación) — lo pinta FirstChargeFlowModal.
interface FirstChargeFlowState {
    open: boolean;
    rowCredito: TrackRowState;
    rowPago: TrackRowState;
    error: string | null;
    errorStage: FirstChargeErrorStage;
    amount: number;
    // Ids del crédito recién creado (y el nombre del cliente para la
    // descripción) — se guardan para poder reintentar solo el pago sin
    // volver a crear el crédito.
    creditId: string;
    customerId: string;
    customerName: string;
}

const FIRST_CHARGE_FLOW_INITIAL: FirstChargeFlowState = {
    open: false,
    rowCredito: 'pending',
    rowPago: 'pending',
    error: null,
    errorStage: null,
    amount: 0,
    creditId: '',
    customerId: '',
    customerName: '',
};

export interface CustomerSummary {
    optionId: string;
    name: string;
    lastName: string;
    address: string;
    status: string;
    phoneNumber: string;
    threeWordsUbication: string;
}

export interface IUseCreditsCustomerContainerState {
    loadingSave: boolean;
    creditOverlayStatus: TransactionOverlayStatus;
    creditError: string | null;
    clearCreditError: () => void;
    isExistingCustomer: boolean;
    isRenewal: boolean;
    handleOnSaveCredit: () => void;

    // Ticket del crédito recién creado — showCreditTicket solo se activa
    // después del "flash" de éxito del overlay genérico (ver SUCCESS_FLASH_DURATION_MS).
    creditSuccessTicket: CreditSuccessTicketData | null;
    showCreditTicket: boolean;
    canSendCreditWhatsApp: boolean;
    handleSendCreditWhatsApp: () => void;
    handleContinueAfterCredit: () => void;

    // Proceso crédito + primer pago (FirstChargeFlowModal)
    firstChargeFlow: {
        open: boolean;
        customerName: string;
        isRenewal: boolean;
        firstChargeAmount: number;
        rowCredito: TrackRowState;
        rowPago: TrackRowState;
        error: string | null;
        errorStage: FirstChargeErrorStage;
        onClose: () => void;
        onRetryPayment: () => void;
        onContinue: () => void;
    };

    customerSelector: {
        value: string;
        onChange: (value: string | undefined) => void;
        onInputChange: (text: string) => void;
        loading: boolean;
        options: { optionId: string; label: string }[];
        summary?: CustomerSummary;
    };

    // Aval del cliente nuevo: botón + hoja inferior con su formulario
    avalField: AvalFieldProps;

    customer: IFormProps<Customers>;

    credit: IFormProps<Credits> & {
        setValue: any;
        initialChargeFrequency?: string;
    };
}

// Convierte un resultado real del backend (CustomerSearchResult) al shape
// que ya usa el resto de la pantalla (CustomerSummaryCard, etc.).
// Quita espacios al inicio/final y espacios dobles de los datos de contacto
// (cliente y aval) antes de mandarlos — ej. "Edgar " -> "Edgar". La
// ubicación GPS se deja tal cual.
const cleanText = (value?: string): string => (value ?? '').trim().replace(/\s+/g, ' ');
const trimContact = (contact: Contact): Contact => ({
    ...contact,
    name: cleanText(contact.name),
    lastName: cleanText(contact.lastName),
    address: cleanText(contact.address),
    phoneNumber: cleanText(contact.phoneNumber),
});

const mapCustomerResultToSummary = (customer: CustomerSearchResult): CustomerSummary => ({
    optionId: customer._id,
    name: get(customer, 'contact.name', ''),
    lastName: get(customer, 'contact.lastName', ''),
    address: get(customer, 'contact.address', ''),
    status: customer.status ?? '',
    phoneNumber: get(customer, 'contact.phoneNumber', ''),
    threeWordsUbication: customer.threeWordsUbication ?? '',
});

export const useCreditsCustomerContainerState = (): IUseCreditsCustomerContainerState => {
    const location = useLocation();
    const navigate = useNavigate();
    const { modo, loan: renewalLoan } = (location.state ?? {}) as RenovacionNavigationState;
    const isRenewal = modo === 'renovacion' && Boolean(renewalLoan);

    const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
    const [loadingSave, setLoadingSave] = useState(false);
    const [creditOverlayStatus, setCreditOverlayStatus] = useState<TransactionOverlayStatus>(null);
    const [creditError, setCreditError] = useState<string | null>(null);
    // Se llena justo al confirmarse la creación del crédito, con todo lo que
    // necesita el ticket visual de éxito (desglose + mensaje de WhatsApp).
    const [creditSuccessTicket, setCreditSuccessTicket] = useState<CreditSuccessTicketData | null>(null);
    // Controla cuándo aparece el ticket — se activa recién después del "flash"
    // de éxito del overlay genérico, no al mismo tiempo.
    const [showCreditTicket, setShowCreditTicket] = useState(false);
    const [firstChargeFlow, setFirstChargeFlow] = useState<FirstChargeFlowState>(FIRST_CHARGE_FLOW_INITIAL);

    // Autocomplete de "cliente existente" — resultados reales del cobrador
    // autenticado, buscados con debounce mientras se teclea.
    const [customerSearchResults, setCustomerSearchResults] = useState<CustomerSearchResult[]>([]);
    const [customerSearchLoading, setCustomerSearchLoading] = useState(false);
    const customerSearchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Aval: el formulario de la hoja inferior es un borrador; solo al dar
    // "Aceptar" (y pasar validación) se guarda en acceptedAval, que es lo que
    // se manda al crear el crédito. Cerrar la hoja descarta el borrador.
    const [avalSheetOpen, setAvalSheetOpen] = useState(false);
    const [acceptedAval, setAcceptedAval] = useState<Aval | null>(null);
    // Cliente existente elegido como aval en el buscador de la hoja ('' = aval capturado a mano)
    const [avalCustomerId, setAvalCustomerId] = useState<string>('');
    // Buscador propio del aval (separado del de "cliente existente" para no
    // pisar sus resultados).
    const [avalSearchResults, setAvalSearchResults] = useState<CustomerSearchResult[]>([]);
    const [avalSearchLoading, setAvalSearchLoading] = useState(false);
    const avalSearchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const { createCredit, createPayment, searchCustomersByEmployee } = useCreditStore();
    const creditorCompanyId = useAuthStore((state) => state.user?.creditorCompanyId ?? '');
    const userId = useAuthStore((state) => state.user?._id ?? '');
    // Número de WhatsApp de la empresa acreedora del trabajador logueado — ya
    // viene resuelto por el backend en el login según creditorCompanyId (JWT),
    // así que es automáticamente el correcto sin importar la empresa.
    const companyWhatsAppPhone = useAuthStore((state) => state.user?.creditorCompanyInfo?.phoneNumber ?? '');

    const {
        control: controlCustomer,
        formState: { errors: errorsCustomer },
        trigger: triggerCustomer,
    } = useForm<Customers>({
        // onChange: sin esto, como el form no usa handleSubmit (isSubmitted
        // nunca se activa), react-hook-form se salta la validación en cada
        // tecleo por completo con el modo default ('onSubmit') — un campo
        // marcado en rojo por trigger() se quedaría así para siempre aunque
        // lo llenes, porque nunca se vuelve a evaluar.
        mode: 'onChange',
        defaultValues: {
            contact: {
                name: '',
                lastName: '',
                phoneNumber: '',
                address: '',
            },
            created: Date.now(),
            creditorCompanyId,
            status: 'Active',
            threeWordsUbication: '',
            userId,
        },
    });

    const {
        control: controlCredit,
        formState: { errors: errorsCredit },
        setValue: setValueCredit,
        trigger: triggerCredit,
    } = useForm<Credits>({
        // onChange (no onBlur): mismo motivo que controlCustomer arriba — como
        // este form no usa handleSubmit, con 'onBlur' un campo marcado en rojo
        // por trigger() solo se revalidaba al perder el foco, no mientras
        // tecleas, así que el rojo se quedaba pegado hasta que tabularas fuera.
        mode: 'onChange',
        defaultValues: {
            creditorCompanyId: renewalLoan?.creditorCompanyId ?? creditorCompanyId,
            customerId: renewalLoan?.customerId ?? '',
            userId: renewalLoan?.employeeId ?? userId,
            admissionDate: Date.now(),
            created: Date.now(),
            creditAmount: 0,
            creditAmountWithMoratory: 0,
            expirationDate: Date.now(),
            fixedCharge: 0,
            startDateChargeConfig: Date.now(),
            status: 'Active',
            chargeRules: {
                chargeFrequency: 'weekly',
                chargePeriods: 1,
                comissionRate: 0,
                renovationPeriod: 0,
            },
        },
    });

    const AVAL_FORM_DEFAULTS: Aval = { contact: { name: '', lastName: '', address: '', phoneNumber: '' } };
    const {
        control: controlAval,
        formState: { errors: errorsAval },
        trigger: triggerAval,
        getValues: getValuesAval,
        setValue: setValueAval,
        reset: resetAval,
    } = useForm<Aval>({
        // onChange: mismo motivo que controlCustomer arriba
        mode: 'onChange',
        defaultValues: AVAL_FORM_DEFAULTS,
    });

    const customerFormState = useWatch({ control: controlCustomer });
    const creditFormState = useWatch({ control: controlCredit });

    const handleChangeSelectedCustomer = (value: string | undefined) => {
        setSelectedCustomerId(value ?? '');
    };

    // Búsqueda en vivo del autocomplete de clientes — espera CUSTOMER_SEARCH_DEBOUNCE_MS
    // desde la última tecla antes de consultar el backend (solo trae los
    // clientes del cobrador autenticado, topado a CUSTOMER_SEARCH_LIMIT).
    const handleSearchCustomerInput = (text: string) => {
        if (customerSearchDebounceRef.current) clearTimeout(customerSearchDebounceRef.current);

        customerSearchDebounceRef.current = setTimeout(async () => {
            setCustomerSearchLoading(true);
            try {
                const { records } = await searchCustomersByEmployee({
                    filtersItems: { generalSearch: text.trim() || undefined },
                    pagination: { limit: CUSTOMER_SEARCH_LIMIT, pageNumber: 0 },
                });
                setCustomerSearchResults(records);
            } catch (error) {
                console.error('Error al buscar clientes:', error);
                setCustomerSearchResults([]);
            } finally {
                setCustomerSearchLoading(false);
            }
        }, CUSTOMER_SEARCH_DEBOUNCE_MS);
    };

    // ---------------- Aval ----------------

    // Abre la hoja con lo último que se aceptó (o vacía) — así "Editar aval"
    // muestra los datos ya capturados para corregirlos.
    const handleOpenAvalSheet = () => {
        resetAval(acceptedAval ?? AVAL_FORM_DEFAULTS);
        setAvalCustomerId(acceptedAval?.customerId ?? '');
        setAvalSheetOpen(true);
    };

    // Cerrar sin aceptar descarta el borrador; el aval aceptado se queda igual.
    const handleCloseAvalSheet = () => setAvalSheetOpen(false);

    // "Limpiar" / "Quitar aval": vacía el formulario y quita el aval aceptado.
    const handleClearAval = () => {
        resetAval(AVAL_FORM_DEFAULTS);
        setAvalCustomerId('');
        setAcceptedAval(null);
    };

    const handleAcceptAval = async () => {
        const valid = await triggerAval();
        if (!valid) return;
        setAcceptedAval({
            ...(avalCustomerId ? { customerId: avalCustomerId } : {}),
            contact: trimContact(getValuesAval('contact')),
        });
        setAvalSheetOpen(false);
    };

    // Elegir un cliente existente como aval: rellena sus datos de contacto
    // (se pueden corregir a mano). Quitar la selección deja lo capturado.
    const handleSelectAvalCustomer = (value: string | undefined) => {
        setAvalCustomerId(value ?? '');
        const selected = avalSearchResults.find((customer) => customer._id === value);
        if (!selected) return;
        const fill = { shouldValidate: true, shouldDirty: true };
        setValueAval('contact.name', get(selected, 'contact.name', ''), fill);
        setValueAval('contact.lastName', get(selected, 'contact.lastName', ''), fill);
        setValueAval('contact.address', get(selected, 'contact.address', ''), fill);
        setValueAval('contact.phoneNumber', get(selected, 'contact.phoneNumber', ''), fill);
    };

    // Mismo buscador con debounce que el de "cliente existente".
    const handleSearchAvalInput = (text: string) => {
        if (avalSearchDebounceRef.current) clearTimeout(avalSearchDebounceRef.current);

        avalSearchDebounceRef.current = setTimeout(async () => {
            setAvalSearchLoading(true);
            try {
                const { records } = await searchCustomersByEmployee({
                    filtersItems: { generalSearch: text.trim() || undefined },
                    pagination: { limit: CUSTOMER_SEARCH_LIMIT, pageNumber: 0 },
                });
                setAvalSearchResults(records);
            } catch (error) {
                console.error('Error al buscar clientes para aval:', error);
                setAvalSearchResults([]);
            } finally {
                setAvalSearchLoading(false);
            }
        }, CUSTOMER_SEARCH_DEBOUNCE_MS);
    };

    const handleOnSaveCredit = async () => {
        setCreditError(null);

        // El formulario no usa handleSubmit (arma el body a mano con useWatch,
        // ver comentario en useForm<Credits> arriba), así que las reglas
        // "required"/"validate" de los campos (chargeRules, monto, dirección,
        // teléfono) nunca se disparaban solas ni marcaban nada en rojo. trigger()
        // fuerza la validación de TODOS los campos de golpe — así, si mandas el
        // form vacío, se ven en rojo todos los que faltan a la vez, no uno por uno.
        const creditValid = await triggerCredit();
        const customerValid = isExistingCustomer ? true : await triggerCustomer();
        if (!creditValid || !customerValid) {
            setCreditError('Completa los campos obligatorios marcados en rojo.');
            return;
        }

        // El "Saldo insuficiente" ya lo cubre el rules.validate de creditAmount
        // en CreditForm (usa el mismo useWalletLedgerStore), así que si
        // triggerCredit() pasó, ya sabemos que el monto entra en el saldo.

        console.log('selectedCustomerId:', selectedCustomerId);
        console.log('customerFormState:', customerFormState);
        console.log('creditFormState:', creditFormState);

        const credit: Credits = {
            creditorCompanyId: get(creditFormState, 'creditorCompanyId', creditorCompanyId),
            customerId: renewalLoan?.customerId || selectedCustomerId || get(creditFormState, 'customerId', ''),
            // Para la descripción de la transacción ("CREDIT - <nombre>")
            customerName: resolveCustomerName(),
            transactionId: get(creditFormState, 'transactionId', ''),
            userId: get(creditFormState, 'userId', userId),
            creationStatus: isRenewal ? CreationStatus.Renewed : CreationStatus.New,
            // Solo aplica en renovación: ID del crédito que se está renovando.
            ...(isRenewal ? { creditId: renewalLoan?.creditId } : {}),
            admissionDate: get(creditFormState, 'admissionDate'),
            created: get(creditFormState, 'created', Date.now()),

            creditAmount: get(creditFormState, 'creditAmount', 0),

            creditAmountWithMoratory: get(creditFormState, 'creditAmountWithMoratory', 0),
            expirationDate: get(creditFormState, 'expirationDate'),
            fixedCharge: get(creditFormState, 'fixedCharge', 0),
            startDateChargeConfig: get(creditFormState, 'startDateChargeConfig'),
            status: get(creditFormState, 'status', 'Active'),
            chargeRules: get(creditFormState, 'chargeRules', {}),
        } as Credits;

        // para confirmar que creditAmount ya llega como number, no string.
        console.log('[TEST] credit.creditAmount:', credit.creditAmount, typeof credit.creditAmount);
        console.log('[TEST] credit completo:', credit);

        const creditRequest = {
            // Solo se manda "customer" cuando se está capturando un cliente nuevo;
            // si ya existe (selector o renovación), el backend lo resuelve por customerId.
            // El aval (si se aceptó uno) viaja dentro del cliente nuevo.
            ...(isExistingCustomer ? {} : {
                customer: {
                    ...(customerFormState as Customers),
                    contact: trimContact(get(customerFormState, 'contact', {}) as Contact),
                    ...(acceptedAval ? { aval: acceptedAval } : {}),
                },
            }),
            credit,
        };

        // El ticket se arma antes de llamar al backend porque solo depende del
        // formulario — y el proceso con primer pago necesita la cuota
        // (chargeAmount) como monto de ese pago.
        const ticket = buildCreditSuccessTicket();

        // Si la regla de cobro seleccionada trae firstCharge (hoy: la regla
        // diaria de la empresa), aplica a TODO crédito, nuevo o renovación →
        // proceso de 2 pasos: crédito + primer pago. Sin la bandera, flujo normal.
        const applyFirstCharge = Boolean(get(creditFormState, 'chargeRules.firstCharge', false));
        if (applyFirstCharge) {
            await runFirstChargeFlow(creditRequest, ticket);
            return;
        }

        setLoadingSave(true);
        // Bloquea toda la pantalla para que no se pueda picar "Guardar" otra vez
        // mientras la petición sigue en curso.
        setCreditOverlayStatus('loading');
        const loadingStartedAt = Date.now();

        try {
            const { ok } = await createCredit(creditRequest);

            // Si el backend respondió muy rápido (p.ej. en local), espera a
            // completar el mínimo para que el "cargando" alcance a verse.
            const elapsed = Date.now() - loadingStartedAt;
            if (elapsed < MIN_LOADING_OVERLAY_MS) {
                await wait(MIN_LOADING_OVERLAY_MS - elapsed);
            }

            // El backend responde 200 con creditId vacío cuando rechaza la
            // operación (p.ej. saldo insuficiente en la wallet) — no lanza excepción.
            if (!ok) {
                setCreditOverlayStatus(null);
                setCreditError('No se pudo crear el crédito: saldo insuficiente en tu wallet.');
                return;
            }

            setCreditSuccessTicket(ticket);
            // Primero el "¡Operación exitosa!" del overlay genérico (breve
            // pausa para que se note), y hasta después aparece el ticket.
            setCreditOverlayStatus('success');
            setTimeout(() => {
                setCreditOverlayStatus(null);
                setShowCreditTicket(true);
            }, SUCCESS_FLASH_DURATION_MS);
        } catch (error) {
            console.error('Error al crear el crédito:', error);
            setCreditOverlayStatus(null);
            setCreditError('No se pudo crear el crédito. Intenta de nuevo.');
        } finally {
            setLoadingSave(false);
        }
    };

    // Nombre del cliente: si ya existía (selector o renovación) viene de
    // selectedCustomerSummary; si se acaba de capturar, viene del propio
    // formulario de cliente. Lo usan el ticket, el mensaje de WhatsApp y la
    // descripción de las transacciones (customerName del crédito y del primer pago).
    const resolveCustomerName = (): string =>
        isExistingCustomer
            ? `${selectedCustomerSummary?.name ?? ''} ${selectedCustomerSummary?.lastName ?? ''}`.trim()
            : `${get(customerFormState, 'contact.name', '')} ${get(customerFormState, 'contact.lastName', '')}`.trim();

    // Datos del ticket de éxito (y del mensaje de WhatsApp) — todo sale del
    // formulario, no de la respuesta del backend.
    const buildCreditSuccessTicket = (): CreditSuccessTicketData => {
        // El teléfono destino NO es el del cliente — el mensaje es un aviso
        // interno que se manda al WhatsApp de la empresa (companyWhatsAppPhone).
        const resolvedName = resolveCustomerName();
        const resolvedCreditAmount = get(creditFormState, 'creditAmount', 0);
        const resolvedChargeFrequency = get(creditFormState, 'chargeRules.chargeFrequency');
        const resolvedChargePeriods = get(creditFormState, 'chargeRules.chargePeriods', 0);
        // El form nunca calcula "fixedCharge" — eso solo pasa en el backend
        // al crear el crédito (CreditService.ts:_fillCreditsDataFromChargeRules)
        // y createCredit() solo regresa los ids, no el crédito completo. Se
        // replica la misma fórmula aquí para el ticket y para el primer pago.
        const resolvedComissionRate = get(creditFormState, 'chargeRules.comissionRate', 0);
        const resolvedAmountDue = resolvedCreditAmount + (resolvedCreditAmount * resolvedComissionRate);
        const resolvedChargeAmount = resolvedChargePeriods > 0 ? resolvedAmountDue / resolvedChargePeriods : 0;

        const resolvedCreatedAt = Date.now();

        return {
            customerName: resolvedName || 'Cliente',
            creditAmount: resolvedCreditAmount,
            chargeAmount: resolvedChargeAmount,
            chargeFrequencyLabel: getChargeFrequencyLabel(resolvedChargeFrequency),
            chargePeriods: resolvedChargePeriods,
            createdAt: resolvedCreatedAt,
            status: CREDIT_PENDING_STATUS_LABEL,
            whatsappPhone: companyWhatsAppPhone,
            whatsappMessage: buildCreditWhatsAppMessage({
                customerName: resolvedName || 'cliente',
                creditAmount: resolvedCreditAmount,
                chargeAmount: resolvedChargeAmount,
                chargeFrequency: resolvedChargeFrequency,
                chargePeriods: resolvedChargePeriods,
                createdAt: resolvedCreatedAt,
                status: CREDIT_PENDING_STATUS_LABEL,
            }),
        };
    };

    // Proceso de 2 pasos cuando la regla trae firstCharge (FirstChargeFlowModal):
    // 1) crea el crédito, 2) registra su primer pago (paymentCategory
    // firstCharge — cuenta en "Otros", no en "Cobrado").
    const runFirstChargeFlow = async (
        creditRequest: { customer?: Customers; credit: Credits },
        ticket: CreditSuccessTicketData
    ) => {
        setLoadingSave(true);
        setCreditSuccessTicket(ticket);
        setFirstChargeFlow({
            ...FIRST_CHARGE_FLOW_INITIAL,
            open: true,
            rowCredito: 'active',
            amount: ticket.chargeAmount,
            customerName: creditRequest.credit.customerName ?? '',
        });

        try {
            const [{ ok, creditId, customerId }] = await Promise.all([
                createCredit(creditRequest),
                wait(MIN_FIRST_CHARGE_STEP_MS),
            ]);

            if (!ok) {
                setFirstChargeFlow((prev) => ({
                    ...prev,
                    rowCredito: 'error',
                    error: 'No se pudo crear el crédito: saldo insuficiente en tu wallet.',
                    errorStage: 'credit',
                }));
                return;
            }

            setFirstChargeFlow((prev) => ({ ...prev, rowCredito: 'done', creditId, customerId }));
            await registerFirstCharge(creditId, customerId, creditRequest.credit.customerName ?? '', ticket.chargeAmount);
        } catch (error) {
            console.error('Error al crear el crédito:', error);
            setFirstChargeFlow((prev) => ({
                ...prev,
                rowCredito: 'error',
                error: 'No se pudo crear el crédito. Intenta de nuevo.',
                errorStage: 'credit',
            }));
        } finally {
            setLoadingSave(false);
        }
    };

    // Paso 2 del proceso: el crédito ya existe, solo se registra el primer
    // pago. Separado para poder reintentarlo sin volver a crear el crédito.
    const registerFirstCharge = async (creditId: string, customerId: string, customerName: string, amount: number) => {
        setFirstChargeFlow((prev) => ({ ...prev, rowPago: 'active', error: null, errorStage: null }));

        const paymentError = 'El crédito se creó, pero no se pudo registrar el primer pago. Puedes reintentar o registrarlo después con "Pagar".';
        try {
            const [paid] = await Promise.all([
                createPayment({
                    creditId,
                    customerId,
                    // Para la descripción de la transacción ("PAGO - <nombre>")
                    customerName,
                    total: amount,
                    paymentCategory: PaymentCategoryEnum.FIRST_CHARGE,
                }),
                wait(MIN_FIRST_CHARGE_STEP_MS),
            ]);

            if (!paid) {
                setFirstChargeFlow((prev) => ({ ...prev, rowPago: 'error', error: paymentError, errorStage: 'payment' }));
                return;
            }

            setFirstChargeFlow((prev) => ({ ...prev, rowPago: 'done' }));
            setCreditSuccessTicket((prev) => (prev ? { ...prev, firstChargeAmount: amount } : prev));
            // Deja ver el check final del anillo antes de pasar al ticket.
            await wait(FIRST_CHARGE_DONE_DELAY_MS);
            setFirstChargeFlow(FIRST_CHARGE_FLOW_INITIAL);
            setShowCreditTicket(true);
        } catch (error) {
            console.error('Error al registrar el primer pago:', error);
            setFirstChargeFlow((prev) => ({ ...prev, rowPago: 'error', error: paymentError, errorStage: 'payment' }));
        }
    };

    const handleRetryFirstCharge = () => {
        registerFirstCharge(firstChargeFlow.creditId, firstChargeFlow.customerId, firstChargeFlow.customerName, firstChargeFlow.amount);
    };

    // El crédito sí se creó aunque falló el primer pago — se muestra su
    // ticket (sin la fila de primer pago) y el cobro queda para "Pagar".
    const handleContinueWithoutFirstCharge = () => {
        setFirstChargeFlow(FIRST_CHARGE_FLOW_INITIAL);
        setShowCreditTicket(true);
    };

    // Falló la creación del crédito — no se creó nada, se regresa al
    // formulario para corregir (ej. bajar el monto).
    const handleCloseFirstChargeFlow = () => {
        setFirstChargeFlow(FIRST_CHARGE_FLOW_INITIAL);
        setCreditSuccessTicket(null);
    };

    const handleSendCreditWhatsApp = () => {
        if (!creditSuccessTicket) return;
        openWhatsApp(creditSuccessTicket.whatsappPhone, creditSuccessTicket.whatsappMessage);
    };

    const handleContinueAfterCredit = () => {
        setCreditOverlayStatus(null);
        setCreditSuccessTicket(null);
        setShowCreditTicket(false);
        navigate(NAV_ROUTES.loans);
    };

    // En renovación el cliente ya viene definido por el crédito que se está
    // renovando: no se elige del autocomplete, y no se vuelve a capturar.
    const renewalCustomerSummary: CustomerSummary | undefined = renewalLoan
        ? {
            optionId: renewalLoan.customerId ?? '',
            name: renewalLoan.name,
            lastName: '',
            address: renewalLoan.address ?? '',
            status: renewalLoan.status,
            phoneNumber: renewalLoan.phone,
            threeWordsUbication: renewalLoan.threeWordsUbication ?? '',
        }
        : undefined;

    const isExistingCustomer = isRenewal || Boolean(selectedCustomerId);
    const selectedCustomerFromSearch = customerSearchResults.find((customer) => customer._id === selectedCustomerId);
    const selectedCustomerSummary = isRenewal
        ? renewalCustomerSummary
        : (selectedCustomerFromSearch ? mapCustomerResultToSummary(selectedCustomerFromSearch) : undefined);

    return {
        loadingSave,
        creditOverlayStatus,
        creditError,
        clearCreditError: () => setCreditError(null),
        handleOnSaveCredit,
        isExistingCustomer,
        isRenewal,

        creditSuccessTicket,
        showCreditTicket,
        canSendCreditWhatsApp: Boolean(creditSuccessTicket?.whatsappPhone),
        handleSendCreditWhatsApp,
        handleContinueAfterCredit,

        firstChargeFlow: {
            open: firstChargeFlow.open,
            customerName: creditSuccessTicket?.customerName ?? '',
            isRenewal,
            firstChargeAmount: firstChargeFlow.amount,
            rowCredito: firstChargeFlow.rowCredito,
            rowPago: firstChargeFlow.rowPago,
            error: firstChargeFlow.error,
            errorStage: firstChargeFlow.errorStage,
            onClose: handleCloseFirstChargeFlow,
            onRetryPayment: handleRetryFirstCharge,
            onContinue: handleContinueWithoutFirstCharge,
        },

        avalField: {
            hasAval: Boolean(acceptedAval),
            avalName: acceptedAval
                ? `${acceptedAval.contact.name ?? ''} ${acceptedAval.contact.lastName ?? ''}`.trim()
                : undefined,
            avalPhone: acceptedAval?.contact.phoneNumber,
            open: avalSheetOpen,
            onOpen: handleOpenAvalSheet,
            onClose: handleCloseAvalSheet,
            onAccept: handleAcceptAval,
            onClear: handleClearAval,
            form: {
                control: controlAval,
                errors: errorsAval,
                customerSelector: {
                    value: avalCustomerId,
                    onChange: handleSelectAvalCustomer,
                    onInputChange: handleSearchAvalInput,
                    loading: avalSearchLoading,
                    options: avalSearchResults.map((customer) => ({
                        optionId: customer._id,
                        label: `${get(customer, 'contact.name', '')} ${get(customer, 'contact.lastName', '')}`.trim(),
                    })),
                },
            },
        },

        customerSelector: {
            value: selectedCustomerId,
            onChange: handleChangeSelectedCustomer,
            onInputChange: handleSearchCustomerInput,
            loading: customerSearchLoading,
            options: customerSearchResults.map((customer) => ({
                optionId: customer._id,
                label: `${get(customer, 'contact.name', '')} ${get(customer, 'contact.lastName', '')}`.trim(),
            })),
            summary: selectedCustomerSummary,
        },
        customer: {
            control: controlCustomer,
            errors: errorsCustomer,
        },
        credit: {
            control: controlCredit,
            errors: errorsCredit,
            setValue: setValueCredit,
            initialChargeFrequency: renewalLoan?.chargeFrequency,
        },
    };
};

export default useCreditsCustomerContainerState;