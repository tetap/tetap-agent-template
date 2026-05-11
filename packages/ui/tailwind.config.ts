import sharedConfig from '@tetap/config/tailwind.config.ts';

const config = {
  ...sharedConfig,
  content: ['./src/**/*.{ts,tsx}', '../../apps/**/*.{ts,tsx}'],
};

export default config;
