import assert from 'node:assert/strict';
import test from 'node:test';
import {
  htmlLinks,
  markdownLinks,
  sitemapLinks,
} from '../scripts/lib/branch/official/documentation/index-links.mjs';
import { pageCollector } from '../scripts/lib/branch/official/documentation/page-filter.mjs';

const spec = {
  allowedHosts: ['docs.example.com'],
  includePrefixes: ['/docs/'],
  excludePrefixes: ['/docs/private/'],
};

test('the page filter keeps only approved HTTPS documentation pages', () => {
  const { pages, add } = pageCollector(spec);
  const base = 'https://docs.example.com/docs/';
  for (const href of [
    'https://docs.example.com/docs/a?x=1#top',
    'http://docs.example.com/docs/insecure',
    'https://user:pw@docs.example.com/docs/creds',
    'https://docs.example.com:8443/docs/port',
    'https://evil.example.net/docs/other-host',
    'https://docs.example.com/blog/outside',
    'https://docs.example.com/docs/private/hidden',
    'https://docs.example.com/docs/file.pdf',
    'relative/b',
    'https://[malformed',
  ])
    add(href, 'Title [x]', base);
  assert.deepEqual(
    [...pages.keys()],
    ['https://docs.example.com/docs/a', 'https://docs.example.com/docs/relative/b'],
  );
  assert.equal(pages.get('https://docs.example.com/docs/a').title, 'Title x');
});

test('fetch suffixes are stripped from page URLs and kept for fetching', () => {
  const { pages, add } = pageCollector({ ...spec, fetchSuffix: '.md' });
  add('https://docs.example.com/docs/guide.md', 'Guide', 'https://docs.example.com/');
  add('https://docs.example.com/docs/other/', 'Other', 'https://docs.example.com/');
  assert.deepEqual(
    [...pages.values()].map(p => [p.url, p.fetchUrl]),
    [
      ['https://docs.example.com/docs/guide', 'https://docs.example.com/docs/guide.md'],
      ['https://docs.example.com/docs/other/', 'https://docs.example.com/docs/other.md'],
    ],
  );
});

test('HTML indexes yield static anchors only, with entity decoding and path titles', () => {
  const html = `<!-- <a href="/docs/commented">x</a> -->
<script>document.write('<a href="/docs/scripted">s</a>')</script>
<a class="x" href="/docs/one?a=1&amp;b=2"><span>One</span>  &amp; more</a>
<a href='/docs/two/deep-page'>Read more</a>
<a href="/docs/empty"> </a>
<a href="/docs/overview">Skip to main content</a>
<a href="/docs/focus">Doesn&#39;t &#x2014; &#0; trap</a>`;
  assert.deepEqual(htmlLinks(html, 'https://docs.example.com/'), [
    { href: '/docs/one?a=1&b=2', title: 'One & more' },
    { href: '/docs/two/deep-page', title: 'two / deep page' },
    { href: '/docs/overview', title: 'docs / overview' },
    { href: '/docs/focus', title: "Doesn't \u2014 &#0; trap" },
  ]);
});

test('sitemaps separate nested indexes from approved page links', () => {
  const xml = `<urlset>
<loc>https://docs.example.com/docs/getting-started/install</loc>
<loc><![CDATA[https://docs.example.com/sitemap-2.xml.gz]]></loc>
<loc>http://docs.example.com/docs/insecure</loc>
<loc>https://other.example.net/docs/x</loc>
<loc>https://docs.example.com/docs/a?x=1&amp;y=2</loc>
</urlset>`;
  assert.deepEqual(sitemapLinks(xml, spec.allowedHosts), {
    indexes: ['https://docs.example.com/sitemap-2.xml.gz'],
    links: [
      {
        href: 'https://docs.example.com/docs/getting-started/install',
        title: 'getting started / install',
      },
      { href: 'https://docs.example.com/docs/a?x=1&y=2', title: 'docs / a' },
    ],
  });
});

test('Markdown indexes yield inline links in order', () => {
  assert.deepEqual(
    markdownLinks('- [Intro](/docs/intro)\n- [API](https://docs.example.com/docs/api)'),
    [
      { href: '/docs/intro', title: 'Intro' },
      { href: 'https://docs.example.com/docs/api', title: 'API' },
    ],
  );
});

test('a malformed escape skips an HTML fallback title but fails a sitemap', () => {
  assert.deepEqual(
    htmlLinks('<a href="/docs/%E0%A4%A">Read more</a>', 'https://docs.example.com/'),
    [],
  );
  assert.throws(
    () => sitemapLinks('<loc>https://docs.example.com/docs/%E0%A4%A</loc>', spec.allowedHosts),
    URIError,
  );
});
