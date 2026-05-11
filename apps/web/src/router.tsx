import { createBrowserRouter } from 'react-router';
import { webRoutes } from './routes';

export const createWebRouter = () => createBrowserRouter(webRoutes);
