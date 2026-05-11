import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const workspaceRoots = ['apps', 'packages', 'scripts'];
const rootPackagePath = 'package.json';
const exactVersionPattern = /^(\d+)\.(\d+)\.(\d+)(?:[-+][0-9A-Za-z-.]+)?$/;

const args = process.argv.slice(2);
const hasArg = name => args.includes(name);
const getArgValue = name => {
  const index = args.indexOf(name);

  return index >= 0 ? args[index + 1] : undefined;
};

const bump = getArgValue('--bump') ?? process.env.VERSION_BUMP ?? 'patch';
const explicitVersion = getArgValue('--version') ?? process.env.VERSION;
const dryRun = hasArg('--dry-run');

const readPackageJson = path => JSON.parse(readFileSync(path, 'utf8'));
const writePackageJson = (path, packageJson) => {
  if (!dryRun) {
    writeFileSync(path, `${JSON.stringify(packageJson, null, 2)}\n`);
  }
};

const assertVersion = version => {
  if (!exactVersionPattern.test(version)) {
    throw new Error(`Invalid semver version: ${version}`);
  }
};

const bumpVersion = (version, bumpType) => {
  assertVersion(version);

  const [, major, minor, patch] = version.match(exactVersionPattern);
  const parts = {
    major: Number(major),
    minor: Number(minor),
    patch: Number(patch),
  };

  if (bumpType === 'major') {
    return `${parts.major + 1}.0.0`;
  }

  if (bumpType === 'minor') {
    return `${parts.major}.${parts.minor + 1}.0`;
  }

  if (bumpType === 'patch') {
    return `${parts.major}.${parts.minor}.${parts.patch + 1}`;
  }

  throw new Error(`Unsupported bump type: ${bumpType}. Use major, minor, patch, or --version x.y.z.`);
};

const findWorkspacePackageJsons = directory => {
  if (!existsSync(directory)) {
    return [];
  }

  return readdirSync(directory, { withFileTypes: true })
    .filter(entry => entry.isDirectory())
    .map(entry => join(directory, entry.name, 'package.json'))
    .filter(existsSync);
};

const rootPackage = readPackageJson(rootPackagePath);
const nextVersion = explicitVersion ?? bumpVersion(rootPackage.version, bump);
assertVersion(nextVersion);

const packageJsonPaths = [rootPackagePath, ...workspaceRoots.flatMap(findWorkspacePackageJsons)];
const updatedPackages = [];

for (const packagePath of packageJsonPaths) {
  const packageJson = readPackageJson(packagePath);

  if (!packageJson.version) {
    continue;
  }

  const previousVersion = packageJson.version;
  packageJson.version = nextVersion;
  writePackageJson(packagePath, packageJson);

  updatedPackages.push({
    name: packageJson.name ?? packagePath,
    packagePath,
    previousVersion,
    nextVersion,
  });
}

const action = dryRun ? 'Would update' : 'Updated';
for (const item of updatedPackages) {
  console.log(`${action} ${item.name} (${item.packagePath}): ${item.previousVersion} -> ${item.nextVersion}`);
}

console.log(`Version ${dryRun ? 'dry run' : 'bump'} complete: ${nextVersion}`);
