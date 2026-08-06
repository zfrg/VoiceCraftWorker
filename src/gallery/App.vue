<template>
  <WinTitleBar :title="appTitle" :theme="themeSetting" />
  <WinToolTipService />
  <div class="gallery-app-content" :class="{ 'has-titlebar': titleBarActive || isHostedInUwpWebView }">
    <WinNavigationView
      class="app-navigation-view"
      :MenuItems="menuItems"
      :SelectedItem="selectedNav"
      :IsSettingsVisible="true"
      :IsPaneToggleButtonVisible="true"
      @update:SelectedItem="onNavChange">
      <div class="app-page">
        <TtsTextPage v-if="selectedNav === 'text'" />
        <TtsFilePage v-else-if="selectedNav === 'file'" />
        <SettingsPage v-else />
      </div>
    </WinNavigationView>
  </div>
</template>

<script setup>
import { ref, provide, computed, watch, onMounted } from 'vue';
import WinTitleBar from '../components/WinTitleBar.vue';
import WinToolTipService from '../components/WinToolTipService.vue';
import WinNavigationView from '../components/WinNavigationView.vue';
import TtsTextPage from './pages/TtsTextPage.vue';
import TtsFilePage from './pages/TtsFilePage.vue';
import SettingsPage from './pages/SettingsPage.vue';
import appManifest from '../manifest.json';

import { useI18n } from '../components/i18n/index';

const { t } = useI18n();

const titleBarActive = ref(false);
provide('winTitleBarVisible', titleBarActive);

const readStoredSetting = (key, fallback, allowedValues) => {
  const value = localStorage.getItem(key);
  return allowedValues.includes(value) ? value : fallback;
};

const themeSetting = ref(readStoredSetting('winui-theme-setting', 'system', ['system', 'light', 'dark']));
const materialSetting = ref(readStoredSetting('winui-material-setting', 'mica', ['mica', 'acrylic']));
const isHostedInUwpWebView = ref(false);

provide('themeSetting', themeSetting);
provide('materialSetting', materialSetting);
provide('isHostedInUwpWebView', isHostedInUwpWebView);

const appTitle = computed(() => t(appManifest.resources?.title ?? 'app.title'));

const menuItems = computed(() => [
  { Content: t('text.nav-text'), Tag: 'text', Icon: '\uE8DB' },
  { Content: t('text.nav-file'), Tag: 'file', Icon: '\uE8B5' }
]);

const selectedNav = ref('text');

function applyTheme(mode) {
  const html = document.documentElement;
  html.classList.remove('theme-light', 'theme-dark');
  if (mode === 'light') html.classList.add('theme-light');
  else if (mode === 'dark') html.classList.add('theme-dark');
}

watch(themeSetting, (val) => applyTheme(val), { immediate: true });

const persistSetting = (key, source) => {
  watch(source, (value) => {
    localStorage.setItem(key, value);
  }, { immediate: true });
};

persistSetting('winui-theme-setting', themeSetting);
persistSetting('winui-material-setting', materialSetting);

function postUwpSetting(key, value) {
  if (!isHostedInUwpWebView.value || !window.chrome?.webview?.postMessage) return;
  window.chrome.webview.postMessage({ source: 'WinUIonWeb', type: 'appSettingChanged', key, value });
}

onMounted(() => {
  isHostedInUwpWebView.value = Boolean(window.__WINUI_ON_WEB_UWP_APP__ || window.chrome?.webview);
  postUwpSetting('theme', themeSetting.value);
  postUwpSetting('material', materialSetting.value);
});

function onNavChange(value) {
  if (value === 'settings') {
    selectedNav.value = 'settings';
    return;
  }
  if (value && selectedNav.value !== value) selectedNav.value = value;
}
</script>

<style>
  @import '../styles/theme.css';
  @import '../styles/animations.css';

  .gallery-app-content {
    width: 100%;
    height: 100%;
    min-width: 0;
    min-height: 0;
  }

  .gallery-app-content.has-titlebar {
    --gallery-titlebar-height: var(--win-titlebar-height, env(titlebar-area-height, 32px));
    height: calc(100% - var(--gallery-titlebar-height));
    margin-top: var(--gallery-titlebar-height);
  }

  .app-navigation-view {
    height: 100%;
    width: 100%;
  }

  .app-page {
    max-width: 960px;
    margin: 0 auto;
    padding: 32px 24px 64px;
  }

  @font-face {
    font-family: 'WinUIOnWebIcons';
    src: url('../assets/Fonts/SEGOEICONS.TTF') format('truetype');
    font-display: block;
  }

  body .icon,
  body .icon-btn,
  body .symbol-icon,
  body .win-symbol-icon,
  body .checkbox-glyph,
  body .win-combo-chevron,
  body .win-expander-header-icon,
  body .win-expander-arrow,
  body .win-menu-flyout-icon,
  body .win-menu-flyout-check,
  body .win-menu-flyout-check-placeholder,
  body .win-menu-flyout-chevron,
  body .win-number-spin-button span,
  body .win-password-reveal span,
  body .win-rating-glyph,
  body .win-textbox-delete-glyph,
  body .font-icon {
    font-family: 'WinUIOnWebIcons';
  }
</style>