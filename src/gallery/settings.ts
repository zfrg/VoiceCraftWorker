import { ref } from 'vue';
import { VOICES, SPEEDS, PITCHES, STYLES } from '../config';

export interface TtsSettings {
  voice: string;
  speed: string;
  pitch: string;
  style: string;
}

export const SETTINGS_STORAGE_KEY = 'tts-user-settings';

const defaultSettings: TtsSettings = {
  voice: VOICES[0].value,
  speed: SPEEDS[2].value,
  pitch: PITCHES[2].value,
  style: STYLES[0].value
};

function loadSettings(): TtsSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) return { ...defaultSettings };
    const parsed = JSON.parse(raw) as Partial<TtsSettings>;
    return { ...defaultSettings, ...parsed };
  } catch {
    return { ...defaultSettings };
  }
}

export const settings = ref<TtsSettings>(loadSettings());

export function useSettings() {
  function setSettings(next: Partial<TtsSettings>) {
    settings.value = { ...settings.value, ...next };
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings.value));
  }

  return { settings, setSettings };
}
