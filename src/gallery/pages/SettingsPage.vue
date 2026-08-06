<template>
  <div class="settings-page">
    <div class="settings-hero">
      <h1 class="page-header">{{ t('text.settings') }}</h1>
      <p class="settings-description">{{ t('text.settings-description') }}</p>
    </div>

    <div class="settings-section">
      <div class="settings-grid">
        <WinComboBox
          class="settings-control"
          :Header="t('text.voice')"
          :ItemsSource="VOICES"
          :SelectedItem="voiceItem"
          @update:SelectedItem="onVoiceChange" />

        <WinComboBox
          class="settings-control"
          :Header="t('text.speed')"
          :ItemsSource="SPEEDS"
          :SelectedItem="speedItem"
          @update:SelectedItem="onSpeedChange" />

        <WinComboBox
          class="settings-control"
          :Header="t('text.pitch')"
          :ItemsSource="PITCHES"
          :SelectedItem="pitchItem"
          @update:SelectedItem="onPitchChange" />

        <WinComboBox
          class="settings-control"
          :Header="t('text.style')"
          :ItemsSource="STYLES"
          :SelectedItem="styleItem"
          @update:SelectedItem="onStyleChange" />
      </div>
      <p class="settings-hint">{{ t('text.settings-hint') }}</p>
    </div>

    <div class="settings-section about">
      <h2 class="settings-about-title">{{ t('text.about') }}</h2>
      <p class="settings-copyright">
        {{ t('text.about-copyright', { year: currentYear, name: appName, version: version, author: author }) }}
      </p>
      <p class="settings-about-title about-sub">{{ t('text.about-opensource') }}</p>
      <ul class="about-list">
        <li>
          <span class="about-project">{{ t('text.about-project-1') }}</span>
          <span class="about-license">{{ t('text.about-license-mit') }}</span>
        </li>
        <li>
          <span class="about-project">{{ t('text.about-project-2') }}</span>
          <span class="about-license">{{ t('text.about-license-gpl') }}</span>
        </li>
        <li>
          <span class="about-project">{{ t('text.about-project-3') }}</span>
          <span class="about-license">{{ t('text.about-license-gpl') }}</span>
        </li>
      </ul>
      <p class="about-note">{{ t('text.about-license-notice') }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import WinComboBox from '../../components/WinComboBox.vue';
import { useI18n } from '../../components/i18n/index';
import manifestTemplate from '../../manifest.json';
import { VOICES, SPEEDS, PITCHES, STYLES } from '../../config';
import { useSettings } from '../settings';

const { t } = useI18n();
const { settings, setSettings } = useSettings();

const appName = computed(() => t(manifestTemplate.resources?.title ?? 'app.title'));
const author = computed(() => t(manifestTemplate.author ?? 'app.author'));
const version = computed(() => t(manifestTemplate.version ?? 'app.version'));
const currentYear = new Date().getFullYear();

const voiceItem = computed(() => VOICES.find((v) => v.value === settings.value.voice) ?? VOICES[0]);
const speedItem = computed(() => SPEEDS.find((v) => v.value === settings.value.speed) ?? SPEEDS[2]);
const pitchItem = computed(() => PITCHES.find((v) => v.value === settings.value.pitch) ?? PITCHES[2]);
const styleItem = computed(() => STYLES.find((v) => v.value === settings.value.style) ?? STYLES[0]);

function onVoiceChange(item) {
  if (item) setSettings({ voice: item.value });
}
function onSpeedChange(item) {
  if (item) setSettings({ speed: item.value });
}
function onPitchChange(item) {
  if (item) setSettings({ pitch: item.value });
}
function onStyleChange(item) {
  if (item) setSettings({ style: item.value });
}
</script>

<style scoped>
.settings-hero {
  margin-bottom: 24px;
}

.settings-description {
  margin: -12px 0 0 0;
  color: var(--text-secondary);
  font-size: 14px;
  line-height: 20px;
}

.settings-section {
  margin-bottom: 28px;
}

.settings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.settings-control {
  width: 100%;
}

.settings-hint {
  margin: 12px 0 0 0;
  color: var(--text-secondary);
  font-size: 13px;
  line-height: 20px;
}

.about {
  padding-top: 20px;
  border-top: 1px solid var(--divider-stroke-color-default, rgba(128, 128, 128, 0.2));
}

.settings-about-title {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 12px 0;
  color: var(--text-primary);
}

.about-sub {
  font-size: 14px;
  margin: 16px 0 8px 0;
}

.about-copyright,
.about-note {
  margin: 0 0 12px 0;
  color: var(--text-secondary);
  font-size: 13px;
  line-height: 20px;
}

.about-list {
  list-style: none;
  margin: 0 0 12px 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.about-project {
  color: var(--text-primary);
  font-weight: 500;
  margin-right: 8px;
}

.about-license {
  color: var(--text-secondary);
  font-size: 13px;
}
</style>