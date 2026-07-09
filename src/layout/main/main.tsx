import MobileDashboardHeader from '@/components/organisms/mobile/MobileDashboardHeader/MobileDashboardHeader';
import BottomNavigation from '@/components/organisms/mobile/BottomNavigation/BottomNavigation';
import { Outlet } from "react-router-dom";
import { Box } from '@mui/material';

const Main = () => {
    return (
        <Box sx={{ pb: 9, backgroundColor: 'background.default', minHeight: '100vh' }}>
            <MobileDashboardHeader userName={"edgar"} initials={'JU'} notificationsCount={1} />

            <main>
                {/* The child component (Home or About) will render here */}
                <Outlet />
            </main>
            <BottomNavigation active={"home"} onChange={() => console.log("gay")} />
        </Box>
    );
}

export default Main;