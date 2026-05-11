import { createHash, createHmac, timingSafeEqual } from 'node:crypto';

export const sha256 = (value: string) => createHash('sha256').update(value).digest('hex');

export const hmacSha256 = (secret: string, value: string) =>
  createHmac('sha256', secret).update(value).digest('base64');

export const timingSafeStringEqual = (left: string, right: string) => {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
};

export const stableStringify = (input: unknown): string => {
  const normalizedInput = JSON.parse(JSON.stringify(input ?? null)) as unknown;

  if (normalizedInput === null || typeof normalizedInput !== 'object') {
    return JSON.stringify(normalizedInput);
  }

  if (Array.isArray(normalizedInput)) {
    return `[${normalizedInput.map(stableStringify).join(',')}]`;
  }

  const record = normalizedInput as Record<string, unknown>;

  return `{${Object.keys(record)
    .sort()
    .map(key => `${JSON.stringify(key)}:${stableStringify(record[key])}`)
    .join(',')}}`;
};

export const getCanonicalPathname = (url: string) => url.split('?')[0] || '/';

export const getBodyHash = (body: unknown) => {
  if (body === null || body === undefined) {
    return sha256('');
  }

  if (typeof body === 'string') {
    const trimmedBody = body.trim();

    if (trimmedBody.startsWith('{') || trimmedBody.startsWith('[')) {
      try {
        return sha256(stableStringify(JSON.parse(trimmedBody)));
      } catch {
        return sha256(body);
      }
    }

    return sha256(body);
  }

  if (Buffer.isBuffer(body)) {
    return sha256(body.toString('utf8'));
  }

  return sha256(stableStringify(body));
};

const blockedOutboundHosts = new Set(['0.0.0.0', '127.0.0.1', '169.254.169.254', '::1', 'localhost']);

export const assertSafeOutboundUrl = (value: string) => {
  const parsedUrl = new URL(value);

  if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
    throw new Error('Only HTTP(S) outbound URLs are allowed.');
  }

  if (blockedOutboundHosts.has(parsedUrl.hostname.toLowerCase())) {
    throw new Error('Outbound URL target is blocked.');
  }

  return parsedUrl;
};

export type UploadCandidate = {
  mimetype: string;
  size: number;
};

export type UploadPolicy = {
  allowedMimeTypes: readonly string[];
  maxBytes: number;
};

export const assertAllowedUpload = (file: UploadCandidate, policy: UploadPolicy) => {
  if (!policy.allowedMimeTypes.includes(file.mimetype)) {
    throw new Error('Upload file type is not allowed.');
  }

  if (file.size > policy.maxBytes) {
    throw new Error('Upload file is too large.');
  }
};
