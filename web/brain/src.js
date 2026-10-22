import ForceGraph3D from '3d-force-graph';
import * as THREE from 'three';
import './style.css';
import {renderMarkdown} from './markdown.js';
import {createCaptureNebula} from './capture-nebula.js';
import {createGuidance} from './guidance.js';
const $=id=>document.getElementById(id);
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
let galaxy,graph,network,stats,session,sessionExpiresAt=0,sessionRequest=null,selected,guidance,focusedDomain='',expanded=new Set(),active=new Map(),fresh=new Map(),planned=new Set(),lastGraph,liveEvents=[],sse,known=new Set();
const nodeObjects=new Map(),metricDisplays=new Map(),starLabels=new Map();
let focusGraph=null,overviewReferences=new Set();
let lastFrame=0,visualTime=0,searchStage='idle',searchUntil=0;
const searchFound=new Set(),searchEdges=new Set(),activeKinds=new Map();
let intakeSignature='',externalSearchTimer,intakeLayer,captureNebula;
const externalSessions=new Map();
const hash=s=>{let h=2166136261;for(const c of s)h=Math.imul(h^c.charCodeAt(0),16777619);return h>>>0;};
function element(tag,text){const e=document.createElement(tag);e.textContent=text;return e;}
async function api(path,input){const r=await fetch(path,input===undefined?{}:{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(input)});const data=await r.json();if(!r.ok)throw new Error(data.error||'Request unavailable');return data;}
function health(n){return n?.freshness?.status==='needs-revalidation'||!!n?.linkHealth&&!['healthy','redirected'].includes(n.linkHealth.state);}
function color(n){if(searchStage==='found'&&searchFound.has(n.id))return '#e6fdff';if(scanLevel(n.id)>.55)return '#79e6ff';if(focusGraph?.id===n.id)return '#e8f9ff';if((active.get(n.id)||0)>Date.now())return activeKinds.get(n.id)==='cited'?'#ffdf9e':activeKinds.get(n.id)==='read'?'#a3ffe1':'#f1ffff';if((fresh.get(n.id)||0)>Date.now())return '#f18dcd';if(health(n))return '#e9ac68';if(planned.has(n.id))return '#b5a4f5';if($('heat').checked){const count=stats?.nodes[n.id]?.returned||0;return new THREE.Color('#328b86').lerp(new THREE.Color('#f6d58c'),Math.min(1,Math.log2(count+1)/6)).getStyle();}return n.kind==='source'?'#75b6d0':n.kind==='index'?'#a1efe0':'#4db6aa';}
function edgeKey(edge){return `${edge.source.id||edge.source}|${edge.target.id||edge.target}|${edge.relation}`;}
function scanLevel(id){return searchStage==='searching'&&!reduced.matches?Math.pow(Math.max(0,Math.sin(visualTime*.007-(hash(id)%100)/100*Math.PI*2)),8):0;}
function energized(edge){return searchStage==='found'&&searchEdges.has(edgeKey(edge));}
function connectionColor(edge){if(energized(edge))return '#c9faff';if(scanLevel(edge.source.id||edge.source)>.6)return '#5ad9ff';return planned.has(edge.source.id||edge.source)&&planned.has(edge.target.id||edge.target)?'#a799ed':focusGraph?'#68b7d8':'#376681';}
function connectionWidth(edge){return energized(edge)?1.7:scanLevel(edge.source.id||edge.source)>.6?1:focusGraph ? .65 : .45;}
function searchVisual(stage,result){clearTimeout(externalSearchTimer);searchStage=stage;searchFound.clear();searchEdges.clear();searchUntil=stage==='searching'?Infinity:Date.now()+4500;
 $('search-state').hidden=stage==='idle';$('search-state').textContent=stage==='searching'?'Searching knowledge':stage==='found'?`${result.results.length} sources found`:stage==='captured'?'Capture received · pending curation':stage==='external'?'Lookup complete · external references':stage==='empty'?'No matching sources':stage==='error'?'Lookup unavailable':'';
 if(stage==='found'){for(const item of result.results)if(item.id)searchFound.add(item.id);for(const connection of result.connections){for(const id of connection.path?.nodes||[])searchFound.add(id);for(const edge of connection.path?.edges||[])searchEdges.add(edgeKey(edge));}
  if(network&&!reduced.matches)for(const edge of network.graphData().links)if(energized(edge))for(let i=0;i<4;i++)network.emitParticle(edge);
 }
}
function position(n){
 const h=hash(n.id),d=Math.max(0,graph.domains.indexOf(n.domain||n.domains?.[0]));
 if(n.id==='knowledge/INDEX.md')return {x:0,y:0,z:0};
 const angle=d/Math.max(1,graph.domains.length)*Math.PI*2+(h%1000)/1000*.65;
 const radius=32+((h>>>8)%1000)/1000*96;
 return {x:Math.cos(angle)*radius,y:Math.sin(angle)*radius,z:((h>>>18)%1000)/1000*35-17.5};
}
function visible(n){return (n.kind==='index'||n.kind==='curated-note'||n.kind==='source'||expanded.has(n.id)||overviewReferences.has(n.id))&&(!focusedDomain||n.domain===focusedDomain||n.domains?.includes(focusedDomain)||n.id==='knowledge/INDEX.md');}
function displayPosition(n){if(!focusGraph)return position(n);if(n.id===focusGraph.id)return {x:0,y:0,z:0};const index=focusGraph.neighbors.indexOf(n.id),angle=index/Math.max(1,focusGraph.neighbors.length)*Math.PI*2-.65,radius=focusGraph.neighbors.length>12?(index%2?63:43):52;return {x:Math.cos(angle)*radius,y:Math.sin(angle)*radius*.84,z:Math.sin(angle*2)*12};}
function rebuild(){if(!graph||!network)return;const nodes=graph.nodes.filter(n=>focusGraph?focusGraph.ids.has(n.id):visible(n)).map(n=>({...n,...displayPosition(n)}));for(const n of nodes){n.fx=n.x;n.fy=n.y;n.fz=n.z;}
 const ids=new Set(nodes.map(n=>n.id));const links=graph.edges.filter(e=>ids.has(e.source)&&ids.has(e.target)).map(e=>({...e}));
 nodeObjects.clear();network.graphData({nodes,links});network.nodeColor(color);if(galaxy)galaxy.visible=!focusGraph;
 network.linkDirectionalParticles(reduced.matches?0:focusGraph?3:1);
 starLabels.clear();$('star-labels').replaceChildren();if(focusGraph)for(const id of focusGraph.neighbors){const node=graph.nodes.find(n=>n.id===id),button=element('button',node.title);button.className='star-label';button.onclick=()=>choose(id);button.title=node.title;starLabels.set(id,button);$('star-labels').append(button);}
}

