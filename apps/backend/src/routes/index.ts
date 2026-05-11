import type { FastifyInstance } from 'fastify';
import { registerHealthRoutes } from './health.js';

export const registerRoutes = (app: FastifyInstance) => {
  registerHealthRoutes(app);
};
