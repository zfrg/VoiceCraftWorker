<template>
  <div class="tts-page">
    <div class="tts-hero">
      <h1 class="page-header">{{ t('text.tts') }}</h1>
      <p class="tts-description">{{ t('text.app-description') }}</p>
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
      v-if="errorMessage"
      :IsOpen="!!errorMessage"
      Severity="Error"
      :Title="t('text.error-empty')"
      :Message="errorMessage"
      IsClosable
      @update:IsOpen="errorMessage = ''" />

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
import WinButton from '../../components/WinButton.vue';
import WinProgressRing from '../../components/WinProgressRing.vue';
import WinInfoBar from '../../components/WinInfoBar.vue';
import { useI18n } from '../../components/i18n/index';
import { synthesizeFromText } from '../../api/tts.ts';
import { useSettings } from '../settings';

const { t } = useI18n();
const { settings } = useSettings();

const text = ref('');
const isGenerating = ref(false);
const loadingText = ref(t('text.loading'));
const errorMessage = ref('');
const successMessage = ref('');
const audioUrl = ref(null);

async function onGenerate() {
  errorMessage.value = '';
  successMessage.value = '';

  if (!text.value.trim()) {
    alert(t('text.error-empty'));
    return;
  }

  isGenerating.value = true;
  if (audioUrl.value) {
    URL.revokeObjectURL(audioUrl.value);
    audioUrl.value = null;
  }

  try {
    const len = text.value.length;
    loadingText.value = len > 3000 ? '正在处理长文本，请耐心等待...' : t('text.loading');
    const blob = await synthesizeFromText(text.value, {
      voice: settings.value.voice,
      speed: settings.value.speed,
      pitch: settings.value.pitch,
      style: settings.value.style
    });
    audioUrl.value = URL.createObjectURL(blob);
    successMessage.value = '生成成功';
  } catch (err) {
    errorMessage.value = err.message || '生成失败';
  } finally {
    isGenerating.value = false;
    loadingText.value = t('text.loading');
  }
}

function onDownload() {
  if (!audioUrl.value) return;
  const a = document.createElement('a');
  a.href = audioUrl.value;
  a.download = 'speech.mp3';
  document.body.appendChild(a);
  a.click();
  a.remove();
}
</script>

<style scoped>
.tts-hero {
  margin-bottom: 24px;
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
