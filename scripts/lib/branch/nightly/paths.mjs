import path from 'node:path';
import { sha } from '../../leaf/hash.mjs';
import { coordinator } from '../platform/git.mjs';

// Private nightly receipts live in the primary checkout's .state, never in a publication branch.
export const privateFile = relative => path.join(coordinator(), '.state/nightly', relative);
export const branchFile = branch => privateFile(`branches/${sha(branch)}.json`);
export const approvalFile = (runId, head) => privateFile(`approvals/${runId}/${head}.json`);
