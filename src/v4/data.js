export const RELEASE_VERSION='4.4.0';
export const RELEASE_NAME='Matchday Companion';
export const RELEASE_STAGE='stable';
// Kept as an internal compatibility export for the v4 runtime module.
export const NEXT_RELEASE=RELEASE_VERSION;
export const NEXT_STORAGE_KEY='footmate:v4:session';

function sampleSchedule(offsetDays,time){
  const date=new Date();
  date.setHours(12,0,0,0);
  date.setDate(date.getDate()+offsetDays);
  const day=new Intl.DateTimeFormat('ko-KR',{month:'long',day:'numeric'}).format(date);
  const weekday=new Intl.DateTimeFormat('ko-KR',{weekday:'short'}).format(date);
  return Object.freeze({dateLabel:`샘플 일정 · ${day} · ${time}`,shortDate:`${weekday} · ${time}`});
}
const SAMPLE_SCHEDULES=Object.freeze([
  sampleSchedule(1,'20:00'),
  sampleSchedule(2,'21:30'),
  sampleSchedule(3,'19:00'),
  sampleSchedule(2,'20:30'),
  sampleSchedule(1,'20:00'),
  sampleSchedule(3,'21:00'),
  sampleSchedule(2,'19:30'),
  sampleSchedule(4,'21:00')
]);

function slots(values){return Object.freeze(values)}
function people(values){return Object.freeze(values)}
function reasons(values){return Object.freeze(values.map(item=>Object.freeze(item)))}

