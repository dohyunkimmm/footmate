import {RECOMMENDATION_DOMAIN,normalizeRecommendationState} from './recommendation.js';
import {PARTICIPATION_DOMAIN,normalizeParticipationState} from './participation.js';
import {MATCHDAY_DOMAIN,normalizeMatchdayState} from './matchday.js';
import {RETURN_DOMAIN,normalizeReturnState} from './return.js';

export const CONNECTED_PLATFORM_VERSION='5.2.0';
export const JOURNEY_CONTRACT=Object.freeze(['Find','Decide','Join','Play','Return']);
export const DOMAIN_OWNERSHIP=Object.freeze({recommendation:RECOMMENDATION_DOMAIN,participation:PARTICIPATION_DOMAIN,matchday:MATCHDAY_DOMAIN,return:RETURN_DOMAIN});

export function evaluateJourneyConsistency(candidate={}){
  const recommendation=normalizeRecommendationState(candidate.recommendation);
  const participation=normalizeParticipationState(candidate.participation);
  const matchday=normalizeMatchdayState(candidate.matchday);
  const returnState=normalizeReturnState(candidate.returnState||candidate.return);
  const problems=[];
  if(recommendation.selectedMatchId&&participation.matchId&&recommendation.selectedMatchId!==participation.matchId)problems.push('selected-participation-mismatch');
  if(participation.status==='success'&&!participation.matchId)problems.push('success-without-match');
  if(matchday.matchId&&participation.matchId&&matchday.matchId!==participation.matchId)problems.push('participation-matchday-mismatch');
  if(matchday.status==='checked-in'&&participation.status!=='success')problems.push('checkin-without-successful-participation');
  if(returnState.matchId&&matchday.matchId&&returnState.matchId!==matchday.matchId)problems.push('matchday-return-mismatch');
  if(returnState.completed&&matchday.status!=='checked-in')problems.push('return-without-checkin');
  return Object.freeze({version:CONNECTED_PLATFORM_VERSION,valid:problems.length===0,problems:Object.freeze(problems),domains:Object.freeze({recommendation,participation,matchday,return:returnState})});
}
