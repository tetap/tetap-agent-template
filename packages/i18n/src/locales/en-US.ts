import type { LocaleResourceShape } from '../types.js';
import type { zhCN } from './zh-CN.js';

export const enUS = {
  app: {
    title: 'TETAP Agent Template',
    eyebrow: 'Full-stack app template',
    readyTitle: 'The web package now fits the TETAP workspace architecture',
    startHint: 'Start building your frontend app from {{path}}.',
    routerDescription:
      'The current web app is wired into the pnpm workspace, Turbo, shared config, centralized hooks, and i18n rules.',
    heroImageAlt: 'TETAP Agent Template application foundation illustration',
    primaryAction: 'Review guardrails',
    secondaryAction: 'Open reference links',
    repositoryPathLabel: 'Entry file',
    languageLabel: 'Language',
    zhCN: '中文',
    enUS: 'English',
    architectureTitle: 'Architecture guardrails',
    architectureDescription:
      'These capabilities come from shared workspace packages and should be reused by future pages, forms, and features.',
    stackTitle: 'Integrated capabilities',
    cards: {
      config: {
        title: 'Shared config',
        description: 'Vite reads the unified env directory through @tetap/config/vite.',
      },
      i18n: {
        title: 'Localized copy',
        description: 'All interface copy comes from @tetap/i18n/react and centralized locale resources.',
      },
      hooks: {
        title: 'Central hooks',
        description: 'Pages read custom hooks from @tetap/hooks instead of scattering app-local implementations.',
      },
      quality: {
        title: 'Quality gates',
        description: 'The web package keeps lint, lint:fix, and type-check scripts in the Turbo pipeline.',
      },
    },
    linksTitle: 'Reference links',
    linksDescription: 'Common documentation links stay available for continued frontend expansion.',
    viteDocs: 'Vite docs',
    reactDocs: 'React docs',
    notFound: 'The requested page could not be found.',
    unexpectedError: 'The app encountered an unexpected error. Please try again later.',
  },
  web: {
    home: {
      title: 'Hello World',
      description: 'This is the web home page powered by React Router and shadcn/ui.',
      content:
        'Future pages should retrieve components from the shadcn/ui MCP or shadcn skill and reuse localized copy.',
      action: 'Back home',
    },
  },
  site: {
    meta: {
      title: 'TETAP Agent Template Site',
      description: 'A VitePress promotional page inspired by the Anime.js homepage.',
    },
    nav: {
      ariaLabel: 'Promotional site navigation',
      docs: 'Docs',
      story: 'Scroll story',
      architecture: 'Architecture',
      quality: 'Quality gates',
      cta: 'Get started',
    },
    hero: {
      eyebrow: 'Agent-first monorepo',
      titleLine1: 'All-in-one',
      titleLine2: 'application foundation',
      description:
        'React, Fastify, IAM, Prisma, i18n, schema, and automated tests are split into explicit workspaces so AI-assisted development keeps boundaries, types, and delivery gates intact.',
      command: 'pnpm install && pnpm dev',
      primaryAction: 'Explore capabilities',
      secondaryAction: 'Read architecture',
      codeLabel: 'workspace.ts',
      stageLabel: 'Architecture animation preview',
      panels: {
        compose: 'Compose runtime',
        guard: 'Guard boundaries',
        ship: 'Ship gates',
      },
    },
    metrics: {
      workspaces: {
        value: '13',
        label: 'explicit workspaces',
      },
      gates: {
        value: '8+',
        label: 'quality gate scripts',
      },
      scopes: {
        value: '5',
        label: 'isolated i18n scopes',
      },
    },
    toolbox: {
      eyebrow: 'Toolbox',
      title: 'A complete enterprise app toolbox',
      description:
        'From page composition to identity controls, every layer has a clear owner so apps do not duplicate cross-cutting capability.',
    },
    scroll: {
      eyebrow: 'Continuous story',
      title: 'Boundaries, contracts, and gates in motion',
      description:
        'Read the engineering chain like an animation timeline: AI generation, workspace layering, permission contracts, and automated validation stay on a deliverable track.',
      stageLabel: 'Continuous scrolling architecture story animation',
      progressLabel: 'Scroll story progress',
      loopLabel: 'workspace loop',
      chapters: {
        prompt: {
          tag: '01 / Prompt',
          title: 'Send ideas into engineering boundaries first',
          description:
            'Agents can generate quickly, but every output still lands in the clear ownership of site, web, admin, backend, or packages.',
        },
        compose: {
          tag: '02 / Compose',
          title: 'Shared capability flows one way',
          description:
            'UI, i18n, schema, IAM, Prisma, and config settle inside packages while apps only compose runtime and pages.',
        },
        verify: {
          tag: '03 / Verify',
          title: 'Quality gates keep drift contained',
          description:
            'Lint, format, type-check, affected tests, Browser Mode, and smoke checks close the loop before changes reach main.',
        },
        publish: {
          tag: '04 / Publish',
          title: 'The site and docs publish from one source',
          description:
            'VitePress emits the static site and GitHub Pages deploys it so positioning, rules, and entry points are visible to users.',
        },
      },
    },
    features: {
      boundaries: {
        title: 'Workspace boundaries',
        description:
          'Apps own runtime and page composition. Shared capabilities live in packages with one-way dependencies.',
        link: 'View boundary rules',
        code: 'apps/* -> packages/*',
      },
      i18n: {
        title: 'Scoped i18n',
        description:
          'Public, admin, backend, and admin API surfaces use isolated entrypoints for all user-visible copy.',
        link: 'View i18n rules',
        code: '@tetap/i18n/site',
      },
      iam: {
        title: 'IAM core',
        description: 'RBAC, PBAC, field permissions, session invalidation, and audit primitives live in @tetap/iam.',
        link: 'View permission model',
        code: 'policyEngine.can()',
      },
      backend: {
        title: 'Fastify layering',
        description: 'Routes only register entrypoints. Validation, error decisions, and responses move into services.',
        link: 'View backend layers',
        code: 'route -> service',
      },
      schema: {
        title: 'Contract first',
        description: 'Frontend and backend request, response, and form schemas are defined with Zod in @tetap/schema.',
        link: 'View schema rules',
        code: 'z.object({...})',
      },
      testing: {
        title: 'Automated gates',
        description: 'Vitest unit, Browser Mode, smoke tests, and affected selection cover the delivery path.',
        link: 'View test strategy',
        code: 'pnpm test:affected',
      },
    },
    workflow: {
      eyebrow: 'Workflow',
      title: 'A fixed rhythm from idea to handoff',
      inspect: {
        title: 'Read context',
        description: 'Start with AGENTS, README, architecture docs, and the target workspace guide.',
      },
      implement: {
        title: 'Minimal change',
        description: 'Touch only the files the task needs, reusing shared packages and existing patterns.',
      },
      verify: {
        title: 'Targeted validation',
        description: 'Run affected or target tests first, then close with lint, format, and check.',
      },
    },
    cta: {
      eyebrow: 'Ready',
      title: 'Keep the landing page, docs, and engineering rules in the same monorepo.',
      description: 'This VitePress app can grow into a product site, architecture gateway, or open-source docs home.',
      action: 'Open README',
    },
  },
  webAdmin: {
    title: 'TETAP Admin',
    badge: 'Admin workspace',
    navigation: {
      label: 'Admin navigation',
      dashboard: 'Overview',
      users: 'Users',
      settings: 'Settings',
      security: 'Security',
      audit: 'Audit logs',
      roles: 'Roles',
      iam: 'IAM',
      sessions: 'Online users',
      account: 'Account',
      billing: 'Billing',
      notifications: 'Notifications',
      groups: {
        platform: 'Platform',
        system: 'System',
      },
      badges: {
        review: 'Review',
      },
    },
    layout: {
      sidebarTitle: 'Admin navigation',
      sidebarDescription: 'Displays the mobile admin navigation.',
      sidebarClose: 'Close sidebar',
      sidebarToggle: 'Toggle sidebar',
      search: {
        trigger: 'Search',
        placeholder: 'Type a command or search pages...',
        empty: 'No results found.',
      },
      teams: {
        label: 'Teams',
        add: 'Add workspace',
        core: {
          name: 'TETAP Admin',
          plan: 'Management console',
        },
        security: {
          name: 'Security Center',
          plan: 'Audit workspace',
        },
      },
      user: {
        name: 'Administrator',
        email: 'admin@tetap.local',
        upgrade: 'Upgrade to Pro',
        signOut: 'Sign out',
      },
      signOut: {
        title: 'Sign out',
        description: 'Sign out of the admin console? You will need to sign in again to continue.',
        confirm: 'Sign out',
      },
    },
    auth: {
      signIn: {
        title: 'Sign in',
        description: 'Enter your email and password to access the admin console. No account yet?',
        signUpLink: 'Sign up',
        forgotPassword: 'Forgot password?',
      },
      signUp: {
        title: 'Create an admin account',
        description: 'Enter your email and password to create an admin account. Already have an account?',
        signInLink: 'Sign in',
      },
      forgotPassword: {
        title: 'Forgot password',
        description: 'Enter your registered email and we will start the reset verification flow.',
        footer: 'No account yet?',
        signUpLink: 'Sign up',
      },
      otp: {
        title: 'Two-factor authentication',
        description: 'Enter the one-time code sent to your email.',
        footer: 'Did not receive it?',
        resendLink: 'Resend code',
      },
      fields: {
        email: 'Email',
        password: 'Password',
        confirmPassword: 'Confirm password',
        rememberMe: 'Remember this session',
        otp: 'Verification code',
      },
      placeholders: {
        email: 'name@example.com',
        password: '********',
        otp: '123456',
      },
      actions: {
        hidePassword: 'Hide password',
        showPassword: 'Show password',
        signIn: 'Sign in',
        signUp: 'Create account',
        continue: 'Continue',
        verify: 'Verify',
      },
      validation: {
        email: 'Enter a valid email address.',
        password: 'Password must be at least 7 characters.',
        confirmPassword: 'Confirm your password.',
        passwordMismatch: 'Passwords do not match.',
        otp: 'Enter the 6-digit code.',
      },
      legal: {
        signIn: 'By signing in, you agree to the terms of service and privacy policy.',
        signUp: 'By creating an account, you agree to the terms of service and privacy policy.',
      },
      providers: {
        github: 'Continue with GitHub',
        facebook: 'Continue with Facebook',
      },
    },
    dashboard: {
      title: 'Admin Dashboard',
      description: 'A shadcn-admin inspired information architecture adapted to this project workspace.',
      actions: {
        download: 'Download',
      },
      tabs: {
        overview: 'Overview',
        users: 'User operations',
        security: 'Security activity',
      },
      overview: {
        title: 'Overview',
        description: 'Management indicators presented with shadcn-admin card grids and scan-friendly density.',
      },
      metrics: {
        activeUsers: {
          label: 'Active users',
          value: '12,482',
          trend: 'Up 8.2% from last week',
        },
        adminTasks: {
          label: 'Open admin tasks',
          value: '24',
          trend: 'Includes account reviews and permission checks',
        },
        securityEvents: {
          label: 'Security events',
          value: '3',
          trend: 'All events are being processed',
        },
        backendStatus: {
          label: 'Admin backend',
          value: 'Online',
          trend: 'Management APIs are served by backend-admin',
        },
      },
      users: {
        title: 'User management entry',
        description: 'The admin web app composes UI only; all management APIs target backend-admin.',
        content: 'Future user tables, role grants, and audit filters must define contracts in @tetap/schema.',
      },
      activity: {
        title: 'Security and audit activity',
        description: 'Keep critical admin actions visible before real audit data is connected.',
        timestamp: 'Updated just now',
        items: {
          audit: 'An administrator login audit entry was recorded.',
          userReview: 'A user profile is waiting for review.',
          roleSync: 'A role permission sync job has been queued.',
        },
      },
    },
    iam: {
      badge: 'IAM',
      title: 'Identity and access',
      description:
        'Manage users, roles, permission codes, field policy, dynamic policy, online sessions, and audit trails.',
      tabs: {
        overview: 'Overview',
        users: 'Users',
        roles: 'Roles',
        permissions: 'Permissions',
        sessions: 'Online users',
        policy: 'Policy',
        fields: 'Field permissions',
        policies: 'Dynamic policies',
        audit: 'Audit',
      },
      actions: {
        createFieldPermission: 'Create field permission',
        createPermission: 'Create permission',
        createPolicy: 'Create policy',
        createRole: 'Create role',
        createUser: 'Create user',
        delete: 'Delete',
        grantPermission: 'Grant form permission',
        refresh: 'Refresh',
        revoke: 'Force offline',
      },
      fields: {
        action: 'Action',
        code: 'Code',
        conditions: 'Conditions JSON',
        dataScope: 'Data scope',
        deptId: 'Department ID',
        effect: 'Effect',
        email: 'Email',
        fieldName: 'Field name',
        name: 'Name',
        password: 'Password',
        permissionCodes: 'Permission codes',
        permissionType: 'Field permission type',
        resource: 'Resource',
        roleCode: 'Role code',
        roleCodes: 'Role codes',
        type: 'Type',
        username: 'Username',
      },
      forms: {
        fieldDescription: 'Configure hide, mask, readonly, or editable field rules for a role.',
        fieldTitle: 'New field permission',
        permissionDescription: 'Maintain permission codes used by roles, buttons, menus, and APIs.',
        permissionTitle: 'New permission',
        policyDescription: 'Create dynamic ABAC/PBAC policies with JSON conditions.',
        policyTitle: 'New policy',
        roleDescription: 'Create a role and bind permission codes and a data scope.',
        roleTitle: 'New role',
        userDescription: 'Create an admin user and assign roles.',
        userTitle: 'New user',
      },
      metrics: {
        users: 'Users',
        roles: 'Roles',
        permissions: 'Permission codes',
        audit: 'Audit events',
      },
      policy: {
        fieldDescription: 'Field rules trim or mask sensitive fields on the backend.',
        policyDescription: 'Dynamic policies power ABAC/PBAC condition checks.',
        auditDescription: 'Audit events track sign-in, denial, forced logout, and permission reads.',
      },
      states: {
        loadFailed: 'Failed to load IAM data. Confirm the backend-admin service is running.',
        loginExpired: 'Your admin session is unavailable. Please sign in again.',
        mutationFailed: 'The IAM management action failed. Check the input or permissions.',
        mutationOk: 'The IAM management action completed.',
        noSessions: 'No online sessions',
        noSessionsDescription: 'Signed-in user sessions will appear here.',
        revokeFailed: 'Failed to force the session offline. Please try again.',
      },
    },
    placeholder: {
      content:
        'This page is wired into the admin layout. Future forms and API contracts must continue through shared packages.',
      users: {
        title: 'User management',
        description: 'Hosts user lists, profile review, and account status management.',
      },
      security: {
        title: 'Security center',
        description: 'Centralizes audit, risk, and role-permission entry points.',
      },
      audit: {
        title: 'Audit logs',
        description: 'Connects future admin action audit queries.',
      },
      roles: {
        title: 'Roles and permissions',
        description: 'Maintains administrator roles, permissions, and authorization policy.',
      },
      settings: {
        title: 'System settings',
        description: 'Configures future admin runtime settings.',
      },
      account: {
        title: 'Account settings',
        description: 'Maintains the current administrator profile.',
      },
      billing: {
        title: 'Billing settings',
        description: 'Hosts future subscription and invoice information.',
      },
      notifications: {
        title: 'Notification settings',
        description: 'Manages admin alerts and message policies.',
      },
    },
    actions: {
      sync: 'Sync admin status',
      openDashboard: 'Back to overview',
    },
  },
  backend: {
    healthOk: 'Service is healthy.',
  },
  backendAdmin: {
    healthOk: 'Admin service is healthy.',
    auth: {
      loginOk: 'Signed in.',
      logoutOk: 'Signed out.',
      meOk: 'Current account loaded.',
      refreshOk: 'Session refreshed.',
    },
    iam: {
      auditLogsOk: 'Audit logs loaded.',
      fieldPermissionCreated: 'Field permission created.',
      fieldPermissionDeleted: 'Field permission deleted.',
      fieldPermissionUpdated: 'Field permission updated.',
      fieldPermissionsOk: 'Field permissions loaded.',
      menuCreated: 'Menu permission created.',
      menuDeleted: 'Menu permission deleted.',
      menusOk: 'Menu permissions loaded.',
      menuUpdated: 'Menu permission updated.',
      overviewOk: 'IAM overview loaded.',
      permissionCreated: 'Permission code created.',
      permissionDeleted: 'Permission code deleted.',
      permissionUpdated: 'Permission code updated.',
      permissionsOk: 'Permission codes loaded.',
      policyCreated: 'Policy created.',
      policyDeleted: 'Policy deleted.',
      policiesOk: 'Policies loaded.',
      policyUpdated: 'Policy updated.',
      revokeSessionOk: 'Session revoked.',
      roleCreated: 'Role created.',
      roleDeleted: 'Role deleted.',
      rolesOk: 'Roles loaded.',
      roleUpdated: 'Role updated.',
      sessionsOk: 'Online sessions loaded.',
      userCreated: 'User created.',
      userDeleted: 'User deleted.',
      userUpdated: 'User updated.',
      usersOk: 'Users loaded.',
    },
  },
  error: {
    badRequest: 'The request is invalid.',
    validationFailed: 'Request validation failed.',
    securityMissingHeaders: 'Required security headers are missing.',
    securityInvalidTimestamp: 'The security timestamp is invalid.',
    securityRequestExpired: 'The request has expired. Please try again.',
    securityNonceReused: 'The request was already submitted. Please do not retry it.',
    securityInvalidAppId: 'The application identifier is invalid.',
    securityInvalidSignature: 'Signature verification failed.',
    unauthorized: 'Authentication is required.',
    loginExpired: 'Your session has expired. Please sign in again.',
    forbidden: 'You do not have permission to access this resource.',
    policyDenied: 'The policy check denied this action.',
    notFound: 'The requested resource was not found.',
    internalServerError: 'The server encountered an error. Please try again later.',
    securityServiceUnavailable: 'The security verification service is unavailable. Please try again later.',
  },
  common: {
    close: 'Close',
    cancel: 'Cancel',
    confirm: 'Confirm',
    error: 'Something went wrong. Please try again later.',
    loading: 'Loading...',
    retry: 'Retry',
    success: 'Done.',
  },
  validation: {
    required: '{{field}} is required.',
  },
} as const satisfies LocaleResourceShape<typeof zhCN>;
