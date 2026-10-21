import ForceGraph3D from '3d-force-graph';
import * as THREE from 'three';
import './style.css';
const $=id=>document.getElementById(id);
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
let paused=reduced.matches,graph,network,stats,session,selected,focusedDomain='',expanded=new Set(),active=new Map(),fresh=new Map(),planned=new Set(),lastGraph,liveEvents=[],sse,known=new Set();
const hash=s=>{let h=2166136261;for(const c of s)h=Math.imul(h^c.charCodeAt(0),16777619);return h>>>0;};
function element(tag,text){const e=document.createElement(tag);e.textContent=text;return e;}
async function api(path,input){const r=await fetch(path,input===undefined?{}:{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(input)});const data=await r.json();if(!r.ok)throw new Error(data.error||'Request unavailable');return data;}
function health(n){return n?.freshness?.status==='needs-revalidation'||['dead','failed'].includes(n?.linkHealth?.state);}
function color(n){if((active.get(n.id)||0)>Date.now())return '#f1ffff';if((fresh.get(n.id)||0)>Date.now())return '#f18dcd';if(health(n))return '#e9ac68';if(planned.has(n.id))return '#b5a4f5';if($('heat').checked){const count=stats?.nodes[n.id]?.returned||0;return new THREE.Color('#328b86').lerp(new THREE.Color('#f6d58c'),Math.min(1,Math.log2(count+1)/6)).getStyle();}return n.kind==='source'?'#75b6d0':n.kind==='index'?'#a1efe0':'#4db6aa';}
function position(n){
 const h=hash(n.id),d=Math.max(0,graph.domains.indexOf(n.domain||n.domains?.[0]));
 const angle=(Math.floor(d/2)/Math.ceil(graph.domains.length/2))*Math.PI*2;
 const side=d%2?1:-1,theta=(h%10000)/10000*Math.PI*2,phi=Math.acos(1-2*((h>>>9)%10000)/10000);
 const radius=n.kind==='index'?6:n.kind==='source'?15:23;
 if(n.id==='knowledge/INDEX.md')return {x:0,y:0,z:0};
 return {x:side*(59+Math.cos(angle)*17)+Math.sin(phi)*Math.cos(theta)*radius,y:Math.cos(angle)*66+Math.cos(phi)*radius,z:Math.sin(angle)*96+Math.sin(phi)*Math.sin(theta)*radius};
}
function visible(n){return (n.kind==='index'||n.kind==='curated-note'||n.kind==='source'||expanded.has(n.id))&&(!focusedDomain||n.domain===focusedDomain||n.domains?.includes(focusedDomain)||n.id==='knowledge/INDEX.md');}
function rebuild(){if(!graph||!network)return;const nodes=graph.nodes.filter(visible).map(n=>({...n,...position(n)}));for(const n of nodes){n.fx=n.x;n.fy=n.y;n.fz=n.z;}
 const ids=new Set(nodes.map(n=>n.id));const links=graph.edges.filter(e=>ids.has(e.source)&&ids.has(e.target)).map(e=>({...e}));
 network.graphData({nodes,links});network.nodeColor(color);
}
function animate(){if(!network)return;const now=Date.now();if(!document.hidden){if(!paused){const breathing=1+Math.sin(now/2300)*.008;network.scene().scale.setScalar(breathing);for(const n of network.graphData().nodes){const p=position(n);n.x=p.x+Math.sin(now/2800+hash(n.id))*0.9;n.y=p.y+Math.cos(now/3300+hash(n.id))*0.9;}}network.nodeColor(color);}requestAnimationFrame(animate);}
function motion(){if(!network)return;network.controls().autoRotate=!paused&&!document.hidden;$('motion').textContent=paused?'Resume motion':'Pause motion';$('motion').setAttribute('aria-pressed',String(paused));if(document.hidden)network.pauseAnimation();else network.resumeAnimation();}
async function choose(id){const n=graph.nodes.find(n=>n.id===id);if(!n)return;selected=id;$('details').hidden=false;$('detail-kind').textContent=n.kind.replaceAll('-',' ');$('detail-title').textContent=n.title;$('detail-health').textContent=health(n)?'Needs attention — source changes or a review date require verification.':n.kind==='curated-note'?'No current revalidation signal; applicability still matters.':'Reference health unknown unless a local check recorded it.';
 $('note').textContent='';$('detail-links').replaceChildren();const counts=stats?.nodes[id];$('detail-metrics').textContent=`Returned ${counts?.returned||0} · Read ${counts?.read||0} · Cited ${counts?.cited||0}${counts?.lastUsed?' · Last used '+new Date(counts.lastUsed).toLocaleString():''}`;
 if(n.url){const a=element('a','Open official reference ↗');a.href=n.url;a.target='_blank';a.rel='noopener noreferrer';$('detail-links').append(a);}
 if(n.kind==='source'){const button=element('button','Expand up to 80 references');button.onclick=()=>{graph.nodes.filter(x=>x.source===n.id.slice(7)).slice(0,80).forEach(x=>expanded.add(x.id));rebuild();};$('detail-links').append(button);}
 const rel=graph.edges.filter(e=>e.source===id||e.target===id).slice(0,24);$('relationships').replaceChildren(...rel.map(e=>{const other=graph.nodes.find(x=>x.id===(e.source===id?e.target:e.source));return element('li',`${e.relation}: ${other?.title||'reference'}`);}));
 if(n.kind==='curated-note'||n.kind==='index')try{if(!session){try{const result=await api('/api/session',{});session=result.session;}catch{session=null;}}
 const result=await api('/api/note',{node:id,session,snapshot:graph.snapshot});if(selected===id){$('note').textContent=result.body;if(!result.metricsRecorded)$('detail-metrics').textContent+=' · Read not recorded';}
 }catch(error){$('note').textContent=error.message;}
 if(!paused){const p=position(n);network?.cameraPosition({x:p.x*2.8,y:p.y*2.8,z:p.z*2.8+180},p,900);}
}
async function metrics(){try{stats=await api(`/api/metrics?period=${$('period').value}`);const fields=[['search','LOOKUPS'],['returned','RETURNED'],['read','READ'],['cited','CITED'],['no-results','NO RESULTS']];const old=[...$('totals').children];$('totals').replaceChildren(...fields.map(([key,label],i)=>{const item=element('div','');item.className='metric';item.append(element('b',String(stats.totals[key]||0)),element('span',label));if(old[i]?.firstChild?.textContent!==item.firstChild.textContent&&!paused)item.classList.add('flash');return item;}));
 $('history').textContent=`Recorded activity since ${stats.firstRecorded||'now'} · America/New_York · Agent reads and citations are self-reported. Counts span revisions.`;
 const popular=Object.entries(stats.nodes).sort((a,b)=>b[1].returned-a[1].returned).slice(0,5);$('popular').replaceChildren(...popular.map(([id,c])=>{const li=element('li',''),n=graph.nodes.find(n=>n.id===id);const button=element('button',`${n?.title||'Historical reference'} · ${c.returned}`);button.onclick=()=>choose(id);li.append(button);return li;}));
 if(!liveEvents.length){$('activity').replaceChildren(...(stats.recent||[]).filter(e=>e.type!=='planned').slice(0,12).map(e=>{const n=graph.nodes.find(n=>n.id===e.node);return element('li',`${e.origin==='agent'?'Agent-reported ':''}${e.type} · ${n?.title||e.session.slice(0,8)}`);}));}
 coverage();if(selected){const c=stats.nodes[selected];$('detail-metrics').textContent=`Returned ${c?.returned||0} · Read ${c?.read||0} · Cited ${c?.cited||0}${c?.lastUsed?' · Last used '+new Date(c.lastUsed).toLocaleString():''}`;}
 }catch{$('history').textContent='Activity metrics unavailable. Knowledge remains accessible.';}}
