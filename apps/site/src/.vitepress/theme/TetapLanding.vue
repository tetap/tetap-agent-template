<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { createSiteI18n, type SiteMessageKey } from '@tetap/i18n/site';

type Feature = {
  titleKey: SiteMessageKey;
  descriptionKey: SiteMessageKey;
  linkKey: SiteMessageKey;
  codeKey: SiteMessageKey;
  href: string;
  accent: 'red' | 'orange' | 'lime' | 'cyan' | 'blue' | 'violet';
};

type WorkflowStep = {
  titleKey: SiteMessageKey;
  descriptionKey: SiteMessageKey;
  index: string;
};

const i18n = createSiteI18n({ locale: 'zh-CN' });
const t = i18n.t;

const navItems = [
  { labelKey: 'site.nav.docs', href: '#toolbox' },
  { labelKey: 'site.nav.architecture', href: '#features' },
  { labelKey: 'site.nav.quality', href: '#workflow' },
] as const satisfies readonly { labelKey: SiteMessageKey; href: string }[];

const metrics = [
  { valueKey: 'site.metrics.workspaces.value', labelKey: 'site.metrics.workspaces.label' },
  { valueKey: 'site.metrics.gates.value', labelKey: 'site.metrics.gates.label' },
  { valueKey: 'site.metrics.scopes.value', labelKey: 'site.metrics.scopes.label' },
] as const satisfies readonly { valueKey: SiteMessageKey; labelKey: SiteMessageKey }[];

const panels = [
  { labelKey: 'site.hero.panels.compose', marker: 'runtime', accent: 'red' },
  { labelKey: 'site.hero.panels.guard', marker: 'policy', accent: 'lime' },
  { labelKey: 'site.hero.panels.ship', marker: 'check', accent: 'cyan' },
] as const satisfies readonly { labelKey: SiteMessageKey; marker: string; accent: string }[];

const features: readonly Feature[] = [
  {
    titleKey: 'site.features.boundaries.title',
    descriptionKey: 'site.features.boundaries.description',
    linkKey: 'site.features.boundaries.link',
    codeKey: 'site.features.boundaries.code',
    href: '#workflow',
    accent: 'red',
  },
  {
    titleKey: 'site.features.i18n.title',
    descriptionKey: 'site.features.i18n.description',
    linkKey: 'site.features.i18n.link',
    codeKey: 'site.features.i18n.code',
    href: '#workflow',
    accent: 'orange',
  },
  {
    titleKey: 'site.features.iam.title',
    descriptionKey: 'site.features.iam.description',
    linkKey: 'site.features.iam.link',
    codeKey: 'site.features.iam.code',
    href: '#workflow',
    accent: 'lime',
  },
  {
    titleKey: 'site.features.backend.title',
    descriptionKey: 'site.features.backend.description',
    linkKey: 'site.features.backend.link',
    codeKey: 'site.features.backend.code',
    href: '#workflow',
    accent: 'cyan',
  },
  {
    titleKey: 'site.features.schema.title',
    descriptionKey: 'site.features.schema.description',
    linkKey: 'site.features.schema.link',
    codeKey: 'site.features.schema.code',
    href: '#workflow',
    accent: 'blue',
  },
  {
    titleKey: 'site.features.testing.title',
    descriptionKey: 'site.features.testing.description',
    linkKey: 'site.features.testing.link',
    codeKey: 'site.features.testing.code',
    href: '#workflow',
    accent: 'violet',
  },
];

const workflowSteps: readonly WorkflowStep[] = [
  {
    titleKey: 'site.workflow.inspect.title',
    descriptionKey: 'site.workflow.inspect.description',
    index: '01',
  },
  {
    titleKey: 'site.workflow.implement.title',
    descriptionKey: 'site.workflow.implement.description',
    index: '02',
  },
  {
    titleKey: 'site.workflow.verify.title',
    descriptionKey: 'site.workflow.verify.description',
    index: '03',
  },
];

const currentPanelIndex = ref(0);
const currentPanel = computed(() => panels[currentPanelIndex.value]);
let rotationTimer: number | undefined;

onMounted(() => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReducedMotion) {
    return;
  }

  rotationTimer = window.setInterval(() => {
    currentPanelIndex.value = (currentPanelIndex.value + 1) % panels.length;
  }, 2400);
});

onUnmounted(() => {
  if (rotationTimer) {
    window.clearInterval(rotationTimer);
  }
});
</script>

