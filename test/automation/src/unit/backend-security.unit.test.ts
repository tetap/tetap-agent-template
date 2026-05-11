import { describe, expect, it } from 'vitest';
import { assertAllowedUpload, assertSafeOutboundUrl } from '../../../../apps/backend/src/shared/security.js';

describe('backend security helpers', () => {
  it('blocks local SSRF targets and non-HTTP protocols', () => {
    expect(() => assertSafeOutboundUrl('http://127.0.0.1:3000/internal')).toThrow('blocked');
    expect(() => assertSafeOutboundUrl('file:///etc/passwd')).toThrow('HTTP(S)');
    expect(assertSafeOutboundUrl('https://example.com/resource').hostname).toBe('example.com');
  });

  it('enforces upload type and size allowlists', () => {
    expect(() =>
      assertAllowedUpload(
        { mimetype: 'image/png', size: 1024 },
        { allowedMimeTypes: ['image/png', 'image/jpeg'], maxBytes: 5 * 1024 * 1024 },
      ),
    ).not.toThrow();
    expect(() =>
      assertAllowedUpload(
        { mimetype: 'application/x-msdownload', size: 1024 },
        { allowedMimeTypes: ['image/png'], maxBytes: 5 * 1024 * 1024 },
      ),
    ).toThrow('type');
  });
});
