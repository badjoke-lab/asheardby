import { useCallback, useEffect, useMemo, useState } from 'react';
import type { AudioEngineState, PlaybackState } from './types';

export function useCompareStatusText(params: {
  engineState: AudioEngineState;
  playbackState: PlaybackState;
  error: string | null;
}) {
  const { engineState, playbackState, error } = params;

  return useMemo(() => {
    if (error) return 'Could not prepare audio. Try another source or reload the page.';
    if (engineState === 'uninitialized') return 'Press Play to prepare audio and begin comparison.';
    if (engineState === 'failed') return 'The audio engine could not be initialized in this browser.';
    if (playbackState === 'playing') return 'Playing the current source.';
    if (playbackState === 'paused') return 'Playback paused.';
    return 'Audio engine ready.';
  }, [engineState, playbackState, error]);
}

export function useUploadedAudio() {
  const [uploadedAudioUrl, setUploadedAudioUrl] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (uploadedAudioUrl) {
        URL.revokeObjectURL(uploadedAudioUrl);
      }
    };
  }, [uploadedAudioUrl]);

  const setUploadedFile = useCallback((file: File | null) => {
    if (!file) return;
    setUploadedAudioUrl((currentUrl) => {
      if (currentUrl) URL.revokeObjectURL(currentUrl);
      return URL.createObjectURL(file);
    });
    setUploadedFileName(file.name);
  }, []);

  return {
    uploadedAudioUrl,
    uploadedFileName,
    setUploadedFile,
  };
}
