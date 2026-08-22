import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { useLocation, useNavigate } from 'react-router-dom';
import type { IFormProps } from '@/shared/interfaces/IFormProps';
import type { Customers } from '@/types/Customers';
import type { Credits } from '@/types/Credits';
import type { LoanSummary } from '@/components/molecules/mobile/DashboardContacTable/DashboardContacTable';
import { get } from 'lodash';
import { useCreditStore } from '@/stores/credits.store';
import { useAuthStore } from '@/stores/auth.store';
import { NAV_ROUTES } from '@/shared/constants/navRoutes';
import type { TransactionOverlayStatus } from '@/components/molecules/mobile/TransactionStatusOverlay/TransactionStatusOverlay';

// Cuánto se queda visible el aviso de "éxito" antes de navegar.
const SUCCESS_OVERLAY_DURATION_MS = 1600;
// Mínimo que se muestra el "cargando" aunque el backend responda al instante.
const MIN_LOADING_OVERLAY_MS = 900;

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
        options: { optionId: string; label: string }[];
        summary?: CustomerSummary;
    };

    customer: IFormProps<Customers>;

    credit: IFormProps<Credits> & {
        setValue: any;
    };
}

const CUSTOMER_OPTIONS: CustomerSummary[] = [
    {
        optionId: '1',
        name: 'Maria Veronica',
        lastName: 'Perez Patistan',
        address: 'Calle 5 de Mayo #123, Col. Centro',
        status: 'ACTIVO',
        phoneNumber: '9611234567',
        threeWordsUbication: 'lider.acaso.rima',
    },
    {
        optionId: '2',
        name: 'Leticia',
        lastName: 'Gomez Torres',
        address: 'Av. Insurgentes #456, Col. Reforma',
        status: 'ATRASADO',
        phoneNumber: '9619876543',
        threeWordsUbication: 'techo.rueda.faro',
    },
    {
        optionId: '3',
        name: 'Maricruz',
        lastName: 'Nucamendi Perez',
        address: 'Calle Juárez #789, Col. Moderna',
        status: 'ACTIVO',
        phoneNumber: '9615551234',
        threeWordsUbication: 'nube.canto.rio',
    },
    {
        optionId: '4',
        name: 'Carlos Mario',
        lastName: 'Simuta Vicente',
        address: 'Av. Central #321, Col. Norte',
        status: 'ACTIVO',
        phoneNumber: '9612223333',
        threeWordsUbication: 'sol.montana.lago',
    },
    {
        optionId: '5',
        name: 'Jose Alfredo',
        lastName: 'Hernandez Gomez',
        address: 'Calle Hidalgo #654, Col. Sur',
        status: 'ATRASADO',
        phoneNumber: '9614445555',
        threeWordsUbication: 'piedra.viento.mar',
    },
    {
        optionId: '6',
        name: 'Teresa de jesus',
        lastName: 'de la Cruz Cruz',
        address: 'Av. Libertad #987, Col. Este',
        status: 'ACTIVO',
        phoneNumber: '9616667777',
        threeWordsUbication: 'estrella.rio.campo',
    },
];

const CUSTOMER_AUTOCOMPLETE_OPTIONS = CUSTOMER_OPTIONS.map((customer) => ({
    optionId: customer.optionId,
    label: `${customer.name} ${customer.lastName}`,
}));

export const useCreditsCustomerContainerState = (): IUseCreditsCustomerContainerState => {
    const location = useLocation();
    const navigate = useNavigate();
    const { modo, loan: renewalLoan } = (location.state ?? {}) as RenovacionNavigationState;
    const isRenewal = modo === 'renovacion' && Boolean(renewalLoan);

    const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
    const [loadingSave, setLoadingSave] = useState(false);
    const [creditOverlayStatus, setCreditOverlayStatus] = useState<TransactionOverlayStatus>(null);

    const { createCredit } = useCreditStore();
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
    // renovando: no se elige de la lista mock, y no se vuelve a capturar.
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
    const selectedCustomerSummary = isRenewal
        ? renewalCustomerSummary
        : CUSTOMER_OPTIONS.find((customer) => customer.optionId === selectedCustomerId);

    return {
        loadingSave,
        creditOverlayStatus,
        handleOnSaveCredit,
        isExistingCustomer,
        isRenewal,

        customerSelector: {
            value: selectedCustomerId,
            onChange: handleChangeSelectedCustomer,
            options: CUSTOMER_AUTOCOMPLETE_OPTIONS,
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