function focusNode(id,limit=24){
 const relationships=graph.edges.filter(edge=>edge.source===id||edge.target===id),neighbors=[...new Set(relationships.map(edge=>edge.source===id?edge.target:edge.source))].slice(0,limit);
 focusGraph={id,neighbors,ids:new Set([id,...neighbors])};document.body.classList.add('node-focused');$('overview').hidden=false;
 $('focus-title').textContent=graph.nodes.find(node=>node.id===id)?.title||'';$('focus-count').textContent=`${neighbors.length} connected stars${relationships.length>limit?' · showing first '+limit:''}`;$('focus-caption').hidden=false;
 rebuild();resizeScene();network?.cameraPosition({x:0,y:0,z:205},{x:0,y:0,z:0},reduced.matches?0:900);
}
function overview(){guidance?.cancel();focusGraph=null;selected=null;document.body.classList.remove('node-focused');$('overview').hidden=true;$('focus-caption').hidden=true;$('details').hidden=true;rebuild();resizeScene();network?.cameraPosition({x:0,y:0,z:420},{x:0,y:0,z:0},reduced.matches?0:900);}
function resizeScene(){if(!network)return;const r=$('scene').getBoundingClientRect();network.width(r.width).height(r.height);}
function animate(timestamp){
 const delta=lastFrame?Math.min(timestamp-lastFrame,50):0;lastFrame=timestamp;
 if(network&&!document.hidden){
  if(!reduced.matches){
   visualTime+=delta;const t=visualTime/1000;
   if(galaxy){const dust=galaxy.children[0].geometry,positions=dust.attributes.position,particles=dust.userData.particles;
    const centers=galaxy.userData.systems.map(system=>orbitPosition(system,t));
    for(let i=0;i<positions.count;i++){const particle=particles[i],center=particle.cluster<0?{x:0,y:0,z:0}:centers[particle.cluster],angle=particle.angle+t*particle.speed;
     positions.setXYZ(i,center.x+Math.cos(angle)*particle.radius,center.y+Math.sin(angle)*particle.radius*particle.flatten,center.z+particle.depth+Math.sin(angle)*particle.radius*.24);
    }positions.needsUpdate=true;
    galaxy.userData.lights.forEach((light,i)=>light.position.copy(centers[i]));
   }
   for(const n of network.graphData().nodes){const p=displayPosition(n),phase=hash(n.id);n.x=p.x+(n.id===focusGraph?.id?0:Math.sin(t*.3+phase)*1.1);n.y=p.y+(n.id===focusGraph?.id?0:Math.cos(t*.24+phase)*1.1);}
  }
  if(searchStage!=='idle'&&Date.now()>searchUntil)searchVisual('idle');
  const capturing=captureNebula?.update(delta,reduced.matches,!!focusGraph)||false;
  $('capture-state').hidden=!capturing;
  document.body.classList.toggle('capture-active',capturing);
  for(const {node,sprite} of nodeObjects.values()){sprite.material.color.set(color(node));const pulse=reduced.matches?0:scanLevel(node.id)+(searchStage==='found'&&searchFound.has(node.id)?(.5+.5*Math.sin(visualTime*.008)):0);const size=sprite.userData.baseSize*(1+pulse*.8);sprite.scale.set(size,size,1);}
  network.nodeColor(color).linkColor(connectionColor).linkWidth(connectionWidth);
  if(galaxy?.userData.corona){const corona=galaxy.userData.corona,visible=['searching','found','captured'].includes(searchStage);corona.visible=visible&&!reduced.matches;if(corona.visible){const progress=(visualTime%1500)/1500;corona.material.color.set(searchStage==='captured'?'#c194ff':'#8ceaff');corona.scale.setScalar(1+progress*18);corona.material.opacity=(1-progress)*(searchStage==='found'?.65:.3);}}

  if(intakeLayer){intakeLayer.material.opacity=capturing?1:.65;intakeLayer.material.size=capturing&&!reduced.matches?4.5+Math.sin(visualTime*.006):3.5;}
  for(const node of network.graphData().nodes){const label=starLabels.get(node.id);if(label){const point=network.graph2ScreenCoords(node.x,node.y,node.z);label.style.left=point.x+'px';label.style.top=(point.y+13)+'px';}}
  for(const display of metricDisplays.values())if(display.value!==display.target){display.value=reduced.matches?display.target:display.value+(display.target-display.value)*Math.min(1,delta/160);if(Math.abs(display.target-display.value)<.05)display.value=display.target;display.number.textContent=Math.round(display.value).toLocaleString();}
 }
 requestAnimationFrame(animate);
}
function motion(){if(!network)return;network.controls().autoRotate=false;if(document.hidden)network.pauseAnimation();else network.resumeAnimation();}
function glowTexture(){const canvas=document.createElement('canvas');canvas.width=canvas.height=64;const context=canvas.getContext('2d'),gradient=context.createRadialGradient(32,32,0,32,32,32);gradient.addColorStop(0,'#fff');gradient.addColorStop(.12,'#fff');gradient.addColorStop(.3,'#ffffff99');gradient.addColorStop(1,'#ffffff00');context.fillStyle=gradient;context.fillRect(0,0,64,64);return new THREE.CanvasTexture(canvas);}
function orbitPosition(system,time=0){const angle=system.angle+time*system.speed;return new THREE.Vector3(Math.cos(angle)*system.radius,Math.sin(angle)*system.radius*Math.cos(system.tilt),Math.sin(angle)*system.radius*Math.sin(system.tilt));}
function createGalaxy(texture){
 const group=new THREE.Group(),positions=[],colors=[],particles=[];
 const systems=Array.from({length:7},(_,i)=>({radius:48+i*15,angle:i*2.399,tilt:(i%2?1:-1)*(.38+i*.06),speed:(i%2?1:-1)*(.009+i*.002)}));
 for(let i=0;i<3300;i++){
  const h=hash('system-star:'+i),j=hash('system-depth:'+i),cluster=i<1900?-1:i%systems.length;
  const radius=cluster<0?12+Math.pow((h%100000)/100000,.55)*143:Math.pow((h%100000)/100000,1.8)*19;
  const particle={cluster,radius,angle:(j%10000)/10000*Math.PI*2,flatten:cluster<0?.55+(h%100)/180:.7,depth:((h>>>12)%1000)/1000*(cluster<0?94:18)-(cluster<0?47:9),speed:(cluster<0?.004:.025)+(h%100)/5000};particles.push(particle);
  const center=cluster<0?new THREE.Vector3():orbitPosition(systems[cluster]);positions.push(center.x+Math.cos(particle.angle)*radius,center.y+Math.sin(particle.angle)*radius*particle.flatten,center.z+particle.depth+Math.sin(particle.angle)*radius*.24);
  const c=new THREE.Color(cluster<0?(i%5?'#8fbee8':'#e8d3b9'):(cluster%2?'#a0dffe':'#c3b5f5'));colors.push(c.r,c.g,c.b);
 }
 const geometry=new THREE.BufferGeometry();geometry.userData.particles=particles;geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geometry.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));
 group.add(new THREE.Points(geometry,new THREE.PointsMaterial({size:2.2,map:texture,vertexColors:true,transparent:true,opacity:.9,depthWrite:false,blending:THREE.AdditiveBlending})));
 // Decorative star systems have independent, inclined orbits; they are not knowledge or activity.
 const lights=[];
 for(const [i,system] of systems.entries()){
  const points=Array.from({length:181},(_,step)=>orbitPosition({...system,angle:step*Math.PI/90}));
  const orbit=new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(points),new THREE.LineBasicMaterial({color:i%2?'#7ba4cd':'#b0adcc',transparent:true,opacity:.12}));group.add(orbit);
  const light=new THREE.Sprite(new THREE.SpriteMaterial({map:texture,color:i%2?'#a6e2ff':'#d2bffa',transparent:true,opacity:.8,depthWrite:false,blending:THREE.AdditiveBlending}));light.position.copy(orbitPosition(system));light.scale.set(9+i%3*2,9+i%3*2,1);lights.push(light);group.add(light);
 }
 group.userData.systems=systems;group.userData.lights=lights;
 const coronaPoints=Array.from({length:97},(_,i)=>new THREE.Vector3(Math.cos(i*Math.PI/48)*8,Math.sin(i*Math.PI/48)*8,0));const corona=new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(coronaPoints),new THREE.LineBasicMaterial({color:'#8ceaff',transparent:true,opacity:0,depthWrite:false,blending:THREE.AdditiveBlending}));corona.visible=false;group.add(corona);group.userData.corona=corona;
 for(let i=0;i<9;i++){const cloud=new THREE.Sprite(new THREE.SpriteMaterial({map:texture,color:i%2?'#466ca7':'#71548f',transparent:true,opacity:.05,depthWrite:false,blending:THREE.AdditiveBlending}));const angle=i*2.399;cloud.position.set(Math.cos(angle)*90,Math.sin(angle)*65,-35);cloud.scale.set(95,70,1);group.add(cloud);}
 const core=new THREE.Sprite(new THREE.SpriteMaterial({map:texture,color:'#fff0d5',transparent:true,opacity:.85,depthWrite:false,blending:THREE.AdditiveBlending}));core.scale.set(21,21,1);group.add(core);
 const halo=new THREE.Sprite(new THREE.SpriteMaterial({map:texture,color:'#8dbbe4',transparent:true,opacity:.15,depthWrite:false,blending:THREE.AdditiveBlending}));halo.scale.set(58,58,1);group.add(halo);
 network.scene().add(group);
 const stars=[],starColors=[];for(let i=0;i<1800;i++){const h=hash('star:'+i),j=hash('star-z:'+i);stars.push((h%10000)/10000*1000-500,((h>>>12)%10000)/10000*700-350,-80-(j%1000)/1000*200);const c=new THREE.Color(i%7?'#91b6dd':'#f3dbb8');starColors.push(c.r,c.g,c.b);}
 const starGeometry=new THREE.BufferGeometry();starGeometry.setAttribute('position',new THREE.Float32BufferAttribute(stars,3));starGeometry.setAttribute('color',new THREE.Float32BufferAttribute(starColors,3));network.scene().add(new THREE.Points(starGeometry,new THREE.PointsMaterial({size:1.5,map:texture,vertexColors:true,transparent:true,opacity:.8,depthWrite:false})));
 return group;
}
function renderTotals(){
 const fields=[['search','LOOKUPS'],['returned','RETURNED'],['read','READ'],['cited','CITED'],['captured','CAPTURES'],['no-results','NO RESULTS']];
 for(const [key,label] of fields){let display=metricDisplays.get(key);if(!display){const item=element('div',''),dial=element('div',''),value=element('div',''),number=element('b','0');item.className='metric';dial.className='dial';dial.setAttribute('aria-hidden','true');dial.append(element('i',''));value.append(number,element('span',label));item.append(dial,value);$('totals').append(item);display={item,number,value:0,target:0};metricDisplays.set(key,display);}
  const target=stats.totals[key]||0;if(target!==display.target){display.target=target;display.item.classList.remove('flash');void display.item.offsetWidth;display.item.classList.add('flash');}if(!network||reduced.matches){display.value=target;display.number.textContent=target.toLocaleString();}
 }
 $('activity-state').textContent=Object.values(stats.totals).some(value=>value>0)?'Recording live':'Awaiting activity';
}
async function choose(id){const n=graph.nodes.find(n=>n.id===id);if(!n)return;selected=id;focusNode(id);$('details').hidden=false;$('detail-kind').textContent=n.format==='playbook'?'Proposed playbook':n.kind.replaceAll('-',' ');$('detail-title').textContent=n.title;guidance.select(n);
 const currentness=n.freshness?.status==='needs-revalidation'?'Needs attention — source changes or a review date require verification.':n.kind==='curated-note'?'No current revalidation signal; applicability still matters.':'';
 const referenceHealth=n.linkHealth?`Link check: ${n.linkHealth.state}${n.linkHealth.checkedAt?' · '+new Date(n.linkHealth.checkedAt).toLocaleString():''}. Link availability does not verify technical guidance.`:n.kind==='curated-note'?'':'Reference health unknown unless a local check recorded it.';
 $('detail-health').textContent=[currentness,referenceHealth].filter(Boolean).join(' ');
 $('note').textContent='';$('detail-links').replaceChildren();const counts=stats?.nodes[id];$('detail-metrics').textContent=`Returned ${counts?.returned||0} · Read ${counts?.read||0} · Cited ${counts?.cited||0}${counts?.lastUsed?' · Last used '+new Date(counts.lastUsed).toLocaleString():''}`;
 if(n.url){const a=element('a','Open official reference ↗');a.href=n.url;a.target='_blank';a.rel='noopener noreferrer';$('detail-links').append(a);}
 if(n.kind==='source'){const button=element('button','Show up to 80 connected stars');button.onclick=()=>focusNode(n.id,80);$('detail-links').append(button);}
 const rel=graph.edges.filter(e=>e.source===id||e.target===id).slice(0,24);$('relationships').replaceChildren(...rel.map(e=>{const other=graph.nodes.find(x=>x.id===(e.source===id?e.target:e.source));const li=element('li',''),button=element('button',other?.title||'reference');button.onclick=()=>choose(other.id);li.append(element('span',e.relation+': '),button);return li;}));
 if(n.kind==='curated-note'||n.kind==='index')try{if(session&&Date.now()>=sessionExpiresAt){session=null;sessionExpiresAt=0;}if(!session){
  if(!sessionRequest){const started=Date.now();
   // Only the current acquisition may update state after a snapshot refresh or search.
   const request=api('/api/session',{}).then(result=>{if(sessionRequest===request&&result.snapshot===graph.snapshot){session=result.session;sessionExpiresAt=session?started+86400000:0;}}).catch(()=>{if(sessionRequest===request){session=null;sessionExpiresAt=0;}}).finally(()=>{if(sessionRequest===request)sessionRequest=null;});
   sessionRequest=request;
  }
  await sessionRequest;
 }
 const attemptedSession=session,result=await api('/api/note',{node:id,session:attemptedSession,snapshot:graph.snapshot});if(!result.metricsRecorded&&session===attemptedSession){session=null;sessionExpiresAt=0;}if(selected===id){$('note').replaceChildren(renderMarkdown(result.body,{path:id,title:n.title,onNavigate:choose,hasNode:target=>graph.nodes.some(node=>node.id===target)}));if(!result.metricsRecorded)$('detail-metrics').textContent+=' · Read not recorded';}
 }catch(error){if(selected===id)$('note').textContent=error.message;}
}
async function metrics(){try{stats=await api(`/api/metrics?period=${$('period').value}`);renderTotals();
 $('history').textContent=`Recorded activity since ${stats.firstRecorded||'now'} · America/New_York · Agent reads and citations are self-reported. Counts span revisions.`;
 const popular=Object.entries(stats.nodes).sort((a,b)=>b[1].returned-a[1].returned).slice(0,5);$('popular').replaceChildren(...popular.map(([id,c])=>{const li=element('li',''),n=graph.nodes.find(n=>n.id===id);const button=element('button',`${n?.title||'Historical reference'} · ${c.returned}`);button.onclick=()=>choose(id);li.append(button);return li;}));
 if(!liveEvents.length){$('activity').replaceChildren(...(stats.recent||[]).filter(e=>e.type!=='planned').slice(0,12).map(e=>{const n=graph.nodes.find(n=>n.id===e.node);return element('li',activityText(e));}));}
 coverage();if(selected){const c=stats.nodes[selected];$('detail-metrics').textContent=`Returned ${c?.returned||0} · Read ${c?.read||0} · Cited ${c?.cited||0}${c?.lastUsed?' · Last used '+new Date(c.lastUsed).toLocaleString():''}`;}
 }catch{$('history').textContent='Activity metrics unavailable. Knowledge remains accessible.';}}
