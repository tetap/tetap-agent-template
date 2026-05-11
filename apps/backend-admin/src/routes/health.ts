import type { FastifyInstance } from 'fastify';
import { getHealth } from '../services/health.js';

export const registerHealthRoutes = (app: FastifyInstance) => {
  app.get(
    '/health',
    {
      config: { auth: false, skipSecurity: true },
      schema: {
        response: {
          200: {
            additionalProperties: true,
            type: 'object',
          },
        },
      },
    },
    getHealth,
  );
};
