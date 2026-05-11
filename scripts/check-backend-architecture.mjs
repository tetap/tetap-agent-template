import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const backendApps = ['apps/backend', 'apps/backend-admin'];
const routeMethods = ['get', 'post', 'put', 'patch', 'delete', 'options', 'head', 'all'];
const failures = [];

const listTsFiles = directory => {
  if (!existsSync(directory)) {
    return [];
  }

  return readdirSync(directory).flatMap(entry => {
    const path = join(directory, entry);
    const stats = statSync(path);

    if (stats.isDirectory()) {
      return listTsFiles(path);
    }

    return path.endsWith('.ts') && !path.endsWith('.d.ts') ? [path] : [];
  });
};

const report = (file, message) => {
  failures.push(`${relative(process.cwd(), file)}: ${message}`);
};

const isAdminPath = file =>
  relative(process.cwd(), file)
    .split(/[\\/._-]+/)
    .some(segment => ['admin', 'admins'].includes(segment.toLowerCase()));

const assertNoAdminApiInPublicBackend = (backendApp, file, source) => {
  if (backendApp !== 'apps/backend') {
    return;
  }

  if (isAdminPath(file)) {
    report(file, 'public backend must not contain admin API files; use apps/backend-admin');
  }

  if (/['"`][^'"`]*\/admin(?:[/?#'"`]|$)/i.test(source)) {
    report(file, 'public backend must not register admin API paths; use apps/backend-admin');
  }
};

const checkBackendApp = backendApp => {
  const backendSrc = join(process.cwd(), backendApp, 'src');
  const routesDir = join(backendSrc, 'routes');
  const servicesDir = join(backendSrc, 'services');
  const routeFiles = listTsFiles(routesDir);
  const serviceFiles = listTsFiles(servicesDir);

  for (const file of routeFiles) {
    const source = readFileSync(file, 'utf8');
    const relativePath = relative(routesDir, file);

    assertNoAdminApiInPublicBackend(backendApp, file, source);

    const forbiddenImports = [
      [/from ['"]@tetap\/schema(?:\/[^'"]*)?['"]/, 'routes must not import @tetap/schema; validate in services'],
      [/from ['"]@tetap\/prisma(?:\/[^'"]*)?['"]/, 'routes must not import @tetap/prisma; access data in services'],
      [/from ['"]\.\.\/shared\/api-response\.js['"]/, 'routes must not build responses; send responses in services'],
      [/from ['"]\.\.\/shared\/app-error\.js['"]/, 'routes must not create app errors; throw them in services'],
      [/from ['"]\.\.\/shared\/error-code\.js['"]/, 'routes must not choose error codes; choose them in services'],
    ];

    for (const [pattern, message] of forbiddenImports) {
      if (pattern.test(source)) {
        report(file, message);
      }
    }

    const forbiddenLogic = [
      [/\.(parse|safeParse)\s*\(/, 'routes must not parse or validate input/output bodies'],
      [/\breply\./, 'routes must not write replies directly'],
      [/\brequest\./, 'routes must not read request data directly'],
      [/\bnew\s+Date\s*\(|\bDate\.now\s*\(/, 'routes must not compute runtime values'],
      [/\b(if|else|switch|for|while|try|catch)\b/, 'routes must not contain branching or control-flow logic'],
    ];

    for (const [pattern, message] of forbiddenLogic) {
      if (pattern.test(source)) {
        report(file, message);
      }
    }

    for (const method of routeMethods) {
      const inlineHandlerPattern = new RegExp(
        `\\.${method}\\s*\\([\\s\\S]*?(?:async\\s*)?(?:\\([^)]*\\)|[a-zA-Z_$][\\w$]*)\\s*=>`,
        'm',
      );
      const functionHandlerPattern = new RegExp(
        `\\.${method}\\s*\\([\\s\\S]*?function\\s*(?:[a-zA-Z_$][\\w$]*)?\\s*\\(`,
        'm',
      );

      if (inlineHandlerPattern.test(source) || functionHandlerPattern.test(source)) {
        report(file, 'routes must pass imported service handlers instead of declaring inline handlers');
        break;
      }
    }

    if (relativePath !== 'index.ts' && /\bapp\.(get|post|put|patch|delete|options|head|all)\s*\(/.test(source)) {
      if (!/from ['"]\.\.\/services\//.test(source)) {
        report(file, 'route registrations must delegate to handlers imported from ../services');
      }
    }
  }

  if (routeFiles.length > 0 && serviceFiles.length === 0) {
    failures.push(`${backendApp}/src/services: backend routes exist, but no services layer was found`);
  }

  for (const file of serviceFiles) {
    const source = readFileSync(file, 'utf8');

    assertNoAdminApiInPublicBackend(backendApp, file, source);

    if (!/from ['"]@tetap\/schema(?:\/[^'"]*)?['"]/.test(source)) {
      report(file, 'services must import @tetap/schema and validate request/response bodies there');
    }
  }
};

for (const backendApp of backendApps) {
  checkBackendApp(backendApp);
}

if (failures.length > 0) {
  console.error('Backend architecture check failed:');

  for (const failure of failures) {
    console.error(`- ${failure}`);
  }

  process.exit(1);
}
