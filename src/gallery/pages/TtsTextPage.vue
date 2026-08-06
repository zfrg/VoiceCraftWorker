<template>
  <div class="tts-page">
    <div class="tts-hero">
      <WinTextBlock class="page-header" :Text="t('text.tts')" />
      <WinTextBlock class="tts-description" :Text="t('text.app-description')" />
    </div>

    <div class="tts-field">
      <WinTextBox
        v-model:text="text"
        :Header="t('text.input-text')"
        :PlaceholderText="t('text.input-placeholder')"
        AcceptsReturn
        :MinHeight="160"
        TextWrapping="WrapWholeWords" />
    </div>

    <div class="tts-controls">
      <WinComboBox
        class="tts-control"
        :Header="t('text.voice')"
        :ItemsSource="VOICES"
        :SelectedItem="voiceItem"
        @update:SelectedItem="changeVoice" />

      <WinComboBox
        class="tts-control"
        :Header="t('text.speed')"
        :ItemsSource="SPEEDS"
        :SelectedItem="speedItem"
        @update:SelectedItem="changeSpeed" />

      <WinComboBox
        class="tts-control"
        :Header="t('text.pitch')"
        :ItemsSource="PITCHES"
        :SelectedItem="pitchItem"
        @update:SelectedItem="changePitch" />

      <WinComboBox
        class="tts-control"
        :Header="t('text.style')"
        :ItemsSource="STYLES"
        :SelectedItem="styleItem"
        @update:SelectedItem="changeStyle" />
    </div>

    <WinButton
      class="tts-generate"
      Style="AccentButtonStyle"
      :Content="isGenerating ? t('text.generating') : t('text.generate')"
      :IsEnabled="!isGenerating"
      @Click="onGenerate" />

    <div v-if="isGenerating" class="tts-loading">
      <WinProgressRing IsActive IsIndeterminate :Width="32" :Height="32" />
      <span class="tts-loading-text">{{ loadingText }}</span>
    </div>

    <WinInfoBar
      v-if="errorTitle || errorMessage"
      :IsOpen="!!(errorTitle || errorMessage)"
      Severity="Error"
      :Title="errorTitle || t('text.error-empty')"
      :Message="errorMessage"
      IsClosable
      @update:IsOpen="errorTitle = ''; errorMessage = ''" />

    <WinInfoBar
      v-if="successMessage"
      :IsOpen="!!successMessage"
      Severity="Success"
      :Title="successMessage"
      IsClosable
      @update:IsOpen="successMessage = ''" />

    <div v-if="audioUrl" class="tts-result">
      <audio :src="audioUrl" class="tts-audio" controls></audio>
      <WinButton
        class="tts-download"
        Style="SubtleButtonStyle"
        :Content="t('text.download')"
        @Click="onDownload" />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import WinTextBox from '../../components/WinTextBox.vue';
import WinTextBlock from '../../components/WinTextBlock.vue';
import WinComboBox from '../../components/WinComboBox.vue';
import WinButton from '../../components/WinButton.vue';
import WinProgressRing from '../../components/WinProgressRing.vue';
import WinInfoBar from '../../components/WinInfoBar.vue';
import { useI18n } from '../../components/i18n/index';
import { synthesizeFromText } from '../../api/tts.ts';
import { useTtsParams } from '../useTtsParams';

const { t } = useI18n();
const { voiceItem, speedItem, pitchItem, styleItem, changeVoice, changeSpeed, changePitch, changeStyle, params } = useTtsParams();

const text = ref('');
const isGenerating = ref(false);
const loadingText = ref(t('text.loading'));
const errorTitle = ref('');
const errorMessage = ref('');
const successMessage = ref('');
const audioUrl = ref(null);

async function onGenerate() {
  errorTitle.value = '';
  errorMessage.value = '';
  successMessage.value = '';

  if (!text.value.trim()) {
    errorTitle.value = t('text.error-empty');
    errorMessage.value = '';
    return;
  }

  isGenerating.value = true;
  if (audioUrl.value) {
    URL.revokeObjectURL(audioUrl.value);
    audioUrl.value = null;
  }

  try {
    const len = text.value.length;
    loadingText.value = len > 3000 ? t('text.processing-long') : t('text.loading');
    const blob = await synthesizeFromText(text.value, params.value);
    audioUrl.value = URL.createObjectURL(blob);
    successMessage.value = t('text.success');
  } catch (err) {
    errorMessage.value = err.message || t('text.error-failed');
  } finally {
    isGenerating.value = false;
    loadingText.value = t('text.loading');
  }
}

function onDownload() {
  if (!audioUrl.value) return;
  const base = (text.value.trim().slice(0, 12) || 'speech').replace(/[\\/:*?"<>|]+/g, '').trim() || 'speech';
  const a = document.createElement('a');
  a.href = audioUrl.value;
  a.download = `${base}.mp3`;
  document.body.appendChild(a);
  a.click();
  a.remove();
}
</script>

<style scoped>
.tts-hero {
  margin-bottom: 0;
}

.tts-description {
  margin: -12px 0 0 0;
  color: var(--text-secondary);
  font-size: 14px;
  line-height: 20px;
}

.tts-field {
  margin-bottom: 20px;
}

.tts-controls {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.tts-control {
  width: 100%;
}

.tts-generate {
  width: 100%;
  margin-bottom: 24px;
}

.tts-loading {
  display: flex;
  align-items: center;
  gap: 12px;
  justify-content: center;
  padding: 16px 0;
}

.tts-loading-text {
  color: var(--text-secondary);
  font-size: 14px;
}

.tts-result {
  margin-top: 24px;
}

.tts-audio {
  width: 100%;
  margin-bottom: 16px;
}

.tts-download {
  width: 100%;
}
</style>
