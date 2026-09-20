export const PARTICIPATION_STATUSES=Object.freeze(['idle','checkout','pending','failure','canceled','success']);
export const PARTICIPATION_DOMAIN=Object.freeze({
  name:'participation',
  version:'5.0.0',
  owns:Object.freeze(['authIntent','paymentAttempt','participationStatus','joinedMatchId']),
  events:Object.freeze(['join.started','join.completed'])
});

export function normalizeParticipationState(candidate={}){
  const status=PARTICIPATION_STATUSES.includes(candidate.status)?candidate.status:'idle';
  return Object.freeze({
    status,
    matchId:typeof candidate.matchId==='string'&&candidate.matchId?candidate.matchId:null,
    attemptId:typeof candidate.attemptId==='string'&&candidate.attemptId?candidate.attemptId:null
  });
}
