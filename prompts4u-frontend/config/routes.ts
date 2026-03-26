// Centralized routes enum for frontend navigation
// This ensures type safety and consistency across the application

export const PUBLIC_ROUTES = {
  HOME: '/',
  ABOUT: '/#about',
  FEATURES: '/#features',
  PRICING: '/#pricing',
  CONTACT: '/#contact',
  MARKETPLACE: '/marketplace',
  LOGIN: '/login',
  SIGNUP: '/signup',
  DASHBOARD: '/dashboard',
} as const;

export const ADMIN_ROUTES = {
  ROOT: '/admin',
  COMPONENTS: '/admin/components',
  SCRAPE: '/admin/scrape',
  PAGES: '/admin/pages',
  MIX_MASTER: '/admin/mix-master',
} as const;

export const USER_ROUTES = {
  DASHBOARD: '/dashboard',
  PROFILE: '/dashboard/profile',
  SETTINGS: '/dashboard/settings',
  ORDERS: '/dashboard/orders',
} as const;

export const ROUTE_LABELS: Record<string, string> = {
  [PUBLIC_ROUTES.HOME]: 'Home',
  [PUBLIC_ROUTES.MARKETPLACE]: 'Marketplace',
  [PUBLIC_ROUTES.LOGIN]: 'Login',
  [PUBLIC_ROUTES.SIGNUP]: 'Sign Up',
  [PUBLIC_ROUTES.DASHBOARD]: 'Dashboard',
  [ADMIN_ROUTES.COMPONENTS]: 'Components',
  [ADMIN_ROUTES.SCRAPE]: 'Scrape Pages',
  [ADMIN_ROUTES.PAGES]: 'View All Pages',
  [ADMIN_ROUTES.MIX_MASTER]: 'Mix Master',
} as const;

export type PublicRoute = (typeof PUBLIC_ROUTES)[keyof typeof PUBLIC_ROUTES];
export type AdminRoute = (typeof ADMIN_ROUTES)[keyof typeof ADMIN_ROUTES];
export type UserRoute = (typeof USER_ROUTES)[keyof typeof USER_ROUTES];
