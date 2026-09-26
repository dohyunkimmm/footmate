import '../../../v5/home-entry-polish.js';
import {footmatePlatform} from '../application/platform.js';

const root=document.getElementById('footmate-next');
const migration=footmatePlatform.session.migrate();
if(root){
  root.dataset.platformVersion=footmatePlatform.version;
  root.dataset.sessionSchemaVersion=String(footmatePlatform.sessionSchemaVersion);
  root.dataset.platformProvider='local-browser';
  root.dataset.storageNamespace='version-neutral';
  root.dataset.storageCompatibility=footmatePlatform.storageCompatibility.installed||footmatePlatform.storageCompatibility.reused?'legacy-mirror':'repository-only';
}

const session=()=>footmatePlatform.session.read()||{};
const participation=()=>footmatePlatform.repositories.participation.read({})||{};
const returnState=()=>footmatePlatform.repositories.returnLoop.read({})||{};

function recordCompletedJoin(){
  const state=participation();
  if(state.status!=='success'||!state.matchId)return null;
  const key=`join.completed:${state.attemptId||state.confirmationId||state.matchId}`;
  return footmatePlatform.events.record('join.completed',{matchId:state.matchId,confirmationId:state.confirmationId||null,attemptNumber:state.attemptNumber||0},{dedupeKey:key});
}

document.addEventListener('click',event=>{
  const recommendation=event.target.closest('[data-action="open-match"]');
  if(recommendation?.dataset.matchId){
    footmatePlatform.events.record('recommendation.selected',{matchId:recommendation.dataset.matchId,route:session().route||null});
    return;
  }
  const join=event.target.closest('[data-action="confirm-payment"],[data-participation-action="retry-payment"]');
  if(join&&!join.disabled){
    const state=participation();
    const current=session();
    footmatePlatform.events.record('join.started',{matchId:state.matchId||current.selectedMatchId||null,paymentMethod:state.paymentMethod||null,attemptNumber:Number(state.attemptNumber||0)+1});
    return;
  }
  const checkin=event.target.closest('[data-matchday-action="checkin"]');
  if(checkin&&!checkin.disabled){
    const matchId=session().joinedMatchId||null;
    footmatePlatform.events.record('checkin.completed',{matchId},{dedupeKey:`checkin.completed:${matchId||'none'}`});
    return;
  }
  const postgame=event.target.closest('[data-return-action="save"]');
  if(postgame&&!postgame.disabled){
    const current=session();
    const stored=returnState();
    const draft=stored.draft&&typeof stored.draft==='object'?stored.draft:{};
    const matchId=current.joinedMatchId||draft.matchId||null;
    footmatePlatform.events.record('postgame.submitted',{matchId,difficulty:draft.difficulty||null,repeatIntent:typeof draft.repeatIntent==='boolean'?draft.repeatIntent:null},{dedupeKey:`postgame.submitted:${matchId||'none'}`});
  }
},true);

queueMicrotask(recordCompletedJoin);
window.__FOOTMATE_PLATFORM__=Object.freeze({
  version:footmatePlatform.version,
  provider:'local-browser',
  externalAnalytics:false,
  sessionSchemaVersion:footmatePlatform.sessionSchemaVersion,
  eventSchemaVersion:footmatePlatform.eventSchemaVersion,
  storageKeys:footmatePlatform.storageKeys,
  legacyStorageKeys:footmatePlatform.legacyStorageKeys,
  storageMigration:footmatePlatform.storageMigration,
  storageCompatibility:footmatePlatform.storageCompatibility,
  migration,
  readSession:()=>footmatePlatform.session.read(),
  readEvents:()=>footmatePlatform.events.read(),
  clearEvents:()=>footmatePlatform.events.clear(),
  recordEvent:(name,payload,options)=>footmatePlatform.events.record(name,payload,options),
  recordCompletedJoin
});