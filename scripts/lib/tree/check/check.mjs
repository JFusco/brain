import { createRequire } from 'node:module';
import path from 'node:path';
import { knowledgeProblems } from '../../branch/check/knowledge-rules.mjs';
import { localLinkProblems } from '../../branch/check/local-links.mjs';
import { repositoryProblems } from '../../branch/check/repository-rules.mjs';
import { stagedEntries, treeEntries } from '../../branch/check/entries.mjs';
import { officialProblems } from '../../branch/official/validate.mjs';
import { assertClean } from '../../branch/privacy/scanner.mjs';
import { walk } from '../../leaf/fs-safe.mjs';
import { at, ROOT } from '../../leaf/paths.mjs';

const require = createRequire(import.meta.url);
const { collect } = require('../../../wiki/lib/wiki-graph.cjs');

// The repository gate: privacy scans, official catalogs, knowledge rules and, outside staged mode,
// the knowledge graph, local links and repository hygiene. Issue order is part of the report.
export function check({ staged = false } = {}) {
  const issues = [],
    warnings = [];
  const entries = staged ? stagedEntries(issues) : treeEntries();
  // Catalog titles and descriptions are vendor text: secrets are scanned, client terms are not.
  const vendor = entries.filter(e => e.id.startsWith('official/catalogs/')),
    personal = entries.filter(e => !e.id.startsWith('official/catalogs/'));
  try {
    assertClean(personal);
  } catch (error) {
    issues.push(error.message);
  }
  try {
    assertClean(vendor, { clients: false });
  } catch (error) {
    issues.push(error.message);
  }
  const byId = new Map(entries.map(e => [e.id, e.bytes]));
  const names = staged
    ? entries.map(e => e.id).filter(id => id.startsWith('official/'))
    : walk(at('official')).map(file => path.relative(ROOT, file).split(path.sep).join('/'));
  const official = officialProblems(name => byId.get(name) ?? null, names, {
    unexpected: staged ? 'issues' : 'warnings',
  });
  issues.push(...official.issues);
  warnings.push(...official.warnings);
  issues.push(...knowledgeProblems(entries));
  if (!staged) {
    try {
      collect(ROOT, { wikiRoot: 'knowledge' });
    } catch (error) {
      issues.push(error.message);
    }
    const links = localLinkProblems(entries);
    issues.push(...links.issues);
    warnings.push(...links.warnings);
    issues.push(...repositoryProblems());
  }
  return {
    ok: !issues.length,
    issues: [...new Set(issues)],
    warnings: [...new Set(warnings)],
    filesScanned: entries.length,
  };
}
