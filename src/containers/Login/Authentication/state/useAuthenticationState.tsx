import React, { useState } from 'react';
import { IFormProps } from '@/shared/interfaces/IFormProps';
import { useForm, useWatch } from 'react-hook-form';
import { UserRequest } from '@/types/UserRequest';

export interface IUseAuthenticationState {
    loading: boolean,
    error: string,
    form: IFormProps<UserRequest> & {
      handleOnSubmitLogin: () => void;
    }
}

export const useAuthenticationState = (): IUseAuthenticationState => {
  const { 
    control, 
    formState: { errors }, 
    reset,
  } = useForm<UserRequest>({
    defaultValues: {
      userName: "",
      password: "",
      rememberMe: false
    }
  });
  //const dispatch = useDispatch();
  const loginFormState = useWatch({ control });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleOnSubmitLogin = () => {
    setLoading(true);
    setError("");
    console.log("LoginFormState: ", loginFormState);
    console.log("loading: ", loading);
    console.log("error: ", error);
  };

  return {
    loading,
    error,
    form: {
      control,
      errors,
      handleOnSubmitLogin
    }
  }
}