#!/usr/bin/env node
// Architecture gate: layer direction (leaf < branch < tree < root), no import
// cycles and no oversized modules. `--warn` reports without failing.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
export const MAX_LINES = 200;
export const LAYERS = ['leaf', 'branch', 'tree', 'root'];

const SCOPES = ['scripts', 'web/brain'];
const EXCLUDED = /^(scripts\/wiki|web\/brain\/(dist|node_modules))\//;
const SOURCE = /\.(mjs|cjs|js)$/;
const IMPORT =
  /(?:\bfrom\s*|\bimport\s*\(\s*|\bimport\s+|\brequire\s*\(\s*)(['"])(\.{1,2}\/[^'"]+)\1/g;

const RULES = [
  [/^scripts\/lib\/leaf\//, 'leaf'],
  [/^scripts\/lib\/branch\//, 'branch'],
  [/^scripts\/lib\/tree\//, 'tree'],
  [/^scripts\/(hosted\/|quality\/)?[^/]+\.(mjs|cjs)$/, 'root'],
  [/^web\/brain\/lib\//, 'leaf'],
  [/^web\/brain\/model\//, 'branch'],
  [/^web\/brain\/(scene|ui|live)\//, 'tree'],
  [/^web\/brain\/main\.js$/, 'root'],
];

export function layerOf(file) {
  return RULES.find(([pattern]) => pattern.test(file))?.[1] ?? null;
}

export function importsOf(file, source) {
  const found = [];
  for (const match of source.matchAll(IMPORT)) {
    found.push(path.posix.normalize(path.posix.join(path.posix.dirname(file), match[2])));
  }
  return found;
}

function findCycles(graph) {
  const cycles = [];
  const state = new Map();
  const stack = [];
  const visit = file => {
    state.set(file, 'open');
    stack.push(file);
    for (const target of graph.get(file) ?? []) {
      if (!graph.has(target)) continue;
      if (state.get(target) === 'open')
        cycles.push([...stack.slice(stack.indexOf(target)), target]);
      else if (!state.has(target)) visit(target);
    }
    stack.pop();
    state.set(file, 'done');
  };
  for (const file of [...graph.keys()].sort()) if (!state.has(file)) visit(file);
  return cycles;
}

// files: Map<repo-relative path, source text>
export function analyze(files) {
  const problems = [];
  const graph = new Map();
  for (const [file, source] of files) {
    const lines = source.split('\n').length - (source.endsWith('\n') ? 1 : 0);
    if (lines > MAX_LINES) problems.push(`${file}: ${lines} lines exceeds ${MAX_LINES}`);
    const layer = layerOf(file);
    if (!layer) problems.push(`${file}: not in a layer directory`);
    const targets = importsOf(file, source);
    graph.set(file, targets);
    for (const target of targets) {
      const targetLayer = layerOf(target);
      if (!layer || !targetLayer) continue;
      if (layer === 'root' && targetLayer === 'root') {
        problems.push(`${file}: root imports another root ${target}`);
      } else if (layer !== 'root' && LAYERS.indexOf(targetLayer) > LAYERS.indexOf(layer)) {
        problems.push(`${file}: ${layer} imports higher layer ${targetLayer} (${target})`);
      }
    }
  }
  for (const cycle of findCycles(graph)) problems.push(`import cycle: ${cycle.join(' -> ')}`);
  return problems;
}

function sources() {
  const files = new Map();
  const walk = directory => {
    for (const entry of fs.readdirSync(path.join(ROOT, directory), { withFileTypes: true })) {
      const relative = path.posix.join(directory, entry.name);
      if (EXCLUDED.test(`${relative}/`) || EXCLUDED.test(relative)) continue;
      if (entry.isDirectory()) walk(relative);
      else if (entry.isFile() && SOURCE.test(entry.name)) {
        files.set(relative, fs.readFileSync(path.join(ROOT, relative), 'utf8'));
      }
    }
  };
  for (const scope of SCOPES) walk(scope);
  return files;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const warnOnly = process.argv.includes('--warn');
  const problems = analyze(sources());
  for (const problem of problems) console.error(`${warnOnly ? 'warning' : 'error'}: ${problem}`);
  console.log(
    `Architecture check: ${problems.length} problem(s)${warnOnly ? ' (warn-only)' : ''}.`,
  );
  if (problems.length && !warnOnly) process.exitCode = 1;
}
