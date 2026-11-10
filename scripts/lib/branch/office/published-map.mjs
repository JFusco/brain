import { publishedSnapshot } from './published-read.mjs';
const LIMIT = 512 * 1024;
const emitted = value => Buffer.byteLength(JSON.stringify(value, null, 2) + '\n');
/** Independent node and edge cursors retain every explicit relationship across bounded pages. */
export function publishedMap({ snapshot: revision, cursor }, load) {
  let offsets = [0, 0];
  if (cursor) {
    if (typeof cursor !== 'string' || cursor.length > 200)
      throw new Error('Invalid snapshot cursor');
    let decoded;
    try {
      decoded = JSON.parse(Buffer.from(cursor, 'base64url').toString());
    } catch {
      throw new Error('Invalid snapshot cursor');
    }
    if (
      !Array.isArray(decoded) ||
      decoded.length !== 3 ||
      decoded.slice(1).some(n => !Number.isSafeInteger(n) || n < 0) ||
      (revision && decoded[0] !== revision)
    )
      throw new Error('Invalid snapshot cursor');
    revision = decoded[0];
    offsets = decoded.slice(1);
  }
  const graph = publishedSnapshot(revision, load);
  const nodes = [...graph.nodes].sort((a, b) => a.id.localeCompare(b.id));
  const edges = [...graph.edges].sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)));
  let [nodeOffset, edgeOffset] = offsets;
  if (nodeOffset > nodes.length || edgeOffset > edges.length)
    throw new Error('Snapshot cursor exceeds content');
  const response = {
    version: 1,
    snapshot: graph.revision,
    nodes: [],
    edges: [],
    truncated: false,
    nextCursor: null,
  };
  // Budget the bytes brain.mjs emits: JSON.stringify(result, null, 2) plus a newline.
  const worstCursor = Buffer.from(
    JSON.stringify([graph.revision, nodes.length, edges.length]),
  ).toString('base64url');
  // Each non-empty array adds a closing newline and indent (3 bytes).
  let size = emitted({ ...response, nextCursor: worstCursor }) + 6;
  for (const [all, result, start, maximum] of [
    [nodes, response.nodes, nodeOffset, 500],
    [edges, response.edges, edgeOffset, 1000],
  ]) {
    for (const item of all.slice(start, start + maximum)) {
      // Array items sit two levels deep: newline, 4-space indent, re-indented lines, comma.
      const text = JSON.stringify(item, null, 2),
        bytes = Buffer.byteLength(text) + 4 * (text.split('\n').length - 1) + 6;
      if (size + bytes > LIMIT) break;
      result.push(item);
      size += bytes;
    }
  }
  nodeOffset += response.nodes.length;
  edgeOffset += response.edges.length;
  response.truncated = nodeOffset < nodes.length || edgeOffset < edges.length;
  if (response.truncated) {
    if (!response.nodes.length && !response.edges.length)
      throw new Error('Snapshot record exceeds response limit');
    response.nextCursor = Buffer.from(
      JSON.stringify([graph.revision, nodeOffset, edgeOffset]),
    ).toString('base64url');
  }
  if (emitted(response) > LIMIT) throw new Error('Snapshot response exceeds its bound');
  return response;
}
