import { sha } from '../../leaf/hash.mjs';

// The token is provided by the worker's credential environment when authorized.
export async function inventory(channel, stream) {
  const method = { pins: 'pins.list', bookmarks: 'bookmarks.list' }[stream];
  if (!['pins', 'bookmarks'].includes(stream) || !process.env.BRAIN_SLACK_READ_TOKEN)
    throw new Error('Read-only inventory access is unverified');
  const url = new URL('https://slack.com/api/' + method);
  url.searchParams.set(stream === 'pins' ? 'channel' : 'channel_id', channel);
  const response = await fetch(url, {
    headers: { authorization: 'Bearer ' + process.env.BRAIN_SLACK_READ_TOKEN },
    redirect: 'error',
    signal: AbortSignal.timeout(20000),
  });
  if (!response.ok) throw new Error('Slack inventory HTTP ' + response.status);
  const data = await response.json();
  const items = stream === 'pins' ? data.items : data.bookmarks;
  if (!data.ok || !Array.isArray(items) || data.response_metadata?.next_cursor)
    throw new Error('Slack inventory unavailable or incomplete');
  return items.map(item => {
    const id = item.id || item.file?.id || item.message?.ts || item.file_comment?.id;
    if (!id) throw new Error('Unidentified inventory item; preserve checkpoint');
    return {
      id,
      revision: sha(JSON.stringify(item)),
      link: item.link || item.message?.permalink || item.file?.permalink,
      type: item.type,
    };
  });
}
