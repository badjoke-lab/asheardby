export function getBandModel(filterId: string) {
  const base = [55, 65, 78, 72, 66];

  switch (filterId) {
    case 'high-frequency-loss':
      return { original: base, filtered: [55, 65, 76, 42, 20], labels: ['Low', 'Low-mid', 'Speech', 'High', 'Very high'] };
    case 'speech-in-noise':
      return { original: base, filtered: [55, 68, 55, 56, 60], labels: ['Low', 'Low-mid', 'Speech', 'High', 'Very high'] };
    case 'left-right-asymmetry':
      return { original: base, filtered: [55, 65, 78, 72, 66], labels: ['Low', 'Low-mid', 'Speech', 'High', 'Very high'] };
    case 'tinnitus-overlay':
      return { original: base, filtered: [55, 64, 74, 75, 82], labels: ['Low', 'Low-mid', 'Speech', 'High', 'Very high'] };
    case 'reduced-clarity':
      return { original: base, filtered: [50, 54, 48, 42, 36], labels: ['Low', 'Low-mid', 'Speech', 'High', 'Very high'] };
    case 'dog':
      return { original: base, filtered: [55, 65, 78, 78, 86], labels: ['Low', 'Low-mid', 'Speech', 'High', 'Extended high'] };
    case 'bat':
      return { original: base, filtered: [44, 54, 64, 78, 92], labels: ['Low', 'Low-mid', 'Speech', 'High', 'Extended high'] };
    case 'elephant':
      return { original: base, filtered: [88, 74, 60, 42, 30], labels: ['Extended low', 'Low', 'Speech', 'High', 'Very high'] };
    default:
      return { original: base, filtered: base, labels: ['Low', 'Low-mid', 'Speech', 'High', 'Very high'] };
  }
}
