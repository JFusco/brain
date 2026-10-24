import path from 'node:path';
import { sha } from '../../../leaf/hash.mjs';
import { https } from './ids.mjs';

// Citations and local links in note bodies, plus each note's hub membership.
export function addLinks(graph) {
  const { nodes, bodies, edge } = graph;
  for (const [id, body] of bodies) {
    for (const match of body.replace(/```[\s\S]*?```/g, '').matchAll(/\[[^\]]*\]\(([^\s)]+)\)/g)) {
      let href;
      try {
        href = decodeURIComponent(match[1].split('#')[0]);
      } catch {
        continue;
      }
      const url = https(match[1].split('#')[0]);
      const target = url
        ? `url:${sha(url)}`
        : path.posix.normalize(path.posix.join(path.posix.dirname(id), href));
      edge(id, target, url ? 'cites official reference' : 'links to');
    }
    const node = nodes.get(id);
    if (node.kind === 'curated-note')
      edge(`knowledge/${node.domain}/INDEX.md`, id, 'domain membership');
  }
}
