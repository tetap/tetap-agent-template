import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const distDir = dirname(fileURLToPath(import.meta.url));

export const configPackageDir = resolve(distDir, '..');

export const configEnvDir = resolve(configPackageDir, 'env');

export const getConfigEnvFile = (mode = 'development') => resolve(configEnvDir, `.env.${mode}`);

export const configBaseEnvFile = resolve(configEnvDir, '.env');

export const configLocalEnvFile = resolve(configEnvDir, '.env.local');
