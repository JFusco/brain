import { sha } from '../../leaf/hash.mjs';

const field = (value, max = 2000) =>
  typeof value === 'string' && value.trim() && value.length <= max;
const resourceId = value =>
  typeof value === 'string' && /^[A-Za-z0-9][A-Za-z0-9._:-]{0,159}$/.test(value);
const slackHost = host => host === 'slack.com' || host.endsWith('.slack.com');
export function validResourceMap(value) {
  return (
    value &&
    typeof value === 'object' &&
    !Array.isArray(value) &&
    Object.entries(value).every(([id, rev]) => resourceId(id) && field(rev, 200))
  );
}

export function evidence(item, task, run, domain, receipt) {
  const source = URL.parse(item.permalink);
  const reference = URL.parse(item.reference);
  if (
    !source ||
    source.protocol !== 'https:' ||
    !slackHost(source.hostname) ||
    source.port ||
    source.username ||
    source.password ||
    [...source.searchParams.keys()].some(key => !['thread_ts', 'cid'].includes(key)) ||
    (source.searchParams.has('cid') && source.searchParams.get('cid') !== task.channel) ||
    source.hash ||
    !(
      (source.pathname.startsWith('/archives/' + task.channel + '/') &&
        /\/p\d{16}$/.test(source.pathname)) ||
      /^\/(?:files|docs|bookmarks)\//.test(source.pathname)
    ) ||
    !reference ||
    reference.protocol !== 'https:' ||
    slackHost(reference.hostname) ||
    reference.port ||
    reference.username ||
    reference.password ||
    !receipt ||
    receipt.reference !== item.reference ||
    receipt.checkedAt !== item.checkedAt ||
    !field(item.reference, 2000) ||
    !resourceId(item.sourceId) ||
    !resourceId(item.decisionKey) ||
    !field(item.revision, 200) ||
    ![item.decision, item.applicability, item.support, item.limits].every(v => field(v)) ||
    !Number.isFinite(Date.parse(item.checkedAt)) ||
    Date.parse(item.checkedAt) < Date.parse(run.startedAt) ||
    Date.parse(item.checkedAt) > Date.now()
  )
    throw new Error(
      'Capture needs scoped provenance and current primary-source evidence for a practical decision',
    );
  const hash = sha(JSON.stringify([task.channel, item.sourceId, item.revision, item.decisionKey]));
  const requestId = [
    hash.slice(0, 8),
    hash.slice(8, 12),
    '8' + hash.slice(13, 16),
    'a' + hash.slice(17, 20),
    hash.slice(20, 32),
  ].join('-');
  const body = [
    '# ' + item.decision,
    'Applicability: ' + item.applicability,
    'Documented evidence: ' + item.support,
    'Official reference: ' + reference.href,
    'Checked: ' + item.checkedAt,
    'Limits: ' + item.limits,
  ].join('\n\n');
  if (/https?:\/\/(?:[\w-]+\.)*slack\.com\//i.test(body) || body.includes(task.channel))
    throw new Error('Remove private Slack provenance from the lesson text');
  source.search = '';
  return { requestId, domain, body, permalink: source.href };
}
