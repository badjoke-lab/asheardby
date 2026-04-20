import { useMemo, useState } from 'react';
import { DEFAULT_FILTER_ID, BUILT_IN_SOURCES, HEARING_FILTERS, UI_TEXT } from './data';
import { getBuiltInSourceUrl, useAudioEngine } from './audio';
import { getBandModel } from './visualization';
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
        <section className="hero-section panel panel-hero">
          <p className="eyebrow">The auditory companion volume</p>
          <h1>{UI_TEXT.heroTitle}</h1>
          <p className="subtitle">{UI_TEXT.heroSubtitle}</p>
          <p className="lead">{UI_TEXT.heroLead}</p>
          <div className="notice-block">
            <p>{UI_TEXT.heroNotice}</p>
            <ul>
              <li>Start with a low volume.</li>
              <li>Headphones are recommended for left-right asymmetry.</li>
            </ul>
          </div>
        </section>

        <div className="main-grid">
          <section className="panel">
            <div className="section-header">
              <p className="eyebrow">Source</p>
              <h2>Choose a source</h2>
            </div>
            <div className="stack">
              {BUILT_IN_SOURCES.map((source) => (
                <button
                  key={source.id}
                  className={`select-card ${selectedSourceType === 'built-in' && selectedBuiltInId === source.id ? 'is-selected' : ''}`}
                  onClick={() => {
                    setSelectedSourceType('built-in');
                    setSelectedBuiltInId(source.id);
                  }}
                >
                  <span className="select-card-title">{source.title}</span>
                  <span className="select-card-body">{source.description}</span>
                  <span className="select-card-meta">Recommended for: {source.recommendedFor}</span>
                </button>
              ))}
            </div>

            <label className={`upload-panel ${selectedSourceType === 'upload' ? 'is-selected' : ''}`}>
              <span className="select-card-title">Upload audio</span>
              <span className="select-card-body">Use a local audio file for comparison. Processing stays in the browser.</span>
              <input type="file" accept="audio/*" onChange={(event) => handleUpload(event.target.files?.[0] ?? null)} />
              <span className="select-card-meta">{uploadedFileName ? `Loaded: ${uploadedFileName}` : 'No file selected'}</span>
            </label>
          </section>

          <section className="panel panel-center">
            <div className="section-header">
              <p className="eyebrow">Compare</p>
              <h2>Listen and compare</h2>
            </div>
            <div className="selection-summary">
              <span><strong>Source</strong> {selectedSource.title}</span>
              <span><strong>Mode</strong> {selectedFilter.title}</span>
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
            <p className="status-line">Engine: {engineState} · Playback: {playbackState}</p>
            {selectedFilter.headphonesRecommended ? <p className="hint">Headphones recommended for this mode.</p> : null}

            <div className="section-header visual-head">
              <p className="eyebrow">Visual</p>
              <h2>What changes</h2>
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
                <div className="lr-meter">
                  <div className="lr-track"><div className="lr-fill left" style={{ width: '38%' }} /></div>
                  <div className="lr-track"><div className="lr-fill right" style={{ width: '100%' }} /></div>
                </div>
              </div>
            ) : null}

            {selectedFilter.visualType === 'noise-overlap' ? (
              <div className="context-panel">
                <h3>Noise overlap</h3>
                <div className="overlap-box">
                  <div className="overlap-speech">Speech</div>
                  <div className="overlap-noise">Noise / ringing</div>
                </div>
              </div>
            ) : null}

            {selectedFilter.visualType === 'range-difference' ? (
              <div className="context-panel">
                <h3>Human range and translated extension</h3>
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

            <section className="panel">
              <div className="section-header">
                <p className="eyebrow">Notes</p>
                <h2>Notes on this mode</h2>
              </div>
              <div className="notes-header">
                <h3>{selectedFilter.title}</h3>
                <p>{selectedFilter.shortDescription}</p>
              </div>
              <dl className="notes-list">
                <div className="note-item"><dt>What it is</dt><dd>{selectedFilter.notes.whatItIs}</dd></div>
                <div className="note-item"><dt>Based on</dt><dd>{selectedFilter.notes.basedOn}</dd></div>
                <div className="note-item"><dt>What changes</dt><dd>{selectedFilter.notes.whatChanges}</dd></div>
                <div className="note-item"><dt>What to notice</dt><dd>{selectedFilter.notes.whatToNotice}</dd></div>
                <div className="note-item"><dt>Limits</dt><dd>{selectedFilter.notes.limits}</dd></div>
              </dl>
              <p className="small-disclaimer">Reference / approximation · not diagnosis · not exact reproduction</p>
            </section>
          </div>
        </div>

        <section className="panel panel-about">
          <div className="section-header">
            <p className="eyebrow">About</p>
            <h2>About this project</h2>
          </div>
          <p>
            AsHeardBy translates commonly described hearing differences into a browser-based comparison experience.
            It is intended for reference and communication, not diagnosis or exact recreation of any single person’s hearing.
          </p>
        </section>
      </main>
    </div>
  );
}
