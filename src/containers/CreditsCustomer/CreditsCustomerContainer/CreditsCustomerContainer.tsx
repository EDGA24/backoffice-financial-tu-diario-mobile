import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography } from '@mui/material';

import FormScreenHeader from '@/components/organisms/mobile/FormscreenHeader/FormscreenHeader';
import CustomerForm from '@/components/molecules/mobile/Forms/CustomerForm/CustomerForm';
import CreditForm from '@/components/molecules/mobile/Forms/CreditForm/CreditForm';
import FormActionBar from '@/components/molecules/mobile/FormActionBar/FormActionBar';
import AutocompleteFormatField from '@/components/atoms/FormInputFileds/AutocompleteFormatField/AutocompleteFormatField';
import CustomerSummaryCard from '@/components/molecules/mobile/CustomerSummaryCard/CustomerSummaryCard';

import { useCreditsCustomerContainerState } from './state/useCreditsCustomerContainerState';

const CreditsCustomerContainer = () => {
  const { customerSelector, customer, credit, loadingSave, isExistingCustomer, handleOnSaveCredit } =
    useCreditsCustomerContainerState();
  const navigate = useNavigate();

  return (
    <React.Fragment>
      <FormScreenHeader title="Nuevo Crédito" onBack={() => navigate(-1)} />

      <Box sx={{ px: 2.5, pt: 2.5, pb: 16, display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Typography variant="caption" color="text.secondary">
          Todos los campos marcados son obligatorios
        </Typography>

        <AutocompleteFormatField
          name="selectedCustomerId"
          value={customerSelector.value}
          onChange={customerSelector.onChange}
          options={customerSelector.options}
          label="¿Ya existe el cliente? Selecciónalo aquí"
        />

        {customerSelector.summary && (
          <Box sx={{ mt: -3 }}>
            <CustomerSummaryCard {...customerSelector.summary} />
          </Box>
        )}

        {!isExistingCustomer && <CustomerForm {...customer} />}

        <CreditForm {...credit} />
      </Box>

      <FormActionBar label="Guardar crédito" isLoading={loadingSave} onClick={handleOnSaveCredit} />
    </React.Fragment>
  );
};

export default CreditsCustomerContainer;