import type { Locale } from '@tetap/i18n/locales';
import type { AuthenticatedUserContext, IamService, PermissionCode } from '@tetap/iam';

declare module 'fastify' {
  interface FastifyInstance {
    iam: IamService;
  }

  interface FastifyRequest {
    locale: Locale;
    auth: AuthenticatedUserContext | null;
  }

  interface FastifyContextConfig {
    auth?:
      | false
      | {
          public?: boolean;
          permission?: PermissionCode;
        };
    skipSecurity?: boolean;
  }
}
