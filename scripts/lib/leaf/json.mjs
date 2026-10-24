import fs from 'node:fs';

// SyntaxError messages can quote the input, so parse failures never carry content.
export function parseJSON(text) {
  try {
    return JSON.parse(text);
  } catch (error) {
    if (error instanceof SyntaxError)
      // eslint-disable-next-line preserve-caught-error -- the SyntaxError message can quote file content
      throw new Error('Invalid JSON in a configured file; content suppressed');
    throw error;
  }
}
export const json = file => parseJSON(fs.readFileSync(file, 'utf8'));
export const readJSON = (file, fallback = {}) => (fs.existsSync(file) ? json(file) : fallback);
