import { createRequire } from 'node:module';

// The wiki kit owns frontmatter parsing; this adapter is the only bridge to it.
const require = createRequire(import.meta.url);
export const { splitFrontmatter, scalar } = require('../../wiki/lib/frontmatter.cjs');
