import { useRef, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { useLocation, useNavigate } from 'react-router-dom';
import type { IFormProps } from '@/shared/interfaces/IFormProps';
import type { Customers } from '@/types/Customers';
import { CreationStatus, type Credits } from '@/types/Credits';
import type { LoanSummary } from '@/components/molecules/mobile/DashboardContacTable/DashboardContacTable';
import { get } from 'lodash';
import { useCreditStore, type CustomerSearchResult } from '@/stores/credits.store';
import { useAuthStore } from '@/stores/auth.store';
import { NAV_ROUTES } from '@/shared/constants/navRoutes';
import type { TransactionOverlayStatus } from '@/components/molecules/mobile/TransactionStatusOverlay/TransactionStatusOverlay';

// Cuánto espera el autocomplete de clientes después de la última tecla antes
// de buscar en el backend (evita un request por cada letra).
const CUSTOMER_SEARCH_DEBOUNCE_MS = 300;
// El backend no aplica tope propio en este endpoint — este es el único límite.
const CUSTOMER_SEARCH_LIMIT = 20;
// Cuánto se queda visible el aviso de "éxito" antes de navegar.
const SUCCESS_OVERLAY_DURATION_MS = 1600;
// Mínimo que se muestra el "cargando" aunque el backend responda al instante.
const MIN_LOADING_OVERLAY_MS = 500;

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

interface RenovacionNavigationState {
    modo?: string;
    loan?: LoanSummary;
}


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

    customerSelector: {
        value: string;
        onChange: (value: string | undefined) => void;
        onInputChange: (text: string) => void;
        loading: boolean;
        options: { optionId: string; label: string }[];
        summary?: CustomerSummary;
    };

    customer: IFormProps<Customers>;

    credit: IFormProps<Credits> & {
        setValue: any;
        initialChargeFrequency?: string;
    };
}

// Convierte un resultado real del backend (CustomerSearchResult) al shape
// que ya usa el resto de la pantalla (CustomerSummaryCard, etc.).
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

    // Autocomplete de "cliente existente" — resultados reales del cobrador
    // autenticado, buscados con debounce mientras se teclea.
    const [customerSearchResults, setCustomerSearchResults] = useState<CustomerSearchResult[]>([]);
    const [customerSearchLoading, setCustomerSearchLoading] = useState(false);
    const customerSearchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const { createCredit, searchCustomersByEmployee } = useCreditStore();
    const creditorCompanyId = useAuthStore((state) => state.user?.creditorCompanyId ?? '');
    const userId = useAuthStore((state) => state.user?._id ?? '');

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

        setLoadingSave(true);
        // Bloquea toda la pantalla para que no se pueda picar "Guardar" otra vez
        // mientras la petición sigue en curso.
        setCreditOverlayStatus('loading');
        const loadingStartedAt = Date.now();
        console.log('selectedCustomerId:', selectedCustomerId);
        console.log('customerFormState:', customerFormState);
        console.log('creditFormState:', creditFormState);

        try {
            const credit: Credits = {
                creditorCompanyId: get(creditFormState, 'creditorCompanyId', creditorCompanyId),
                customerId: renewalLoan?.customerId || selectedCustomerId || get(creditFormState, 'customerId', ''),
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

            const ok = await createCredit({
                // Solo se manda "customer" cuando se está capturando un cliente nuevo;
                // si ya existe (selector o renovación), el backend lo resuelve por customerId.
                ...(isExistingCustomer ? {} : { customer: customerFormState as Customers }),
                credit,
            });

            // Si el backend respondió muy rápido (p.ej. en local), espera a
            // completar el mínimo para que el "cargando" alcance a verse.
            const elapsed = Date.now() - loadingStartedAt;
            if (elapsed < MIN_LOADING_OVERLAY_MS) {
                await wait(MIN_LOADING_OVERLAY_MS - elapsed);
            }

            // El backend responde 200 con data:false cuando rechaza la operación
            // (p.ej. saldo insuficiente en la wallet) — no lanza excepción.
            if (!ok) {
                setCreditOverlayStatus(null);
                setCreditError('No se pudo crear el crédito: saldo insuficiente en tu wallet.');
                return;
            }

            setCreditOverlayStatus('success');
            setTimeout(() => {
                setCreditOverlayStatus(null);
                navigate(NAV_ROUTES.loans);
            }, SUCCESS_OVERLAY_DURATION_MS);
        } catch (error) {
            console.error('Error al crear el crédito:', error);
            setCreditOverlayStatus(null);
            setCreditError('No se pudo crear el crédito. Intenta de nuevo.');
        } finally {
            setLoadingSave(false);
        }
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