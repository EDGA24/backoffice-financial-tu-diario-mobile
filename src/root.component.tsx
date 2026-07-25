import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import theme from './theme.ts';
import { ThemeProvider } from '@emotion/react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import HomeDashboardContainer from './containers/mobile-dashboard/HomeDashboardContainer/HomeDashboardContainer.tsx';
import WalletDashboardContainer from './containers/wallet/WalletDashboardContainer/WalletDashboardContainer.tsx';
import Main from './layout/main/main.tsx';
import CreditsDashboardContainer from './containers/Credits/CreditsDashboardContainer/CreditsDashboardContainer.tsx';
import CreditsCustomerContainer from './containers/CreditsCustomer/CreditsCustomerContainer/CreditsCustomerContainer.tsx';
import LoginDashboardContainer from './containers/Login/Authentication/LoginDashboarContiainer.tsx';


export const appRouter = createBrowserRouter([
  {
    path: '/login',
    Component: LoginDashboardContainer,
  },
  {
    path: '/',
    element: <Main />,
    children: [
      { index: true, Component: HomeDashboardContainer }, 
      { path: 'home-Dashboard', Component: HomeDashboardContainer },
      { path: 'wallet-dashboard', Component: WalletDashboardContainer },
      { path: 'credits-dashboard', Component: CreditsDashboardContainer },
      { path: 'customer-create', Component: CreditsCustomerContainer },
    ]
  }
]);


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <RouterProvider router={appRouter} />
    </ThemeProvider>
  </StrictMode>
)