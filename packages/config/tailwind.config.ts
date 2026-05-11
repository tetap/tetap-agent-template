import type { Config } from 'tailwindcss';

const settings: Omit<Config, 'content'> = {
  theme: {
    extend: {
      colors: {},
    },
  },
  plugins: [],
};

export default settings;
