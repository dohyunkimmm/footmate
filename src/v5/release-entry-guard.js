import {footmatePlatform} from '../v4/platform/application/platform.js';

const HISTORY_KEY='footmate:release-flow:history:v1';
const LAST_ROUTE_KEY='footmate:release-flow:last-route:v1';
const params=new URLSearchParams(location.search);
const mode=['guided','evidence'].includes(params.get('mode'))?params.get('mode'):'real';
const embed=params.get('embed')==='1';
const internalResume=params.get('resume')==='1'||params.get('oauth_return')==='1';
const navigation=performance.getEntriesByType('navigation')[0];
const navigationType=navigation?.type||'navigate';
const isFreshEntry=mode==='real'&&!embed&&!internalResume&&navigationType==='navigate';

if(isFreshEntry){
  const current=footmatePlatform.session.read()||{};
  footmatePlatform.session.write({...current,route:'welcome',setupStep:0});
  sessionStorage.removeItem(HISTORY_KEY);
  sessionStorage.removeItem(LAST_ROUTE_KEY);
}

document.documentElement.dataset.footmateFreshEntry=isFreshEntry?'reset':'preserved';
