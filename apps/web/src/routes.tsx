import type { RouteObject } from 'react-router';
import { HomePage } from './pages/home';
import { WebStatePage } from './pages/state-page';

export const webRoutes = [
  {
    path: '/',
    element: <HomePage />,
  },
  {
    path: '/500',
    element: <WebStatePage status="500" />,
  },
  {
    path: '*',
    element: <WebStatePage status="404" />,
  },
] satisfies RouteObject[];
