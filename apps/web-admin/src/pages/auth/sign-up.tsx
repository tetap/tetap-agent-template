import { Link } from 'react-router';
import { ShieldCheck } from 'lucide-react';
import { Alert, AlertDescription, Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@tetap/ui';
import { useAdminT } from '@tetap/hooks';
import { AuthLayout } from './auth-layout.js';

export const SignUpPage = () => {
  const t = useAdminT();

  return (
    <AuthLayout>
      <Card className="max-w-sm gap-4">
        <CardHeader>
          <CardTitle className="text-lg tracking-tight">{t('webAdmin.auth.signUp.title')}</CardTitle>
          <CardDescription>{t('webAdmin.auth.signUp.description')}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Alert>
            <ShieldCheck />
            <AlertDescription>{t('webAdmin.auth.signUp.adminManaged')}</AlertDescription>
          </Alert>
          <Button asChild>
            <Link to="/sign-in">{t('webAdmin.auth.signUp.signInLink')}</Link>
          </Button>
        </CardContent>
      </Card>
    </AuthLayout>
  );
};
