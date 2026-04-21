import { useEffect, useMemo, useState } from 'react';
import { DEFAULT_FILTER_ID, BUILT_IN_SOURCES, HEARING_FILTERS, UI_TEXT } from './data';
import { getBuiltInSourceUrl, useAudioEngine } from './audio';
import { getBandModel } from './visualization';
import { AboutPanel, HeroSection } from './layout';
import { SourcePanel } from './sourcePanel';
import { NotesPanel } from './notesPanel';
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

          <section className="panel panel-center">
            <div className="section-header">
              <p className="eyebrow">Compare</p>
              <h2>Listen and compare</h2>
              <p className="section-copy">
                Keep the same source, then switch between Original and Filtered to compare the described change.
              </p>
            </div>
            <div className="selection-summary">
              <span><strong>Source</strong> {selectedSource.title}</span>
              <span><strong>Mode</strong> {selectedFilter.title}</span>
              <span><strong>View</strong> {compareMode === 'filtered' ? 'Filtered' : 'Original'}</span>
            </div>
            <div className="toggle-row">
              <button className={compareMode === 'original' ? 'mode-toggle is-active' : 'mode-toggle'} onClick={() => setCompareMode('original')}>
                Original
              </button>
              <button className={compareMode === 'filtered' ? 'mode-toggle is-active' : 'mode-toggle'} onClick={() => setCompareMode('filtered')}>
                Filtered
              </button>
            </div>
            <div className="controls-row">
              <button onClick={() => void play()}>Play</button>
              <button onClick={() => pause()}>Pause</button>
              <button onClick={() => restart()}>Restart</button>
            </div>
            <audio ref={audioRef} preload="auto" className="native-audio" />
            <p className="status-line">{statusText}</p>
            {selectedFilter.headphonesRecommended ? <p className="hint">Headphones recommended for this mode.</p> : null}

            <div className="section-header visual-head">
              <p className="eyebrow">Visual</p>
              <h2>What changes</h2>
              <p className="section-copy">
                The display highlights which bands weaken, blur, overlap, or extend beyond the usual human range.
              </p>
            </div>
            <div className="band-grid">
              {bands.labels.map((label, index) => (
                <div key={label} className="band-card">
                  <span className="band-label">{label}</span>
                  <div className="bar-pair">
                    <div className="bar-column">
                      <span className="bar-name">Original</span>
                      <div className="bar-track"><div className="bar-fill original" style={{ height: `${bands.original[index]}%` }} /></div>
                    </div>
                    <div className="bar-column">
                      <span className="bar-name">Filtered</span>
                      <div className="bar-track"><div className="bar-fill filtered" style={{ height: `${bands.filtered[index]}%` }} /></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {selectedFilter.visualType === 'lr-balance' ? (
              <div className="context-panel">
                <h3>Left / Right balance</h3>
                <p className="section-copy compact-copy">One side is intentionally reduced so the stereo centre drifts away from balance.</p>
                <div className="lr-meter">
                  <div className="lr-track"><div className="lr-fill left" style={{ width: '38%' }} /></div>
                  <div className="lr-track"><div className="lr-fill right" style={{ width: '100%' }} /></div>
                </div>
              </div>
            ) : null}

            {selectedFilter.visualType === 'noise-overlap' ? (
              <div className="context-panel">
                <h3>Noise overlap</h3>
                <p className="section-copy compact-copy">The target signal remains, but competing sound or ringing makes it harder to separate.</p>
                <div className="overlap-box">
                  <div className="overlap-speech">Speech</div>
                  <div className="overlap-noise">Noise / ringing</div>
                </div>
              </div>
            ) : null}

            {selectedFilter.visualType === 'range-difference' ? (
              <div className="context-panel">
                <h3>Human range and translated extension</h3>
                <p className="section-copy compact-copy">Animal modes emphasize the difference between the common human range and a translated extension.</p>
                <div className="range-wrap">
                  <div className="range-line human">Human range</div>
                  <div className="range-line extension">Extended reference range</div>
                </div>
              </div>
            ) : null}

            {error ? <div className="error-panel">{error}</div> : null}
          </section>

          <div className="stack-layout">
            <section className="panel">
              <div className="section-header">
                <p className="eyebrow">Modes</p>
                <h2>Choose a listening mode</h2>
                <p className="section-copy">
                  Condition covers everyday listening difficulty. Animal Reference translates differences in range into a comparison aid.
                </p>
              </div>
              {(['condition', 'animal'] as const).map((group) => (
                <div key={group} className="filter-group">
                  <h3>{group === 'condition' ? 'Condition' : 'Animal Reference'}</h3>
                  <div className="stack compact">
                    {HEARING_FILTERS.filter((filter) => filter.group === group).map((filter) => (
                      <button
                        key={filter.id}
                        className={`select-card ${selectedFilterId === filter.id ? 'is-selected' : ''}`}
                        onClick={() => setSelectedFilterId(filter.id)}
                      >
                        <span className="select-card-title">{filter.title}</span>
                        <span className="select-card-body">{filter.shortDescription}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </section>

            <NotesPanel selectedFilter={selectedFilter} />
          </div>
        </div>

        <AboutPanel />
      </main>
    </div>
  );
}