function coverage(){if(!graph)return;$('coverage').replaceChildren(...graph.domains.map(domain=>{const items=graph.nodes.filter(n=>n.domain===domain||n.domains?.includes(domain));const notes=items.filter(n=>n.kind==='curated-note').length,refs=items.filter(n=>n.url).length,usage=items.reduce((sum,n)=>sum+(stats?.nodes[n.id]?.returned||0),0);const button=element('button',`${domain} · ${notes} notes / ${refs} refs / ${usage} returns`);button.onclick=()=>{focusedDomain=focusedDomain===domain?'':domain;$('domain').value=focusedDomain;rebuild();};return button;}));}
async function loadGraph(){const next=await api('/api/graph');if(lastGraph===next.snapshot){graph=next;return;}guidance?.reset();const prior=known;known=new Set(next.nodes.map(n=>n.id));graph=next;lastGraph=next.snapshot;session=null;sessionExpiresAt=0;sessionRequest=null;overview();overviewReferences=new Set();for(const source of graph.nodes.filter(n=>n.kind==='source'))graph.nodes.filter(n=>n.source===source.id.slice(7)).slice(0,6).forEach(n=>overviewReferences.add(n.id));for(const edge of graph.edges)if(edge.relation==='cites official reference')overviewReferences.add(edge.target);
 if(prior.size)for(const id of known)if(!prior.has(id))fresh.set(id,Date.now()+4000);
 $('inventory').textContent=`${graph.nodes.filter(n=>n.kind==='curated-note').length.toLocaleString()} notes / ${graph.nodes.filter(n=>n.url).length.toLocaleString()} references`;
 $('snapshot').textContent=`MAIN ${graph.snapshot.slice(0,12)} · ${graph.nodes.filter(n=>n.kind==='curated-note').length} NOTES · ${graph.nodes.filter(n=>n.url).length} REFERENCES`;
 $('domain').replaceChildren(element('option','All domains'),...graph.domains.map(d=>{const o=element('option',d);o.value=d;return o;}));$('domain').firstChild.value='';$('domain').value=focusedDomain;rebuild();coverage();}
