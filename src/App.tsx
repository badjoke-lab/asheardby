import { useEffect, useMemo, useState } from 'react';
import { DEFAULT_FILTER_ID, BUILT_IN_SOURCES, HEARING_FILTERS, UI_TEXT } from './data';
import { getBuiltInSourceUrl, useAudioEngine } from './audio';
import { getBandModel } from './visualization';
import { AboutPanel, HeroSection } from './layout';
import { SourcePanel } from './sourcePanel';
import { NotesPanel } from './notesPanel';
import { ModesPanel } from './modesPanel';
import { ComparePanel } from './comparePanel';
import type { CompareMode, SourceType } from './types';

export function App() {
  const [selectedSourceType, setSelectedSourceType] = useState<SourceType>('built-in');
  const [selectedBuiltInId, setSelectedBuiltInId] = useState('voice');
  const [uploadedAudioUrl, setUploadedAudioUrl] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [selectedFilterId, setSelectedFilterId] = useState(DEFAULT_FILTER_ID);
  const [compareMode, setCompareMode] = useState<CompareMode>('filtered');

  const selectedFilter = useMemo(
    () => HEARING_FILTERS.find((filter) => filter.id === selectedFilterId) ?? HEARING_FILTERS[0],
    [selectedFilterId]
  );

  const selectedSource = useMemo(() => {
    if (selectedSourceType === 'upload' && uploadedAudioUrl) {
      return {
        title: uploadedFileName ?? 'Uploaded audio',
        url: uploadedAudioUrl,
      };
    }
    const builtIn = BUILT_IN_SOURCES.find((source) => source.id === selectedBuiltInId) ?? BUILT_IN_SOURCES[0];
    return {
      title: builtIn.title,
      url: getBuiltInSourceUrl(builtIn.id),
    };
  }, [selectedSourceType, uploadedAudioUrl, uploadedFileName, selectedBuiltInId]);

  const bands = useMemo(() => getBandModel(selectedFilter.id), [selectedFilter.id]);
  const { audioRef, engineState, playbackState, error, play, pause, restart } = useAudioEngine(
    selectedSource.url,
    selectedFilter.id,
    compareMode
  );

  const statusText = useMemo(() => {
    if (error) return 'Could not prepare audio. Try another source or reload the page.';
    if (engineState === 'uninitialized') return 'Press Play to prepare audio and begin comparison.';
    if (engineState === 'failed') return 'The audio engine could not be initialized in this browser.';
    if (playbackState === 'playing') return 'Playing the current source.';
    if (playbackState === 'paused') return 'Playback paused.';
    return 'Audio engine ready.';
  }, [engineState, playbackState, error]);

  useEffect(() => {
    return () => {
      if (uploadedAudioUrl) {
        URL.revokeObjectURL(uploadedAudioUrl);
      }
    };
  }, [uploadedAudioUrl]);

  function handleUpload(file: File | null) {
    if (!file) return;
    if (uploadedAudioUrl) URL.revokeObjectURL(uploadedAudioUrl);
    setUploadedAudioUrl(URL.createObjectURL(file));
    setUploadedFileName(file.name);
    setSelectedSourceType('upload');
  }

  return (
    <div className="app-shell">
      <main className="page-wrap">
        <HeroSection
          title={UI_TEXT.heroTitle}
          subtitle={UI_TEXT.heroSubtitle}
          lead={UI_TEXT.heroLead}
          notice={UI_TEXT.heroNotice}
        />

        <div className="main-grid">
          <SourcePanel
            builtInSources={BUILT_IN_SOURCES}
            selectedSourceType={selectedSourceType}
            selectedBuiltInId={selectedBuiltInId}
            uploadedFileName={uploadedFileName}
            onSelectBuiltIn={(sourceId) => {
              setSelectedSourceType('built-in');
              setSelectedBuiltInId(sourceId);
            }}
            onUpload={handleUpload}
          />

          <ComparePanel
            selectedSourceTitle={selectedSource.title}
            selectedFilter={selectedFilter}
            compareMode={compareMode}
            statusText={statusText}
            audioRef={audioRef}
            bands={bands}
            error={error}
            onSetCompareMode={setCompareMode}
            onPlay={() => void play()}
            onPause={() => pause()}
            onRestart={() => restart()}
          />

          <div className="stack-layout">
            <ModesPanel
              filters={HEARING_FILTERS}
              selectedFilterId={selectedFilterId}
              onSelectFilter={setSelectedFilterId}
            />

            <NotesPanel selectedFilter={selectedFilter} />
          </div>
        </div>

        <AboutPanel />
      </main>
    </div>
  );
}
