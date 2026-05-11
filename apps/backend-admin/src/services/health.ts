import { healthResponseSchema, type HealthData } from '@tetap/schema/backend';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { sendSuccess } from '../shared/api-response.js';

export const getHealth = async (request: FastifyRequest, reply: FastifyReply) => {
  const data = {
    status: 'ok',
    service: 'backend-admin',
    timestamp: new Date().toISOString(),
  } satisfies HealthData;

  return sendSuccess(reply, request, healthResponseSchema, data, 'backendAdmin.healthOk');
};
