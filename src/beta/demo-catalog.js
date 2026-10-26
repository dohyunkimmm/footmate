// Isolated preview data. Never inserted into the live match/participation tables.
export const isDemoEntry=location.pathname.replace(/\/$/,'')==='/demo';
const KEY='footmate:beta:demo-participations:v1';
const templates=[
 ['영통 저녁 풋살','수원 · 영통','영통 데모 풋살장','중급','6 vs 6',20],
 ['인계 가볍게 한 경기','수원 · 인계','인계 데모 풋살장','입문','5 vs 5',19],
 ['영통 주말 풋살','수원 · 영통','영통 데모 풋살장','초중급','6 vs 6',18],
 ['기흥 저녁 풋살','용인 · 기흥','기흥 데모 풋살장','중급','6 vs 6',20],
 ['강남 퇴근 후 풋살','서울 · 강남','강남 데모 풋살장','초중급','5 vs 5',21],
 ['영통 초보 풋살','수원 · 영통','영통 데모 풋살장','입문','6 vs 6',20],
 ['기흥 처음 시작하는 풋살','용인 · 기흥','기흥 데모 풋살장','입문','6 vs 6',19],
 ['인계 주말 풋살','수원 · 인계','인계 데모 풋살장','초중급','6 vs 6',18]
];
for(const [region,venue] of [['수원 · 영통','영통'],['수원 · 인계','인계'],['용인 · 기흥','기흥'],['서울 · 강남','강남']]){
 for(const [i,level] of ['입문','초중급','중급','중급+'].entries()){
  templates.push([`${venue} ${level} 저녁 풋살`,region,`${venue} 데모 풋살장`,level,i%2?'5 vs 5':'6 vs 6',20+i%2]);
 }
}
export function isFutsalMatch(match){
 const format=String(match.format_label||match.format||'');
 return /풋살|futsal/i.test(format)||/^([56])\s*(?:vs?\.?|:|대)\s*\1$/i.test(format);
}
function read(){try{const rows=JSON.parse(localStorage.getItem(KEY)||'[]');return Array.isArray(rows)?rows.filter(p=>p&&typeof p.user_id==='string'&&String(p.match_id).startsWith('demo-')):[]}catch{return[]}}
export function demoParticipations(userId){return userId?read().filter(p=>p.user_id===userId):[]}
export function demoCatalog(userId='',now=Date.now()){
 const seoul=new Date(now+9*3600000),mine=demoParticipations(userId);
 const rows=templates.map(([title,region,venue_name,level,format_label,hour],i)=>{
  const starts=new Date(Date.UTC(seoul.getUTCFullYear(),seoul.getUTCMonth(),seoul.getUTCDate()+1+i%4,hour-9));
  const five=format_label==='5 vs 5',id=`demo-${i+1}-${starts.toISOString().slice(0,10)}`;
  const capacities=five?[3,3,3,1]:[4,3,4,1],left=five?[1,1,2,1]:[2,1,2,1];
  const own=mine.find(p=>p.match_id===id&&p.status==='confirmed');
  const match_slots=['MF','FW','DF','GK'].map((position,j)=>({position,capacity_total:capacities[j],joined_count:capacities[j]-left[j]+(own?.position===position?1:0),remaining_spots:left[j]-(own?.position===position?1:0)}));
  const capacity_total=capacities.reduce((a,b)=>a+b,0),joined_count=match_slots.reduce((a,s)=>a+s.joined_count,0);
  return{id,title,region,area_label:region.split(' · ')[1],venue_name,address:'',level,format_label,starts_at:starts.toISOString(),price_krw:0,capacity_total,joined_count,remaining_spots:capacity_total-joined_count,positions:['MF','FW','DF','GK'],match_slots,surface:'인조잔디',duration_minutes:80,status:'open',is_demo:true};
 });
 for(const p of mine)if(p.match_snapshot&&isFutsalMatch(p.match_snapshot)&&!rows.some(m=>m.id===p.match_id))rows.push(p.match_snapshot);
 return rows;
}
export function joinDemoMatch(userId,matchId,position){
 if(!userId)throw new Error('로그인 후 참가해주세요.');
 const match=demoCatalog(userId).find(m=>m.id===matchId),slot=match?.match_slots.find(s=>s.position===position);
 if(!match||new Date(match.starts_at)<=new Date()||!slot||slot.remaining_spots<=0)throw new Error('참가할 수 있는 자리가 없어요.');
 const rows=read(),existing=rows.find(p=>p.user_id===userId&&p.match_id===matchId);
 if(existing?.status==='confirmed')return;
 const record={id:`${userId}:${matchId}`,user_id:userId,match_id:matchId,position,status:'confirmed',joined_at:new Date().toISOString(),match_snapshot:match,is_demo:true};
 localStorage.setItem(KEY,JSON.stringify([...rows.filter(p=>p!==existing),record]));
 window.dispatchEvent(new Event('footmate:beta:demo-changed'));
}
export function cancelDemoMatch(userId,matchId){localStorage.setItem(KEY,JSON.stringify(read().map(p=>p.user_id===userId&&p.match_id===matchId?{...p,status:'canceled'}:p)));window.dispatchEvent(new Event('footmate:beta:demo-changed'))}

