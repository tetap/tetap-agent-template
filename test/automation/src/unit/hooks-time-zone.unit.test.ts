import { describe, expect, it } from 'vitest';
import { formatUserDateTime, getUserLocale, getUserTimeZone } from '@tetap/hooks';

describe('time-zone helpers', () => {
  it('formats valid datetimes with the requested locale and time zone', () => {
    const isoDatetime = '2026-05-17T08:00:00.000Z';
    const expected = Intl.DateTimeFormat('en-US', {
      dateStyle: 'medium',
      hour12: false,
      timeStyle: 'medium',
      timeZone: 'UTC',
    }).format(new Date(isoDatetime));

    expect(formatUserDateTime(isoDatetime, 'UTC', 'en-US')).toBe(expected);
  });

  it('returns invalid datetime input unchanged', () => {
    expect(formatUserDateTime('not-a-date', 'UTC', 'en-US')).toBe('not-a-date');
  });

  it('resolves runtime locale and time zone fallbacks as strings', () => {
    expect(getUserLocale()).toEqual(expect.any(String));
    expect(getUserTimeZone()).toEqual(expect.any(String));
  });
});
