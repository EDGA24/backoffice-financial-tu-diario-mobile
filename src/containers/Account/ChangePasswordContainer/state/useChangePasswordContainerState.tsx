import { useState } from 'react';
import { useForm } from 'react-hook-form';
import type { FieldErrors } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth.store';
import type { TransactionOverlayStatus } from '@/components/molecules/mobile/TransactionStatusOverlay/TransactionStatusOverlay';

// Cuánto se queda el "¡Contraseña actualizada!" antes de regresar a la
// pantalla anterior — mismo criterio que SUCCESS_FLASH_DURATION_MS en
// useCreditsCustomerContainerState (avisar el éxito antes de navegar).
const SUCCESS_FLASH_DURATION_MS = 1200;

interface ChangePasswordFormValues {
    currentPassword: string;
    newPassword: string;
    confirmNewPassword: string;
}

export interface IUseChangePasswordContainerState {
    control: any;
    errors: FieldErrors<ChangePasswordFormValues>;
    loadingSave: boolean;
    overlayStatus: TransactionOverlayStatus;
    serverError: string | null;
    clearServerError: () => void;
    handleOnSave: () => void;
    handleBack: () => void;
}

export const useChangePasswordContainerState = (): IUseChangePasswordContainerState => {
    const navigate = useNavigate();
    const changePassword = useAuthStore((state) => state.changePassword);

    const {
        control,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<ChangePasswordFormValues>({
        mode: 'onChange',
        defaultValues: {
            currentPassword: '',
            newPassword: '',
            confirmNewPassword: '',
        },
    });

    const [loadingSave, setLoadingSave] = useState(false);
    const [overlayStatus, setOverlayStatus] = useState<TransactionOverlayStatus>(null);
    const [serverError, setServerError] = useState<string | null>(null);

    const submit = async (values: ChangePasswordFormValues) => {
        setServerError(null);
        setLoadingSave(true);
        setOverlayStatus('loading');

        try {
            await changePassword({
                currentPassword: values.currentPassword,
                newPassword: values.newPassword,
            });

            setOverlayStatus('success');
            reset();
            setTimeout(() => {
                setOverlayStatus(null);
                navigate(-1);
            }, SUCCESS_FLASH_DURATION_MS);
        } catch (error: any) {
            // El backend regresa 401 con { error: "La contraseña actual es
            // incorrecta" } o { error: "Usuario no encontrado" } — mismo
            // criterio de lectura que useAuthenticationState con el login.
            setOverlayStatus(null);
            setServerError(error?.response?.data?.error ?? 'No se pudo actualizar la contraseña. Intenta de nuevo.');
        } finally {
            setLoadingSave(false);
        }
    };

    return {
        control,
        errors,
        loadingSave,
        overlayStatus,
        serverError,
        clearServerError: () => setServerError(null),
        handleOnSave: handleSubmit(submit),
        handleBack: () => navigate(-1),
    };
};

export default useChangePasswordContainerState;
