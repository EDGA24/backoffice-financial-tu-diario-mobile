import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IFormProps } from '@/shared/interfaces/IFormProps';
import { useForm } from 'react-hook-form';
import { UserRequest } from '@/types/UserRequest';
import { useAuthStore } from '@/stores/auth.store';
import { NAV_ROUTES } from '@/shared/constants/navRoutes';

// El servidor (Render, plan gratuito) se apaga si está inactivo y tarda en
// levantarse de nuevo. Si el login no resuelve en este tiempo, avisamos que
// puede ser justo eso, para que el usuario no piense que la app está trabada.
const SLOW_SERVER_HINT_DELAY_MS = 4000;

export interface IUseAuthenticationState {
    loading: boolean,
    error: string,
    showSlowServerHint: boolean,
    form: IFormProps<UserRequest> & {
      handleOnSubmitLogin: () => void;
    }
}

export const useAuthenticationState = (): IUseAuthenticationState => {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<UserRequest>({
    defaultValues: {
      userName: "",
      password: "",
      rememberMe: false
    }
  });
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSlowServerHint, setShowSlowServerHint] = useState(false);

  const submitLogin = async (values: UserRequest) => {
    setLoading(true);
    setError("");
    setShowSlowServerHint(false);

    const slowHintTimer = setTimeout(() => setShowSlowServerHint(true), SLOW_SERVER_HINT_DELAY_MS);

    try {
      await login({
        email: values.userName ?? "",
        password: values.password ?? ""
      });
      navigate(NAV_ROUTES.home);
    } catch (err: any) {
      setError(err?.response?.data?.error ?? 'Credenciales inválidas');
    } finally {
      clearTimeout(slowHintTimer);
      setLoading(false);
      setShowSlowServerHint(false);
    }
  };

  const handleOnSubmitLogin = handleSubmit(submitLogin);

  return {
    loading,
    error,
    showSlowServerHint,
    form: {
      control,
      errors,
      handleOnSubmitLogin
    }
  }
}