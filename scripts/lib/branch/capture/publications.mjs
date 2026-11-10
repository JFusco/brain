/** Operator-supplied incorporation mappings, verified at the exact merged commit. */
export function publicationMappings(ids, value, commit, read) {
  if (typeof value !== 'string' || value.length > 65536)
    throw new Error('Acceptance requires a bounded explicit publication map');
  let mapping;
  try {
    mapping = JSON.parse(value);
  } catch {
    throw new Error('Invalid publication map JSON');
  }
  if (
    !mapping ||
    Array.isArray(mapping) ||
    typeof mapping !== 'object' ||
    Object.keys(mapping).length !== ids.length ||
    Object.keys(mapping).some(id => !ids.includes(id))
  )
    throw new Error('Publication map must identify exactly the accepted candidates');
  const verified = {};
  for (const id of ids) {
    const entries = mapping[id];
    if (!Array.isArray(entries) || !entries.length || entries.length > 20)
      throw new Error('Each accepted candidate needs 1 through 20 explicit notes');
    const seen = new Set();
    verified[id] = entries.map(entry => {
      if (
        !entry ||
        Object.keys(entry).sort().join(',') !== 'contentSha256,path' ||
        typeof entry.path !== 'string' ||
        !/^[a-f0-9]{64}$/.test(entry.contentSha256) ||
        seen.has(entry.path)
      )
        throw new Error('Invalid publication mapping');
      seen.add(entry.path);
      const note = read(commit, entry.path);
      if (note.snapshot !== commit || note.contentSha256 !== entry.contentSha256)
        throw new Error('Publication mapping does not match the merged note');
      return { path: entry.path, commit, contentSha256: entry.contentSha256 };
    });
  }
  return verified;
}
