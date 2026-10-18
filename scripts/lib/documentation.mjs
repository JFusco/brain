import {api,download,markdownResponse} from './network.mjs';
import {config,sha} from './core.mjs';
import {gunzipSync} from 'node:zlib';

function bounded(spec,pages) {
  if(!pages.length)throw new Error('Official source contains no matching documentation links');
  if(pages.length>(spec.maxPages??5000))throw new Error('Documentation catalog exceeds its page bound; refusing a partial catalog');
  return pages.sort((a,b)=>a.url.localeCompare(b.url));
}
// Collection revisions keep the digest of the former PAGES.json serialization, so earlier citations stay comparable.
export const pageDigest=(spec,origin,pages)=>sha(JSON.stringify({schemaVersion:1,source:spec.id,domains:spec.domains,origin,pages},null,2)+'\n');

export async function fetchDocumentationCatalog(spec,revision) {
  if(spec.kind==='repository'){
    const tree=await api(`repos/${spec.repository}/git/trees/${revision}?recursive=1`);
    if(tree.truncated)throw new Error('Official repository tree is truncated; refusing a partial catalog');
    const prefix=spec.documentationPrefix;
    if(typeof prefix!=='string'||!prefix||!spec.documentationBase)throw new Error('Repository catalog requires documentationPrefix and documentationBase');
    const pages=tree.tree.filter(file=>file.type==='blob'&&/^100(?:644|755)$/.test(file.mode)&&file.path.startsWith(prefix)&&/\.(?:md|mdx)$/.test(file.path)).map(file=>{
      const relative=file.path.slice(prefix.length).replace(/\.(?:md|mdx)$/,'').replace(/(?:^|\/)index$/,'');
      return {title:relative.split('/').filter(Boolean).join(' / ').replace(/-/g,' ')||spec.vendor,url:new URL(relative,spec.documentationBase).href,fetchUrl:`https://raw.githubusercontent.com/${spec.repository}/${revision}/${file.path}`,gitBlobSha:file.sha};
    });
    return {pages:bounded(spec,pages),origin:`https://github.com/${spec.repository}/tree/${revision}/${prefix}`};
  }
  const pages=new Map(),queue=[spec.indexUrl],seen=new Set();
  const add=(href,title,base,replace=false)=>{
    let target;try{target=new URL(href,base);}catch{return;}
    if(target.protocol!=='https:'||target.username||target.password||target.port&&target.port!=='443'||!spec.allowedHosts.includes(target.hostname)||!spec.includePrefixes.some(prefix=>target.pathname.startsWith(prefix)))return;
    target.hash='';target.search='';
    if(spec.fetchSuffix&&target.pathname.endsWith(spec.fetchSuffix))target.pathname=target.pathname.slice(0,-spec.fetchSuffix.length);
    if(/\.(?:png|jpe?g|gif|svg|webp|pdf|zip|json|txt|xml|gz)$/i.test(target.pathname))return;
    const url=target.href,fetchUrl=spec.fetchSuffix&&!target.pathname.endsWith(spec.fetchSuffix)?url.replace(/\/$/,'')+spec.fetchSuffix:url;
    if(replace||!pages.has(url))pages.set(url,{title:title.replace(/[\[\]\r\n]/g,'').replace(/\.md$/,''),url,fetchUrl});
  };
  while(queue.length){
    const input=queue.shift();if(seen.has(input))continue;seen.add(input);if(seen.size>(spec.maxIndexes??32))throw new Error('Sitemap index bound exceeded; refusing a partial catalog');
    const response=await download(input,{hosts:spec.allowedHosts,maxBytes:config().network.maxDownloadBytes});
    const bytes=/\.gz(?:$|\?)/.test(input)?gunzipSync(response.bytes,{maxOutputLength:config().network.maxExpandedBytes}):response.bytes;
    const index=markdownResponse({...response,bytes});
    if(spec.indexFormat==='sitemap'){
      for(const match of index.matchAll(/<loc>\s*(?:<!\[CDATA\[)?([^<]+?)(?:\]\]>)?\s*<\/loc>/g)){
        const href=match[1].replace(/&amp;/g,'&').trim();let target;try{target=new URL(href);}catch{continue;}
        if(target.protocol!=='https:'||target.username||target.password||!spec.allowedHosts.includes(target.hostname))continue;
        if(/\.xml(?:\.gz)?$/.test(target.pathname)){queue.push(target.href);continue;}
        add(href,decodeURIComponent(target.pathname).split('/').filter(Boolean).slice(-2).join(' / ').replace(/-/g,' '),response.url);
      }
    }else for(const match of index.matchAll(/\[([^\]\n]+)\]\(([^\s)]+)\)/g))add(match[2],match[1],response.url);
  }
  for(const page of spec.additionalPages||[])add(page.url,page.title,spec.indexUrl,true);
  const sorted=bounded(spec,[...pages.values()]);
  return {pages:sorted,origin:spec.indexUrl,revision:pageDigest(spec,spec.indexUrl,sorted)};
}
