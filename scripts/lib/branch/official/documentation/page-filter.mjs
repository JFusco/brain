// Collects documentation page links that stay on the source's approved HTTPS hosts and paths.
export function pageCollector(spec) {
  const pages = new Map();
  const add = (href, title, base, replace = false) => {
    let target;
    try {
      target = new URL(href, base);
    } catch {
      return;
    }
    if (
      target.protocol !== 'https:' ||
      target.username ||
      target.password ||
      (target.port && target.port !== '443') ||
      !spec.allowedHosts.includes(target.hostname) ||
      !spec.includePrefixes.some(prefix => target.pathname.startsWith(prefix)) ||
      spec.excludePrefixes?.some(prefix => target.pathname.startsWith(prefix))
    )
      return;
    target.hash = '';
    target.search = '';
    if (spec.fetchSuffix && target.pathname.endsWith(spec.fetchSuffix))
      target.pathname = target.pathname.slice(0, -spec.fetchSuffix.length);
    if (/\.(?:png|jpe?g|gif|svg|webp|pdf|zip|json|txt|xml|gz)$/i.test(target.pathname)) return;
    const url = target.href,
      fetchUrl =
        spec.fetchSuffix && !target.pathname.endsWith(spec.fetchSuffix)
          ? url.replace(/\/$/, '') + spec.fetchSuffix
          : url;
    if (replace || !pages.has(url))
      pages.set(url, {
        title: title.replace(/[[\]\r\n]/g, '').replace(/\.md$/, ''),
        url,
        fetchUrl,
      });
  };
  return { pages, add };
}
