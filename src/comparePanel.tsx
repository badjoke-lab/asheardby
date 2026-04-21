import type { RefObject } from 'react';
import type { CompareMode, HearingFilter } from './types';

type BandModel = {
  original: number[];
  filtered: number[];
  labels: string[];
};

export function ComparePanel(props: {
  selectedSourceTitle: string;
  selectedFilter: HearingFilter;
  compareMode: CompareMode;
  statusText: string;
  audioRef: RefObject<HTMLAudioElement | null>;
  bands: BandModel;
  error: string | null;
  onSetCompareMode: (mode: CompareMode) => void;
  onPlay: () => void;
  onPause: () => void;
  onRestart: () => void;
}) {
  const {
    selectedSourceTitle,
    selectedFilter,
    compareMode,
    statusText,
    audioRef,
    bands,
    error,
    onSetCompareMode,
    onPlay,
    onPause,
    onRestart,
  } = props;

  return (
    <section className="panel panel-center">
      <div className="section-header">
        <p className="eyebrow">Compare</p>
        <h2>Listen and compare</h2>
        <p className="section-copy">
          Keep the same source, then switch between Original and Filtered to compare the described change.
        </p>
      </div>
      <div className="selection-summary">
        <span><strong>Source</strong> {selectedSourceTitle}</span>
        <span><strong>Mode</strong> {selectedFilter.title}</span>
        <span><strong>View</strong> {compareMode === 'filtered' ? 'Filtered' : 'Original'}</span>
      </div>
      <div className="toggle-row">
        <button className={compareMode === 'original' ? 'mode-toggle is-active' : 'mode-toggle'} onClick={() => onSetCompareMode('original')}>
          Original
        </button>
        <button className={compareMode === 'filtered' ? 'mode-toggle is-active' : 'mode-toggle'} onClick={() => onSetCompareMode('filtered')}>
          Filtered
        </button>
      </div>
      <div className="controls-row">
        <button onClick={onPlay}>Play</button>
        <button onClick={onPause}>Pause</button>
        <button onClick={onRestart}>Restart</button>
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
  );
}
