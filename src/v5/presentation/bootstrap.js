import {connectedMatchdayPlatform} from '../application/connected-platform.js';
import {footmatePlatform} from '../../v4/platform/application/platform.js';

const root=document.getElementById('footmate-next');
const entryParams=new URLSearchParams(location.search);
const entryMode=['guided','evidence'].includes(entryParams.get('mode'))?entryParams.get('mode'):'real';
const entryEmbed=entryParams.get('embed')==='1';
const internalResume=entryParams.get('resume')==='1'||entryParams.get('oauth_return')==='1';
const navigation=performance.getEntriesByType('navigation')[0];
const navigationType=navigation?.type||'navigate';
const isFreshEntry=entryMode==='real'&&!entryEmbed&&!internalResume&&navigationType==='navigate';
if(isFreshEntry){
  const current=footmatePlatform.session.read()||{};
  footmatePlatform.session.write({...current,route:'welcome',setupStep:0});
  sessionStorage.removeItem('footmate:release-flow:history:v1');
  sessionStorage.removeItem('footmate:release-flow:last-route:v1');
}
document.documentElement.dataset.footmateFreshEntry=isFreshEntry?'reset':'preserved';

document.documentElement.dataset.footmateV5Version=connectedMatchdayPlatform.version;
if(root){
  root.dataset.connectedPlatformVersion=connectedMatchdayPlatform.version;
  root.dataset.connectionMode=connectedMatchdayPlatform.connectionMode;
  root.dataset.domainOwnership='separated';
  root.dataset.providerBoundary='explicit';
}

function currentJourneyCandidate(){
  const session=footmatePlatform.session.read()||{};
  const participation=footmatePlatform.repositories.participation.read({})||{};
  const matchday=footmatePlatform.repositories.matchday.read({})||{};
  const returnLoop=footmatePlatform.repositories.returnLoop.read({})||{};
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
