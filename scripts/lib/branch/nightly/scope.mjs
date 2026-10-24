import { safePath } from '../../leaf/fs-safe.mjs';
import { sha } from '../../leaf/hash.mjs';
import { git, blob } from '../platform/git.mjs';

const OFFICIAL = /<!-- brain:official:start -->[\s\S]*?<!-- brain:official:end -->/;
const CURATED = /<!-- brain:curated:start -->[\s\S]*?<!-- brain:curated:end -->/;

// The committed files a publication changes, limited to the scope its kind allows.
export function publicationScope(entry, head) {
  const { worktree: cwd, baseSha, kind } = entry;
  git(cwd, 'merge-base', '--is-ancestor', baseSha, head);
  const paths = git(cwd, 'diff', '--name-only', '--no-renames', '-z', baseSha, head)
    .toString()
    .split('\0')
    .filter(Boolean)
    .sort();
  const notes = [],
    files = paths.map(file => {
      safePath(file);
      const hub = /^knowledge\/(?:[^/]+\/)+INDEX\.md$/.test(file);
      const permitted =
        kind === 'catalog'
          ? /^(official\/catalogs\/|official\/sources\.lock\.json$)/.test(file) || hub
          : /^(knowledge\/|wiki\/|scripts\/wiki\/graph\/data\/)/.test(file) &&
            !file.includes('/_templates/');
      if (!permitted) throw new Error('Changed path is outside this nightly publication scope');
      const before = blob(cwd, baseSha, file),
        after = blob(cwd, head, file);
      if (
        hub &&
        kind === 'catalog' &&
        (!before ||
          !after ||
          before.toString().replace(OFFICIAL, '') !== after.toString().replace(OFFICIAL, ''))
      )
        throw new Error('Catalog refresh may change only the official section of existing hubs');
      if (
        file.startsWith('knowledge/') &&
        (!hub ||
          !before ||
          !after ||
          before.toString().replace(OFFICIAL, '').replace(CURATED, '') !==
            after.toString().replace(OFFICIAL, '').replace(CURATED, ''))
      )
        notes.push(file);
      return { path: file, sha256: after === null ? null : sha(after) };
    });
  if (!files.length) throw new Error('No committed publication changes');
  return { files, notes };
}
