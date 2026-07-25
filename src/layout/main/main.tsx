import MobileDashboardHeader from '@/components/organisms/mobile/MobileDashboardHeader/MobileDashboardHeader';
import BottomNavigation, { type NavKey } from '@/components/organisms/mobile/BottomNavigation/BottomNavigation';
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { Box } from '@mui/material';

const NAV_ROUTES: Record<NavKey, string> = {
  home: '/home-Dashboard',
  clients: '/customer-create',
  loans: '/credits-dashboard',
  wallet: '/wallet-dashboard',
  credits: '/credits-dashboard',
};

const PATH_TO_NAV_KEY: Record<string, NavKey> = Object.entries(NAV_ROUTES).reduce(
  (acc, [key, path]) => ({ ...acc, [path]: key as NavKey }),
  {} as Record<string, NavKey>
);

const Main = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const activeKey: NavKey = PATH_TO_NAV_KEY[location.pathname] ?? 'home';

    const handleChangeNav = (key: NavKey) => {
        navigate(NAV_ROUTES[key]);
    };

    return (
        <Box sx={{ pb: 9, backgroundColor: 'background.default', minHeight: '100vh' }}>
            <MobileDashboardHeader userName={"edgar"} initials={'JU'} notificationsCount={1} />

            <main>
                {/* The child component (Home or About) will render here */}
                <Outlet />
            </main>
            <BottomNavigation active={activeKey} onChange={handleChangeNav} />
        </Box>
    );
}

export default Main;