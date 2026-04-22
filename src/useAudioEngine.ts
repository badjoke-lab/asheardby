import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createAudioEngine } from './audioEngine';
import type { AudioEngineState, CompareMode, PlaybackState } from './types';

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
      if (!engineRef.current) {
        engineRef.current = createAudioEngine(element);
      }
      await engineRef.current.loadSource(sourceUrl);
      await engineRef.current.init();
      engineRef.current.setFilter(filterId);
      engineRef.current.setCompareMode(compareMode);
      setEngineState('ready');
      setError(null);
    } catch (err) {
      setEngineState('failed');
      setError(err instanceof Error ? err.message : 'Failed to initialize audio engine');
    }
  }, [sourceUrl, filterId, compareMode]);

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
    const element = audioRef.current;
    if (!element) return;
    const wasPlaying = !element.paused;
    element.src = sourceUrl;
    element.load();
    if (engineRef.current) {
      void engineRef.current.loadSource(sourceUrl).then(() => {
        engineRef.current?.setFilter(filterId);
        engineRef.current?.setCompareMode(compareMode);
        if (wasPlaying) {
          void engineRef.current?.play().catch(() => {});
        }
      });
    } else if (wasPlaying) {
      void element.play().catch(() => {});
    }
  }, [sourceUrl, filterId, compareMode]);

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
