import type { HearingFilter } from './types';

export function ModesPanel(props: {
  filters: HearingFilter[];
  selectedFilterId: string;
  onSelectFilter: (filterId: string) => void;
}) {
  const { filters, selectedFilterId, onSelectFilter } = props;

  return (
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
            {filters.filter((filter) => filter.group === group).map((filter) => (
              <button
                key={filter.id}
                className={`select-card ${selectedFilterId === filter.id ? 'is-selected' : ''}`}
                onClick={() => onSelectFilter(filter.id)}
              >
                <span className="select-card-title">{filter.title}</span>
                <span className="select-card-body">{filter.shortDescription}</span>
              </button>
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}
