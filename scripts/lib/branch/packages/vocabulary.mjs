import { sha } from '../../leaf/hash.mjs';
import { parseJSON } from '../../leaf/json.mjs';
import { STABLE_SEMVER } from '../../leaf/semver.mjs';
import { pinnedPackage } from './pinned.mjs';
import { packageReleaseStatus, checkPackageRelease } from './releases.mjs';
import { assertClean } from '../privacy/scanner.mjs';

const name = 'cms-field-vocabulary';
const { file: packageFile, identity: packageIdentity } = pinnedPackage(name, 'CMS vocabulary', {
  maxBytes: 2 * 1024 * 1024,
});
const release = {
  name,
  label: 'CMS vocabulary',
  stateFile: '.state/vocabulary-release.json',
  identity: packageIdentity,
};
const domains = {
  contentful: 'cms/contentful',
  contentstack: 'cms/contentstack',
  'optimizely-saas': 'cms/optimizely-saas',
  'optimizely-paas': 'cms/optimizely-paas',
  'sitecore-ai': 'cms/sitecore-ai',
  'sitecore-on-prem': 'cms/sitecore-xp',
  wordpress: 'cms/wordpress',
};

function vocabulary() {
  const identity = packageIdentity(),
    bytes = packageFile('catalog/catalog.json'),
    catalog = parseJSON(bytes);
  if (catalog.schemaVersion !== 1 || !Array.isArray(catalog.profiles))
    throw new Error('Unsupported CMS vocabulary catalog');
  return {
    catalog,
    identity: {
      ...identity,
      catalogSha256: sha(bytes),
      sourceLockDigest: catalog.sourceLockDigest,
    },
  };
}
const profileInfo = p => ({
  id: p.id,
  product: p.product,
  platform: p.platform,
  domain: domains[p.platform],
  surface: p.surface,
  transport: p.transport,
  version: p.version,
  extensibility: p.extensibility,
  notes: p.notes || [],
});
const constraints = p =>
  p.platform === 'optimizely-saas' && STABLE_SEMVER.test(p.version.sdk)
    ? [`@optimizely/cms-sdk@${p.version.sdk}`]
    : [];

export function vocabularyProfiles() {
  const { catalog, identity } = vocabulary();
  return {
    ...identity,
    profiles: catalog.profiles.map(profileInfo),
    notice:
      'Choose an exact profile for lookup --cms-profile. Profile selection is explicit; installed CMS compatibility is not inferred.',
  };
}

export function vocabularyEntries(profileId, domain) {
  const { catalog, identity } = vocabulary(),
    profile = catalog.profiles.find(p => p.id === profileId);
  if (!profile) throw new Error('Unknown CMS vocabulary profile; use vocabulary profiles');
  const info = profileInfo(profile);
  if (domain && domain !== info.domain)
    throw new Error('CMS vocabulary profile does not match --domain');
  const sources = parseJSON(packageFile('sources/official-sources.json'));
  const sourceMap = new Map(sources.sources.map(s => [s.id, s]));
  const evidence = ref => {
    const source = sourceMap.get(ref.sourceId);
    if (!source || !source.profiles.includes(profileId))
      throw new Error('CMS vocabulary evidence is outside the selected profile');
    const url = new URL(source.url);
    if (
      url.protocol !== 'https:' ||
      url.username ||
      url.password ||
      (url.port && url.port !== '443') ||
      !source.allowedHosts.includes(url.hostname)
    )
      throw new Error('CMS vocabulary evidence URL is outside its approved hosts');
    return { ...ref, url: url.href, sourceVersion: source.version };
  };
  const entries = profile.fields.map(field => {
    const claims = Object.fromEntries(
      Object.entries(field.claims).map(([key, claim]) => [
        key,
        { status: claim.status, value: claim.value, evidence: claim.evidence.map(evidence) },
      ]),
    );
    const title = `${field.displayName || field.nativeToken} (${field.nativeToken.replace(/([a-z])([A-Z])/g, '$1 $2')}) — ${profile.product} ${profile.surface}`;
    return {
      kind: 'cms-field',
      source: name,
      sourceRevision: identity.version,
      profileId,
      canonicalId: field.canonicalId,
      title,
      domain: info.domain,
      versions: constraints(profile),
      nativeToken: field.nativeToken,
      ...(field.displayName ? { displayName: field.displayName } : {}),
      summary: JSON.stringify([field.canonicalId, ...Object.values(claims).map(c => c.value)]),
      claims,
      formats: field.formats,
      renderingOperations: field.renderingOperations,
    };
  });
  // Installed package data remains untrusted reference material.
  assertClean([{ id: 'cms-vocabulary', bytes: Buffer.from(JSON.stringify(entries)) }], {
    clients: false,
  });
  return {
    entries,
    metadata: {
      ...identity,
      profile: info,
      versions: constraints(profile),
      notice:
        'Pinned vocabulary facts and source locators; official pages were not fetched or reverified. Undocumented claims remain unknown. Rendering operations retain their authority and any required selection; no agent policy is applied.',
    },
  };
}

export function vocabularyStatus() {
  return packageReleaseStatus(release);
}

export function checkVocabularyRelease() {
  return checkPackageRelease(release);
}
