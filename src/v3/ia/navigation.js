export const RELEASE_VERSION='3.0.0';

export const PRIMARY_DESTINATIONS=Object.freeze([
  Object.freeze({
    id:'discover',
    label:'탐색',
    shortLabel:'탐색',
    description:'조건을 정하고 오늘의 경기를 찾습니다.',
    icon:'discover',
    target:'s-home',
    screens:Object.freeze(['s-home','s-filter'])
  }),
  Object.freeze({
    id:'recommendations',
    label:'추천',
    shortLabel:'추천',
    description:'추천 후보와 근거를 비교합니다.',
    icon:'recommendations',
    target:'s-results',
    screens:Object.freeze(['s-results','s-detail','s-reason'])
  }),
  Object.freeze({
    id:'participation',
    label:'참가',
    shortLabel:'참가',
    description:'결제부터 경기 당일까지 상태를 확인합니다.',
    icon:'participation',
    target:'s-pay',
    screens:Object.freeze(['s-pay','s-pay-low','s-charge','s-charge-done','s-confirm','s-notifs','s-checkin','s-gameday','s-postgame','s-eval','s-eloUpdate'])
  }),
  Object.freeze({
    id:'profile',
    label:'내 정보',
    shortLabel:'MY',
    description:'프로필과 커뮤니티 활동을 확인합니다.',
    icon:'profile',
    target:'s-profile',
    screens:Object.freeze(['s-profile','s-chat','s-friends','s-friend','s-notif','s-notifications','s-settings'])
  })
]);

export const ONBOARDING_SCREENS=Object.freeze([
  's-splash','s-sso','s-quiz','s-location','s-manual-location','s-elo'
]);

const destinationByScreen=new Map();
PRIMARY_DESTINATIONS.forEach(destination=>{
  destination.screens.forEach(screenId=>destinationByScreen.set(screenId,destination.id));
});

const titleByScreen=Object.freeze({
  's-home':'오늘의 경기',
  's-filter':'경기 조건',
  's-results':'추천 경기',
  's-detail':'경기 상세',
  's-reason':'추천 근거',
  's-pay':'참가 확인',
  's-pay-low':'크레딧 확인',
  's-charge':'크레딧 충전',
  's-charge-done':'충전 완료',
  's-confirm':'참가 완료',
  's-notifs':'알림',
  's-checkin':'체크인',
  's-gameday':'경기 진행',
  's-postgame':'경기 결과',
  's-eval':'경기 평가',
  's-eloUpdate':'ELO 업데이트',
  's-profile':'내 정보',
  's-chat':'메시지'
});

export function isOnboardingScreen(screenId=''){
  return ONBOARDING_SCREENS.includes(screenId);
}

export function destinationForScreen(screenId='',fallback='discover'){
  if(destinationByScreen.has(screenId))return destinationByScreen.get(screenId);
  if(/^s-(pay|charge|confirm|notif|checkin|gameday|postgame|eval)/.test(screenId))return'participation';
  if(/^s-(result|detail|reason|match)/.test(screenId))return'recommendations';
  if(/^s-(profile|chat|friend|setting)/.test(screenId))return'profile';
  if(/^s-(home|filter)/.test(screenId))return'discover';
  return PRIMARY_DESTINATIONS.some(item=>item.id===fallback)?fallback:'discover';
}

export function targetForDestination(destinationId){
  return PRIMARY_DESTINATIONS.find(item=>item.id===destinationId)?.target||'s-home';
}

export function destinationMeta(destinationId){
  return PRIMARY_DESTINATIONS.find(item=>item.id===destinationId)||PRIMARY_DESTINATIONS[0];
}

export function titleForScreen(screenId='',destinationId='discover'){
  return titleByScreen[screenId]||destinationMeta(destinationId).label;
}