async function intake(){try{const result=await api('/api/intake');$('pending-summary').textContent=`${result.pending.toLocaleString()} pending teachings`;$('intake-domains').replaceChildren(...Object.entries(result.domains).sort(([a],[b])=>a.localeCompare(b)).map(([domain,count])=>element('li',`${domain} · ${count}`)));if(!result.pending)$('intake-domains').append(element('li','No pending captures'));
 const signature=JSON.stringify(result.domains);if(!galaxy||signature===intakeSignature)return;intakeSignature=signature;if(intakeLayer){galaxy.remove(intakeLayer);intakeLayer.geometry.dispose();intakeLayer.material.dispose();}
 const points=[],domains=Object.entries(result.domains);for(let d=0;d<domains.length;d++){const count=Math.min(domains[d][1],12),angle=d/Math.max(domains.length,1)*Math.PI*2;for(let i=0;i<count;i++){const jitter=hash(domains[d][0]+i),a=angle+((jitter%100)/100-.5)*.18,radius=161+((jitter>>>9)%100)/100*15;points.push(Math.cos(a)*radius,Math.sin(a)*radius*.85,((jitter>>>18)%100)/100*28-14);}}
 const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(points,3));intakeLayer=new THREE.Points(geometry,new THREE.PointsMaterial({map:galaxy.children[0].material.map,color:'#bf86ff',size:3.5,transparent:true,opacity:.65,depthWrite:false,blending:THREE.AdditiveBlending}));galaxy.add(intakeLayer);
 }catch{$('pending-summary').textContent='Pending counts unavailable';}}
