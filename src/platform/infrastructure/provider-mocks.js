import {PROVIDER_CONTRACTS,RELEASE_CANDIDATE_VERSION} from '../domain/release-candidate.js';

export function createProviderMock(name,{now=()=>new Date('2026-09-20T00:00:00.000Z'),fixtures={}}={}){
  const contract=PROVIDER_CONTRACTS[name];
  if(!contract)throw new TypeError(`Unknown provider mock: ${name}`);
  const log=[];
  const provider={
    name,
    kind:'mock',
    version:RELEASE_CANDIDATE_VERSION,
    external:false,
    calls:()=>log.map(entry=>({...entry,input:{...entry.input}}))
  };
  for(const method of contract.methods){
    provider[method]=async(input={})=>{
      const at=(typeof now==='function'?now():new Date(now));
      const occurredAt=at instanceof Date?at.toISOString():new Date(at).toISOString();
      const entry={provider:name,method,occurredAt,input:input&&typeof input==='object'?{...input}:{}};
      log.push(entry);
      return Object.freeze({provider:name,method,status:'simulated',external:false,fixture:fixtures[method]??null,input:entry.input});
    };
  }
  return Object.freeze(provider);
}

export function createProviderMocks(options={}){
  return Object.freeze(Object.fromEntries(Object.keys(PROVIDER_CONTRACTS).map(name=>[name,createProviderMock(name,options[name])])));
}
