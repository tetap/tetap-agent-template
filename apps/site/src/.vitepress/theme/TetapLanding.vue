<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { createSiteI18n, type SiteMessageKey } from '@tetap/i18n/site';

type Feature = {
  titleKey: SiteMessageKey;
  descriptionKey: SiteMessageKey;
  linkKey: SiteMessageKey;
  codeKey: SiteMessageKey;
  href: string;
  external?: boolean;
  accent: 'red' | 'orange' | 'lime' | 'cyan' | 'blue' | 'violet';
};

type NavItem = {
  labelKey: SiteMessageKey;
  href: string;
  external?: boolean;
};

type WorkflowStep = {
  titleKey: SiteMessageKey;
  descriptionKey: SiteMessageKey;
  index: string;
};

type ScrollAccent = 'red' | 'orange' | 'lime' | 'cyan';

type ScrollChapter = {
  titleKey: SiteMessageKey;
  descriptionKey: SiteMessageKey;
  tagKey: SiteMessageKey;
  index: string;
  accent: ScrollAccent;
  command: string;
};

const i18n = createSiteI18n({ locale: 'zh-CN' });
const t = i18n.t;

const repositoryUrl = 'https://github.com/tetap/tetap-agent-template';
const docsLinks = {
  readme: `${repositoryUrl}#readme`,
  architecture: `${repositoryUrl}/blob/master/docs/Logical%20Architecture%20Diagram/README.md`,
  boundaries: `${repositoryUrl}/blob/master/docs/Logical%20Architecture%20Diagram/01-workspace-boundaries.md`,
  i18n: `${repositoryUrl}/blob/master/docs/Logical%20Architecture%20Diagram/packages-i18n.md`,
  iam: `${repositoryUrl}/blob/master/docs/Logical%20Architecture%20Diagram/packages-iam.md`,
  backend: `${repositoryUrl}/blob/master/docs/Logical%20Architecture%20Diagram/apps-backend.md`,
  schema: `${repositoryUrl}/blob/master/docs/Logical%20Architecture%20Diagram/packages-schema.md`,
  testing: `${repositoryUrl}/blob/master/docs/memory/testing-workflow.md`,
} as const;

