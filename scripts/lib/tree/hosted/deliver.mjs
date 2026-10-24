import { spawnSync } from 'node:child_process';
import { config } from '../../branch/platform/config.mjs';
import { atomic } from '../../leaf/fs-safe.mjs';
import { at, ROOT } from '../../leaf/paths.mjs';
import { body, MARKER, TITLE } from '../../branch/hosted/issue-body.mjs';

const maxBytes = 32 * 1024 * 1024;
function gh(...args) {
  const result = spawnSync(config().toolchain.gh, args, {
    cwd: ROOT,
    encoding: 'utf8',
    maxBuffer: maxBytes,
    timeout: 120000,
  });
  if (result.status !== 0) throw new Error('GitHub CLI operation failed; inspect the weekly step');
  return result.stdout.trim();
}
const ghJSON = (...args) => JSON.parse(gh(...args));
// `run` is { repository, runId, runURL } for the trusted GitHub run.
export function deliver(findings, context, run) {
  const { repository, runId, runURL } = run;
  // Only findings that need a person open or rewrite the issue; routine catalog drift does not.
  const open = ghJSON(
    'issue',
    'list',
    '--repo',
    repository,
    '--state',
    'open',
    '--label',
    'documentation',
    '--search',
    `"${TITLE}" in:title`,
    '--json',
    'number,body,title',
  ).filter(i => i.body.includes(MARKER));
  if (open.length > 1) throw new Error('Ambiguous weekly reference health issues');
  const [current] = open,
    empty = Object.values(findings).every(list => !list.length);
  if (empty) {
    if (!current) return { outcome: 'no findings', issue: null };
    gh(
      'issue',
      'close',
      String(current.number),
      '--repo',
      repository,
      '--reason',
      'completed',
      '--comment',
      `No findings in [run ${runId}](${runURL}).${context.drift.length ? ` Routine catalog drift: ${context.drift.map(c => c.id).join(', ')}.` : ''}`,
    );
    if (
      ghJSON('issue', 'view', String(current.number), '--repo', repository, '--json', 'state')
        .state !== 'CLOSED'
    )
      throw new Error('Weekly issue did not close');
    return { outcome: 'closed', issue: current.number };
  }
  if (current?.body.includes(`Fingerprint: ${context.fingerprint}.`))
    return { outcome: 'unchanged', issue: current.number };
  const text = body(findings, context, run),
    file = at('.state/weekly-issue.md');
  atomic(file, text, 0o600);
  const number = current
    ? current.number
    : Number(
        gh(
          'issue',
          'create',
          '--repo',
          repository,
          '--title',
          TITLE,
          '--label',
          'documentation',
          '--body-file',
          file,
        )
          .split('/')
          .pop(),
      );
  if (current) gh('issue', 'edit', String(number), '--repo', repository, '--body-file', file);
  const saved = ghJSON(
    'issue',
    'view',
    String(number),
    '--repo',
    repository,
    '--json',
    'body,title,state,labels',
  );
  if (
    saved.body.trim() !== text.trim() ||
    saved.title !== TITLE ||
    saved.state !== 'OPEN' ||
    !saved.labels.some(label => label.name === 'documentation')
  )
    throw new Error('Saved weekly issue does not match');
  return { outcome: current ? 'updated' : 'opened', issue: number };
}
