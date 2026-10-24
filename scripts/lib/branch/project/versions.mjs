export const packageName = /^(?:@[a-z0-9][a-z0-9._-]*\/)?[a-z0-9][a-z0-9._-]*$/i;
const literal = /^(\d+)(?:\.(\d+))?(?:\.(\d+))?$/;
export function versionConstraint(value) {
  const match = String(value).match(/^(.+)@(>=)?(\d+(?:\.\d+){0,2})$/);
  if (!match || !packageName.test(match[1]))
    throw new Error('Version constraints use package@major[.minor.patch] or package@>=version');
  return {
    name: match[1],
    minimum: !!match[2],
    version: match[3],
    parts: match[3].split('.').map(Number),
  };
}
export function versionFit(constraints, context) {
  if (!constraints?.length)
    return {
      status: 'unconfirmed',
      reason: 'This reference has no explicit package-version constraints',
    };
  let matched = 0;
  const unknown = [];
  for (const value of constraints) {
    const rule = versionConstraint(value),
      dependency = context.dependencies[rule.name];
    if (!dependency?.version || !literal.test(dependency.version)) {
      unknown.push(rule.name);
      continue;
    }
    const actual = dependency.version.split('.').map(Number),
      shared = Math.min(actual.length, rule.parts.length);
    let comparison = 0;
    for (let index = 0; index < shared; index++)
      if (actual[index] !== rule.parts[index]) {
        comparison = Math.sign(actual[index] - rule.parts[index]);
        break;
      }
    if (rule.minimum ? comparison < 0 : comparison !== 0)
      return {
        status: 'incompatible',
        reason: `${rule.name} ${dependency.version} does not match ${rule.minimum ? '>=' : ''}${rule.version}`,
      };
    if (rule.minimum && comparison > 0) matched++;
    else if (actual.length < rule.parts.length) unknown.push(rule.name);
    else matched++;
  }
  return unknown.length
    ? {
        status: 'unconfirmed',
        reason: 'Exact target versions are not established for ' + unknown.join(', '),
      }
    : {
        status: 'matched',
        reason: `Explicit version constraints matched for ${matched} package(s)`,
      };
}
