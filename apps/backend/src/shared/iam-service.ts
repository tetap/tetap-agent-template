import { createDemoIamData, IamService } from '@tetap/iam';
import type { AppEnv } from '@tetap/config';

export const createIamService = (env: AppEnv) =>
  new IamService(createDemoIamData(env.AUTH_SALT), {
    accessTokenSecret: env.AUTH_SECRET,
    refreshTokenSecret: env.REFRESH_AUTH_SECRET,
    passwordSalt: env.AUTH_SALT,
    accessTokenTtlSeconds: env.AUTH_ACCESS_TOKEN_TTL_SECONDS,
    refreshTokenTtlSeconds: env.AUTH_REFRESH_TOKEN_TTL_SECONDS,
  });
