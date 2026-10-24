import fs from 'node:fs';
import path from 'node:path';
import { config } from '../platform/config.mjs';
import { splitFrontmatter } from '../../leaf/frontmatter.mjs';
import { inside } from '../../leaf/fs-safe.mjs';
import { at, ROOT } from '../../leaf/paths.mjs';

// Relative links in knowledge notes must resolve inside public Brain content or a configured authority.
export function localLinkProblems(entries) {
  const issues = [],
    warnings = [];
  for (const { id, bytes } of entries.filter(
    e => e.id.startsWith('knowledge/') && e.id.endsWith('.md') && !e.id.includes('/_templates/'),
  )) {
    const text = splitFrontmatter(bytes.toString()).body.replace(/```[\s\S]*?```/g, '');
    for (const match of text.matchAll(/\[[^\]]*\]\(([^\s)]+)\)/g)) {
      const href = match[1];
      if (/^(?:[a-z][\w+.-]*:|#)/i.test(href)) continue;
      let target;
      try {
        target = path.resolve(path.dirname(at(id)), decodeURIComponent(href.split(/[?#]/)[0]));
      } catch {
        issues.push(`${id}: invalid link encoding`);
        continue;
      }
      const authority = (config().authorities || []).some(a =>
        inside(path.resolve(ROOT, a.path), target),
      );
      if (
        (!inside(ROOT, target) && !authority) ||
        inside(at('.state'), target) ||
        inside(at('inbox'), target)
      ) {
        issues.push(`${id}: link leaves public brain content`);
        continue;
      }
      if (authority && !fs.existsSync(target)) {
        warnings.push(`${id}: an authority checkout is unavailable`);
        continue;
      }
      if (!fs.existsSync(target)) issues.push(`${id}: missing local link target`);
    }
  }
  return { issues, warnings };
}
