import { memo } from 'react';
import { HomeCapabilitiesSection } from './home/capabilities-section.js';
import { HomeHeroSection } from './home/hero-section.js';
import { HomeWorkflowSection } from './home/workflow-section.js';

export const HomePage = memo(function HomePage() {
  return (
    <main className="min-h-svh bg-background text-foreground">
      <HomeHeroSection />
      <HomeCapabilitiesSection />
      <HomeWorkflowSection />
    </main>
  );
});
