import { scan } from './scanner.mjs';
import { config } from '../platform/config.mjs';
import { sha } from '../../leaf/hash.mjs';
/** No capture, scan-block writes, client-name policy or publication side effects. */
export function readOnlyScan(input, { scanText = scan, toolchain = config().toolchain } = {}) {
  const bytes = Buffer.from(input);
  if (bytes.length > 1024 * 1024) throw new Error('Scan input exceeds 1 MiB');
  new TextDecoder('utf-8', { fatal: true }).decode(bytes);
  const findings = scanText([{ id: 'stdin', bytes }]).map(({ rule, line, endLine }) => ({
    rule,
    line,
    endLine,
  }));
  if (findings.length > 10000) throw new Error('Scan findings exceed the response limit');
  return {
    version: 1,
    inputSha256: sha(bytes),
    scannerVersion: `gitleaks/${toolchain.gitleaksVersion}+builtin/1`,
    policyVersion: sha(
      JSON.stringify([
        'secrets-only-v1',
        toolchain.gitleaksVersion,
        toolchain.gitleaksBinarySha256,
      ]),
    ),
    clean: findings.length === 0,
    findings,
  };
}
