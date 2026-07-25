import React, { JSX } from 'react';
import { Paper } from '@mui/material';

export interface CustomCardProps {
    children?: JSX.Element | any;
    elevation?: number;
    sx?: object;
}

const CustomCard = ({ 
  children, 
  elevation = 2,
  sx= {},
  ...props
}: CustomCardProps) => {
  return (
    <Paper
      elevation={elevation}
      sx={{
        padding: 3,
        borderRadius: 2,
        background: 'white',
        border: '1px solid #e0e0e0',
        ...sx
      }}
      {...props}
    >
      {children}
    </Paper>
  );
};

export default CustomCard;