import { Link, useNavigate, useSearchParams } from 'react-router';
import { useState } from 'react';
import { Facebook, Github, LogIn } from 'lucide-react';
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
          <CardDescription>
            {t('webAdmin.auth.signIn.description')}{' '}
            <Link className="text-nowrap underline underline-offset-4 hover:text-primary" to="/sign-up">
              {t('webAdmin.auth.signIn.signUpLink')}
            </Link>
          </CardDescription>
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
                <div className="flex items-center justify-between gap-3">
                  <FieldLabel htmlFor="admin-sign-in-password">{t('webAdmin.auth.fields.password')}</FieldLabel>
                  <Link className="text-sm font-medium text-muted-foreground hover:opacity-75" to="/forgot-password">
                    {t('webAdmin.auth.signIn.forgotPassword')}
                  </Link>
                </div>
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
              <div className="relative my-2">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">{t('webAdmin.auth.providers.separator')}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Button disabled={form.formState.isSubmitting} type="button" variant="outline">
                  <Github data-icon="inline-start" />
                  {t('webAdmin.auth.providers.github')}
                </Button>
                <Button disabled={form.formState.isSubmitting} type="button" variant="outline">
                  <Facebook data-icon="inline-start" />
                  {t('webAdmin.auth.providers.facebook')}
                </Button>
              </div>
            </FieldGroup>
          </form>
        </CardContent>
        <CardFooter>
          <p className="px-8 text-center text-sm text-muted-foreground">
            {t('webAdmin.auth.legal.signInPrefix')}{' '}
            <Link className="underline underline-offset-4 hover:text-primary" to="/terms">
              {t('webAdmin.auth.legal.terms')}
            </Link>{' '}
            {t('webAdmin.auth.legal.and')}{' '}
            <Link className="underline underline-offset-4 hover:text-primary" to="/privacy">
              {t('webAdmin.auth.legal.privacy')}
            </Link>
            .
          </p>
        </CardFooter>
      </Card>
    </AuthLayout>
  );
};
