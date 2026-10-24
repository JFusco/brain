// HTTPS without credentials on the default port; anything else is null.
export function httpsURL(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' &&
      !url.username &&
      !url.password &&
      (!url.port || url.port === '443')
      ? url
      : null;
  } catch {
    return null;
  }
}
export const onHosts = (value, hosts) => hosts.includes(httpsURL(value)?.hostname);
