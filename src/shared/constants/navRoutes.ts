import type { NavKey } from '@/components/organisms/mobile/BottomNavigation/BottomNavigation';

export const NAV_ROUTES: Record<NavKey, string> = {
  home: '/home-Dashboard',
  clients: '/customer-create',      
  loans: '/credits-dashboard',      
  wallet: '/wallet-dashboard',
  credits: '/credits-dashboard',
};

export const PATH_TO_NAV_KEY: Record<string, NavKey> = Object.entries(NAV_ROUTES).reduce(
  (acc, [key, path]) => ({ ...acc, [path]: key as NavKey }),
  {} as Record<string, NavKey>
);