import {PROVIDER_CONTRACTS} from '../../v4/platform/domain/release-candidate.js';
import {createProviderMocks} from '../../v4/platform/infrastructure/provider-mocks.js';

const names=Object.freeze(Object.keys(PROVIDER_CONTRACTS));
function inspectProvider(name,provider){
  const contract=PROVIDER_CONTRACTS[name];
  const missing=contract.methods.filter(method=>typeof provider?.[method]!=='function');
  if(missing.length)throw new TypeError(`${name} provider missing: ${missing.join(', ')}`);
  if(provider?.external===true&&provider?.connected!==true)throw new TypeError(`${name} external provider must declare connected:true`);
  const connected=provider?.external===true&&provider?.connected===true;
  return Object.freeze({name,mode:connected?'connected':'mock',external:connected,connected,methods:contract.methods});
}

export function createProviderRegistry({providers={},mockOptions={}}={}){
  const defaults=createProviderMocks(mockOptions);
  const resolved=Object.freeze(Object.fromEntries(names.map(name=>[name,providers[name]||defaults[name]])));
  const catalog=Object.freeze(Object.fromEntries(names.map(name=>[name,inspectProvider(name,resolved[name])])));
  const connectedNames=Object.freeze(names.filter(name=>catalog[name].connected));
  const mockNames=Object.freeze(names.filter(name=>!catalog[name].connected));
  async function execute(name,method,input={}){
    if(!catalog[name])throw new TypeError(`Unknown provider: ${name}`);
    if(!catalog[name].methods.includes(method))throw new TypeError(`Unsupported provider method: ${name}.${method}`);
    return resolved[name][method](input);
  }
  return Object.freeze({
    names,
    catalog,
    connectedNames,
    mockNames,
    externalProductionFeatures:connectedNames.length>0,
    mode:connectedNames.length===0?'mock-only':mockNames.length===0?'connected':'hybrid',
    productionClaims:()=>connectedNames.slice(),
    execute
  });
}