function activityText(event){if(event.type==='captured')return 'Capture received · pending curation';if(event.type==='search-started')return 'Lookup started';if(event.type==='search-failed')return 'Lookup unavailable';if(event.type==='complete')return 'Reading session complete';const node=graph.nodes.find(node=>node.id===event.node);return `${event.origin==='agent'?'Agent-reported ':''}${event.type} · ${node?.title||'knowledge lookup'}`;}
function externalActivity(rows){
 // Intake has no graph node and remains relevant when local main advances.
 if(rows.some(event=>event.origin!=='viewer'&&event.type==='captured')){captureNebula?.trigger();intake();}
 const events=rows.filter(event=>event.origin!=='viewer'&&event.snapshot===graph.snapshot);if(!events.length)return;
 for(const event of events){if(event.type==='search-started'){externalSessions.set(event.session,{results:[],nodes:new Set()});searchVisual('searching');clearTimeout(externalSearchTimer);externalSearchTimer=setTimeout(()=>{if(searchStage==='searching')searchVisual('idle');},30000);}
  if(['returned','planned'].includes(event.type)){const session=externalSessions.get(event.session)||{results:[],nodes:new Set()};if(event.node){session.nodes.add(event.node);if(event.type==='returned')session.results.push({id:event.node});}externalSessions.set(event.session,session);}
  if(event.type==='no-results')searchVisual('empty');if(event.type==='search-failed')searchVisual('error');
 }
 const sessions=new Set(events.filter(event=>['search','returned','planned'].includes(event.type)).map(event=>event.session));for(const id of sessions){const session=externalSessions.get(id);if(!session?.results.length){if(events.some(event=>event.session===id&&event.type==='returned'))searchVisual('external');continue;}const edges=graph.edges.filter(edge=>session.nodes.has(edge.source)&&session.nodes.has(edge.target));if(!edges.length){const returned=new Set(session.results.map(result=>result.id));edges.push(...graph.edges.filter(edge=>returned.has(edge.source)||returned.has(edge.target)).slice(0,24));for(const edge of edges){session.nodes.add(edge.source);session.nodes.add(edge.target);expanded.add(edge.source);expanded.add(edge.target);}rebuild();}searchVisual('found',{results:session.results,connections:[{path:{nodes:[...session.nodes],edges}}]});}
 while(externalSessions.size>30)externalSessions.delete(externalSessions.keys().next().value);
}
function eventStream(){sse=new EventSource('/api/events');sse.addEventListener('ready',()=>{$('connection').textContent='Live · local';$('signal').className='live';liveEvents=[];metrics();});sse.onerror=()=>{$('connection').textContent='Reconnecting';$('signal').className='';};sse.addEventListener('unavailable',()=>{$('connection').textContent='Metrics unavailable';$('signal').className='';});
 sse.onmessage=event=>{const rows=JSON.parse(event.data);for(const e of rows){if(e.snapshot===graph.snapshot&&e.node){expanded.add(e.node);if(e.type==='planned'){planned.add(e.node);setTimeout(()=>planned.delete(e.node),10000);}else{active.set(e.node,Date.now()+3500);activeKinds.set(e.node,e.type);}}
 const node=graph.nodes.find(n=>n.id===e.node);if(e.type!=='planned')liveEvents.unshift(activityText(e));}
 liveEvents=liveEvents.slice(0,12);$('activity').replaceChildren(...liveEvents.map(t=>element('li',t)));rebuild();externalActivity(rows);if(!reduced.matches&&network)for(const link of network.graphData().links){const source=link.source.id||link.source,target=link.target.id||link.target;if((active.get(source)||0)>Date.now()&&(active.get(target)||0)>Date.now())network.emitParticle(link);}metrics();};}
