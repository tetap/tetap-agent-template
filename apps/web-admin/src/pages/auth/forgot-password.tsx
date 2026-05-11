import { Link, useNavigate } from 'react-router';
import { adminForgotPasswordInputSchema, type AdminForgotPasswordInput } from '@tetap/schema';
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
} from '@tetap/ui';
import { useAdminT, useZodForm } from '@tetap/hooks';
import { AuthLayout } from './auth-layout.js';
import { getAdminAuthFieldErrorKey } from './form-errors.js';

export const ForgotPasswordPage = () => {
  const t = useAdminT();
  const navigate = useNavigate();
  const form = useZodForm<AdminForgotPasswordInput>(adminForgotPasswordInputSchema, {
    defaultValues: {
      email: '',
    },
  });
  const emailErrorKey = getAdminAuthFieldErrorKey(form.formState.errors.email, 'webAdmin.auth.validation.email');

  const onSubmit = form.handleSubmit(() => {
    void navigate('/otp');
  });

  return (
    <AuthLayout>
      <Card>
        <CardHeader>
          <CardTitle>{t('webAdmin.auth.forgotPassword.title')}</CardTitle>
          <CardDescription>{t('webAdmin.auth.forgotPassword.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit}>
            <FieldGroup>
              <Field data-invalid={Boolean(emailErrorKey)}>
                <FieldLabel htmlFor="admin-forgot-email">{t('webAdmin.auth.fields.email')}</FieldLabel>
                <Input
                  aria-invalid={Boolean(emailErrorKey)}
                  id="admin-forgot-email"
                  placeholder={t('webAdmin.auth.placeholders.email')}
                  type="email"
                  {...form.register('email')}
                />
                {emailErrorKey ? <FieldError>{t(emailErrorKey)}</FieldError> : null}
              </Field>
              <Button type="submit">{t('webAdmin.auth.actions.continue')}</Button>
            </FieldGroup>
          </form>
        </CardContent>
        <CardFooter>
          {t('webAdmin.auth.forgotPassword.footer')}{' '}
          <Button asChild variant="link">
            <Link to="/sign-up">{t('webAdmin.auth.forgotPassword.signUpLink')}</Link>
          </Button>
        </CardFooter>
      </Card>
    </AuthLayout>
  );
};
