import { API_BASE } from '../config.ts';

async function handleResponse(response: Response): Promise<Blob> {
  if (!response.ok) {
    let message = '生成失败';
    try {
      const data = await response.json();
      message = data.error?.message || message;
    } catch (e) {
      /* 忽略非 JSON 响应 */
    }
    throw new Error(message);
  }
  return response.blob();
}

export interface TtsParams {
  voice: string;
  speed: string;
  pitch: string;
  style: string;
}

export function synthesizeFromText(input: string, params: TtsParams): Promise<Blob> {
  return fetch(`${API_BASE}/v1/audio/speech`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ input, ...params })
  }).then(handleResponse);
}

export function synthesizeFromFile(file: File, params: TtsParams): Promise<Blob> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('voice', params.voice);
  formData.append('speed', params.speed);
  formData.append('pitch', params.pitch);
  formData.append('style', params.style);

  return fetch(`${API_BASE}/v1/audio/speech`, {
    method: 'POST',
    body: formData
  }).then(handleResponse);
}