import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { AudioEngineState, CompareMode, PlaybackState } from './types';

const sampleRate = 22050;
const duration = 1.6;
const sampleLength = Math.floor(sampleRate * duration);
const demoCache = new Map<string, string>();

function encodeWavStereo(left: number[], right: number[]) {
  const buffer = new ArrayBuffer(44 + left.length * 4);
  const view = new DataView(buffer);
  const writeString = (offset: number, value: string) => {
    for (let i = 0; i < value.length; i += 1) view.setUint8(offset + i, value.charCodeAt(i));
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

const filterPresets: Record<string, { lowpass?: number; highpass?: number; leftGain?: number; rightGain?: number; noiseGain?: number; tinnitusFreq?: number; tinnitusGain?: number }> = {
  'high-frequency-loss': { lowpass: 4200 },
  'speech-in-noise': { lowpass: 9000, noiseGain: 0.18 },
  'left-right-asymmetry': { lowpass: 12000, leftGain: 0.35, rightGain: 1 },
  'tinnitus-overlay': { lowpass: 11000, noiseGain: 0.03, tinnitusFreq: 7600, tinnitusGain: 0.024 },
  'reduced-clarity': { lowpass: 3500, highpass: 220, noiseGain: 0.08 },
  dog: { lowpass: 15000 },
  bat: { lowpass: 17000 },
  elephant: { lowpass: 1800, highpass: 20 },
};

function createAudioEngine(audioElement: HTMLAudioElement) {
  let context: AudioContext | null = null;
  let sourceNode: MediaElementAudioSourceNode | null = null;
  let originalGain: GainNode | null = null;
  let filteredGain: GainNode | null = null;
  let masterGain: GainNode | null = null;
  let lowpass: BiquadFilterNode | null = null;
  let highpass: BiquadFilterNode | null = null;
  let splitter: ChannelSplitterNode | null = null;
  let leftGain: GainNode | null = null;
  let rightGain: GainNode | null = null;
  let merger: ChannelMergerNode | null = null;
  let noiseSource: AudioBufferSourceNode | null = null;
  let noiseGain: GainNode | null = null;
  let tinnitusOsc: OscillatorNode | null = null;
  let tinnitusGain: GainNode | null = null;

  async function init() {
    if (context) return;
    const AudioContextCtor = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextCtor) throw new Error('Web Audio API unavailable');
    context = new AudioContextCtor();

    sourceNode = context.createMediaElementSource(audioElement);
    originalGain = context.createGain();
    filteredGain = context.createGain();
    masterGain = context.createGain();
    lowpass = context.createBiquadFilter();
    highpass = context.createBiquadFilter();
    splitter = context.createChannelSplitter(2);
    leftGain = context.createGain();
    rightGain = context.createGain();
    merger = context.createChannelMerger(2);
    noiseGain = context.createGain();
    tinnitusGain = context.createGain();
    tinnitusOsc = context.createOscillator();

    highpass.type = 'highpass';
    lowpass.type = 'lowpass';
    noiseGain.gain.value = 0;
    tinnitusGain.gain.value = 0;
    tinnitusOsc.type = 'sine';
    tinnitusOsc.frequency.value = 7600;

    sourceNode.connect(originalGain);
    originalGain.connect(masterGain);
    sourceNode.connect(highpass);
    highpass.connect(lowpass);
    lowpass.connect(splitter);
    splitter.connect(leftGain, 0);
    splitter.connect(rightGain, 1);
    leftGain.connect(merger, 0, 0);
    rightGain.connect(merger, 0, 1);
    merger.connect(filteredGain);

    const noiseBuffer = context.createBuffer(1, context.sampleRate * 2, context.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    let brown = 0;
    for (let i = 0; i < data.length; i += 1) {
      const white = Math.random() * 2 - 1;
      brown = (brown + 0.02 * white) / 1.02;
      data[i] = brown * 3;
    }
    noiseSource = context.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;
    noiseSource.connect(noiseGain);
    noiseGain.connect(filteredGain);

    tinnitusOsc.connect(tinnitusGain);
    tinnitusGain.connect(filteredGain);
    filteredGain.connect(masterGain);
    masterGain.connect(context.destination);

    noiseSource.start();
    tinnitusOsc.start();
    await context.resume();
  }

  async function ensureReady() {
    if (!context) await init();
    await context?.resume();
  }

  async function loadSource(url: string) {
    audioElement.src = url;
    audioElement.load();
  }

  function setCompareMode(mode: CompareMode) {
    if (!originalGain || !filteredGain) return;
    originalGain.gain.value = mode === 'original' ? 1 : 0;
    filteredGain.gain.value = mode === 'filtered' ? 0.96 : 0;
  }

  function setFilter(filterId: string) {
    const preset = filterPresets[filterId] ?? {};
    if (!lowpass || !highpass || !leftGain || !rightGain || !noiseGain || !tinnitusOsc || !tinnitusGain) return;
    lowpass.frequency.value = preset.lowpass ?? 18000;
    highpass.frequency.value = preset.highpass ?? 20;
    leftGain.gain.value = preset.leftGain ?? 1;
    rightGain.gain.value = preset.rightGain ?? 1;
    noiseGain.gain.value = preset.noiseGain ?? 0;
    tinnitusOsc.frequency.value = preset.tinnitusFreq ?? 7600;
    tinnitusGain.gain.value = preset.tinnitusGain ?? 0;
  }

  async function play() {
    await ensureReady();
    await audioElement.play();
  }

  function pause() {
    audioElement.pause();
  }

  function restart() {
    audioElement.currentTime = 0;
    void play();
  }

  function destroy() {
    noiseSource?.stop();
    tinnitusOsc?.stop();
    context?.close();
    context = null;
  }

  return { init, loadSource, setCompareMode, setFilter, play, pause, restart, destroy };
}

export function useAudioEngine(sourceUrl: string, filterId: string, compareMode: CompareMode) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const engineRef = useRef<ReturnType<typeof createAudioEngine> | null>(null);
  const [engineState, setEngineState] = useState<AudioEngineState>('uninitialized');
  const [playbackState, setPlaybackState] = useState<PlaybackState>('idle');
  const [error, setError] = useState<string | null>(null);

  const init = useCallback(async () => {
    const element = audioRef.current;
    if (!element) return;
    try {
      if (!engineRef.current) engineRef.current = createAudioEngine(element);
      await engineRef.current.init();
      setEngineState('ready');
      setError(null);
    } catch (err) {
      setEngineState('failed');
      setError(err instanceof Error ? err.message : 'Failed to initialize audio engine');
    }
  }, []);

  useEffect(() => {
    const element = audioRef.current;
    if (!element) return;
    const onPlay = () => setPlaybackState('playing');
    const onPause = () => setPlaybackState('paused');
    const onEnded = () => setPlaybackState('idle');
    element.addEventListener('play', onPlay);
    element.addEventListener('pause', onPause);
    element.addEventListener('ended', onEnded);
    return () => {
      element.removeEventListener('play', onPlay);
      element.removeEventListener('pause', onPause);
      element.removeEventListener('ended', onEnded);
    };
  }, []);

  useEffect(() => {
    if (engineRef.current) void engineRef.current.loadSource(sourceUrl);
  }, [sourceUrl]);

  useEffect(() => {
    engineRef.current?.setFilter(filterId);
  }, [filterId]);

  useEffect(() => {
    engineRef.current?.setCompareMode(compareMode);
  }, [compareMode]);

  useEffect(() => () => {
    engineRef.current?.destroy();
    engineRef.current = null;
  }, []);

  return useMemo(() => ({
    audioRef,
    engineState,
    playbackState,
    error,
    play: async () => {
      await init();
      await engineRef.current?.play();
    },
    pause: () => engineRef.current?.pause(),
    restart: () => engineRef.current?.restart(),
  }), [engineState, playbackState, error, init]);
}
