import { memo } from 'react';

type SectionHeadingProps = {
  description: string;
  title: string;
};

export const SectionHeading = memo(function SectionHeading({ description, title }: SectionHeadingProps) {
  return (
    <div className="max-w-2xl">
      <h2 className="text-3xl font-semibold tracking-normal">{title}</h2>
      <p className="mt-3 text-muted-foreground">{description}</p>
    </div>
  );
});
