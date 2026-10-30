// Only authenticated real Beta accounts sync conditions. Demo and guest inputs stay local.
export const DEFAULT_SYNC_PREFERENCES=Object.freeze({sport:'futsal',region:'',level:'',position:'',afterTime:'',beforeTime:'',dateWindow:''});
const allowed={
 level:['','입문','초중급','중급','중급+'],
 position:['','MF','FW','DF','GK'],
 afterTime:['','09:00','14:00','18:00','20:00'],
 beforeTime:['','12:00','18:00','22:00'],
 dateWindow:['','today','tomorrow','weekend']
};
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export function cleanSyncPreferences(input){
 if(!input||typeof input!=='object'||Array.isArray(input))return null;
 const region=typeof input.region==='string'?input.region.trim():'';
 if(region.length>80)return null;
 for(const [key,values] of Object.entries(allowed)){
  if(!values.includes(input[key]??''))return null;
 }
 return {...DEFAULT_SYNC_PREFERENCES,region,...Object.fromEntries(Object.keys(allowed).map(key=>[key,input[key]||'']))};
}
export function createPreferenceSyncClient({url,publishableKey,fetchImpl=globalThis.fetch}){
 const base=new URL(url);
 if(base.protocol!=='https:')throw new Error('Secure backend URL required');
 const endpoint=base.toString().replace(/\/$/,'')+'/rest/v1/beta_user_preferences';
 async function send(userId,accessToken,options={}){
  if(!uuid.test(String(userId||''))||!String(accessToken||''))throw new Error('Authenticated user required');
  const response=await fetchImpl(endpoint+(options.query||''),{
   method:options.method||'GET',cache:'no-store',
   headers:{apikey:publishableKey,authorization:'Bearer '+accessToken,...(options.body?{'content-type':'application/json',prefer:'resolution=merge-duplicates,return=minimal'}:{})},
   ...(options.body?{body:JSON.stringify(options.body)}:{})
  });
  if(!response.ok)throw new Error('Preference sync unavailable');
  if(options.body)return null;
  return response.json();
 }
 return {
  async load({userId,accessToken}){
   const rows=await send(userId,accessToken,{query:'?select=preferences&user_id=eq.'+encodeURIComponent(userId)+'&limit=1'});
   return cleanSyncPreferences(Array.isArray(rows)?rows[0]?.preferences:null);
  },
  async save({userId,accessToken,preferences}){
   const cleaned=cleanSyncPreferences(preferences);
   if(!cleaned)throw new Error('Invalid preference settings');
   await send(userId,accessToken,{method:'POST',query:'?on_conflict=user_id',body:{user_id:userId,preferences:cleaned}});
   return cleaned;
  }
 };
}
