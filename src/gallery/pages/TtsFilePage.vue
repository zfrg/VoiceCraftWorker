<template>
  <div class="tts-page">
    <div class="tts-hero">
      <h1 class="page-header">{{ t('text.file-tts') }}</h1>
      <p class="tts-description">{{ t('text.file-description') }}</p>
    </div>

    <div class="tts-field">
      <div
        class="tts-drop-zone"
        :class="{ dragover: dragOver }"
        @click="fileInput?.click()"
        @dragover.prevent="dragOver = true"
        @dragleave.prevent="dragOver = false"
        @drop.prevent="onDrop">
        <p class="tts-drop-text">{{ t('text.upload-txt') }}</p>
        <p class="tts-drop-hint">{{ t('text.upload-hint') }}</p>
        <input
          ref="fileInput"
          type="file"
          accept=".txt,text/plain"
          style="display: none"
          @change="onFileChange" />
      </div>
      <p v-if="fileName" class="tts-file-name">{{ fileName }} ({{ fileSize }})</p>
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
import WinComboBox from '../../components/WinComboBox.vue';
import WinButton from '../../components/WinButton.vue';
import WinProgressRing from '../../components/WinProgressRing.vue';
import WinInfoBar from '../../components/WinInfoBar.vue';
import { useI18n } from '../../components/i18n/index';
import { synthesizeFromFile } from '../../api/tts.ts';
import { useTtsParams } from '../useTtsParams';

const { t } = useI18n();
const { voiceItem, speedItem, pitchItem, styleItem, changeVoice, changeSpeed, changePitch, changeStyle, params } = useTtsParams();

const fileName = ref('');
const fileSize = ref('');
const selectedFile = ref(null);
const dragOver = ref(false);
const fileInput = ref(null);

const isGenerating = ref(false);
const loadingText = ref(t('text.loading'));
const errorTitle = ref('');
const errorMessage = ref('');
const successMessage = ref('');
const audioUrl = ref(null);

function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function handleFile(file) {
  const isTxt =
    (file.type && file.type.includes('text/')) ||
    file.name.toLowerCase().endsWith('.txt');
  if (!isTxt) {
    errorTitle.value = t('text.error-file-type');
    errorMessage.value = '';
    return;
  }
  if (file.size > 500 * 1024) {
    errorTitle.value = t('text.error-file-size');
    errorMessage.value = '';
    return;
  }
  selectedFile.value = file;
  fileName.value = file.name;
  fileSize.value = formatFileSize(file.size);
}

function onFileChange(e) {
  const file = e.target.files[0];
  if (file) handleFile(file);
}

function onDrop(e) {
  dragOver.value = false;
  const file = e.dataTransfer.files[0];
  if (file) handleFile(file);
}

async function onGenerate() {
  errorTitle.value = '';
  errorMessage.value = '';
  successMessage.value = '';

  if (!selectedFile.value) {
    errorTitle.value = t('text.error-file-empty');
    errorMessage.value = '';
    return;
  }

  isGenerating.value = true;
  if (audioUrl.value) {
    URL.revokeObjectURL(audioUrl.value);
    audioUrl.value = null;
  }

  try {
    loadingText.value = t('text.processing-file');
    const blob = await synthesizeFromFile(selectedFile.value, params.value);
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
  const base = (fileName.value || 'speech').replace(/\.txt$/i, '').trim() || 'speech';
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

.tts-drop-zone {
  border: 1.5px dashed var(--control-strong-stroke-color-default);
  border-radius: 8px;
  padding: 40px 24px;
  text-align: center;
  cursor: pointer;
  transition: border-color 0.2s ease, background 0.2s ease;
  background: var(--control-fill-color-secondary);
}

.tts-drop-zone:hover,
.tts-drop-zone.dragover {
  border-color: var(--accent-base);
  background: var(--control-fill-color-tertiary);
}

.tts-drop-text {
  color: var(--text-primary);
  font-size: 16px;
  font-weight: 500;
  margin: 0 0 8px 0;
}

.tts-drop-hint {
  color: var(--text-secondary);
  font-size: 13px;
  margin: 0;
}

.tts-file-name {
  margin: 12px 4px 0 0;
  color: var(--text-primary);
  font-size: 13px;
  font-weight: 500;
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