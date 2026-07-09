import React from 'react';
import {
  BottomNavigation as MuiBottomNavigation,
  BottomNavigationAction,
  Paper,
} from '@mui/material';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import PeopleAltRoundedIcon from '@mui/icons-material/PeopleAltRounded';
import AccountBalanceRoundedIcon from '@mui/icons-material/AccountBalanceRounded';
import CreditCardRoundedIcon from '@mui/icons-material/CreditCardRounded';

export type NavKey = 'home' | 'clients' | 'loans' | 'wallet' | 'credits';

export interface BottomNavigationProps {
  active: NavKey;
  onChange: (key: NavKey) => void;
}

const BottomNavigation: React.FC<BottomNavigationProps> = ({ active, onChange }) => {
  return (
    <Paper
      elevation={8}
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        borderTop: '1px solid',
        borderColor: 'divider',
        zIndex: (theme) => theme.zIndex.appBar,
      }}
    >
      <MuiBottomNavigation
        showLabels
        value={active}
        onChange={(_, value: NavKey) => onChange(value)}
        sx={{ height: 64 }}
      >
        <BottomNavigationAction label="Inicio" value="home" icon={<HomeRoundedIcon />} />
        <BottomNavigationAction label="Clientes" value="clients" icon={<PeopleAltRoundedIcon />} />
        <BottomNavigationAction label="Préstamos" value="loans" icon={<AccountBalanceRoundedIcon />} />
        <BottomNavigationAction label="Cartera" value="wallet" icon={<CreditCardRoundedIcon />} />
        <BottomNavigationAction label="Credits" value="Credits" icon={<CreditCardRoundedIcon />} />
      </MuiBottomNavigation>
    </Paper>
  );
};

export default BottomNavigation;