$('search').onsubmit=async event=>{event.preventDefault();if(focusGraph)overview();searchVisual('searching');$('submit').disabled=true;$('status').textContent='Finding relevant evidence…';try{const started=Date.now(),result=await api('/api/route',{query:$('query').value,domain:$('domain').value||undefined,versions:$('versions').value||undefined});if(result.snapshot!==graph.snapshot){await loadGraph();searchVisual('idle');$('status').textContent='Knowledge changed. Search again on the new snapshot.';return;}sessionRequest=null;session=result.session;sessionExpiresAt=session?started+86400000:0;planned.clear();for(const item of result.results)if(item.id)expanded.add(item.id);for(const c of result.connections)for(const id of c.path?.nodes||[])planned.add(id);rebuild();searchVisual(result.results.length?'found':'empty',result);
 $('results').replaceChildren(...result.results.map(item=>{const li=element('li',''),button=element('button',item.title);button.onclick=()=>choose(item.id);const disconnected=result.connections.find(c=>c.target===item.id&&!c.path);li.append(button,element('small',`${item.kind} · compatibility ${item.compatibility.status}${disconnected?' · no graph connection':''}`));return li;}));$('status').textContent=result.results.length?`${result.results.length} ranked sources. Purple paths explain connections.${result.metricsRecorded?'':' Metrics unavailable.'}`:'No matching evidence. This search adds no knowledge automatically.';metrics();}catch(error){searchVisual('error');$('status').textContent=error.message;}finally{$('submit').disabled=false;}};