export const MATCHES=Object.freeze([
  Object.freeze({id:'suwon-ingye-2000',...SAMPLE_SCHEDULES[0],region:'수원 · 인계',place:'수원 인계 풋살파크',area:'수원 인계동',address:'경기 수원시 팔달구 인계로 126',level:'중급',distance:'15분',distanceMin:15,positionSlots:slots({MF:1,FW:0,DF:1,GK:0}),fit:'내 레벨과 잘 맞아요',spot:'MF 1자리',price:12000,joined:8,capacity:10,format:'6 vs 6',surface:'인조잔디',duration:'90분',reasons:reasons([{title:'비슷한 경기 레벨',detail:'최근 경기 ELO 범위와 가장 가깝습니다.',icon:'level'},{title:'이동 부담이 적어요',detail:'설정한 생활권에서 약 15분 거리입니다.',icon:'pin'},{title:'원하는 포지션이 남았어요',detail:'선호한 MF 포지션에 1자리가 남아 있습니다.',icon:'position'}]),participants:people(['MJ','KH','SY','JW','DK'])}),
  Object.freeze({id:'gwanggyo-2130',...SAMPLE_SCHEDULES[1],region:'수원 · 영통',place:'광교 웨스트파크',area:'수원 광교',address:'경기 수원시 영통구 광교중앙로 145',level:'중급+',distance:'22분',distanceMin:22,positionSlots:slots({MF:2,FW:0,DF:1,GK:1}),fit:'도전하기 좋은 경기',spot:'MF 2자리',price:13000,joined:7,capacity:10,format:'6 vs 6',surface:'인조잔디',duration:'90분',reasons:reasons([{title:'한 단계 높은 강도',detail:'현재 레벨보다 약간 높은 경기로 분류됩니다.',icon:'level'},{title:'선호 시간대와 일치',detail:'평일 저녁 선호 시간에 맞는 경기입니다.',icon:'clock'},{title:'포지션 선택 여유',detail:'MF 포지션에 아직 2자리가 남아 있습니다.',icon:'position'}]),participants:people(['SH','YR','JH','MS'])}),
  Object.freeze({id:'yeongtong-1900',...SAMPLE_SCHEDULES[2],region:'수원 · 영통',place:'영통 스타필드 코트',area:'수원 영통',address:'경기 수원시 영통구 봉영로 1579',level:'중급',distance:'12분',distanceMin:12,positionSlots:slots({MF:0,FW:1,DF:1,GK:0}),fit:'가볍게 뛰기 좋아요',spot:'FW 1자리',price:11000,joined:9,capacity:10,format:'5 vs 5',surface:'인조잔디',duration:'80분',reasons:reasons([{title:'가장 가까운 경기',detail:'설정한 생활권 기준으로 가장 가깝습니다.',icon:'pin'},{title:'비슷한 경기 레벨',detail:'최근 경기 레벨과 유사한 그룹입니다.',icon:'level'},{title:'빠르게 확정 가능',detail:'마감 직전 1자리가 남아 있습니다.',icon:'clock'}]),participants:people(['HJ','YK','TW','JS','HM'])}),
  Object.freeze({id:'maetan-2030',...SAMPLE_SCHEDULES[3],region:'수원 · 인계',place:'매탄 밸런스 풋살',area:'수원 매탄동',address:'경기 수원시 영통구 매탄로 102',level:'초중급',distance:'18분',distanceMin:18,positionSlots:slots({MF:0,FW:1,DF:1,GK:1}),fit:'편하게 시작하기 좋아요',spot:'GK 1자리',price:10000,joined:8,capacity:10,format:'5 vs 5',surface:'인조잔디',duration:'80분',reasons:reasons([{title:'부담 적은 경기 강도',detail:'기본 플레이에 익숙한 참가자 중심 경기입니다.',icon:'level'},{title:'인계 생활권과 가까워요',detail:'인계·권선·매탄 생활권에서 이동하기 좋습니다.',icon:'pin'},{title:'골키퍼 자리가 열려 있어요',detail:'GK 포지션에 1자리가 남아 있습니다.',icon:'position'}]),participants:people(['AN','EB','HS','JK'])}),
  Object.freeze({id:'giheung-2000',...SAMPLE_SCHEDULES[4],region:'용인 · 기흥',place:'기흥 리버 풋살아레나',area:'용인 기흥',address:'경기 용인시 기흥구 구갈로 74',level:'초중급',distance:'17분',distanceMin:17,positionSlots:slots({MF:1,FW:0,DF:1,GK:1}),fit:'기본기에 맞는 경기',spot:'MF 1자리',price:11000,joined:7,capacity:10,format:'6 vs 6',surface:'인조잔디',duration:'90분',reasons:reasons([{title:'기흥 생활권 경기',detail:'기흥·보정·죽전 생활권에서 접근하기 좋습니다.',icon:'pin'},{title:'초중급 템포',detail:'기본 플레이에 익숙한 참가자에게 맞는 강도입니다.',icon:'level'},{title:'MF·GK 선택 가능',detail:'선호 포지션을 선택할 여유가 있습니다.',icon:'position'}]),participants:people(['JY','PN','SR','WG'])}),
  Object.freeze({id:'jukjeon-2100',...SAMPLE_SCHEDULES[5],region:'용인 · 기흥',place:'죽전 플레이돔',area:'용인 죽전',address:'경기 용인시 수지구 죽전로 152',level:'중급+',distance:'24분',distanceMin:24,positionSlots:slots({MF:0,FW:2,DF:1,GK:0}),fit:'빠른 템포를 원할 때',spot:'FW 2자리',price:13000,joined:7,capacity:10,format:'6 vs 6',surface:'인조잔디',duration:'90분',reasons:reasons([{title:'빠른 경기 템포',detail:'중급 이상 플레이어가 많은 경기입니다.',icon:'level'},{title:'FW 선택 여유',detail:'FW 포지션에 2자리가 남아 있습니다.',icon:'position'},{title:'죽전 저녁 경기',detail:'퇴근 후 이동 가능한 저녁 시간대입니다.',icon:'clock'}]),participants:people(['CY','DH','KM','RL'])}),
  Object.freeze({id:'gangnam-1930',...SAMPLE_SCHEDULES[6],region:'서울 · 강남',place:'강남 테헤란 풋살랩',area:'서울 강남',address:'서울 강남구 테헤란로 231',level:'중급',distance:'16분',distanceMin:16,positionSlots:slots({MF:1,FW:1,DF:0,GK:1}),fit:'퇴근 후 바로 뛰기 좋아요',spot:'MF 1자리',price:15000,joined:8,capacity:10,format:'6 vs 6',surface:'인조잔디',duration:'90분',reasons:reasons([{title:'강남 생활권 경기',detail:'강남·서초·송파 생활권에서 접근하기 좋습니다.',icon:'pin'},{title:'중급 템포',detail:'정기적으로 경기하는 플레이어에게 맞는 강도입니다.',icon:'level'},{title:'여러 포지션 선택 가능',detail:'MF·FW·GK 포지션에 자리가 남아 있습니다.',icon:'position'}]),participants:people(['BK','HN','SM','YL','QJ'])}),
  Object.freeze({id:'songpa-2100',...SAMPLE_SCHEDULES[7],region:'서울 · 강남',place:'잠실 리턴 풋살파크',area:'서울 송파',address:'서울 송파구 올림픽로 240',level:'입문',distance:'26분',distanceMin:26,positionSlots:slots({MF:0,FW:2,DF:1,GK:1}),fit:'처음 시작하기 편해요',spot:'GK 1자리',price:12000,joined:6,capacity:10,format:'5 vs 5',surface:'인조잔디',duration:'80분',reasons:reasons([{title:'입문자 중심 경기',detail:'처음 시작하거나 천천히 익히는 플레이어 중심입니다.',icon:'level'},{title:'송파 생활권 경기',detail:'강남권 설정에서 함께 추천하는 송파 경기입니다.',icon:'pin'},{title:'GK 포함 포지션 여유',detail:'여러 포지션에 참가 여유가 있습니다.',icon:'position'}]),participants:people(['NR','SJ','UE'])})
]);

export const DEFAULT_STATE=Object.freeze({route:'welcome',setupStep:0,setupComplete:false,region:'수원 · 영통',position:'MF',level:'중급',signedIn:false,joinedMatchId:null,matchStage:'discover',selectedMatchId:MATCHES[0].id,userName:'게스트'});
export function createState(saved={}){return {...DEFAULT_STATE,...saved}}
export function selectedMatch(state){return MATCHES.find(match=>match.id===state.selectedMatchId)||MATCHES[0]}
export function joinedMatch(state){return MATCHES.find(match=>match.id===state.joinedMatchId)||null}
