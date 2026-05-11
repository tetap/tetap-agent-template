import type { FastifyInstance } from 'fastify';
import { registerAuthRoutes } from './auth.js';
import { registerHealthRoutes } from './health.js';
import { registerIamRoutes } from './iam.js';

export const registerRoutes = (app: FastifyInstance) => {
  registerHealthRoutes(app);
  registerAuthRoutes(app);
  registerIamRoutes(app);
};
