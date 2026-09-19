import{element,badge,metric}from'./primitives.js';
import{destinationMeta,titleForScreen}from'../ia/navigation.js';

function selectedMatch(state){
  return state?.selectedScenario||state?.selectedMatch||null;
}

export function createContextBar({screenId,destinationId,state={}}){
  const destination=destinationMeta(destinationId);
  const section=element('section','fm30-context');
  section.dataset.fm30Slot='context';
  section.setAttribute('aria-label','현재 화면 컨텍스트');

  const heading=element('div','fm30-context-heading');
  heading.append(
    element('span','fm30-context-kicker',destination.label.toUpperCase()),
    element('h1','fm30-context-title',titleForScreen(screenId,destinationId))
  );

  const status=element('div','fm30-context-status');
  const elo=Number(state?.elo);
  if(Number.isFinite(elo))status.append(metric('ELO',elo.toLocaleString()));
  const match=selectedMatch(state);
  if(match?.pct!=null)status.append(metric('매칭',`${match.pct}%`));
  status.append(badge('MATCHDAY','accent'));

  section.append(heading,status);
  return section;
}
