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
      <div class="page-view" :class="transitionClass">
        <WinTextBlock class="page-header" :Text="pageTitle" />
        <WinScrollViewer
          ref="pageScroller"
          class="app-page-scroll"
          VerticalScrollMode="Auto"
          VerticalScrollBarVisibility="Auto"
          HorizontalScrollMode="Disabled"
          HorizontalScrollBarVisibility="Disabled">
          <div class="app-page">
            <TtsTextPage v-show="selectedNav === 'text'" />
            <TtsFilePage v-show="selectedNav === 'file'" />
            <SettingsPage v-show="selectedNav === 'settings'" />
          </div>
        </WinScrollViewer>
      </div>
    </WinNavigationView>
  </div>
</template>

<script setup>
import { ref, provide, computed, watch, nextTick, onMounted } from 'vue';
import WinTitleBar from '../components/WinTitleBar.vue';
import WinToolTipService from '../components/WinToolTipService.vue';
import WinNavigationView from '../components/WinNavigationView.vue';
import WinScrollViewer from '../components/WinScrollViewer.vue';
import WinTextBlock from '../components/WinTextBlock.vue';
import TtsTextPage from './pages/TtsTextPage.vue';
import TtsFilePage from './pages/TtsFilePage.vue';
import SettingsPage from './pages/SettingsPage.vue';
import appManifest from '../manifest.json';
import {
  createEntranceNavigationTransitionInfo,
  getNavigationTransitionInfoClassName
} from '../utils/navigationTransitionInfo';

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
  { Content: t('text.nav-text'), Tag: 'text', Icon: '\uE8D2' },
  { Content: t('text.nav-file'), Tag: 'file', Icon: '\uE8A5' }
]);

const pageOrder = { text: 0, file: 1, settings: 2 };

const pageTitle = computed(() => {
  switch (selectedNav.value) {
    case 'text':
      return t('text.tts');
    case 'file':
      return t('text.file-tts');
    default:
      return t('text.settings');
  }
});

const selectedNav = ref('text');
const pageScroller = ref(null);
const transitionClass = ref(getNavigationTransitionInfoClassName(createEntranceNavigationTransitionInfo()));
let transitionSequence = 0;

function restartTransition(info) {
  const nextClass = getNavigationTransitionInfoClassName(info);
  const sequence = ++transitionSequence;
  transitionClass.value = '';
  nextTick(() => {
    pageScroller.value?.ChangeView?.(0, 0, null);
    const restart = () => {
      if (sequence === transitionSequence) transitionClass.value = nextClass;
    };
    if (typeof requestAnimationFrame === 'function') requestAnimationFrame(restart);
    else restart();
  });
}

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
    navigateTo('settings');
    return;
  }
  if (value) navigateTo(value);
}

function navigateTo(value) {
  if (!(value in pageOrder) || value === selectedNav.value) return;
  selectedNav.value = value;
  restartTransition(createEntranceNavigationTransitionInfo());
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

  .app-navigation-view .win-nav-content-inner {
    position: relative;
  }

  .app-navigation-view .page-view {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    min-width: 0;
    min-height: 0;
    flex: 1 1 auto;
    overflow: hidden;
  }

  .app-navigation-view .page-view .page-header {
    flex: 0 0 auto;
    width: 100%;
    min-width: 0;
    box-sizing: border-box;
    padding: 24px 36px 0;
    font-size: 28px;
    font-weight: 600;
    color: var(--text-primary);
  }

  .app-navigation-view .page-view .app-page-scroll {
    flex: 1 1 auto;
    min-height: 0;
    width: 100%;
    min-width: 0;
  }

  .app-page {
    width: 100%;
    min-width: 0;
    min-height: 100%;
    display: flex;
    flex-direction: column;
    padding: 24px 36px 36px;
  }

  @media (max-width: 640px) {
    .app-navigation-view .page-view .page-header {
      padding: 12px 16px 0;
    }

    .app-page {
      padding: 12px 16px 16px;
    }
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