import { repository } from '../platform/github-cli.mjs';
import { api } from '../platform/network/github.mjs';

// The saved PR, only when it is merged into this repository's main branch.
export async function mergedBrainPR(pr) {
  if (!/^[1-9]\d*$/.test(String(pr || ''))) throw new Error('A merged PR number is required');
  let name;
  try {
    name = repository();
  } catch {
    throw new Error('Cannot establish Brain repository identity');
  }
  const saved = await api(`repos/${name}/pulls/${pr}`);
  if (
    !saved.merged_at ||
    saved.base?.ref !== 'main' ||
    saved.base?.repo?.full_name?.toLowerCase() !== name.toLowerCase()
  )
    throw new Error('PR is not merged to Brain main');
  return saved;
}
