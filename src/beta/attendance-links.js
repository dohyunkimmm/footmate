// Closed Beta only: user-initiated external directions and calendar drafts.
// Neither link confirms a booking, stores an event, nor shares FootMate auth tokens.
export function betaDirectionsUrl(match){
  if(match?.source!=='connected-beta')return null;
  const venue=String(match.address||'').trim();
  const name=String(match.place||'').trim();
  if(!venue&&!name)return null;
  const query=[venue,name].filter(Boolean).join(' ');
  return 'https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(query);
}

function calendarUtc(value){
  const ms=typeof value==='number'?value:Date.parse(value);
  if(!Number.isFinite(ms))return null;
  return new Date(ms).toISOString().replace(/[-:]/g,'').replace(/\.\d{3}/,'');
}

export function betaCalendarUrl(match){
  if(match?.source!=='connected-beta')return null;
  const from=Date.parse(match.startsAt);
  const minutes=Number(match.durationMin);
  if(!Number.isFinite(from)||!Number.isFinite(minutes)||minutes<30||minutes>240)return null;
  const start=calendarUtc(from);
  const end=calendarUtc(from+minutes*60*1000);
  if(!start||!end)return null;
  const title=String(match.title||'').trim();
  if(!title)return null;
  const params=new URLSearchParams({
    action:'TEMPLATE',
    text:'FootMate · '+title,
    dates:start+'/'+end,
    location:[match.address,match.place].map(value=>String(value||'').trim()).filter(Boolean).join(' · '),
    details:'FootMate Closed Beta 일정 초안입니다. 확정된 참가 상태와 운영자 공지에서 장소·시간 변경 여부를 다시 확인하세요.'
  });
  return 'https://calendar.google.com/calendar/render?'+params.toString();
}
