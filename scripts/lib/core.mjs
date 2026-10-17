import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
export const sha = value => crypto.createHash('sha256').update(value).digest('hex');
export const json = file => {try{return JSON.parse(fs.readFileSync(file,'utf8'));}catch(error){if(error instanceof SyntaxError)throw new Error('Invalid JSON in a configured file; content suppressed');throw error;}};
export const readJSON = (file, fallback = {}) => fs.existsSync(file) ? json(file) : fallback;
export const at = relative => path.join(ROOT, relative);
export const now = () => new Date().toISOString();
export function mkdir(dir, mode = 0o755) { fs.mkdirSync(dir, {recursive:true, mode}); }
export function atomic(file, data, mode = 0o644) {
  if(inside(ROOT,file))noSymlinks(ROOT,file);
  mkdir(path.dirname(file), file.startsWith(at('.state')) || file.startsWith(at('inbox')) ? 0o700 : 0o755);
  const temporary = `${file}.${process.pid}.${crypto.randomBytes(4).toString('hex')}.tmp`;
  try { fs.writeFileSync(temporary, data, {mode, flag:'wx'}); fs.renameSync(temporary, file); }
  finally { fs.rmSync(temporary, {force:true}); }
}
export const writeJSON = (file, value, mode = 0o644) => atomic(file, JSON.stringify(value, null, 2)+'\n', mode);
export function inside(root, target) {
  const rel = path.relative(path.resolve(root), path.resolve(target));
  return rel === '' || (rel !== '..' && !rel.startsWith('..'+path.sep) && !path.isAbsolute(rel));
}
export function safePath(relative) {
  if (typeof relative !== 'string' || !relative || relative.includes('\\') || /[\x00-\x1f\x7f]/.test(relative) || path.isAbsolute(relative) || relative.split('/').some(p=>p==='..' || p==='.' || !p)) throw new Error('Unsafe relative path');
  return relative;
}
export function noSymlinks(root, target) {
  if (!inside(root,target)) throw new Error('Path escapes its managed root');
  let current = root;
  if (fs.lstatSync(root).isSymbolicLink()) throw new Error('Managed root is a symlink');
  for (const part of path.relative(root,target).split(path.sep).filter(Boolean)) {
    current=path.join(current,part);
    if (fs.existsSync(current) ? fs.lstatSync(current).isSymbolicLink() : (()=>{try{return fs.lstatSync(current).isSymbolicLink();}catch(e){if(e.code==='ENOENT')return false;throw e;}})()) throw new Error('Refusing a symlink in a managed path');
  }
}
export function walk(root, {skip=()=>false, file=()=>true}={}) {
  const out=[];
  if (!fs.existsSync(root)) return out;
  function visit(dir) {
    for(const entry of fs.readdirSync(dir,{withFileTypes:true}).sort((a,b)=>a.name.localeCompare(b.name))) {
      const full=path.join(dir,entry.name);
      if(entry.isSymbolicLink() || skip(full,entry)) continue;
      if(entry.isDirectory()) visit(full); else if(entry.isFile() && file(full)) out.push(full);
    }
  }
  visit(root);return out;
}
let loadedConfig;
export function config() {
  if(loadedConfig)return loadedConfig;
  const publicConfig=json(at('brain.config.json'));
  const local=readJSON(at('brain.config.local.json'));
  loadedConfig={...publicConfig,...local,toolchain:{...publicConfig.toolchain,...local.toolchain}};
  return loadedConfig;
}
export function args(argv) {
  const positional=[], flags={};
  const bool=new Set(['yes','dry-run','recommended','copy','staged','stdin','seed','force','json','help','all','fetch','retry-failures']);
  for(let i=0;i<argv.length;i++) {
    if(!argv[i].startsWith('--')){positional.push(argv[i]);continue;}
    const [key,inline]=argv[i].slice(2).split(/=(.*)/s);
    if(Object.hasOwn(flags,key))throw new Error(`Duplicate option --${key}`);
    if(bool.has(key))flags[key]=true;
    else {const value=inline ?? argv[++i];if(!value || value.startsWith('--'))throw new Error(`Missing value for --${key}`);flags[key]=value;}
  }
  return {positional,flags};
}
export function withLock(fn) {
  return (async()=>{
    const file=at('.state/mutation.lock');mkdir(at('.state'),0o700);
    let descriptor;
    try {descriptor=fs.openSync(file,'wx',0o600);fs.writeFileSync(descriptor,JSON.stringify({pid:process.pid,startedAt:now()}));}
    catch(error){
      if(error.code!=='EEXIST')throw error;
      const owner=readJSON(file,{pid:0});
      if(owner.pid){try{process.kill(owner.pid,0);throw new Error('Another brain mutation is running');}catch(e){if(e.code!=='ESRCH')throw e;}}
      fs.rmSync(file);return withLock(fn);
    }
    try{return await fn();}finally{fs.closeSync(descriptor);fs.rmSync(file,{force:true});}
  })();
}
export function log(event,details={}) {
  const dir=at('.state/logs');mkdir(dir,0o700);
  const file=path.join(dir,now().slice(0,10)+'.jsonl');
  fs.appendFileSync(file,JSON.stringify({at:now(),event,...details})+'\n',{mode:0o600});
  for(const old of fs.readdirSync(dir))if(/^\d{4}-\d\d-\d\d\.jsonl$/.test(old) && Date.now()-Date.parse(old.slice(0,10))>30*86400000)fs.rmSync(path.join(dir,old));
}
export function object(bytes) {
  const digest=sha(bytes),file=at(`.state/objects/${digest}`);
  if(!fs.existsSync(file))atomic(file,bytes,0o600);
  else if(sha(fs.readFileSync(file))!==digest)throw new Error('Corrupt cache object');
  return digest;
}
