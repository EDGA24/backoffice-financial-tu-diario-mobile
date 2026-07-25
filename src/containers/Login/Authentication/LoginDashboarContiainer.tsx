import { LoginForm } from '@/components/molecules/mobile/Forms/LoginForm/LoginForm';
import React from 'react'
import { useAuthenticationState } from './state/useAuthenticationState';



const LoginDashboardContainer = () => {
    const { form, loading } = useAuthenticationState();
    return (
        <React.Fragment>
            <LoginForm
                control={form.control}
                errors={form.errors}
                loadingSave={loading}
                //catalogEmployeeOptions={form.catalogEmployeeOptions}
                //catalogCustomerOptions={form.catalogCustomerOptions}
                onLogin={form.handleOnSubmitLogin}
            />

        </React.Fragment>
    )
}

export default LoginDashboardContainer;