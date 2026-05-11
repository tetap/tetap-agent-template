import { existsSync, readFileSync } from 'node:fs';
import { configBaseEnvFile, configLocalEnvFile, getConfigEnvFile } from './paths.js';
import { readAppEnv, type AppEnv, type EnvSource } from './env.js';

export type LoadConfigEnvOptions = {
  mode?: string;
  includeLocal?: boolean;
  override?: boolean;
  target?: NodeJS.ProcessEnv;
};

type LoadEnvFileOptions = {
  protectedKeys: ReadonlySet<string>;
  override: boolean;
};

const parseEnvLine = (line: string) => {
  const normalizedLine = line.trim();

  if (!normalizedLine || normalizedLine.startsWith('#')) {
    return undefined;
  }

  const match = normalizedLine.match(/^([\w.-]+)\s*=\s*(.*)$/);

  if (!match) {
    return undefined;
  }

  const [, key, rawValue = ''] = match;
  const value = rawValue.replace(/^['"]|['"]$/g, '');

  return [key, value] as const;
};

const isEnvEntry = (entry: ReturnType<typeof parseEnvLine>): entry is readonly [string, string] => Boolean(entry);

const loadEnvFile = (filePath: string, target: NodeJS.ProcessEnv, { protectedKeys, override }: LoadEnvFileOptions) => {
  if (!existsSync(filePath)) {
    return;
  }

  const content = readFileSync(filePath, 'utf8');

  content
    .split(/\r?\n/)
    .map(parseEnvLine)
    .filter(isEnvEntry)
    .forEach(([key, value]) => {
      if (override || !protectedKeys.has(key)) {
        target[key] = value;
      }
    });
};

export const loadConfigEnv = ({
  mode = process.env.NODE_ENV ?? 'development',
  includeLocal = true,
  override = false,
  target = process.env,
}: LoadConfigEnvOptions = {}) => {
  const protectedKeys = new Set(Object.keys(target));
  const loadOptions = { protectedKeys, override };

  loadEnvFile(configBaseEnvFile, target, loadOptions);
  loadEnvFile(getConfigEnvFile(mode), target, loadOptions);

  if (includeLocal) {
    loadEnvFile(configLocalEnvFile, target, loadOptions);
  }

  return target;
};

export const getAppEnv = (source: EnvSource = process.env): AppEnv => readAppEnv(source);
