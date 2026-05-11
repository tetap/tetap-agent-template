import { getAppEnv, loadConfigEnv } from '@tetap/config/node';
import { buildBackendApp } from './app.js';

loadConfigEnv();

const env = getAppEnv();
const app = await buildBackendApp({ env });

try {
  const address = await app.listen({ host: env.HOST, port: env.PORT });
  app.log.info({ address });
} catch (error) {
  app.log.error(error);
  process.exit(1);
}
