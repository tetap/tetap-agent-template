import { memo } from 'react';
import { Badge, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@tetap/ui';

type HomeSummaryCardProps = {
  description: string;
  label?: string;
  title: string;
};

export const HomeSummaryCard = memo(function HomeSummaryCard({ description, label, title }: HomeSummaryCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      {label ? (
        <CardContent>
          <Badge variant="outline">{label}</Badge>
        </CardContent>
      ) : null}
    </Card>
  );
});
