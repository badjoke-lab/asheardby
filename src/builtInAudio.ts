const sampleRate = 22050;
const duration = 1.6;
const sampleLength = Math.floor(sampleRate * duration);
const demoCache = new Map<string, string>();

function encodeWavStereo(left: number[], right: number[]) {
  const buffer = new ArrayBuffer(44 + left.length * 4);
  const view = new DataView(buffer);
  const writeString = (offset: number, value: string) => {
    for (let i = 0; i < value.length; i += 1) {
      view.setUint8(offset + i, value.charCodeAt(i));
    }
  };

  writeString(0, 'RIFF');
  view.setUint32(4, 36 + left.length * 4, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 2, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 4, true);
  view.setUint16(32, 4, true);
  view.setUint16(34, 16, true);
  writeString(36, 'data');
  view.setUint32(40, left.length * 4, true);

  let offset = 44;
  for (let i = 0; i < left.length; i += 1) {
    view.setInt16(offset, Math.max(-32767, Math.min(32767, Math.round(left[i] * 32767))), true);
    view.setInt16(offset + 2, Math.max(-32767, Math.min(32767, Math.round(right[i] * 32767))), true);
    offset += 4;
  }

  return new Blob([buffer], { type: 'audio/wav' });
}

export function getBuiltInSourceUrl(id: string) {
  const cached = demoCache.get(id);
  if (cached) return cached;

  let left: number[] = [];
  let right: number[] = [];

  if (id === 'voice') {
    for (let i = 0; i < sampleLength; i += 1) {
      const t = i / sampleRate;
      let env = 0;
      const syllables = [[0.12, 0.18], [0.45, 0.16], [0.76, 0.18], [1.08, 0.18]] as const;
      for (const [start, len] of syllables) {
        if (t >= start && t <= start + len) {
          const x = (t - start) / len;
          env += Math.sin(Math.PI * x) ** 2;
        }
      }
      const f0 = 160 + 18 * Math.sin(2 * Math.PI * 0.8 * t);
      const noise = 0.01 * (Math.random() * 2 - 1);
      const sample = env * (
        0.5 * Math.sin(2 * Math.PI * f0 * t) +
        0.14 * Math.sin(2 * Math.PI * 2 * f0 * t + 0.2) +
        0.06 * Math.sin(2 * Math.PI * 3.2 * f0 * t)
      ) + noise;
      left.push(sample * 0.72);
    }
    right = left;
  } else if (id === 'noise') {
    for (let i = 0; i < sampleLength; i += 1) {
      const t = i / sampleRate;
      const tone = t > 0.25 && t < 1.35 ? 0.18 * Math.sin(2 * Math.PI * 220 * t) : 0;
      left.push((0.06 * (Math.random() * 2 - 1) + 0.02 * Math.sin(2 * Math.PI * 90 * t) + tone) * 0.7);
    }
    right = left;
  } else {
    for (let i = 0; i < sampleLength; i += 1) {
      const t = i / sampleRate;
      let l = 0;
      let r = 0;
      const idx = Math.floor(t / 0.25);
      if (t < 1.45) {
        const phase = (t % 0.25) / 0.25;
        const env = Math.sin(Math.PI * phase) ** 2 * 0.45;
        const freq = idx % 2 === 0 ? 440 : 660;
        const sig = env * Math.sin(2 * Math.PI * freq * t);
        if (idx % 2 === 0) {
          l = sig;
          r = 0.06 * sig;
        } else {
          r = sig;
          l = 0.06 * sig;
        }
      }
      left.push(l);
      right.push(r);
    }
  }

  const url = URL.createObjectURL(encodeWavStereo(left, right));
  demoCache.set(id, url);
  return url;
}
