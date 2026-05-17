import { memo, useCallback } from 'react';
import { LogOut } from 'lucide-react';
import { formatUserDateTime, useAdminT } from '@tetap/hooks';
import {
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@tetap/ui';
import type { IamSession } from '@tetap/schema/iam';
import { ConfirmActionButton } from './confirm-action-button.js';

type SessionsSectionProps = {
  canRevokeSessions: boolean;
  isMutating: boolean;
  onRevoke: (session: IamSession) => void;
  sessions: IamSession[];
  timeZone: string;
};

export const SessionsSection = memo(function SessionsSection({
  canRevokeSessions,
  isMutating,
  onRevoke,
  sessions,
  timeZone,
}: SessionsSectionProps) {
  const t = useAdminT();

  return (
    <section className="grid min-w-0 gap-4">
      {sessions.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>{t('webAdmin.iam.tables.sessionsTitle')}</CardTitle>
            <CardDescription>{t('webAdmin.iam.tables.sessionsDescription')}</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('webAdmin.iam.fields.userId')}</TableHead>
                  <TableHead>{t('webAdmin.iam.fields.email')}</TableHead>
                  <TableHead>{t('webAdmin.iam.fields.deviceType')}</TableHead>
                  <TableHead>{t('webAdmin.iam.fields.ip')}</TableHead>
                  <TableHead>{t('webAdmin.iam.fields.status')}</TableHead>
                  <TableHead>{t('webAdmin.iam.fields.lastActiveTime')}</TableHead>
                  <TableHead>{t('webAdmin.iam.fields.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sessions.map(session => (
                  <SessionRow
                    canRevokeSessions={canRevokeSessions}
                    isMutating={isMutating}
                    key={session.id}
                    onRevoke={onRevoke}
                    session={session}
                    timeZone={timeZone}
                  />
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>{t('webAdmin.iam.states.noSessions')}</CardTitle>
            <CardDescription>{t('webAdmin.iam.states.noSessionsDescription')}</CardDescription>
          </CardHeader>
        </Card>
      )}
    </section>
  );
});

type SessionRowProps = {
  canRevokeSessions: boolean;
  isMutating: boolean;
  onRevoke: (session: IamSession) => void;
  session: IamSession;
  timeZone: string;
};

const SessionRow = memo(function SessionRow({
  canRevokeSessions,
  isMutating,
  onRevoke,
  session,
  timeZone,
}: SessionRowProps) {
  const t = useAdminT();
  const revokeSession = useCallback(() => {
    onRevoke(session);
  }, [onRevoke, session]);

  return (
    <TableRow>
      <TableCell>{session.username ?? session.userId}</TableCell>
      <TableCell>{session.email ?? '-'}</TableCell>
      <TableCell>{session.deviceType}</TableCell>
      <TableCell>{session.ip}</TableCell>
      <TableCell>
        <Badge>{session.status}</Badge>
      </TableCell>
      <TableCell>{formatUserDateTime(session.lastActiveTime, timeZone)}</TableCell>
      <TableCell>
        <ConfirmActionButton
          description={t('webAdmin.iam.confirm.revokeDescription', {
            item: session.username ?? session.userId,
          })}
          disabled={isMutating || session.status !== 'ONLINE' || !canRevokeSessions}
          onConfirm={revokeSession}
          pending={isMutating}
          size="sm"
          title={t('webAdmin.iam.confirm.revokeTitle')}
          variant="outline">
          <LogOut data-icon="inline-start" />
          {t('webAdmin.iam.actions.revoke')}
        </ConfirmActionButton>
      </TableCell>
    </TableRow>
  );
});
