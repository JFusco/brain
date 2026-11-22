import { splitFrontmatter } from './frontmatter.mjs';

function correctionSection(text) {
  const { full, body } = splitFrontmatter(text);
  const lines = body.split(/\r?\n/);
  let fence = '';
  let start = -1;
  let end = lines.length;
  for (const [index, line] of lines.entries()) {
    const marker = /^ {0,3}(`{3,}|~{3,})(.*)$/.exec(line);
    if (fence) {
      if (marker && marker[1].startsWith(fence) && !marker[2].trim()) fence = '';
      continue;
    }
    if (marker && !(marker[1][0] === '`' && marker[2].includes('`'))) {
      fence = marker[1];
      continue;
    }
    const heading = /^ {0,3}(#{1,2})(?:[ \t]+(.*)|$)/.exec(line);
    if (!heading) continue;
    if (start !== -1) {
      end = index;
      break;
    }
    if (heading[1] === '##' && heading[2]?.replace(/[ \t]+#+[ \t]*$/, '').trim() === 'Corrections')
      start = index + 1;
  }
  if (start === -1) return null;
  const offset = full.split('\n').length - 1;
  return { lines: lines.slice(start, end), startLine: offset + start + 1 };
}

export function compareCorrections(before, after) {
  const previous = correctionSection(before),
    current = correctionSection(after);
  const correctionsChanged = previous?.lines.join('\n') !== current?.lines.join('\n');
  if (!correctionsChanged || !current) return { correctionsChanged, corrections: null };

  // If every current line occurs in order in the original, only text was removed.
  const oldLines = previous?.lines || [];
  let cursor = 0;
  for (const [index, line] of current.lines.entries()) {
    const match = oldLines.indexOf(line, cursor);
    if (match !== -1) {
      cursor = match + 1;
      continue;
    }
    const excerpt = current.lines.slice(index).join('\n').slice(0, 4000).trimEnd();
    if (!excerpt.trim()) break;
    const startLine = current.startLine + index;
    return {
      correctionsChanged,
      corrections: { excerpt, startLine, endLine: startLine + excerpt.split('\n').length - 1 },
    };
  }
  return { correctionsChanged, corrections: null };
}
