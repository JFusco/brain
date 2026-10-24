const stops = new Set([
  'a',
  'an',
  'and',
  'are',
  'for',
  'how',
  'i',
  'in',
  'is',
  'it',
  'of',
  'on',
  'the',
  'to',
  'use',
  'using',
  'with',
]);
export const tokens = text => [
  ...new Set(
    String(text)
      .toLowerCase()
      .replace(/next\.?js/g, 'nextjs')
      .split(/[^a-z0-9]+/)
      .filter(word => word.length > 1 && !stops.has(word)),
  ),
];
