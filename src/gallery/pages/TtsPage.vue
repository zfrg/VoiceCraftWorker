<template>
  <div class="tts-page">
    <div class="tts-hero">
      <h1 class="page-header">{{ t('text.tts') }}</h1>
      <p class="tts-description">{{ t('text.app-description') }}</p>
    </div>

    <div class="tts-input-tabs" role="tablist">
      <button
        class="tts-input-tab"
        :class="{ active: inputMode === 'text' }"
        @click="inputMode = 'text'">
        {{ t('text.tab-text') }}
      </button>
      <button
        class="tts-input-tab"
        :class="{ active: inputMode === 'file' }"
        @click="inputMode = 'file'">
        {{ t('text.tab-file') }}
      </button>
    </div>

    <div v-if="inputMode === 'text'" class="tts-field">
      <WinTextBox
        v-model:text="text"
        :Header="t('text.input-text')"
        :PlaceholderText="t('text.input-placeholder')"
        AcceptsReturn
        :MinHeight="160"
        TextWrapping="WrapWholeWords" />
    </div>

    <div v-else class="tts-field">
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
        @update:SelectedItem="onVoiceChange" />

      <WinComboBox
        class="tts-control"
        :Header="t('text.speed')"
        :ItemsSource="SPEEDS"
        :SelectedItem="speedItem"
        @update:SelectedItem="onSpeedChange" />

      <WinComboBox
        class="tts-control"
        :Header="t('text.pitch')"
        :ItemsSource="PITCHES"
        :SelectedItem="pitchItem"
        @update:SelectedItem="onPitchChange" />

      <WinComboBox
        class="tts-control"
        :Header="t('text.style')"
        :ItemsSource="STYLES"
        :SelectedItem="styleItem"
        @update:SelectedItem="onStyleChange" />
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
import { ref, computed } from 'vue';
import WinTextBox from '../../components/WinTextBox.vue';
import WinComboBox from '../../components/WinComboBox.vue';
import WinButton from '../../components/WinButton.vue';
import WinProgressRing from '../../components/WinProgressRing.vue';
import WinInfoBar from '../../components/WinInfoBar.vue';
import { useI18n } from '../../components/i18n/index';
import { VOICES, SPEEDS, PITCHES, STYLES } from '../../config.ts';
import { synthesizeFromText, synthesizeFromFile } from '../../api/tts.ts';

const { t } = useI18n();

const inputMode = ref('text');
const text = ref('');
const fileName = ref('');
const fileSize = ref('');
const selectedFile = ref(null);
const dragOver = ref(false);
const fileInput = ref(null);

const isGenerating = ref(false);
const loadingText = ref(t('text.loading'));
const errorMessage = ref('');
const successMessage = ref('');
const audioUrl = ref(null);

const voiceItem = ref(VOICES[0]);
const speedItem = ref(SPEEDS[2]);
const pitchItem = ref(PITCHES[2]);
const styleItem = ref(STYLES[0]);

const currentParams = computed(() => ({
  voice: voiceItem.value?.value ?? VOICES[0].value,
  speed: speedItem.value?.value ?? '1.0',
  pitch: pitchItem.value?.value ?? '0',
  style: styleItem.value?.value ?? 'general'
}));

function onVoiceChange(item) { if (item) voiceItem.value = item; }
function onSpeedChange(item) { if (item) speedItem.value = item; }
function onPitchChange(item) { if (item) pitchItem.value = item; }
function onStyleChange(item) { if (item) styleItem.value = item; }

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
    alert('请选择txt格式的文本文件');
    return;
  }
  if (file.size > 500 * 1024) {
    alert('文件大小不能超过500KB');
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
  errorMessage.value = '';
  successMessage.value = '';

  if (inputMode.value === 'text') {
    if (!text.value.trim()) {
      alert(t('text.error-empty'));
      return;
    }
  } else if (!selectedFile.value) {
    alert('请选择要上传的txt文件');
    return;
  }

  isGenerating.value = true;
  if (audioUrl.value) {
    URL.revokeObjectURL(audioUrl.value);
    audioUrl.value = null;
  }

  try {
    let blob;
    if (inputMode.value === 'text') {
      const len = text.value.length;
      loadingText.value = len > 3000 ? '正在处理长文本，请耐心等待...' : t('text.loading');
      blob = await synthesizeFromText(text.value, currentParams.value);
    } else {
      loadingText.value = '正在处理上传的文件...';
      blob = await synthesizeFromFile(selectedFile.value, currentParams.value);
    }
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

.tts-input-tabs {
  display: inline-flex;
  gap: 8px;
  margin-bottom: 16px;
  padding: 3px;
  background: var(--control-fill-color-secondary);
  border-radius: 6px;
}

.tts-input-tab {
  border: none;
  background: transparent;
  color: var(--text-secondary);
  padding: 8px 20px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s ease, color 0.15s ease;
}

.tts-input-tab.active {
  background: var(--control-fill-color-default);
  color: var(--text-primary);
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