function coverage(){if(!graph)return;$('coverage').replaceChildren(...graph.domains.map(domain=>{const items=graph.nodes.filter(n=>n.domain===domain||n.domains?.includes(domain));const notes=items.filter(n=>n.kind==='curated-note').length,refs=items.filter(n=>n.url).length,usage=items.reduce((sum,n)=>sum+(stats?.nodes[n.id]?.returned||0),0);const button=element('button',`${domain} · ${notes} notes / ${refs} refs / ${usage} returns`);button.onclick=()=>{focusedDomain=focusedDomain===domain?'':domain;$('domain').value=focusedDomain;rebuild();};return button;}));}
async function loadGraph(){const next=await api('/api/graph');if(lastGraph===next.snapshot){graph=next;return;}const prior=known;known=new Set(next.nodes.map(n=>n.id));graph=next;lastGraph=next.snapshot;session=null;selected=null;$('details').hidden=true;
 if(prior.size)for(const id of known)if(!prior.has(id))fresh.set(id,Date.now()+4000);
 $('snapshot').textContent=`MAIN ${graph.snapshot.slice(0,12)} · ${graph.nodes.filter(n=>n.kind==='curated-note').length} NOTES · ${graph.nodes.filter(n=>n.url).length} REFERENCES`;
 $('domain').replaceChildren(element('option','All domains'),...graph.domains.map(d=>{const o=element('option',d);o.value=d;return o;}));$('domain').firstChild.value='';$('domain').value=focusedDomain;rebuild();coverage();}
