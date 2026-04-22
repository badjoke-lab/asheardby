import { useMemo, useState } from 'react';
import { DEFAULT_FILTER_ID, BUILT_IN_SOURCES, HEARING_FILTERS, UI_TEXT } from './data';
import { useAudioEngine } from './audio';
import { getBandModel } from './visualization';
import { AboutPanel, HeroSection } from './layout';
import { SourcePanel } from './sourcePanel';
import { NotesPanel } from './notesPanel';
import { ModesPanel } from './modesPanel';
import { ComparePanel } from './comparePanel';
import { useCompareStatusText, useResolvedSource, useUploadedAudio } from './appHooks';
import type { CompareMode, SourceType } from './types';

export function App() {
  const [selectedSourceType, setSelectedSourceType] = useState<SourceType>('built-in');
  const [selectedBuiltInId, setSelectedBuiltInId] = useState('voice');
  const [selectedFilterId, setSelectedFilterId] = useState(DEFAULT_FILTER_ID);
  const [compareMode, setCompareMode] = useState<CompareMode>('filtered');
  const { uploadedAudioUrl, uploadedFileName, setUploadedFile } = useUploadedAudio();

  const selectedFilter = useMemo(
    () => HEARING_FILTERS.find((filter) => filter.id === selectedFilterId) ?? HEARING_FILTERS[0],
    [selectedFilterId]
  );

  const selectedSource = useResolvedSource({
    selectedSourceType,
    selectedBuiltInId,
    uploadedAudioUrl,
    uploadedFileName,
    builtInSources: BUILT_IN_SOURCES,
  });

  const bands = useMemo(() => getBandModel(selectedFilter.id), [selectedFilter.id]);
  const { audioRef, engineState, playbackState, error, play, pause, restart } = useAudioEngine(
    selectedSource.url,
    selectedFilter.id,
    compareMode
  );

  const statusText = useCompareStatusText({
    engineState,
    playbackState,
    error,
  });

  function handleUpload(file: File | null) {
    if (!file) return;
    setUploadedFile(file);
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
