import type { FastifyInstance } from 'fastify';
import { getCurrentUser, login, logout, refreshToken } from '../services/auth.js';

const responseSchema = {
  additionalProperties: true,
  type: 'object',
};

export const registerAuthRoutes = (app: FastifyInstance) => {
  app.post(
    '/auth/login',
    {
      config: { auth: false, skipSecurity: true },
      schema: {
        body: {
          type: 'object',
          required: ['username', 'password'],
          additionalProperties: false,
          properties: {
            username: { type: 'string', minLength: 1 },
            password: { type: 'string', minLength: 1 },
            deviceType: { type: 'string' },
            rememberMe: { type: 'boolean' },
          },
        },
        response: { 200: responseSchema },
      },
    },
    login,
  );
  app.post(
    '/auth/refresh',
    {
      config: { auth: false, skipSecurity: true },
      schema: {
        body: {
          type: 'object',
          required: ['refreshToken'],
          additionalProperties: false,
          properties: {
            refreshToken: { type: 'string', minLength: 1 },
          },
        },
        response: { 200: responseSchema },
      },
    },
    refreshToken,
  );
  app.post(
    '/auth/logout',
    {
      config: { auth: { public: false }, skipSecurity: true },
      schema: {
        response: { 200: responseSchema },
      },
    },
    logout,
  );
  app.get(
    '/auth/me',
    {
      config: { auth: { public: false }, skipSecurity: true },
      schema: {
        response: { 200: responseSchema },
      },
    },
    getCurrentUser,
  );
};
