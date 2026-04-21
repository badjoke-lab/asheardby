import type { AudioSource, SourceType } from './types';

export function SourcePanel(props: {
  builtInSources: AudioSource[];
  selectedSourceType: SourceType;
  selectedBuiltInId: string;
  uploadedFileName: string | null;
  onSelectBuiltIn: (sourceId: string) => void;
  onUpload: (file: File | null) => void;
}) {
  const {
    builtInSources,
    selectedSourceType,
    selectedBuiltInId,
    uploadedFileName,
    onSelectBuiltIn,
    onUpload,
  } = props;

  return (
    <section className="panel">
      <div className="section-header">
        <p className="eyebrow">Source</p>
        <h2>Choose a source</h2>
        <p className="section-copy">
          Begin with a built-in sample or load your own local audio file. The comparison stays in the browser.
        </p>
      </div>
      <p className="subheading">Built-in samples</p>
      <div className="stack">
        {builtInSources.map((source) => (
          <button
            key={source.id}
            className={`select-card ${selectedSourceType === 'built-in' && selectedBuiltInId === source.id ? 'is-selected' : ''}`}
            onClick={() => onSelectBuiltIn(source.id)}
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
        <input type="file" accept="audio/*" onChange={(event) => onUpload(event.target.files?.[0] ?? null)} />
        <span className="select-card-meta">{uploadedFileName ? `Loaded: ${uploadedFileName}` : 'No file selected'}</span>
      </label>
    </section>
  );
}
