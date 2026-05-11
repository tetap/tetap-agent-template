import { ShieldCheck } from 'lucide-react';
import { TetapLogo } from '@tetap/ui';
import type { AdminTeam } from '../types.js';

export const adminTeams: readonly AdminTeam[] = [
  {
    nameKey: 'webAdmin.layout.teams.core.name',
    planKey: 'webAdmin.layout.teams.core.plan',
    logo: TetapLogo,
  },
  {
    nameKey: 'webAdmin.layout.teams.security.name',
    planKey: 'webAdmin.layout.teams.security.plan',
    logo: ShieldCheck,
  },
];
