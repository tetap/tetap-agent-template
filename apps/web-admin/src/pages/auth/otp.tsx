import { Link, useNavigate } from 'react-router';
import { adminOtpInputSchema, type AdminOtpInput } from '@tetap/schema';
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

export const OtpPage = () => {
  const t = useAdminT();
  const navigate = useNavigate();
  const form = useZodForm<AdminOtpInput>(adminOtpInputSchema, {
    defaultValues: {
      otp: '',
    },
  });
  const otpErrorKey = getAdminAuthFieldErrorKey(form.formState.errors.otp, 'webAdmin.auth.validation.otp');

  const onSubmit = form.handleSubmit(() => {
    void navigate('/sign-in');
  });

  return (
    <AuthLayout>
      <Card>
        <CardHeader>
          <CardTitle>{t('webAdmin.auth.otp.title')}</CardTitle>
          <CardDescription>{t('webAdmin.auth.otp.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit}>
            <FieldGroup>
              <Field data-invalid={Boolean(otpErrorKey)}>
                <FieldLabel htmlFor="admin-otp-code">{t('webAdmin.auth.fields.otp')}</FieldLabel>
                <Input
                  aria-invalid={Boolean(otpErrorKey)}
                  id="admin-otp-code"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder={t('webAdmin.auth.placeholders.otp')}
                  {...form.register('otp')}
                />
                {otpErrorKey ? <FieldError>{t(otpErrorKey)}</FieldError> : null}
              </Field>
              <Button type="submit">{t('webAdmin.auth.actions.verify')}</Button>
            </FieldGroup>
          </form>
        </CardContent>
        <CardFooter>
          {t('webAdmin.auth.otp.footer')}{' '}
          <Button asChild variant="link">
            <Link to="/sign-in">{t('webAdmin.auth.otp.resendLink')}</Link>
          </Button>
        </CardFooter>
      </Card>
    </AuthLayout>
  );
};
