const ICONS=Object.freeze({
  discover:'<circle cx="10.5" cy="10.5" r="5.75"></circle><path d="m15 15 4.25 4.25"></path>',
  recommendations:'<path d="M5 17.5V13"></path><path d="M10 17.5V9"></path><path d="M15 17.5V6"></path><path d="M20 17.5V10.5"></path>',
  participation:'<path d="M5.5 7.5h13v10h-13z"></path><path d="M8.5 7.5V5.5h7v2"></path><path d="M9 12.5h6"></path>',
  profile:'<circle cx="12" cy="8.5" r="3.25"></circle><path d="M5.75 19c.8-3 3-4.75 6.25-4.75S17.45 16 18.25 19"></path>',
  chevron:'<path d="m9 6 6 6-6 6"></path>'
});

export function element(tag,className='',text=''){
  const node=document.createElement(tag);
  if(className)node.className=className;
  if(text!==''&&text!=null)node.textContent=String(text);
  return node;
}

export function icon(name,className=''){
  const span=element('span',`fm30-icon ${className}`.trim());
  span.setAttribute('aria-hidden','true');
  span.innerHTML=`<svg viewBox="0 0 24 24" focusable="false">${ICONS[name]||ICONS.chevron}</svg>`;
  return span;
}

export function badge(label,tone='neutral'){
  const node=element('span','fm30-badge',label);
  node.dataset.tone=tone;
  return node;
}

export function metric(label,value){
  const item=element('div','fm30-metric');
  item.append(element('span','fm30-metric-label',label),element('strong','fm30-metric-value',value));
  return item;
}
