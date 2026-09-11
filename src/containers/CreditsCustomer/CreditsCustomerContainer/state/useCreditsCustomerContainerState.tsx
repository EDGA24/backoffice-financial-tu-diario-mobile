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
    } = useForm<Customers>({
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
    } = useForm<Credits>({
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

            await createCredit({
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

            setCreditOverlayStatus('success');
            setTimeout(() => {
                setCreditOverlayStatus(null);
                navigate(NAV_ROUTES.loans);
            }, SUCCESS_OVERLAY_DURATION_MS);
        } catch (error) {
            console.error('Error al crear el crédito:', error);
            setCreditOverlayStatus(null);
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
        },
    };
};

export default useCreditsCustomerContainerState;