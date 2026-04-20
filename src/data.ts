import type { AudioSource, HearingFilter } from './types';

export const UI_TEXT = {
  heroTitle: 'AsHeardBy',
  heroSubtitle: 'A comparative listening study',
  heroLead:
    'Hearing differences, translated into a browser-based comparison experience built from commonly described characteristics.',
  heroNotice:
    'This project is reference, not diagnosis. It does not claim exact reproduction of an individual person’s hearing.',
};

export const BUILT_IN_SOURCES: AudioSource[] = [
  {
    id: 'voice',
    title: 'Voice sample',
    description: 'Basic speech-like material for consonants and clarity.',
    recommendedFor: 'High-frequency loss, clarity',
  },
  {
    id: 'noise',
    title: 'Noise sample',
    description: 'A noisier environment for masking and overlap.',
    recommendedFor: 'Speech in noise, tinnitus',
  },
  {
    id: 'stereo',
    title: 'Stereo sample',
    description: 'Alternating left/right cues for balance and asymmetry.',
    recommendedFor: 'Left-right asymmetry',
  },
];

export const HEARING_FILTERS: HearingFilter[] = [
  {
    id: 'high-frequency-loss',
    group: 'condition',
    title: 'High-frequency loss reference',
    shortDescription: 'High components soften and consonants become less distinct.',
    visualType: 'none',
    notes: {
      whatItIs: 'A reference mode based on commonly described reduction in high-frequency audibility.',
      basedOn: 'Descriptions of reduced sensitivity to higher-frequency detail.',
      whatChanges: 'Bright edges and consonant-like content feel weaker.',
      whatToNotice: 'Compare the High and Very high bands.',
      limits: 'This is a reference approximation, not a personal recreation.',
    },
  },
  {
    id: 'speech-in-noise',
    group: 'condition',
    title: 'Speech in noise reference',
    shortDescription: 'Background noise competes with the speech region.',
    visualType: 'noise-overlap',
    notes: {
      whatItIs: 'A reference mode for understanding why speech can become tiring or unclear in noise.',
      basedOn: 'Common descriptions of masking by background sound.',
      whatChanges: 'Speech remains present but its boundaries are less distinct.',
      whatToNotice: 'Look at the Speech band and the overlap visual.',
      limits: 'Real environments vary widely; this is only one translation.',
    },
  },
  {
    id: 'left-right-asymmetry',
    group: 'condition',
    title: 'Left-right asymmetry reference',
    shortDescription: 'One side becomes weaker and stereo balance shifts.',
    visualType: 'lr-balance',
    headphonesRecommended: true,
    notes: {
      whatItIs: 'A reference mode for asymmetry between the two ears.',
      basedOn: 'Descriptions of changed localisation and balance with unequal sensitivity.',
      whatChanges: 'The centre drifts and one side feels thinner.',
      whatToNotice: 'Use headphones and watch the Left / Right balance.',
      limits: 'The degree and character of asymmetry differ from person to person.',
    },
  },
  {
    id: 'tinnitus-overlay',
    group: 'condition',
    title: 'Tinnitus overlay reference',
    shortDescription: 'A thin persistent tone rides above the outside sound.',
    visualType: 'noise-overlap',
    notes: {
      whatItIs: 'A reference overlay inspired by descriptions of ringing or buzzing.',
      basedOn: 'Common descriptions of tinnitus-like internal sound.',
      whatChanges: 'A narrow continuous tone competes for attention.',
      whatToNotice: 'Focus on the upper bands and the overlap visual.',
      limits: 'Experiences vary greatly; this is only a single illustrative cue.',
    },
  },
  {
    id: 'reduced-clarity',
    group: 'condition',
    title: 'Reduced clarity reference',
    shortDescription: 'Sound arrives, but edges and word boundaries blur together.',
    visualType: 'noise-overlap',
    notes: {
      whatItIs: 'A reference mode for lowered definition without simple loudness loss.',
      basedOn: 'Descriptions of hearing something but struggling to parse it cleanly.',
      whatChanges: 'Boundaries feel softer and speech becomes harder to separate.',
      whatToNotice: 'Compare the Speech band and the overlap visual.',
      limits: 'This is a translated illustration, not a clinical model.',
    },
  },
  {
    id: 'dog',
    group: 'animal',
    title: 'Dog reference',
    shortDescription: 'A human-accessible translation of a more high-extended hearing profile.',
    visualType: 'range-difference',
    notes: {
      whatItIs: 'A translated reference mode inspired by commonly described canine high-frequency sensitivity.',
      basedOn: 'General descriptions of dogs responding beyond the typical human range.',
      whatChanges: 'Extended high-band awareness becomes the main idea.',
      whatToNotice: 'Compare Human range and Extended high.',
      limits: 'This does not recreate a dog’s hearing. It translates the idea for human comparison.',
    },
  },
  {
    id: 'bat',
    group: 'animal',
    title: 'Bat reference',
    shortDescription: 'A translated view of an extreme high-frequency world beyond human hearing.',
    visualType: 'range-difference',
    notes: {
      whatItIs: 'A human-oriented translation of commonly described bat ultrasonic behaviour.',
      basedOn: 'Descriptions of bats using frequencies far above normal human audibility.',
      whatChanges: 'The visual emphasis shifts toward an extended upper region.',
      whatToNotice: 'Watch how Extended high exceeds Human range.',
      limits: 'Ultrasonic perception cannot be directly reproduced here as hearing.',
    },
  },
  {
    id: 'elephant',
    group: 'animal',
    title: 'Elephant reference',
    shortDescription: 'A translated view of very low-frequency communication below normal human hearing.',
    visualType: 'range-difference',
    notes: {
      whatItIs: 'A human-oriented translation of commonly described elephant low-frequency communication.',
      basedOn: 'Descriptions of elephants using low-frequency sound below standard human hearing.',
      whatChanges: 'Attention shifts toward the extended lower region.',
      whatToNotice: 'Compare Human range and Extended low.',
      limits: 'This is a translated comparison aid, not an exact recreation.',
    },
  },
];

export const DEFAULT_FILTER_ID = 'high-frequency-loss';
