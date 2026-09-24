export const RECOMMENDATION_DOMAIN=Object.freeze({
  name:'recommendation',
  version:'5.2.0',
  owns:Object.freeze(['preferences','rankedMatches','selectedMatchId','recommendationReason']),
  events:Object.freeze(['recommendation.selected'])
});

export {rankRecommendations,recommendationFor} from './recommendation-engine.js';

export function normalizeRecommendationState(candidate={}){
  return Object.freeze({
    selectedMatchId:typeof candidate.selectedMatchId==='string'&&candidate.selectedMatchId?candidate.selectedMatchId:null,
    preferenceProfile:candidate.preferenceProfile&&typeof candidate.preferenceProfile==='object'?{...candidate.preferenceProfile}:null
  });
}