$('pending-summary').onclick=()=>{$('intake-panel').hidden=!$('intake-panel').hidden;$('pending-summary').setAttribute('aria-expanded',String(!$('intake-panel').hidden));};
$('domain').onchange=()=>{if(focusGraph)overview();focusedDomain=$('domain').value;rebuild();};$('period').onchange=metrics;$('heat').onchange=()=>network?.nodeColor(color);$('close').onclick=overview;$('overview').onclick=overview;reduced.onchange=()=>{motion();network?.linkDirectionalParticles(reduced.matches?0:focusGraph?3:1);};document.addEventListener('visibilitychange',motion);
guidance=createGuidance({api,getGraph:()=>graph,onNavigate:choose,onBrowse:overview,onSession:(result,started)=>{sessionRequest=null;session=result.session;sessionExpiresAt=session?started+86400000:0;metrics();}});
$('versions').addEventListener('change',()=>{if(selected)choose(selected);});
try{
 await loadGraph();
 const texture=glowTexture();
 network=new ForceGraph3D($('scene'),{controlType:'orbit'}).backgroundColor('#02050c').showNavInfo(false).nodeId('id').nodeLabel(n=>focusGraph?element('span',n.title):'').nodeVal(.15).nodeRelSize(1).nodeThreeObject(n=>{const sprite=new THREE.Sprite(new THREE.SpriteMaterial({map:texture,color:color(n),transparent:true,opacity:.95,depthWrite:false,blending:THREE.AdditiveBlending}));const size=focusGraph?.id===n.id?13:focusGraph?4:n.kind==='index'?4:n.kind==='source'?3.4:2.8;sprite.scale.set(size,size,1);sprite.userData.baseSize=size;nodeObjects.set(n.id,{node:n,sprite});return sprite;}).nodeColor(color).linkColor(connectionColor).linkOpacity(.4).linkWidth(connectionWidth).linkDirectionalParticles(reduced.matches?0:1).linkDirectionalParticleSpeed(edge=>energized(edge) ? .018 : searchStage==='searching' ? .01 : .004).linkDirectionalParticleWidth(.85).linkDirectionalParticleColor(()=>'#d3f4ff').onNodeClick(n=>choose(n.id)).d3VelocityDecay(.9).cooldownTicks(1);
 network.cameraPosition({x:0,y:0,z:420});network.controls().enableDamping=true;network.controls().dampingFactor=.08;
 galaxy=createGalaxy(texture);
 captureNebula=createCaptureNebula(texture,network.scene());
 window.addEventListener('resize',resizeScene);resizeScene();rebuild();motion();requestAnimationFrame(animate);eventStream();await metrics();await intake();$('status').textContent='Search committed knowledge. Paths show evidence connections.';
 setInterval(()=>{if(!document.hidden)loadGraph().catch(()=>{$('status').textContent='Knowledge refresh unavailable; showing the last snapshot.';});},5000);
 setInterval(()=>{if(!document.hidden){metrics();intake();}},10000);
}catch(error){$('status').textContent=`Visualization unavailable: ${error.message}. Knowledge search remains available when the local server is healthy.`;}
