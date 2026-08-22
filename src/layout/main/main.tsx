import MobileDashboardHeader from '@/components/organisms/mobile/MobileDashboardHeader/MobileDashboardHeader';
import BottomNavigation, { type NavKey } from '@/components/organisms/mobile/BottomNavigation/BottomNavigation';
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { Box } from '@mui/material';
import { useAuthStore } from '@/stores/auth.store';

const NAV_ROUTES: Record<NavKey, string> = {
  home: '/home-Dashboard',
  newcredits: '/customer-create',
  loans: '/credits-dashboard',
  wallet: '/wallet-dashboard',
};

const PATH_TO_NAV_KEY: Record<string, NavKey> = Object.entries(NAV_ROUTES).reduce(
  (acc, [key, path]) => ({ ...acc, [path]: key as NavKey }),
  {} as Record<string, NavKey>
);

const getInitials = (fullName: string) =>
  fullName
    .trim()
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('');

const Main = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const userName = useAuthStore((state) => state.user?.userName ?? '');
    const logout = useAuthStore((state) => state.logout);

    const activeKey: NavKey = PATH_TO_NAV_KEY[location.pathname] ?? 'home';

    const handleChangeNav = (key: NavKey) => {
        navigate(NAV_ROUTES[key]);
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <Box sx={{ pb: 9, backgroundColor: 'background.default', minHeight: '100vh' }}>
            <MobileDashboardHeader
                userName={userName}
                initials={getInitials(userName) || 'U'}
                onLogoutClick={handleLogout}
            />

            <main>
                {/* The child component (Home or About) will render here */}
                <Outlet />
            </main>
            <BottomNavigation active={activeKey} onChange={handleChangeNav} />
        </Box>
    );
}

export default Main;