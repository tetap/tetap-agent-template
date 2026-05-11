import { createHmac, timingSafeEqual } from 'node:crypto';
import type { IamJwtPayload } from './types.js';

const base64UrlEncode = (input: string | Buffer) => Buffer.from(input).toString('base64url');

const base64UrlDecode = (input: string) => Buffer.from(input, 'base64url').toString('utf8');

const sign = (value: string, secret: string) => createHmac('sha256', secret).update(value).digest('base64url');

const safeEqual = (left: string, right: string) => {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
};

export const signJwt = (payload: IamJwtPayload, secret: string) => {
  const header = base64UrlEncode(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = base64UrlEncode(JSON.stringify(payload));
  const unsigned = `${header}.${body}`;

  return `${unsigned}.${sign(unsigned, secret)}`;
};

export const verifyJwt = (token: string, secret: string, nowSeconds = Math.floor(Date.now() / 1000)) => {
  const [header, body, signature] = token.split('.');

  if (!header || !body || !signature) {
    throw new Error('Invalid token.');
  }

  const unsigned = `${header}.${body}`;
  const expectedSignature = sign(unsigned, secret);

  if (!safeEqual(signature, expectedSignature)) {
    throw new Error('Invalid token signature.');
  }

  const payload = JSON.parse(base64UrlDecode(body)) as IamJwtPayload;

  if (payload.exp <= nowSeconds) {
    throw new Error('Token expired.');
  }

  return payload;
};
