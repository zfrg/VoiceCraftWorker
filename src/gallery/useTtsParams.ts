import { ref, computed } from 'vue';
import { VOICES, SPEEDS, PITCHES, STYLES } from '../config';
import { useSettings } from './settings';

export function useTtsParams() {
  const { settings } = useSettings();

  const voiceItem = ref(VOICES.find((v) => v.value === settings.value.voice) ?? VOICES[0]);
  const speedItem = ref(SPEEDS.find((v) => v.value === settings.value.speed) ?? SPEEDS[2]);
  const pitchItem = ref(PITCHES.find((v) => v.value === settings.value.pitch) ?? PITCHES[2]);
  const styleItem = ref(STYLES.find((v) => v.value === settings.value.style) ?? STYLES[0]);

  const changeVoice = (item: (typeof VOICES)[number] | undefined) => { if (item) voiceItem.value = item; };
  const changeSpeed = (item: (typeof SPEEDS)[number] | undefined) => { if (item) speedItem.value = item; };
  const changePitch = (item: (typeof PITCHES)[number] | undefined) => { if (item) pitchItem.value = item; };
  const changeStyle = (item: (typeof STYLES)[number] | undefined) => { if (item) styleItem.value = item; };

  const params = computed(() => ({
    voice: voiceItem.value?.value ?? VOICES[0].value,
    speed: speedItem.value?.value ?? '1.0',
    pitch: pitchItem.value?.value ?? '0',
    style: styleItem.value?.value ?? 'general'
  }));

  return {
    voiceItem,
    speedItem,
    pitchItem,
    styleItem,
    changeVoice,
    changeSpeed,
    changePitch,
    changeStyle,
    params
  };
}