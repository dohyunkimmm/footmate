import {matchesRecommendationConditions} from './recommendation-discovery.js';

// Each alternative changes only the condition named on its button.
export function discoveryRecoveryOptions(matches,preferences,now=Date.now()){
 const alternatives=[
  {key:'date',label:'날짜 조건 해제',changes:{dateWindow:''}},
  {key:'time',label:'시간 조건 해제',changes:{afterTime:'',beforeTime:''}},
  {key:'position',label:'포지션 조건 해제',changes:{position:''}},
  {key:'level',label:'실력 조건 해제',changes:{level:''}},
  {key:'region',label:'지역 조건 해제',changes:{region:''}}
 ];
 return alternatives.filter(item=>Object.keys(item.changes).some(key=>preferences[key])).map(item=>({
  ...item,count:matches.filter(match=>matchesRecommendationConditions(match,{...preferences,...item.changes},now)).length
 })).filter(item=>item.count>0);
}

export function hasInvalidTimeRange(preferences){
 return Boolean(preferences.afterTime&&preferences.beforeTime&&preferences.afterTime>=preferences.beforeTime);
}
