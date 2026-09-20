import {connectedMatchdayPlatform} from '../application/connected-platform.js';

const root=document.getElementById('footmate-next');
document.documentElement.dataset.footmateV5Version=connectedMatchdayPlatform.version;
if(root){
  root.dataset.connectedPlatformVersion=connectedMatchdayPlatform.version;
  root.dataset.connectionMode=connectedMatchdayPlatform.connectionMode;
  root.dataset.domainOwnership='separated';
  root.dataset.providerBoundary='explicit';
}

const readJson=(key)=>{try{return JSON.parse(localStorage.getItem(key)||'{}')}catch{return {}}};
function currentJourneyCandidate(){
  const session=readJson('footmate:v4:session');
  const participation=readJson('footmate:v4:participation');
  const matchday=readJson('footmate:v4:matchday');
  const returnLoop=readJson('footmate:v4:return');
  return {
    recommendation:{selectedMatchId:session.selectedMatchId||participation.matchId||null},
    participation:{status:participation.status||'idle',matchId:participation.matchId||session.joinedMatchId||null,attemptId:participation.attemptId||null},
    matchday:{status:matchday.status||matchday.stage||'idle',matchId:matchday.matchId||session.joinedMatchId||null},
    returnState:{completed:Boolean(returnLoop.completed||returnLoop.submittedAt),matchId:returnLoop.matchId||session.joinedMatchId||null,repeatIntent:returnLoop.repeatIntent}
  };
}

window.__FOOTMATE_V5__=Object.freeze({
  version:connectedMatchdayPlatform.version,
  architecture:connectedMatchdayPlatform.architecture,
  connectionMode:connectedMatchdayPlatform.connectionMode,
  connectedProviders:connectedMatchdayPlatform.connectedProviders,
  mockProviders:connectedMatchdayPlatform.mockProviders,
  externalProductionFeatures:connectedMatchdayPlatform.externalProductionFeatures,
  domains:Object.freeze(Object.keys(connectedMatchdayPlatform.domains)),
  providerCatalog:connectedMatchdayPlatform.providers.catalog,
  evaluateJourney:candidate=>connectedMatchdayPlatform.evaluateJourney(candidate),
  validateCurrentJourney:()=>connectedMatchdayPlatform.evaluateJourney(currentJourneyCandidate()),
  executeProvider:(name,method,input)=>connectedMatchdayPlatform.executeProvider(name,method,input)
});
