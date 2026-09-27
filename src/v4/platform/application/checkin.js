import {MATCHES} from '../../data.js';
import {footmatePlatform} from './platform.js';

// Product check-in has one durable owner. Old session/interaction fields are read
// only when migrating a record; their compatibility keys remain available.
const repository=footmatePlatform.repositories.matchday;
let pendingMatchId=null;
let failedMatchId=null;
const validTime=value=>typeof value==='string'&&Number.isFinite(Date.parse(value));
const notify=()=>globalThis.dispatchEvent(new Event('footmate:checkin'));

export function readCheckin(now=Date.now()){
  const session=footmatePlatform.session.read()||{};
  const match=MATCHES.find(item=>item.id===session.joinedMatchId);
  if(!match||!session.signedIn)return {status:'unjoined',matchId:null};
  const stored=repository.read({})||{};
  let record=stored.matchId===match.id?stored:{};
  if(record.checkinSchema!==1){
    const legacy=footmatePlatform.repositories.interaction.read({})||{};
    const completed=record.status==='checked-in'||session.checkedInMatchId===match.id||legacy.checkedInMatchId===match.id;
    const oldTime=legacy.checkedInMatchId===match.id?legacy.checkedInAt:session.checkedInAt;
    const checkedInAt=completed&&Number.isFinite(oldTime)&&Math.abs(oldTime)<=8640000000000000?new Date(oldTime).toISOString():null;
    record={...record,matchId:match.id,status:record.status==='canceled'?'canceled':completed?'checked-in':record.status||'upcoming',checkinSchema:1,startsAt:validTime(record.startsAt)?record.startsAt:match.startsAt,checkedInAt,checkinComplete:completed};
    repository.write(record);
  }
  const startsAt=validTime(record.startsAt)?Date.parse(record.startsAt):Date.parse(match.startsAt);
  const opensAt=startsAt-20*60*1000;
  const endsAt=startsAt+parseInt(match.duration,10)*60*1000;
  const participation=footmatePlatform.repositories.participation.read({})||{};
  const canceled=record.status==='canceled'||session.matchStage==='canceled'||(participation.matchId===match.id&&participation.status==='canceled');
  const status=canceled?'canceled':session.matchStage==='postgame'||now>=endsAt?'ended':record.checkinComplete?'completed':now<opensAt?'waiting':pendingMatchId===match.id?'processing':failedMatchId===match.id?'failed':'available';
  return {status,matchId:match.id,startsAt,opensAt,endsAt,checkedInAt:validTime(record.checkedInAt)?record.checkedInAt:null,record};
}

export async function completeCheckin(){
  const before=readCheckin();
  if(!['available','failed'].includes(before.status)||pendingMatchId)return false;
  pendingMatchId=before.matchId;
  failedMatchId=null;
  notify();
  // Yield for the processing state to paint; the actual operation is local demo storage.
  await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
  try{
    const current=readCheckin();
    if(current.matchId!==before.matchId||current.status!=='processing')return false;
    const checkedInAt=new Date().toISOString();
    repository.write({...current.record,status:'checked-in',arrival:'arrived',checkinComplete:true,checkedInAt,updatedAt:checkedInAt});
    const saved=repository.read({})||{};
    if(saved.matchId!==before.matchId||!saved.checkinComplete||saved.checkedInAt!==checkedInAt)throw new Error('Check-in was not saved');
    footmatePlatform.session.patch({checkedInMatchId:before.matchId,checkedInAt:Date.parse(checkedInAt)});
    footmatePlatform.events.record('checkin.completed',{matchId:before.matchId,checkedInAt},{dedupeKey:`checkin.completed:${before.matchId}:${checkedInAt}`});
    return true;
  }catch(_error){
    failedMatchId=before.matchId;
    return false;
  }finally{
    pendingMatchId=null;
    notify();
  }
}

export function checkinCopy(value=readCheckin()){
  const format=time=>new Intl.DateTimeFormat('ko-KR',{month:'long',day:'numeric',hour:'2-digit',minute:'2-digit',hour12:false}).format(new Date(time));
  const copies={
    unjoined:['참가 신청 전','참가를 확정한 뒤 체크인할 수 있어요.'],
    waiting:['체크인 시작 전',`${value.opensAt?format(value.opensAt):''}부터 체크인할 수 있어요.`],
    available:['체크인 가능','경기장에 도착했다면 체크인해주세요.'],
    processing:['체크인 중','완료 상태를 저장하고 있어요.'],
    failed:['체크인 저장 실패','저장하지 못했어요. 다시 시도해주세요.'],
    completed:['체크인 완료',value.checkedInAt?`완료 시간 · ${format(value.checkedInAt)}`:'기존 체크인 완료 기록 · 완료 시간 기록 없음'],
    canceled:['취소됨','취소된 경기는 체크인할 수 없어요.'],
    ended:['경기 종료',value.checkedInAt?`체크인 완료 · ${format(value.checkedInAt)}`:'체크인 시간이 종료됐어요.']
  };
  return copies[value.status];
}
