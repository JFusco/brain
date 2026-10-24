import fs from 'node:fs';
import path from 'node:path';
import { walk } from '../../leaf/fs-safe.mjs';
import { at, ROOT } from '../../leaf/paths.mjs';
import { officialProblems } from '../../branch/official/validate.mjs';

export function checkOfficial() {
  const names = walk(at('official')).map(file =>
    path.relative(ROOT, file).split(path.sep).join('/'),
  );
  const { issues, warnings } = officialProblems(
    name => (fs.existsSync(at(name)) ? fs.readFileSync(at(name)) : null),
    names,
  );
  return { ok: !issues.length, issues, warnings };
}
