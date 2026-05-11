import { Link, useNavigate } from 'react-router';
import { adminSignUpInputSchema, type AdminSignUpInput } from '@tetap/schema';
import {
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
  Separator,
} from '@tetap/ui';
import { useAdminSessionStore, useAdminT, useZodForm } from '@tetap/hooks';
import { AuthLayout } from './auth-layout.js';
import { createAdminAuthResult } from './auth-session.js';
import { getAdminAuthFieldErrorKey } from './form-errors.js';

export const SignUpPage = () => {
  const t = useAdminT();
  const navigate = useNavigate();
  const setAccessToken = useAdminSessionStore(state => state.auth.setAccessToken);
  const setUser = useAdminSessionStore(state => state.auth.setUser);
  const form = useZodForm<AdminSignUpInput>(adminSignUpInputSchema, {
    defaultValues: {
      confirmPassword: '',
      email: '',
      password: '',
    },
  });
  const errors = form.formState.errors;
  const emailErrorKey = getAdminAuthFieldErrorKey(errors.email, 'webAdmin.auth.validation.email');
  const passwordErrorKey = getAdminAuthFieldErrorKey(errors.password, 'webAdmin.auth.validation.password');
  const confirmPasswordErrorKey = getAdminAuthFieldErrorKey(
    errors.confirmPassword,
    'webAdmin.auth.validation.confirmPassword',
  );

  const onSubmit = form.handleSubmit(async values => {
    const authResult = await createAdminAuthResult(values.email, values.password);
    setAccessToken(authResult.accessToken);
    setUser(authResult.user);
    void navigate('/', { replace: true });
  });

  return (
    <AuthLayout>
      <Card>
        <CardHeader>
          <CardTitle>{t('webAdmin.auth.signUp.title')}</CardTitle>
          <CardDescription>
            {t('webAdmin.auth.signUp.description')}{' '}
            <Button asChild variant="link">
              <Link to="/sign-in">{t('webAdmin.auth.signUp.signInLink')}</Link>
            </Button>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit}>
            <FieldGroup>
              <Field data-invalid={Boolean(emailErrorKey)}>
                <FieldLabel htmlFor="admin-sign-up-email">{t('webAdmin.auth.fields.email')}</FieldLabel>
                <Input
                  aria-invalid={Boolean(emailErrorKey)}
                  id="admin-sign-up-email"
                  placeholder={t('webAdmin.auth.placeholders.email')}
                  type="email"
                  {...form.register('email')}
                />
                {emailErrorKey ? <FieldError>{t(emailErrorKey)}</FieldError> : null}
              </Field>
              <Field data-invalid={Boolean(passwordErrorKey)}>
                <FieldLabel htmlFor="admin-sign-up-password">{t('webAdmin.auth.fields.password')}</FieldLabel>
                <PasswordInput
                  aria-invalid={Boolean(passwordErrorKey)}
                  hidePasswordLabel={t('webAdmin.auth.actions.hidePassword')}
                  id="admin-sign-up-password"
                  placeholder={t('webAdmin.auth.placeholders.password')}
                  showPasswordLabel={t('webAdmin.auth.actions.showPassword')}
                  {...form.register('password')}
                />
                {passwordErrorKey ? <FieldError>{t(passwordErrorKey)}</FieldError> : null}
              </Field>
              <Field data-invalid={Boolean(confirmPasswordErrorKey)}>
                <FieldLabel htmlFor="admin-sign-up-confirm-password">
                  {t('webAdmin.auth.fields.confirmPassword')}
                </FieldLabel>
                <PasswordInput
                  aria-invalid={Boolean(confirmPasswordErrorKey)}
                  hidePasswordLabel={t('webAdmin.auth.actions.hidePassword')}
                  id="admin-sign-up-confirm-password"
                  placeholder={t('webAdmin.auth.placeholders.password')}
                  showPasswordLabel={t('webAdmin.auth.actions.showPassword')}
                  {...form.register('confirmPassword')}
                />
                {confirmPasswordErrorKey ? <FieldError>{t(confirmPasswordErrorKey)}</FieldError> : null}
              </Field>
              <Button disabled={form.formState.isSubmitting} type="submit">
                {t('webAdmin.auth.actions.signUp')}
              </Button>
              <Separator />
              <Button type="button" variant="outline">
                {t('webAdmin.auth.providers.github')}
              </Button>
              <Button type="button" variant="outline">
                {t('webAdmin.auth.providers.facebook')}
              </Button>
            </FieldGroup>
          </form>
        </CardContent>
        <CardFooter>{t('webAdmin.auth.legal.signUp')}</CardFooter>
      </Card>
    </AuthLayout>
  );
};