const navItems = [
  { labelKey: 'site.nav.docs', href: docsLinks.readme, external: true },
  { labelKey: 'site.nav.story', href: '#scroll-story' },
  { labelKey: 'site.nav.architecture', href: '#features' },
  { labelKey: 'site.nav.quality', href: '#workflow' },
] as const satisfies readonly NavItem[];

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
    href: docsLinks.boundaries,
    external: true,
    accent: 'red',
  },
  {
    titleKey: 'site.features.i18n.title',
    descriptionKey: 'site.features.i18n.description',
    linkKey: 'site.features.i18n.link',
    codeKey: 'site.features.i18n.code',
    href: docsLinks.i18n,
    external: true,
    accent: 'orange',
  },
  {
    titleKey: 'site.features.iam.title',
    descriptionKey: 'site.features.iam.description',
    linkKey: 'site.features.iam.link',
    codeKey: 'site.features.iam.code',
    href: docsLinks.iam,
    external: true,
    accent: 'lime',
  },
  {
    titleKey: 'site.features.backend.title',
    descriptionKey: 'site.features.backend.description',
    linkKey: 'site.features.backend.link',
    codeKey: 'site.features.backend.code',
    href: docsLinks.backend,
    external: true,
    accent: 'cyan',
  },
  {
    titleKey: 'site.features.schema.title',
    descriptionKey: 'site.features.schema.description',
    linkKey: 'site.features.schema.link',
    codeKey: 'site.features.schema.code',
    href: docsLinks.schema,
    external: true,
    accent: 'blue',
  },
  {
    titleKey: 'site.features.testing.title',
    descriptionKey: 'site.features.testing.description',
    linkKey: 'site.features.testing.link',
    codeKey: 'site.features.testing.code',
    href: docsLinks.testing,
    external: true,
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

const scrollChapters: readonly ScrollChapter[] = [
  {
    titleKey: 'site.scroll.chapters.prompt.title',
    descriptionKey: 'site.scroll.chapters.prompt.description',
    tagKey: 'site.scroll.chapters.prompt.tag',
    index: '01',
    accent: 'red',
    command: 'agent.read(AGENTS.md)',
  },
  {
    titleKey: 'site.scroll.chapters.compose.title',
    descriptionKey: 'site.scroll.chapters.compose.description',
    tagKey: 'site.scroll.chapters.compose.tag',
    index: '02',
    accent: 'orange',
    command: 'apps -> packages',
  },
  {
    titleKey: 'site.scroll.chapters.verify.title',
    descriptionKey: 'site.scroll.chapters.verify.description',
    tagKey: 'site.scroll.chapters.verify.tag',
    index: '03',
    accent: 'lime',
    command: 'pnpm check',
  },
  {
    titleKey: 'site.scroll.chapters.publish.title',
    descriptionKey: 'site.scroll.chapters.publish.description',
    tagKey: 'site.scroll.chapters.publish.tag',
    index: '04',
    accent: 'cyan',
    command: 'deploy_pages(site)',
  },
];

const currentPanelIndex = ref(0);
const scrollStoryRef = ref<HTMLElement | null>(null);
const scrollProgress = ref(0);
const activeScrollChapterIndex = ref(0);
const currentPanel = computed(() => panels[currentPanelIndex.value]);
const activeScrollChapter = computed(() => scrollChapters[activeScrollChapterIndex.value] ?? scrollChapters[0]);
const scrollProgressPercent = computed(() => Math.round(scrollProgress.value * 100));
const scrollRotate = computed(() => `${Math.round(scrollProgress.value * 180)}deg`);
let rotationTimer: number | undefined;
let scrollAnimationFrame: number | undefined;
let removeScrollListeners: (() => void) | undefined;

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const updateScrollStory = () => {
  const element = scrollStoryRef.value;

  if (!element) {
    return;
  }

  const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
  const rect = element.getBoundingClientRect();
  const scrollDistance = Math.max(1, rect.height - viewportHeight);
  const nextProgress = clamp(-rect.top / scrollDistance, 0, 1);

  scrollProgress.value = nextProgress;
  activeScrollChapterIndex.value = Math.min(
    scrollChapters.length - 1,
    Math.floor(nextProgress * scrollChapters.length),
  );
};

const requestScrollStoryUpdate = () => {
  if (scrollAnimationFrame !== undefined) {
    return;
  }

  scrollAnimationFrame = window.requestAnimationFrame(() => {
    scrollAnimationFrame = undefined;
    updateScrollStory();
  });
};

onMounted(() => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!prefersReducedMotion) {
    rotationTimer = window.setInterval(() => {
      currentPanelIndex.value = (currentPanelIndex.value + 1) % panels.length;
    }, 2400);
  }

  window.addEventListener('scroll', requestScrollStoryUpdate, { passive: true });
  window.addEventListener('resize', requestScrollStoryUpdate);
  removeScrollListeners = () => {
    window.removeEventListener('scroll', requestScrollStoryUpdate);
    window.removeEventListener('resize', requestScrollStoryUpdate);
  };
  requestScrollStoryUpdate();
});

