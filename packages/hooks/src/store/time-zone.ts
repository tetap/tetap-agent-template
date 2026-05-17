const fallbackTimeZone = 'UTC';
const userTimeZoneFormatter = typeof Intl === 'undefined' ? undefined : Intl.DateTimeFormat();
const dateTimeFormatters = new Map<string, Intl.DateTimeFormat>();

export const getUserTimeZone = () => {
  return userTimeZoneFormatter?.resolvedOptions().timeZone || fallbackTimeZone;
};

export const getUserLocale = () => {
  if (typeof navigator === 'undefined') {
    return 'en-US';
  }

  return navigator.language || 'en-US';
};

export const formatUserDateTime = (isoDatetime: string, timeZone = getUserTimeZone(), locale = getUserLocale()) => {
  const date = new Date(isoDatetime);

  if (Number.isNaN(date.getTime()) || typeof Intl === 'undefined') {
    return isoDatetime;
  }

  const formatterKey = `${locale}:${timeZone}`;
  const cachedFormatter = dateTimeFormatters.get(formatterKey);

  if (cachedFormatter) {
    return cachedFormatter.format(date);
  }

  const formatter = Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
    hour12: false,
    timeStyle: 'medium',
    timeZone,
  });

  dateTimeFormatters.set(formatterKey, formatter);

  return formatter.format(date);
};