function eventStream(){sse=new EventSource('/api/events');sse.addEventListener('ready',()=>{$('connection').textContent='Live · local';$('signal').className='live';liveEvents=[];metrics();});sse.onerror=()=>{$('connection').textContent='Reconnecting';$('signal').className='';};sse.addEventListener('unavailable',()=>{$('connection').textContent='Metrics unavailable';$('signal').className='';});
 sse.onmessage=event=>{const rows=JSON.parse(event.data);for(const e of rows){if(e.snapshot===graph.snapshot&&e.node){expanded.add(e.node);if(e.type==='planned'){planned.add(e.node);setTimeout(()=>planned.delete(e.node),10000);}else active.set(e.node,Date.now()+2200);}
 const node=graph.nodes.find(n=>n.id===e.node);if(e.type!=='planned')liveEvents.unshift(`${e.type==='read'&&e.origin==='agent'?'Agent-reported read':e.type==='cited'?'Agent-reported citation':e.type} · ${node?.title||e.session.slice(0,8)}`);}
 liveEvents=liveEvents.slice(0,12);$('activity').replaceChildren(...liveEvents.map(t=>element('li',t)));rebuild();if(!paused&&network)for(const link of network.graphData().links){const source=link.source.id||link.source,target=link.target.id||link.target;if((active.get(source)||0)>Date.now()&&(active.get(target)||0)>Date.now())network.emitParticle(link);}metrics();};}
$('search').onsubmit=async event=>{event.preventDefault();$('submit').disabled=true;$('status').textContent='Finding relevant evidence…';try{const result=await api('/api/route',{query:$('query').value,domain:$('domain').value||undefined,versions:$('versions').value||undefined});if(result.snapshot!==graph.snapshot){await loadGraph();$('status').textContent='Knowledge changed. Search again on the new snapshot.';return;}session=result.session;planned.clear();for(const item of result.results)if(item.id)expanded.add(item.id);for(const c of result.connections)for(const id of c.path?.nodes||[])planned.add(id);rebuild();
 $('results').replaceChildren(...result.results.map(item=>{const li=element('li',''),button=element('button',item.title);button.onclick=()=>choose(item.id);const disconnected=result.connections.find(c=>c.target===item.id&&!c.path);li.append(button,element('small',`${item.kind} · compatibility ${item.compatibility.status}${disconnected?' · no graph connection':''}`));return li;}));$('status').textContent=result.results.length?`${result.results.length} ranked sources. Purple paths explain connections.${result.metricsRecorded?'':' Metrics unavailable.'}`:'No matching evidence. This search adds no knowledge automatically.';metrics();}catch(error){$('status').textContent=error.message;}finally{$('submit').disabled=false;}};
