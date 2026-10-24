import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { config } from '../platform/config.mjs';
import { mkdir, writeJSON } from '../../leaf/fs-safe.mjs';
import { sha } from '../../leaf/hash.mjs';
import { at } from '../../leaf/paths.mjs';
import { parseJSON } from '../../leaf/json.mjs';
import { now } from '../../leaf/time.mjs';
import { clientHits } from './client-terms.mjs';
import { builtinHits } from './secrets.mjs';

export function scanner() {
  const c = config(),
    binary = c.toolchain.gitleaks;
  if (!binary || !fs.existsSync(binary))
    throw new Error('Gitleaks is required. Run node scripts/setup.mjs.');
  if (
    typeof c.toolchain.gitleaksBinarySha256 !== 'string' ||
    !/^[0-9a-f]{64}$/.test(c.toolchain.gitleaksBinarySha256)
  )
    throw new Error('Gitleaks binary SHA-256 pin is required. Run node scripts/setup.mjs.');
  if (sha(fs.readFileSync(binary)) !== c.toolchain.gitleaksBinarySha256)
    throw new Error('Gitleaks binary hash changed');
  const result = spawnSync(binary, ['version'], { encoding: 'utf8', timeout: 10000 });
  if (result.status !== 0 || result.stdout.trim().replace(/^v/, '') !== c.toolchain.gitleaksVersion)
    throw new Error('Gitleaks version does not match the pinned toolchain');
  return binary;
}
// Scanner reports and input copies stay in a private temporary directory.
export function scan(entries) {
  const binary = scanner(),
    temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'brain-scan-'));
  fs.chmodSync(temporary, 0o700);
  const input = path.join(temporary, 'input');
  mkdir(input, 0o700);
  try {
    const names = new Map();
    const findings = [];
    for (const [index, entry] of entries.entries()) {
      const name = String(index).padStart(8, '0') + '.txt';
      names.set(name, entry.id);
      fs.writeFileSync(path.join(input, name), entry.bytes, { mode: 0o600 });
      const text = entry.bytes.toString('utf8');
      for (const hit of builtinHits(text)) {
        const line = text.slice(0, hit.index).split('\n').length,
          endLine = line + text.slice(hit.index, hit.index + hit.length).split('\n').length - 1;
        findings.push({
          id: entry.id,
          rule: hit.rule,
          line,
          endLine,
          lineSha256: sha(
            text
              .split(/\r?\n/)
              .slice(line - 1, endLine)
              .join('\n'),
          ),
        });
      }
    }
    if (!entries.length) return findings;
    const report = path.join(temporary, 'report.json');
    const result = spawnSync(
      binary,
      [
        'dir',
        '--no-banner',
        '--redact=100',
        '--ignore-gitleaks-allow',
        '--report-format',
        'json',
        '--report-path',
        report,
        '--exit-code',
        '42',
        input,
      ],
      {
        encoding: 'utf8',
        maxBuffer: 1024 * 1024,
        timeout: 300000,
        env: { PATH: process.env.PATH, HOME: temporary },
      },
    );
    if (result.error || ![0, 42].includes(result.status))
      throw new Error('Gitleaks scan failed; refusing unscanned content');
    const reports = fs.existsSync(report) ? parseJSON(fs.readFileSync(report, 'utf8')) : [];
    for (const item of reports) {
      const id = names.get(path.basename(item.File));
      if (!id) throw new Error('Unexpected scanner report path');
      const entry = entries.find(e => e.id === id);
      const lines = entry.bytes
        .toString('utf8')
        .split(/\r?\n/)
        .slice(item.StartLine - 1, item.EndLine);
      findings.push({
        id,
        rule: item.RuleID,
        line: item.StartLine,
        endLine: item.EndLine,
        lineSha256: sha(lines.join('\n')),
      });
    }
    return findings;
  } finally {
    fs.rmSync(temporary, { recursive: true, force: true });
  }
}
export function assertClean(entries, { clients = true } = {}) {
  const findings = scan(entries);
  if (findings.length) {
    const id = sha(JSON.stringify(findings)).slice(0, 24);
    writeJSON(at(`.state/scan-blocks/${id}.json`), { at: now(), findings }, 0o600);
    throw new Error(
      `Secret scan blocked content (${findings.length} findings; private report ${id}; values suppressed)`,
    );
  }
  if (clients && entries.some(e => clientHits(e.id + '\n' + e.bytes.toString('utf8')).length))
    throw new Error('Client identifier scan blocked content (values suppressed)');
}
