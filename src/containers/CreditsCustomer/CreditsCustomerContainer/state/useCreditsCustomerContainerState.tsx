import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import type { IFormProps } from '@/shared/interfaces/IFormProps';
import type { Customers } from '@/types/Customers';
import type { Credits } from '@/types/Credits';
import { get } from 'lodash';
import { useCreditStore } from '@/stores/credits.store';


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
    isExistingCustomer: boolean;
    handleOnSaveCredit: () => void;

    customerSelector: {
        value: string;
        onChange: (value: string | undefined) => void;
        options: { optionId: string; label: string }[];
        summary?: CustomerSummary;
    };

    customer: IFormProps<Customers> & {
        catalogEmployeeOptions: { optionId: string; label: string }[];
        catalogCustomerOptions: { optionId: string; label: string }[];
    };

    credit: IFormProps<Credits> & {
        setValue: any;
    };
}

const EMPLOYEE_OPTIONS = [
    { optionId: '1', label: 'Jose Manuel' },
    { optionId: '2', label: 'Jose de Jesus' },
    { optionId: '3', label: 'Erick' },
    { optionId: '4', label: 'Antony' },
    { optionId: '5', label: 'Javier' },
    { optionId: '6', label: 'Eduardo' },
];

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
    const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
    const [loadingSave, setLoadingSave] = useState(false);

    const { notification, createCredit } = useCreditStore();

    const {
        control: controlCustomer,
        formState: { errors: errorsCustomer },
    } = useForm<Customers>({
        defaultValues: {
            contact: {
                name: '',
                lastName: '',
                phoneNumber: '',
                adress: '',
            },
            created: Date.now(),
            creditorCompanyId: '123',
            status: 'Active',
            threeWordsUbication: '',
            userId: '',
        },
    });

    const {
        control: controlCredit,
        formState: { errors: errorsCredit },
        setValue: setValueCredit,
    } = useForm<Credits>({
        defaultValues: {
            creditorCompanyId: '123',
            customerId: '',
            transactionId: 'tx_001',
            userId: '123124',
            admissionDate: undefined,
            created: Date.now(),
            creditAmount: 0,
            creditAmountWithMoratory: 0,
            expirationDate: undefined,
            fixedCharge: 0,
            startDateChargeConfig: undefined,
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
        console.log('selectedCustomerId:', selectedCustomerId);
        console.log('customerFormState:', customerFormState);
        console.log('creditFormState:', creditFormState);

        await createCredit({
            creditorCompanyId: get(creditFormState, 'creditorCompanyId', '123'),
            customerId: selectedCustomerId || get(creditFormState, 'customerId', ''),
            transactionId: get(creditFormState, 'transactionId', ''),
            userId: get(creditFormState, 'userId', ''),
            admissionDate: get(creditFormState, 'admissionDate'),
            created: get(creditFormState, 'created', Date.now()),
            creditAmount: get(creditFormState, 'creditAmount', 0),
            creditAmountWithMoratory: get(creditFormState, 'creditAmountWithMoratory', 0),
            expirationDate: get(creditFormState, 'expirationDate'),
            fixedCharge: get(creditFormState, 'fixedCharge', 0),
            startDateChargeConfig: get(creditFormState, 'startDateChargeConfig'),
            status: get(creditFormState, 'status', 'Active'),
            chargeRules: get(creditFormState, 'chargeRules', {}),
        } as Credits);
    };

    const isExistingCustomer = Boolean(selectedCustomerId);
    const selectedCustomerSummary = CUSTOMER_OPTIONS.find((customer) => customer.optionId === selectedCustomerId);

    return {
        loadingSave,
        handleOnSaveCredit,
        isExistingCustomer,
    

        customerSelector: {
            value: selectedCustomerId,
            onChange: handleChangeSelectedCustomer,
            options: CUSTOMER_AUTOCOMPLETE_OPTIONS,
            summary: selectedCustomerSummary,
        },
        customer: {
            control: controlCustomer,
            errors: errorsCustomer,
            catalogEmployeeOptions: EMPLOYEE_OPTIONS,
            catalogCustomerOptions: CUSTOMER_AUTOCOMPLETE_OPTIONS,
        },
        credit: {
            control: controlCredit,
            errors: errorsCredit,
            setValue: setValueCredit,
        },
    };
};

export default useCreditsCustomerContainerState;