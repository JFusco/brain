// Built-in secret patterns, checked alongside Gitleaks. Hits carry positions, never values.
export function builtinHits(text) {
  const patterns = [
    [
      'private-key',
      /-----BEGIN (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----[\s\S]{0,32768}?-----END (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----/g,
    ],
    ['github-token', /\b(?:gh[pousr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{50,})\b/g],
    ['aws-key', /\b(?:AKIA|ASIA)[A-Z0-9]{16}\b/g],
  ];
  const hits = [];
  for (const [rule, pattern] of patterns)
    for (const match of text.matchAll(pattern))
      hits.push({ rule, index: match.index, length: match[0].length });
  for (const match of text.matchAll(/-----BEGIN (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----/g))
    if (
      !hits.some(
        h => h.rule === 'private-key' && match.index >= h.index && match.index < h.index + h.length,
      )
    )
      hits.push({ rule: 'private-key', index: match.index, length: match[0].length });
  return hits;
}
