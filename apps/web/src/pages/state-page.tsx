import { Button, Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@tetap/ui';
import { usePublicT } from '@tetap/hooks';

type WebStatePageProps = {
  status: '404' | '500';
};

export const WebStatePage = ({ status }: WebStatePageProps) => {
  const t = usePublicT();
  const isNotFound = status === '404';

  return (
    <main className="flex min-h-svh items-center justify-center p-6">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>{isNotFound ? t('app.notFoundTitle') : t('app.unexpectedErrorTitle')}</CardTitle>
          <CardDescription>{isNotFound ? t('app.notFound') : t('app.unexpectedError')}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{status}</p>
        </CardContent>
        <CardFooter>
          <Button asChild>
            <a href="/">{t('web.home.action')}</a>
          </Button>
        </CardFooter>
      </Card>
    </main>
  );
};
