import { Link } from 'react-router';
import { usePublicT } from '@tetap/hooks';
import { Button, Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@tetap/ui';

export const HomePage = () => {
  const t = usePublicT();

  return (
    <main>
      <Card>
        <CardHeader>
          <CardTitle>{t('web.home.title')}</CardTitle>
          <CardDescription>{t('web.home.description')}</CardDescription>
        </CardHeader>
        <CardContent>{t('web.home.content')}</CardContent>
        <CardFooter>
          <Button asChild>
            <Link to="/">{t('web.home.action')}</Link>
          </Button>
        </CardFooter>
      </Card>
    </main>
  );
};