<template>
  <div class="tetap-landing">
    <header class="site-header">
      <a class="brand-mark" href="#hero" aria-label="TETAP">
        <span class="brand-icon" aria-hidden="true">T</span>
        <span class="brand-name">TETAP</span>
      </a>

      <nav class="site-nav" :aria-label="t('site.nav.ariaLabel')">
        <a v-for="item in navItems" :key="item.href" :href="item.href">
          {{ t(item.labelKey) }}
        </a>
      </nav>

      <a class="nav-cta" href="#toolbox">
        {{ t('site.nav.cta') }}
      </a>
    </header>

    <main>
      <section id="hero" class="hero-section" aria-labelledby="hero-title">
        <div class="hero-copy">
          <p class="eyebrow">{{ t('site.hero.eyebrow') }}</p>
          <h1 id="hero-title">
            {{ t('site.hero.titleLine1') }}
            <span>{{ t('site.hero.titleLine2') }}</span>
            <i aria-hidden="true">.</i>
          </h1>
          <p class="hero-description">{{ t('site.hero.description') }}</p>

          <div class="hero-actions" aria-label="hero actions">
            <code>{{ t('site.hero.command') }}</code>
            <a class="action-button primary" href="#toolbox">
              {{ t('site.hero.primaryAction') }}
              <span aria-hidden="true">→</span>
            </a>
            <a class="action-button secondary" href="#features">
              {{ t('site.hero.secondaryAction') }}
              <span aria-hidden="true">↓</span>
            </a>
          </div>
        </div>

        <div class="motion-stage" :aria-label="t('site.hero.stageLabel')">
          <div class="stage-grid" aria-hidden="true"></div>
          <div class="code-window">
            <div class="window-bar">
              <span>{{ t('site.hero.codeLabel') }}</span>
              <span>{{ currentPanel.marker }}</span>
            </div>
            <pre><code>const tetap = createWorkspace({
  runtime: ['web', 'admin', 'api'],
  contracts: '@tetap/schema',
  policy: '@tetap/iam',
  verify: ['lint', 'check', 'smoke']
})</code></pre>
          </div>

          <div class="shape-cloud" aria-hidden="true">
            <span class="shape square"></span>
            <span class="shape circle"></span>
            <span class="shape triangle"></span>
            <span class="shape capsule"></span>
          </div>

          <div class="stage-tabs">
            <button
              v-for="(panel, index) in panels"
              :key="panel.marker"
              type="button"
              :class="{ active: index === currentPanelIndex }"
              :aria-pressed="index === currentPanelIndex"
              @click="currentPanelIndex = index">
              {{ t(panel.labelKey) }}
            </button>
          </div>

          <div class="stage-status" :data-accent="currentPanel.accent" aria-live="polite">
            <span></span>
            {{ t(currentPanel.labelKey) }}
          </div>
        </div>
      </section>

      <section class="metrics-band" aria-label="site metrics">
        <div v-for="item in metrics" :key="item.labelKey" class="metric-item">
          <strong>{{ t(item.valueKey) }}</strong>
          <span>{{ t(item.labelKey) }}</span>
        </div>
      </section>

      <section id="toolbox" class="toolbox-section section-band" aria-labelledby="toolbox-title">
        <div class="section-copy">
          <p class="eyebrow">{{ t('site.toolbox.eyebrow') }}</p>
          <h2 id="toolbox-title">{{ t('site.toolbox.title') }}</h2>
          <p>{{ t('site.toolbox.description') }}</p>
        </div>
        <div class="toolbox-board" aria-hidden="true">
          <span class="board-line line-one"></span>
          <span class="board-line line-two"></span>
          <span class="board-node node-web">web</span>
          <span class="board-node node-api">api</span>
          <span class="board-node node-iam">iam</span>
          <span class="board-node node-test">test</span>
        </div>
      </section>

      <section id="features" class="features-gallery" aria-label="feature gallery">
        <article v-for="feature in features" :key="feature.titleKey" class="feature-row" :data-accent="feature.accent">
          <div class="feature-copy">
            <h2>{{ t(feature.titleKey) }}</h2>
            <p>{{ t(feature.descriptionKey) }}</p>
            <a :href="feature.href">
              {{ t(feature.linkKey) }}
              <span aria-hidden="true">→</span>
            </a>
          </div>
          <div class="feature-demo" aria-hidden="true">
            <span class="demo-label">{{ t(feature.codeKey) }}</span>
            <span class="demo-pulse"></span>
            <span class="demo-track"></span>
            <span class="demo-track short"></span>
          </div>
        </article>
      </section>

      <section id="workflow" class="workflow-section section-band" aria-labelledby="workflow-title">
        <div class="section-copy">
          <p class="eyebrow">{{ t('site.workflow.eyebrow') }}</p>
          <h2 id="workflow-title">{{ t('site.workflow.title') }}</h2>
        </div>
        <div class="workflow-grid">
          <article v-for="step in workflowSteps" :key="step.index" class="workflow-step">
            <span>{{ step.index }}</span>
            <h3>{{ t(step.titleKey) }}</h3>
            <p>{{ t(step.descriptionKey) }}</p>
          </article>
        </div>
      </section>

      <section class="closing-section" aria-labelledby="closing-title">
        <p class="eyebrow">{{ t('site.cta.eyebrow') }}</p>
        <h2 id="closing-title">{{ t('site.cta.title') }}</h2>
        <p>{{ t('site.cta.description') }}</p>
        <a class="action-button primary" href="#hero">
          {{ t('site.cta.action') }}
          <span aria-hidden="true">↑</span>
        </a>
      </section>
    </main>
  </div>
</template>
