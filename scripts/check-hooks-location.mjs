import { existsSync, readdirSync, statSync } from 'node:fs';
import { basename, extname, join, normalize, sep } from 'node:path';

const roots = ['apps', 'packages', 'scripts'];
const hooksPackageDir = normalize(join('packages', 'hooks'));
const allowedHookDir = normalize(join(hooksPackageDir, 'src', 'store'));
const ignoredDirectories = new Set(['node_modules', 'build', 'dist', '.react-router', '.turbo', '.cache']);
const errors = [];

const isTypescriptFile = filePath => ['.ts', '.tsx'].includes(extname(filePath));
const isHookFile = filePath => /^use[A-Z0-9].*\.(ts|tsx)$/.test(basename(filePath));
const isInHooksPackage = filePath => normalize(filePath).startsWith(`${hooksPackageDir}${sep}`);
const isAllowedHookFile = filePath => normalize(filePath).startsWith(`${allowedHookDir}${sep}`);
const hasHooksDirectory = filePath => !isInHooksPackage(filePath) && normalize(filePath).split(sep).includes('hooks');

const walk = directory => {
  if (!existsSync(directory)) {
    return [];
  }

  return readdirSync(directory).flatMap(entry => {
    const fullPath = join(directory, entry);
    const stat = statSync(fullPath);

    if (stat.isDirectory()) {
      if (ignoredDirectories.has(entry)) {
        return [];
      }

      return walk(fullPath);
    }

    return stat.isFile() && isTypescriptFile(fullPath) ? [fullPath] : [];
  });
};

for (const filePath of roots.flatMap(walk)) {
  const normalizedPath = normalize(filePath);

  if (isAllowedHookFile(normalizedPath)) {
    continue;
  }

  if (isHookFile(normalizedPath)) {
    errors.push(`${normalizedPath} is a hook file. Move hooks to ${allowedHookDir}.`);
  }

  if (hasHooksDirectory(normalizedPath)) {
    errors.push(`${normalizedPath} is under a hooks directory. Use ${allowedHookDir} instead.`);
  }
}

if (errors.length > 0) {
  console.error(errors.map(error => `- ${error}`).join('\n'));
  process.exit(1);
}
