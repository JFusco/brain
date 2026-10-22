import {at,readJSON,sha,now,writeJSON} from './core.mjs';
import {download} from './network.mjs';

const stable=/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/;

export function packageReleaseStatus(spec){
  const saved=readJSON(at(spec.stateFile),{});
  let identity;try{identity=spec.identity();}catch(error){return {ok:false,error:error.message,release:saved};}
  const latest=saved.lastGood?.version;
  const newer=latest?latest.split('.').map(Number).reduce((result,n,i)=>result||Math.sign(n-Number(identity.version.split('.')[i])),0)>0:false;
  return {ok:!saved.lastError,...identity,release:{checkedAt:saved.lastAttempt||null,lastSuccess:saved.lastSuccess||null,latest:latest||null,updateAvailable:latest?newer:null,lastError:saved.lastError||null,lastFailure:saved.lastFailure||null,retryAfter:saved.retryAfter||null},notice:'Release detection never changes the dependency pin or validates vendor claims. Upgrade through an ordinary code change.'};
}

export async function checkPackageRelease(spec){
  // Lookup never calls this. Validate the installed pin before contacting npm.
  spec.identity();
  const saved=readJSON(at(spec.stateFile),{}),time=Date.now();
  if(Date.parse(saved.retryAfter)>time)return {...packageReleaseStatus(spec),skipped:'failure-backoff'};
  if(!saved.lastError&&time-Date.parse(saved.lastSuccess)<24*3600000)return {...packageReleaseStatus(spec),skipped:'checked-within-24-hours'};
  saved.lastAttempt=now();
  try{
    const response=await download(`https://registry.npmjs.org/${encodeURIComponent(spec.name)}/latest`,{hosts:['registry.npmjs.org'],maxBytes:128*1024,headers:{accept:'application/json'}});
    const metadata=JSON.parse(response.bytes);
    if(metadata.name!==spec.name||!stable.test(metadata.version))throw new Error(`Unexpected ${spec.label} release metadata`);
    saved.lastGood={version:metadata.version,metadataSha256:sha(response.bytes)};saved.lastSuccess=now();delete saved.lastError;delete saved.retryAfter;
  }catch(error){saved.lastError=error.message;saved.lastFailure={at:now(),error:error.message};saved.retryAfter=new Date(time+3600000).toISOString();}
  writeJSON(at(spec.stateFile),saved,0o600);return packageReleaseStatus(spec);
}
