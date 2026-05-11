import { useNavigate, useSearchParams } from 'react-router';
import { useState } from 'react';
import { LogIn } from 'lucide-react';
import { adminSignInInputSchema, type AdminSignInInput } from '@tetap/schema';
import {
  Alert,
  AlertDescription,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  Input,
  PasswordInput,
} from '@tetap/ui';
import { useAdminSessionStore, useAdminT, useZodForm } from '@tetap/hooks';
import { AuthLayout } from './auth-layout.js';
import { createAdminAuthResult } from './auth-session.js';
import { getAdminAuthFieldErrorKey } from './form-errors.js';

export const SignInPage = () => {
  const t = useAdminT();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const setContext = useAdminSessionStore(state => state.auth.setContext);
  const [authError, setAuthError] = useState<string | null>(null);
  const form = useZodForm<AdminSignInInput>(adminSignInInputSchema, {
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });
  const errors = form.formState.errors;
  const emailErrorKey = getAdminAuthFieldErrorKey(errors.email, 'webAdmin.auth.validation.email');
  const passwordErrorKey = getAdminAuthFieldErrorKey(errors.password, 'webAdmin.auth.validation.password');

  const onSubmit = form.handleSubmit(async values => {
    setAuthError(null);

    try {
      const authResult = await createAdminAuthResult(values.email, values.password, values.rememberMe);
      setContext(authResult);
      void navigate(searchParams.get('redirect') || '/', { replace: true });
    } catch {
      setAuthError(t('webAdmin.auth.signIn.loginFailed'));
    }
  });

  return (
    <AuthLayout>
      <Card className="max-w-sm gap-4">
        <CardHeader>
          <CardTitle className="text-lg tracking-tight">{t('webAdmin.auth.signIn.title')}</CardTitle>
          <CardDescription>{t('webAdmin.auth.signIn.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit}>
            <FieldGroup className="gap-3">
              {authError ? (
                <Alert variant="destructive">
                  <AlertDescription>{authError}</AlertDescription>
                </Alert>
              ) : null}
              <Field data-invalid={Boolean(emailErrorKey)}>
                <FieldLabel htmlFor="admin-sign-in-email">{t('webAdmin.auth.fields.email')}</FieldLabel>
                <Input
                  aria-invalid={Boolean(emailErrorKey)}
                  id="admin-sign-in-email"
                  placeholder={t('webAdmin.auth.placeholders.email')}
                  type="email"
                  {...form.register('email')}
                />
                {emailErrorKey ? <FieldError>{t(emailErrorKey)}</FieldError> : null}
              </Field>
              <Field className="relative" data-invalid={Boolean(passwordErrorKey)}>
                <FieldLabel htmlFor="admin-sign-in-password">{t('webAdmin.auth.fields.password')}</FieldLabel>
                <PasswordInput
                  aria-invalid={Boolean(passwordErrorKey)}
                  hidePasswordLabel={t('webAdmin.auth.actions.hidePassword')}
                  id="admin-sign-in-password"
                  placeholder={t('webAdmin.auth.placeholders.password')}
                  showPasswordLabel={t('webAdmin.auth.actions.showPassword')}
                  {...form.register('password')}
                />
                {passwordErrorKey ? <FieldError>{t(passwordErrorKey)}</FieldError> : null}
              </Field>
              <Button className="mt-2" disabled={form.formState.isSubmitting} type="submit">
                <LogIn data-icon="inline-start" />
                {t('webAdmin.auth.actions.signIn')}
              </Button>
            </FieldGroup>
          </form>
        </CardContent>
        <CardFooter>
          <p className="text-muted-foreground text-sm">{t('webAdmin.auth.signIn.adminManaged')}</p>
        </CardFooter>
      </Card>
    </AuthLayout>
  );
};
