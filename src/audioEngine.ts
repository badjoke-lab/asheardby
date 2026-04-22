import type { CompareMode } from './types';

const filterPresets: Record<
  string,
  {
    lowpass?: number;
    highpass?: number;
    leftGain?: number;
    rightGain?: number;
    noiseGain?: number;
    tinnitusFreq?: number;
    tinnitusGain?: number;
  }
> = {
  'high-frequency-loss': { lowpass: 4200 },
  'speech-in-noise': { lowpass: 9000, noiseGain: 0.18 },
  'left-right-asymmetry': { lowpass: 12000, leftGain: 0.35, rightGain: 1 },
  'tinnitus-overlay': { lowpass: 11000, noiseGain: 0.03, tinnitusFreq: 7600, tinnitusGain: 0.024 },
  'reduced-clarity': { lowpass: 3500, highpass: 220, noiseGain: 0.08 },
  dog: { lowpass: 15000 },
  bat: { lowpass: 17000 },
  elephant: { lowpass: 1800, highpass: 20 },
};

export function createAudioEngine(audioElement: HTMLAudioElement) {
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
    const AudioContextCtor =
      window.AudioContext ||
      (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
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
