export const NEXT_RELEASE='next-major';
export const NEXT_STORAGE_KEY='footmate:next:session';

export const MATCHES=Object.freeze([
  Object.freeze({
    id:'suwon-ingye-2000',
    dateLabel:'9월 21일 · 20:00',
    shortDate:'월 · 20:00',
    place:'수원 인계 풋살파크',
    area:'수원 인계동',
    address:'경기 수원시 팔달구 인계로 126',
    level:'중급',
    distance:'15분',
    fit:'내 레벨과 잘 맞아요',
    spot:'MF 1자리',
    price:12000,
    joined:8,
    capacity:10,
    format:'6 vs 6',
    surface:'인조잔디',
    duration:'90분',
    reasons:Object.freeze([
      Object.freeze({title:'비슷한 경기 레벨',detail:'최근 경기 ELO 범위와 가장 가깝습니다.',icon:'level'}),
      Object.freeze({title:'이동 부담이 적어요',detail:'설정한 생활권에서 약 15분 거리입니다.',icon:'pin'}),
      Object.freeze({title:'원하는 포지션이 남았어요',detail:'선호한 MF 포지션에 1자리가 남아 있습니다.',icon:'position'})
    ]),
    participants:Object.freeze(['MJ','KH','SY','JW','DK'])
  }),
  Object.freeze({
    id:'gwanggyo-2130',
    dateLabel:'9월 22일 · 21:30',
    shortDate:'화 · 21:30',
    place:'광교 웨스트파크',
    area:'수원 광교',
    address:'경기 수원시 영통구 광교중앙로 145',
    level:'중급+',
    distance:'22분',
    fit:'도전하기 좋은 경기',
    spot:'MF 2자리',
    price:13000,
    joined:7,
    capacity:10,
    format:'6 vs 6',
    surface:'인조잔디',
    duration:'90분',
    reasons:Object.freeze([
      Object.freeze({title:'한 단계 높은 강도',detail:'현재 레벨보다 약간 높은 경기로 분류됩니다.',icon:'level'}),
      Object.freeze({title:'선호 시간대와 일치',detail:'평일 저녁 선호 시간에 맞는 경기입니다.',icon:'clock'}),
      Object.freeze({title:'포지션 선택 여유',detail:'MF 포지션에 아직 2자리가 남아 있습니다.',icon:'position'})
    ]),
    participants:Object.freeze(['SH','YR','JH','MS'])
  }),
  Object.freeze({
    id:'yeongtong-1900',
    dateLabel:'9월 23일 · 19:00',
    shortDate:'수 · 19:00',
    place:'영통 스타필드 코트',
    area:'수원 영통',
    address:'경기 수원시 영통구 봉영로 1579',
    level:'중급',
    distance:'12분',
    fit:'가볍게 뛰기 좋아요',
    spot:'FW 1자리',
    price:11000,
    joined:9,
    capacity:10,
    format:'5 vs 5',
    surface:'인조잔디',
    duration:'80분',
    reasons:Object.freeze([
      Object.freeze({title:'가장 가까운 경기',detail:'설정한 생활권 기준으로 가장 가깝습니다.',icon:'pin'}),
      Object.freeze({title:'비슷한 경기 레벨',detail:'최근 경기 레벨과 유사한 그룹입니다.',icon:'level'}),
      Object.freeze({title:'빠르게 확정 가능',detail:'마감 직전 1자리가 남아 있습니다.',icon:'clock'})
    ]),
    participants:Object.freeze(['HJ','YK','TW','JS','HM'])
  })
]);

export const DEFAULT_STATE=Object.freeze({
  route:'welcome',
  setupStep:0,
  setupComplete:false,
  region:'수원 · 영통',
  position:'MF',
  level:'중급',
  signedIn:false,
  joinedMatchId:null,
  matchStage:'discover',
  selectedMatchId:MATCHES[0].id,
  userName:'도현'
});

export function createState(saved={}){
  return {...DEFAULT_STATE,...saved};
}

export function selectedMatch(state){
  return MATCHES.find(match=>match.id===state.selectedMatchId)||MATCHES[0];
}

export function joinedMatch(state){
  return MATCHES.find(match=>match.id===state.joinedMatchId)||null;
}
