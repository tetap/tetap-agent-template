import type { RouteObject } from 'react-router';
import { HomePage } from './pages/home';

export const webRoutes = [
  {
    path: '/',
    element: <HomePage />,
  },
] satisfies RouteObject[];
