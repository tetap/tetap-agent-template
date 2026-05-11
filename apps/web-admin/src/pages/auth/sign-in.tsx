import { Link, useNavigate, useSearchParams } from 'react-router';
import { adminSignInInputSchema, type AdminSignInInput } from '@tetap/schema';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Checkbox,
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
  const setAccessToken = useAdminSessionStore(state => state.auth.setAccessToken);
  const setUser = useAdminSessionStore(state => state.auth.setUser);
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
    const authResult = await createAdminAuthResult(values.email, values.password, values.rememberMe);
    setAccessToken(authResult.accessToken);
    setUser(authResult.user);
    void navigate(searchParams.get('redirect') || '/', { replace: true });
  });

  return (
    <AuthLayout>
      <Card>
        <CardHeader>
          <CardTitle>{t('webAdmin.auth.signIn.title')}</CardTitle>
          <CardDescription>
            {t('webAdmin.auth.signIn.description')}{' '}
            <Button asChild variant="link">
              <Link to="/sign-up">{t('webAdmin.auth.signIn.signUpLink')}</Link>
            </Button>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit}>
            <FieldGroup>
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
              <Field data-invalid={Boolean(passwordErrorKey)}>
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
              <Field orientation="horizontal">
                <Checkbox
                  checked={form.watch('rememberMe')}
                  id="admin-sign-in-remember"
                  onCheckedChange={checked => form.setValue('rememberMe', checked === true)}
                />
                <FieldLabel htmlFor="admin-sign-in-remember">{t('webAdmin.auth.fields.rememberMe')}</FieldLabel>
              </Field>
              <Button disabled={form.formState.isSubmitting} type="submit">
                {t('webAdmin.auth.actions.signIn')}
              </Button>
              <Button asChild variant="link">
                <Link to="/forgot-password">{t('webAdmin.auth.signIn.forgotPassword')}</Link>
              </Button>
            </FieldGroup>
          </form>
        </CardContent>
        <CardFooter>{t('webAdmin.auth.legal.signIn')}</CardFooter>
      </Card>
    </AuthLayout>
  );
};