onUnmounted(() => {
  if (rotationTimer) {
    window.clearInterval(rotationTimer);
  }

  if (scrollAnimationFrame !== undefined) {
    window.cancelAnimationFrame(scrollAnimationFrame);
  }

  removeScrollListeners?.();
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
        <a
          v-for="item in navItems"
          :key="item.href"
          :href="item.href"
          :target="item.external ? '_blank' : undefined"
          :rel="item.external ? 'noreferrer' : undefined">
          {{ t(item.labelKey) }}
        </a>
      </nav>

      <a class="nav-cta" :href="docsLinks.readme" target="_blank" rel="noreferrer">
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

          <div class="hero-actions" :aria-label="t('site.a11y.heroActions')">
            <code>{{ t('site.hero.command') }}</code>
            <a class="action-button primary" href="#toolbox">
              {{ t('site.hero.primaryAction') }}
              <span aria-hidden="true">→</span>
            </a>
            <a class="action-button secondary" :href="docsLinks.architecture" target="_blank" rel="noreferrer">
              {{ t('site.hero.secondaryAction') }}
              <span aria-hidden="true">→</span>
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

      <section class="metrics-band" :aria-label="t('site.a11y.metrics')">
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

      <section
        id="scroll-story"
        ref="scrollStoryRef"
        class="scroll-story"
        aria-labelledby="scroll-story-title"
        :style="{ '--scroll-progress': scrollProgress.toFixed(3), '--scroll-rotate': scrollRotate }">
        <div class="scroll-sticky">
          <div class="section-copy scroll-copy">
            <p class="eyebrow">{{ t('site.scroll.eyebrow') }}</p>
            <h2 id="scroll-story-title">{{ t('site.scroll.title') }}</h2>
            <p>{{ t('site.scroll.description') }}</p>

            <div
              class="scroll-progress"
              role="progressbar"
              :aria-label="t('site.scroll.progressLabel')"
              aria-valuemin="0"
              aria-valuemax="100"
              :aria-valuenow="scrollProgressPercent">
              <span></span>
            </div>
          </div>

          <div class="scroll-stage" :data-accent="activeScrollChapter.accent" :aria-label="t('site.scroll.stageLabel')">
            <div class="scroll-stage-grid" aria-hidden="true"></div>

            <div class="scroll-marquee-stack" aria-hidden="true">
              <div class="scroll-marquee lane-one">
                <span>apps/site</span>
                <span>@tetap/i18n/site</span>
                <span>vitepress build</span>
                <span>github pages</span>
                <span>apps/site</span>
                <span>@tetap/i18n/site</span>
                <span>vitepress build</span>
                <span>github pages</span>
              </div>
              <div class="scroll-marquee lane-two">
                <span>@tetap/schema</span>
                <span>@tetap/iam</span>
                <span>@tetap/config</span>
                <span>@tetap/prisma</span>
                <span>@tetap/schema</span>
                <span>@tetap/iam</span>
                <span>@tetap/config</span>
                <span>@tetap/prisma</span>
              </div>
            </div>

            <div class="scroll-orbit" aria-hidden="true">
              <span class="orbit-core">T</span>
              <span class="orbit-node node-one"></span>
              <span class="orbit-node node-two"></span>
              <span class="orbit-node node-three"></span>
            </div>

            <div class="scroll-path" aria-hidden="true">
              <span class="path-line"></span>
              <span class="path-dot"></span>
              <span class="path-block block-one"></span>
              <span class="path-block block-two"></span>
              <span class="path-block block-three"></span>
            </div>

            <div class="scroll-console" aria-live="polite">
              <div class="console-bar">
                <span>{{ t('site.scroll.loopLabel') }}</span>
                <span>{{ t(activeScrollChapter.tagKey) }}</span>
              </div>
              <code>{{ activeScrollChapter.command }}</code>
              <strong>{{ t(activeScrollChapter.titleKey) }}</strong>
            </div>
          </div>
        </div>

        <div class="scroll-chapters">
          <article
            v-for="(chapter, index) in scrollChapters"
            :key="chapter.index"
            class="scroll-chapter"
            :class="{ active: index === activeScrollChapterIndex }"
            :data-accent="chapter.accent">
            <span class="chapter-index">{{ chapter.index }}</span>
            <span class="chapter-tag">{{ t(chapter.tagKey) }}</span>
            <h3>{{ t(chapter.titleKey) }}</h3>
            <p>{{ t(chapter.descriptionKey) }}</p>
          </article>
        </div>
      </section>

      <section id="features" class="features-gallery" :aria-label="t('site.a11y.featureGallery')">
        <article v-for="feature in features" :key="feature.titleKey" class="feature-row" :data-accent="feature.accent">
          <div class="feature-copy">
            <h2>{{ t(feature.titleKey) }}</h2>
            <p>{{ t(feature.descriptionKey) }}</p>
            <a
              :href="feature.href"
              :target="feature.external ? '_blank' : undefined"
              :rel="feature.external ? 'noreferrer' : undefined">
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
        <a class="action-button primary" :href="docsLinks.readme" target="_blank" rel="noreferrer">
          {{ t('site.cta.action') }}
          <span aria-hidden="true">→</span>
        </a>
      </section>
    </main>
  </div>
</template>
