import { memo } from 'react';
import { Card, CardDescription, CardHeader, CardTitle } from '@tetap/ui';

type HomeMetricCardProps = {
  label: string;
  value: string;
};

export const HomeMetricCard = memo(function HomeMetricCard({ label, value }: HomeMetricCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardDescription>{label}</CardDescription>
        <CardTitle className="text-4xl">{value}</CardTitle>
      </CardHeader>
    </Card>
  );
});
