import { createPublicI18n } from '@tetap/i18n/public';
import {
  Button,
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  FieldError,
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@tetap/ui';
import { memo, useCallback, useState } from 'react';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-react';

const i18n = createPublicI18n({ locale: 'zh-CN' });

const uiText = {
  action: i18n.t('common.confirm'),
  fieldError: i18n.t('validation.required', { field: i18n.t('web.home.title') }),
  initialStatus: i18n.t('common.loading'),
  searchAddon: i18n.t('web.home.eyebrow'),
  searchInput: i18n.t('web.home.primaryAction'),
  successStatus: i18n.t('common.success'),
  title: i18n.t('web.home.title'),
};

const InteractiveCard = memo(function InteractiveCard() {
  const [confirmed, setConfirmed] = useState(false);
  const confirm = useCallback(() => {
    setConfirmed(true);
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{uiText.title}</CardTitle>
      </CardHeader>
      <CardContent>{confirmed ? uiText.successStatus : uiText.initialStatus}</CardContent>
      <CardFooter>
        <Button onClick={confirm}>{uiText.action}</Button>
      </CardFooter>
    </Card>
  );
});

const InputGroupFocusFixture = memo(function InputGroupFocusFixture() {
  return (
    <div>
      <InputGroup>
        <InputGroupAddon>{uiText.searchAddon}</InputGroupAddon>
        <InputGroupInput aria-label={uiText.searchInput} />
      </InputGroup>
      <FieldError errors={[{ message: uiText.fieldError }]} />
    </div>
  );
});

describe('shared UI browser behavior', () => {
  it('renders shadcn/ui components and handles real browser clicks', async () => {
    const screen = await render(<InteractiveCard />);

    expect(screen.getByText(uiText.title).query()).not.toBeNull();
    expect(screen.getByText(uiText.initialStatus).query()).not.toBeNull();

    await screen.getByRole('button', { name: uiText.action }).click();

    await expect.poll(() => screen.getByText(uiText.successStatus).query()).not.toBeNull();
  });

  it('keeps input groups and field errors accessible in a real browser', async () => {
    const screen = await render(<InputGroupFocusFixture />);
    const input = screen.getByRole('textbox', { name: uiText.searchInput }).query();

    expect(input).not.toBeNull();
    expect(screen.getByRole('alert').query()).not.toBeNull();
    expect(screen.getByText(uiText.fieldError).query()).not.toBeNull();

    await screen.getByText(uiText.searchAddon).click();

    await expect.poll(() => document.activeElement).toBe(input);
  });
});
