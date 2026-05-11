import type { Theme } from 'vitepress';
import DefaultTheme from 'vitepress/theme';
import TetapLanding from './TetapLanding.vue';
import './styles.css';

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('TetapLanding', TetapLanding);
  },
} satisfies Theme;
