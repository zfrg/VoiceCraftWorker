<template>
  <div class="settings-page">
    <WinTextBlock class="settings-section-title" :Text="t('text.settings-section-tts')" />
    <div class="settings-controls">
      <WinSettingsCard :Header="t('text.voice')" :Description="t('text.voice-description')" :Height="70">
        <WinComboBox :ItemsSource="VOICES" :SelectedItem="voiceItem" @update:SelectedItem="onVoiceChange" />
      </WinSettingsCard>
      <WinSettingsCard :Header="t('text.speed')" :Description="t('text.speed-description')" :Height="70">
        <WinComboBox :ItemsSource="SPEEDS" :SelectedItem="speedItem" @update:SelectedItem="onSpeedChange" />
      </WinSettingsCard>
      <WinSettingsCard :Header="t('text.pitch')" :Description="t('text.pitch-description')" :Height="70">
        <WinComboBox :ItemsSource="PITCHES" :SelectedItem="pitchItem" @update:SelectedItem="onPitchChange" />
      </WinSettingsCard>
      <WinSettingsCard :Header="t('text.style')" :Description="t('text.style-description')" :Height="70">
        <WinComboBox :ItemsSource="STYLES" :SelectedItem="styleItem" @update:SelectedItem="onStyleChange" />
      </WinSettingsCard>
    </div>

    <WinTextBlock class="about-section-title" :Text="t('text.about')" />
    <div class="about-controls">
      <WinSettingsCard :Header="t('text.about-project-1')" :Description="t('text.about-license-mit')" :Height="70" :IsActionIconVisible="false" />
      <WinSettingsCard :Header="t('text.about-project-2')" :Description="t('text.about-license-gpl')" :Height="70" :IsActionIconVisible="false" />
      <WinSettingsCard :Header="t('text.about-project-3')" :Description="t('text.about-license-gpl')" :Height="70" :IsActionIconVisible="false" />
    </div>
    <WinTextBlock class="about-note" :Text="t('text.about-license-notice')" />
  </div>
</template>

<script setup>
import { computed } from 'vue';
import WinTextBlock from '../../components/WinTextBlock.vue';
import WinSettingsCard from '../../components/WinSettingsCard.vue';
import WinComboBox from '../../components/WinComboBox.vue';
import { useI18n } from '../../components/i18n/index';
import { VOICES, SPEEDS, PITCHES, STYLES } from '../../config';
import { useSettings } from '../settings';

const { t } = useI18n();
const { settings, setSettings } = useSettings();

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
.settings-section-title {
  font-size: 14px;
  font-weight: 600;
}

.settings-controls {
  display: flex;
  flex-direction: column;
  margin-top: 6px;
  margin-bottom: 32px;
}

.settings-controls :deep(.win-settings-card) {
  margin-bottom: 4px;
}

.about-section-title {
  font-size: 14px;
  font-weight: 600;
  margin-top: 32px;
}

.about-controls {
  display: flex;
  flex-direction: column;
  margin-top: 6px;
}

.about-controls :deep(.win-settings-card) {
  margin-bottom: 4px;
}

.about-note {
  margin-top: 16px;
  color: var(--text-secondary);
  font-size: 13px;
  line-height: 20px;
}
</style>