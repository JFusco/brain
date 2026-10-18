import {createRequire} from 'node:module';
import {sha} from './core.mjs';
import {publishedGuidance} from './guidance.mjs';
const require=createRequire(import.meta.url);
const {splitFrontmatter,scalar,list}=require('../wiki/lib/frontmatter.cjs');
const stops=new Set('a an and are as at be by for from has have how in is it of on or that the this to use using with'.split(' '));
const words=text=>new Set(String(text).toLowerCase().split(/[^a-z0-9]+/).filter(word=>word.length>2&&!stops.has(word)));
const normalized=text=>splitFrontmatter(text).body.replace(/^#\s+[^\n]*\n/,'').replace(/\s+/g,' ').trim().toLowerCase();
const scope=raw=>JSON.stringify([scalar(raw,'domain'),scalar(raw,'applicability'),list(raw,'versions').sort()]);

export function comparisonCatalog() {
  const pages=publishedGuidance().sort((a,b)=>a.path.localeCompare(b.path));
  const catalog=pages.map(page=>({path:page.path,sha256:page.sha256,title:page.title,domain:page.domain,versions:page.versions,status:page.freshness.status,applicability:scalar(page.raw,'applicability'),summary:page.body.replace(/^#+.*$/gm,'').trim().slice(0,700)}));
  if(Buffer.byteLength(JSON.stringify(catalog))>256*1024)throw new Error('Duplicate-review catalog exceeds its context bound; partition review before publication');
  return {pages,catalog,catalogSha256:sha(JSON.stringify(catalog))};
}

export function compareText(text,snapshot=comparisonCatalog()) {
  const query=words(text);
  const ranked=snapshot.pages.map(page=>{
    const terms=words(page.title+' '+scalar(page.raw,'applicability')+' '+page.body);
    const shared=[...query].filter(word=>terms.has(word)).length;
    return {page,score:shared/Math.sqrt(Math.max(1,query.size)*Math.max(1,terms.size))};
  }).filter(item=>item.score>0).sort((a,b)=>b.score-a.score||a.page.path.localeCompare(b.page.path)).slice(0,6);
  return {catalogSha256:snapshot.catalogSha256,catalog:snapshot.catalog,related:ranked.map(({page,score})=>({path:page.path,sha256:page.sha256,score:Number(score.toFixed(4)),excerpt:page.body.slice(0,3000),truncated:page.body.length>3000})),notice:'Ranking uses shared words, not semantic equivalence. The curator must compare the meaning across the entire compact catalog, read relevant full pages, and preserve differences in versions, applicability and evidence. Update existing guidance for the same lesson; create a page only for a distinct decision. Never reject or accept a candidate from similarity alone.'};
}

export function validateDeduplication(changes,review) {
  const notes=changes.filter(change=>change.path.startsWith('knowledge/')&&!change.path.endsWith('/INDEX.md'));
  if(!notes.length)return null;
  const snapshot=comparisonCatalog();
  if(!review||review.catalogSha256!==snapshot.catalogSha256||!Array.isArray(review.decisions)||review.decisions.length!==notes.length)throw new Error('Knowledge proposals require current deduplication.catalogSha256 and one decision per note; run inbox compare <id> or inbox compare --file <proposal-input.json>');
  const reason=value=>{if(typeof value!=='string'||value.trim().length<20||value.length>1200)throw new Error('Duplicate review requires a concrete reason (20–1200 characters)');return value.trim();};
  const seen=new Set(),decisions=[];
  for(const decision of review.decisions){
    const change=notes.find(note=>note.path===decision.path);
    if(!change||seen.has(decision.path)||!['create','update'].includes(decision.action)||!Array.isArray(decision.compared))throw new Error('Invalid duplicate-review decision');
    seen.add(decision.path);
    const existing=snapshot.pages.find(page=>page.path===change.path);
    if(decision.action!==(existing?'update':'create'))throw new Error('Duplicate-review action must match the existing guidance destination');
    const compared=[],paths=new Set();
    for(const item of decision.compared){
      const page=snapshot.pages.find(page=>page.path===item.path&&page.sha256===item.sha256);
      if(!page||paths.has(item.path)||!['distinct','same-lesson'].includes(item.relationship))throw new Error('Duplicate comparison must identify an exact current page and relationship');
      if(item.relationship==='same-lesson'&&item.path!==change.path)throw new Error('Update the existing same-lesson page instead of creating or updating a parallel note');
      paths.add(item.path);compared.push({path:item.path,sha256:item.sha256,relationship:item.relationship,reason:reason(item.reason)});
    }
    // A short ranked shortlist prevents an empty assertion from replacing review.
    // The complete catalog still needs semantic review for zero-word-overlap cases.
    const required=compareText(change.text,snapshot).related.slice(0,3).map(page=>page.path);
    if(existing)required.push(existing.path);
    if(required.some(file=>!paths.has(file)))throw new Error('Duplicate review must account for the top three related pages and the updated page; run inbox compare --file <proposal-input.json>');
    const body=normalized(change.text),applicability=scope(splitFrontmatter(change.text).raw);
    if(snapshot.pages.some(page=>page.path!==change.path&&scope(page.raw)===applicability&&normalized(page.body)===body)||notes.some(other=>other.path!==change.path&&scope(splitFrontmatter(other.text).raw)===applicability&&normalized(other.text)===body))throw new Error('Duplicate guidance body and scope: extend one existing page instead');
    decisions.push({path:decision.path,action:decision.action,reason:reason(decision.reason),compared});
  }
  return {catalogSha256:snapshot.catalogSha256,decisions};
}
