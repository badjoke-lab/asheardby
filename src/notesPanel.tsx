import type { HearingFilter } from './types';

export function NotesPanel(props: { selectedFilter: HearingFilter }) {
  const { selectedFilter } = props;

  return (
    <section className="panel">
      <div className="section-header">
        <p className="eyebrow">Notes</p>
        <h2>Notes on this mode</h2>
        <p className="section-copy">
          These notes explain what this mode is trying to communicate and where to focus while listening.
        </p>
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
  );
}
