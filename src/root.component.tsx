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


export const appRouter = createBrowserRouter([

  {
    path: '/',
    element: <Main />,
    children: [
      { index: true, path: "home-Dashboard", Component: HomeDashboardContainer },
      { index: true, path: "wallet-dashboard", Component: WalletDashboardContainer },
      { index: true, path: "credits-dashboard", Component: CreditsDashboardContainer }
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