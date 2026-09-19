import{element,icon}from'./primitives.js';

export function createAppNavigation(destinations){
  const nav=element('nav','fm30-app-nav');
  nav.id='fm30AppNav';
  nav.setAttribute('aria-label','FootMate 주요 메뉴');

  const brand=element('div','fm30-brand');
  brand.append(element('span','fm30-brand-mark','FM'),element('span','fm30-brand-name','FootMate'));

  const list=element('div','fm30-nav-list');
  destinations.forEach(destination=>{
    const button=element('button','fm30-nav-item');
    button.type='button';
    button.dataset.fm30Destination=destination.id;
    button.setAttribute('aria-label',`${destination.label} · ${destination.description}`);
    button.append(icon(destination.icon),element('span','fm30-nav-label',destination.shortLabel));
    list.append(button);
  });

  const version=element('div','fm30-version','v3.0');
  version.setAttribute('aria-hidden','true');
  nav.append(brand,list,version);
  return nav;
}

export function setActiveDestination(nav,destinationId){
  if(!nav)return;
  nav.querySelectorAll('[data-fm30-destination]').forEach(button=>{
    const active=button.dataset.fm30Destination===destinationId;
    button.dataset.active=active?'true':'false';
    if(active)button.setAttribute('aria-current','page');
    else button.removeAttribute('aria-current');
  });
}
