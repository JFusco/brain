const BOOLEAN_FLAGS = new Set([
  'yes',
  'staged',
  'stdin',
  'help',
  'all',
  'backlog',
  'fetch',
  'ui-patterns',
  'retry-failures',
  'hosted',
]);

export function args(argv) {
  const positional = [];
  const flags = {};
  for (let i = 0; i < argv.length; i++) {
    if (!argv[i].startsWith('--')) {
      positional.push(argv[i]);
      continue;
    }
    const [key, inline] = argv[i].slice(2).split(/=(.*)/s);
    if (Object.hasOwn(flags, key)) throw new Error(`Duplicate option --${key}`);
    if (BOOLEAN_FLAGS.has(key)) flags[key] = true;
    else {
      const value = inline ?? argv[++i];
      if (!value || value.startsWith('--')) throw new Error(`Missing value for --${key}`);
      flags[key] = value;
    }
  }
  return { positional, flags };
}
