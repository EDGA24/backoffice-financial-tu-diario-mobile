import React from 'react';
import { Box, ButtonBase, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import PersonAddAltRoundedIcon from '@mui/icons-material/PersonAddAltRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';

import FilterBottomSheet from '@/components/molecules/mobile/Filter/FilterBottomSheet/FilterBottomSheet';
import AvalForm, { type AvalFormProps } from '@/components/molecules/mobile/Forms/AvalForm/AvalForm';

export interface AvalFieldProps {
  // Ya se aceptó un aval — la pastilla se marca en verde con su nombre
  hasAval: boolean;
  avalName?: string;
  avalPhone?: string;
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
  onAccept: () => void;
  onClear: () => void;
  form: AvalFormProps;
}

// Pastilla compacta "Agregar aval" (solo del tamaño de su contenido) + hoja
// inferior con el formulario del aval (mismo bottom sheet que los filtros).
// Al aceptar, la pastilla se marca en verde con el nombre del aval y
// "Editar", para poder corregirlo ahí mismo.
export const AvalField: React.FC<AvalFieldProps> = ({
  hasAval,
  avalName,
  open,
  onOpen,
  onClose,
  onAccept,
  onClear,
  form,
}) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      <Typography sx={{ fontWeight: 700, fontSize: 16, color: 'primary.main' }}>
        Aval
      </Typography>

      <ButtonBase
        onClick={onOpen}
        sx={(theme) => {
          const color = hasAval ? theme.palette.success.main : theme.palette.primary.main;
          return {
            alignSelf: 'flex-start',
            maxWidth: '100%',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 0.75,
            pl: 1.25,
            pr: hasAval ? 1.5 : 0.75,
            py: 0.75,
            borderRadius: 999,
            border: '1px solid',
            borderColor: alpha(color, 0.45),
            backgroundColor: alpha(color, 0.1),
            color,
            transition: 'background-color 0.2s ease, border-color 0.2s ease',
          };
        }}
      >
        {hasAval ? (
          <CheckCircleRoundedIcon sx={{ fontSize: 18, flexShrink: 0 }} />
        ) : (
          <PersonAddAltRoundedIcon sx={{ fontSize: 18, flexShrink: 0 }} />
        )}

        <Typography noWrap sx={{ fontWeight: 600, fontSize: 13.5, color: hasAval ? 'text.primary' : 'inherit', minWidth: 0 }}>
          {hasAval ? avalName || 'Aval agregado' : 'Agregar aval'}
        </Typography>

        {hasAval ? (
          <Typography sx={{ fontWeight: 700, fontSize: 13, flexShrink: 0 }}>· Editar</Typography>
        ) : (
          <ChevronRightRoundedIcon sx={{ fontSize: 18, flexShrink: 0 }} />
        )}
      </ButtonBase>

      <FilterBottomSheet
        open={open}
        title="Aval"
        onClose={onClose}
        onClear={onClear}
        onApply={onAccept}
        clearLabel={hasAval ? 'Quitar aval' : 'Limpiar'}
        applyLabel="Aceptar"
      >
        <AvalForm {...form} />
      </FilterBottomSheet>
    </Box>
  );
};

export default AvalField;
