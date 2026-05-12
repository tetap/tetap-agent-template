const fallbackTimeZone = 'UTC';

export const getUserTimeZone = () => {
  if (typeof Intl === 'undefined') {
    return fallbackTimeZone;
  }

  return Intl.DateTimeFormat().resolvedOptions().timeZone || fallbackTimeZone;
};

export const getUserLocale = () => {
  if (typeof navigator === 'undefined') {
    return 'en-US';
  }

  return navigator.language || 'en-US';
};

export const formatUserDateTime = (isoDatetime: string, timeZone = getUserTimeZone(), locale = getUserLocale()) => {
  const date = new Date(isoDatetime);

  if (Number.isNaN(date.getTime())) {
    return isoDatetime;
  }

  return new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
    hour12: false,
    timeStyle: 'medium',
    timeZone,
  }).format(date);
};
