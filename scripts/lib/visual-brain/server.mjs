import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import {randomUUID} from 'node:crypto';
import {at,noSymlinks} from '../core.mjs';
import {snapshot,healthOverlay} from './snapshot.mjs';
import {route,reportActivity,pendingIntake} from './retrieval.mjs';
import {summary,eventsAfter,latestSequence,startSession,sessionInfo} from './metrics.mjs';
import {brief,playbooks,explain,compare} from './guidance-tools.mjs';
import {feedback} from './feedback.mjs';
const types={'.html':'text/html; charset=utf-8','.js':'application/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml'};
async function body(req){let data='';for await(const chunk of req){data+=chunk;if(Buffer.byteLength(data)>8192)throw new Error('Request body exceeds its bound');}return JSON.parse(data);}
function strict(value,keys){if(!value||Array.isArray(value)||typeof value!=='object'||Object.keys(value).some(k=>!keys.includes(k)))throw new Error('Unsupported request fields');return value;}
export async function serve({port=4174}={}){
  port=Number(port);if(!Number.isInteger(port)||port<1024||port>65535)throw new Error('Port must be between 1024 and 65535');
  const assets=at('web/brain/dist');noSymlinks(at('web/brain'),assets);
  if(!fs.existsSync(path.join(assets,'index.html')))throw new Error('Build the viewer first: pnpm --dir web/brain install --frozen-lockfile && pnpm --dir web/brain run build');
  const graph=snapshot();console.log(`Knowledge snapshot ${graph.revision.slice(0,12)}; ${graph.nodes.length} nodes`);
  const origin=`http://127.0.0.1:${port}`;const sockets=new Set();
  const server=http.createServer(async(req,res)=>{
    res.setHeader('Cache-Control','no-store');res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Referrer-Policy','no-referrer');
    res.setHeader('Content-Security-Policy',"default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; connect-src 'self'; img-src 'self' data:; frame-ancestors 'none'; base-uri 'none'; form-action 'self'");
    const send=(code,data)=>{res.writeHead(code,{'Content-Type':'application/json; charset=utf-8'});res.end(JSON.stringify(data));};
    try{
      if(req.headers.host!==`127.0.0.1:${port}`||(req.headers.origin&&req.headers.origin!==origin)||['cross-site','same-site'].includes(req.headers['sec-fetch-site']))return send(403,{error:'Local same-origin access only'});
      const url=new URL(req.url,origin);
      if(req.method==='GET'&&url.pathname==='/api/graph'){
        const s=snapshot(),nodes=healthOverlay(s);return send(200,{snapshot:s.revision,domains:s.domains,nodes,edges:s.edges});
      }
      if(req.method==='GET'&&url.pathname==='/api/intake')return send(200,pendingIntake());
      if(req.method==='GET'&&url.pathname==='/api/metrics')return send(200,await summary(url.searchParams.get('period')||'today'));
      if(req.method==='GET'&&url.pathname==='/api/events'){
        let seq=await latestSequence();res.writeHead(200,{'Content-Type':'text/event-stream','Connection':'keep-alive'});res.write('event: ready\ndata: {}\n\n');
        let busy=false;const timer=setInterval(async()=>{if(busy)return;busy=true;try{const rows=await eventsAfter(seq);if(rows.length){seq=rows.at(-1).seq;res.write(`data: ${JSON.stringify(rows)}\n\n`);}else res.write(': heartbeat\n\n');}catch{res.write('event: unavailable\ndata: {}\n\n');}finally{busy=false;}},750);
        req.on('close',()=>clearInterval(timer));return;
      }
      if(req.method==='POST'&&req.headers.origin!==origin)return send(403,{error:'Same-origin request required'});
      if(req.method==='POST'&&!String(req.headers['content-type']).startsWith('application/json'))return send(415,{error:'JSON required'});
      if(req.method==='POST'&&url.pathname==='/api/session'){strict(await body(req),[]);return send(200,await startSession(snapshot().revision));}
      if(req.method==='POST'&&url.pathname==='/api/route'){
        const input=strict(await body(req),['query','domain','versions']);return send(200,await route({...input,origin:'viewer'}));
      }
      if(req.method==='POST'&&url.pathname==='/api/brief'){
        const input=strict(await body(req),['query','domain','versions']);return send(200,await brief({...input,origin:'viewer'}));
      }
      if(req.method==='POST'&&url.pathname==='/api/playbooks'){
        const input=strict(await body(req),['domain','versions']);return send(200,playbooks(input));
      }
      if(req.method==='POST'&&['/api/explain','/api/compare','/api/feedback'].includes(url.pathname)){
        const input=strict(await body(req),url.pathname==='/api/explain'?['node','snapshot','versions']:url.pathname==='/api/compare'?['from','to','snapshot','versions']:['node','snapshot','value']);
        if(input.snapshot!==snapshot().revision)return send(409,{error:'Knowledge changed; refresh before continuing'});
        return send(200,await (url.pathname==='/api/explain'?explain:url.pathname==='/api/compare'?compare:feedback)(input));
      }
      if(req.method==='POST'&&url.pathname==='/api/note'){
        const input=strict(await body(req),['node','session','snapshot']);const s=snapshot();if(input.snapshot!==s.revision)return send(409,{error:'Knowledge changed; refresh the graph before opening the note'});
        if(!s.bodies.has(input.node))return send(404,{error:'Unknown knowledge note'});
        let metricsRecorded=true;
        try{
          if(input.session){const prior=await sessionInfo(input.session);if(prior.snapshot!==s.revision)return send(409,{error:'Session uses an older knowledge snapshot; search again'});
            await reportActivity({session:input.session,node:input.node,type:'read',eventId:randomUUID(),origin:'viewer'});}
          else metricsRecorded=false;
        }catch{metricsRecorded=false;}
        return send(200,{snapshot:s.revision,node:input.node,body:s.bodies.get(input.node),metricsRecorded});
      }
      if(req.method!=='GET')return send(405,{error:'Method not allowed'});
      if(url.pathname.startsWith('/api/'))return send(404,{error:'Unknown endpoint'});
      const file=url.pathname==='/'?'index.html':decodeURIComponent(url.pathname.slice(1));
      if(!/^(?:index\.html|assets\/[a-zA-Z0-9_.-]+\.(?:js|css|svg))$/.test(file))return send(404,{error:'Unknown asset'});
      const full=path.join(assets,file);noSymlinks(assets,full);if(!fs.existsSync(full))return send(404,{error:'Unknown asset'});
      res.writeHead(200,{'Content-Type':types[path.extname(full)]});fs.createReadStream(full).pipe(res);
    }catch{if(!res.headersSent)send(400,{error:'Request failed; check inputs and local activity storage'});else res.end();}
  });
  server.on('connection',socket=>{sockets.add(socket);socket.on('close',()=>sockets.delete(socket));});
  await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(port,'127.0.0.1',resolve);});
  console.log(`Visual Brain → ${origin}/`);
  function stop(){for(const socket of sockets)socket.destroy();server.close();}
  process.once('SIGINT',stop);process.once('SIGTERM',stop);
  return new Promise(resolve=>server.once('close',()=>resolve({ok:true})));
}
