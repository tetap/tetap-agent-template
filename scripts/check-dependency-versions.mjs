import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const rootPackagePath = 'package.json';
const rootPackage = JSON.parse(readFileSync(rootPackagePath, 'utf8'));

const rootVersions = {
  '@hookform/resolvers': rootPackage.dependencies?.['@hookform/resolvers'],
  react: rootPackage.dependencies?.react,
  'react-dom': rootPackage.dependencies?.['react-dom'],
  'react-hook-form': rootPackage.dependencies?.['react-hook-form'],
  typescript: rootPackage.devDependencies?.typescript,
  zod: rootPackage.dependencies?.zod,
};

const exactVersionPattern = /^\d+\.\d+\.\d+(?:[-+].*)?$/;
const workspaceRoots = ['apps', 'packages', 'scripts', 'test'];
const dependencySections = ['dependencies', 'devDependencies', 'optionalDependencies'];
const peerSections = ['peerDependencies'];
const errors = [];

const assertExactRootVersion = (name, version) => {
  if (!version) {
    errors.push(`Root package.json must define ${name}.`);
    return;
  }

  if (!exactVersionPattern.test(version)) {
    errors.push(`Root ${name} must use an exact version, got ${version}.`);
  }
};

Object.entries(rootVersions).forEach(([name, version]) => assertExactRootVersion(name, version));

for (const [name, version] of Object.entries(rootVersions)) {
  const overrideVersion = rootPackage.pnpm?.overrides?.[name];

  if (overrideVersion !== version) {
    errors.push(`pnpm.overrides.${name} must match root version ${version}, got ${overrideVersion ?? '<missing>'}.`);
  }
}

const findWorkspacePackageJsons = directory => {
  if (!existsSync(directory)) {
    return [];
  }

  return readdirSync(directory, { withFileTypes: true })
    .filter(entry => entry.isDirectory())
    .map(entry => join(directory, entry.name, 'package.json'))
    .filter(existsSync);
};

const workspacePackageJsons = workspaceRoots.flatMap(findWorkspacePackageJsons);

for (const packagePath of workspacePackageJsons) {
  const packageJson = JSON.parse(readFileSync(packagePath, 'utf8'));
  const packageName = packageJson.name ?? packagePath;

  for (const section of dependencySections) {
    for (const name of Object.keys(rootVersions)) {
      const version = packageJson[section]?.[name];

      if (version) {
        errors.push(`${packageName} must not install ${name} in ${section}. Install it only at the workspace root.`);
      }
    }
  }

  for (const section of peerSections) {
    for (const [name, rootVersion] of Object.entries(rootVersions)) {
      const version = packageJson[section]?.[name];

      if (version && version !== rootVersion) {
        errors.push(`${packageName} ${section}.${name} must match root version ${rootVersion}, got ${version}.`);
      }
    }
  }
}

if (errors.length > 0) {
  console.error(errors.map(error => `- ${error}`).join('\n'));
  process.exit(1);
}
