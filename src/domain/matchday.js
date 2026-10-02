export const MATCHDAY_STATUSES=Object.freeze(['idle','upcoming','matchday','checked-in']);
export const MATCHDAY_DOMAIN=Object.freeze({
  name:'matchday',
  version:'5.0.0',
  owns:Object.freeze(['arrivalStatus','checkinStatus','matchUpdate','matchdayRecovery']),
  events:Object.freeze(['checkin.completed'])
});

export function normalizeMatchdayState(candidate={}){
  const status=MATCHDAY_STATUSES.includes(candidate.status)?candidate.status:'idle';
  return Object.freeze({
    status,
    matchId:typeof candidate.matchId==='string'&&candidate.matchId?candidate.matchId:null
  });
}
