export const RETURN_DOMAIN=Object.freeze({
  name:'return',
  version:'5.0.0',
  owns:Object.freeze(['postgameFeedback','completionHistory','repeatIntent']),
  events:Object.freeze(['postgame.submitted'])
});

export function normalizeReturnState(candidate={}){
  return Object.freeze({
    completed:candidate.completed===true,
    matchId:typeof candidate.matchId==='string'&&candidate.matchId?candidate.matchId:null,
    repeatIntent:typeof candidate.repeatIntent==='boolean'?candidate.repeatIntent:null
  });
}
