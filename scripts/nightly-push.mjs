#!/usr/bin/env node
import fs from 'node:fs';
import { validatePush } from './lib/nightly-publication.mjs';
try {
  validatePush(fs.readFileSync(0, 'utf8'));
} catch (error) {
  console.error('brain nightly push: ' + error.message);
  process.exitCode = 1;
}
