import { useCallback, useEffect, useMemo, useState } from 'react';
import { getBuiltInSourceUrl } from './audio';
import type { AudioSource, SourceType } from './types';

export type SelectedSource = {
  title: string;
  url: string;
};

export function useSourceSelection(builtInSources: AudioSource[]) {
  const [selectedSourceType, setSelectedSourceType] = useState<SourceType>('built-in');
  const [selectedBuiltInId, setSelectedBuiltInId] = useState('voice');
  const [uploadedAudioUrl, setUploadedAudioUrl] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);

  const selectedSource = useMemo<SelectedSource>(() => {
    if (selectedSourceType === 'upload' && uploadedAudioUrl) {
      return {
        title: uploadedFileName ?? 'Uploaded audio',
        url: uploadedAudioUrl,
      };
    }

    const builtIn = builtInSources.find((source) => source.id === selectedBuiltInId) ?? builtInSources[0];
    return {
      title: builtIn.title,
      url: getBuiltInSourceUrl(builtIn.id),
    };
  }, [builtInSources, selectedSourceType, uploadedAudioUrl, uploadedFileName, selectedBuiltInId]);

  useEffect(() => {
    return () => {
      if (uploadedAudioUrl) {
        URL.revokeObjectURL(uploadedAudioUrl);
      }
    };
  }, [uploadedAudioUrl]);

  const selectBuiltIn = useCallback((sourceId: string) => {
    setSelectedSourceType('built-in');
    setSelectedBuiltInId(sourceId);
  }, []);

  const handleUpload = useCallback((file: File | null) => {
    if (!file) return;
    setUploadedAudioUrl((currentUrl) => {
      if (currentUrl) {
        URL.revokeObjectURL(currentUrl);
      }
      return URL.createObjectURL(file);
    });
    setUploadedFileName(file.name);
    setSelectedSourceType('upload');
  }, []);

  return {
    selectedSourceType,
    selectedBuiltInId,
    uploadedFileName,
    selectedSource,
    selectBuiltIn,
    handleUpload,
  };
}
