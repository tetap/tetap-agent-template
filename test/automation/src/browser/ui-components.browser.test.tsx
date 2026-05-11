import { createPublicI18n } from '@tetap/i18n/public';
import { Button, Card, CardContent, CardFooter, CardHeader, CardTitle } from '@tetap/ui';
import { useState } from 'react';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-react';

const i18n = createPublicI18n({ locale: 'zh-CN' });

const uiText = {
  action: i18n.t('common.confirm'),
  initialStatus: i18n.t('common.loading'),
  successStatus: i18n.t('common.success'),
  title: i18n.t('web.home.title'),
};

const InteractiveCard = () => {
  const [confirmed, setConfirmed] = useState(false);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{uiText.title}</CardTitle>
      </CardHeader>
      <CardContent>{confirmed ? uiText.successStatus : uiText.initialStatus}</CardContent>
      <CardFooter>
        <Button onClick={() => setConfirmed(true)}>{uiText.action}</Button>
      </CardFooter>
    </Card>
  );
};

describe('shared UI browser behavior', () => {
  it('renders shadcn/ui components and handles real browser clicks', async () => {
    const screen = await render(<InteractiveCard />);

    expect(screen.getByText(uiText.title).query()).not.toBeNull();
    expect(screen.getByText(uiText.initialStatus).query()).not.toBeNull();

    await screen.getByRole('button', { name: uiText.action }).click();

    await expect.poll(() => screen.getByText(uiText.successStatus).query()).not.toBeNull();
  });
});
