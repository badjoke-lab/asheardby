export type SourceType = 'built-in' | 'upload';
export type CompareMode = 'original' | 'filtered';
export type AudioEngineState = 'uninitialized' | 'ready' | 'failed';
export type PlaybackState = 'idle' | 'playing' | 'paused';
export type FilterGroup = 'condition' | 'animal';
export type VisualType = 'none' | 'lr-balance' | 'noise-overlap' | 'range-difference';

export type AudioSource = {
  id: string;
  title: string;
  description: string;
  recommendedFor: string;
};

export type FilterNotes = {
  whatItIs: string;
  basedOn: string;
  whatChanges: string;
  whatToNotice: string;
  limits: string;
};

export type HearingFilter = {
  id: string;
  group: FilterGroup;
  title: string;
  shortDescription: string;
  visualType: VisualType;
  headphonesRecommended?: boolean;
  notes: FilterNotes;
};