$('domain').onchange=()=>{focusedDomain=$('domain').value;rebuild();};$('period').onchange=metrics;$('heat').onchange=()=>network?.nodeColor(color);$('motion').onclick=()=>{paused=!paused;motion();};$('close').onclick=()=>{$('details').hidden=true;selected=null;};reduced.onchange=()=>{paused=reduced.matches;motion();};document.addEventListener('visibilitychange',motion);
try{
 await loadGraph();
 network=new ForceGraph3D($('scene'),{controlType:'orbit'}).backgroundColor('#050d14').showNavInfo(false).nodeId('id').nodeLabel(n=>element('span',n.title)).nodeVal(n=>n.kind==='index'?4:n.kind==='source'?2:1).nodeColor(color).nodeOpacity(.9).linkColor(e=>planned.has(e.source?.id||e.source)&&planned.has(e.target?.id||e.target)?'#b6a1f0':'#397571').linkOpacity(.22).linkWidth(.35).linkDirectionalParticleWidth(1.4).linkDirectionalParticleColor(()=>'#d3fff3').onNodeClick(n=>choose(n.id)).d3VelocityDecay(.9).cooldownTicks(1);
 network?.cameraPosition({x:260,y:75,z:410});network.controls().autoRotate=!paused;network.controls().autoRotateSpeed=.18;
 // An anatomical envelope is decorative: it creates no knowledge nodes or edges.
 for(const side of [-1,1]){
   const geometry=new THREE.SphereGeometry(1,36,30),vertices=geometry.attributes.position;
   for(let i=0;i<vertices.count;i++){const x=vertices.getX(i),y=vertices.getY(i),z=vertices.getZ(i);const fold=1+.035*Math.sin(y*24+z*8)*Math.cos(x*12);vertices.setXYZ(i,x*fold,y*fold,z*fold);}
   const envelope=new THREE.Mesh(geometry,new THREE.MeshBasicMaterial({color:'#58b4a8',wireframe:true,transparent:true,opacity:.025}));envelope.scale.set(79,115,145);envelope.position.x=side*63;network.scene().add(envelope);
   for(let band=0;band<10;band++){
     const points=[];for(let i=0;i<=100;i++){const theta=i/100*Math.PI*2,latitude=(band+1)/11*Math.PI+.065*Math.sin(theta*5+band),wave=1+.025*Math.sin(theta*9+band);points.push(new THREE.Vector3(side*63+Math.sin(latitude)*Math.cos(theta)*80*wave,Math.cos(latitude)*116,Math.sin(latitude)*Math.sin(theta)*146*wave));}
     const groove=new THREE.Line(new THREE.BufferGeometry().setFromPoints(points),new THREE.LineBasicMaterial({color:'#62adab',transparent:true,opacity:.15}));network.scene().add(groove);
   }
 }
 const resize=()=>{const r=$('scene').getBoundingClientRect();network.width(r.width).height(r.height);};window.addEventListener('resize',resize);resize();rebuild();motion();animate();eventStream();await metrics();$('status').textContent='Search committed knowledge. Paths show evidence connections.';
 setInterval(()=>{if(!document.hidden)loadGraph().catch(()=>{$('status').textContent='Knowledge refresh unavailable; showing the last snapshot.';});},5000);
 setInterval(()=>{if(!document.hidden)metrics();},10000);
}catch(error){$('status').textContent=`Visualization unavailable: ${error.message}. Knowledge search remains available when the local server is healthy.`;}
