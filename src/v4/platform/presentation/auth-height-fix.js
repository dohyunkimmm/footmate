const STYLE_ID='fm-auth-height-fix';

// Keep login spacing compact and prevent horizontal touch-pan without changing vertical scrolling.
function installAuthHeightFix(){
  if(document.getElementById(STYLE_ID))return;
  const style=document.createElement('style');
  style.id=STYLE_ID;
  style.textContent=`
html[data-footmate-surface="real"],
html[data-footmate-surface="real"] body,
html[data-footmate-surface="real"] #footmate-next,
html[data-footmate-surface="real"] .fm-next-page,
html[data-footmate-surface="real"] .fm-next-stage{
  overscroll-behavior-x:none;
}
html[data-footmate-surface="real"] .fm-next-page[data-mode="real"] .fm-next-app[data-embed="false"]{
  touch-action:pan-y pinch-zoom;
  overscroll-behavior-x:none;
}
html[data-footmate-surface="real"] .fm-next-page[data-mode="real"] .fm-next-app[data-embed="false"] .fm-next-screen,
html[data-footmate-surface="real"] .fm-next-page[data-mode="real"] .fm-next-app[data-embed="false"] [data-screen="auth"]{
  overscroll-behavior-x:none;
}
.fm-next-page[data-mode="real"] .fm-next-app[data-embed="false"] [data-screen="auth"],
.fm-next-page[data-mode="real"] .fm-next-app[data-embed="false"] .fm-next-auth-v3{
  overflow-x:hidden;
}
@media (min-width:700px){
  .fm-next-page[data-mode="real"] .fm-next-app[data-embed="false"] .fm-next-auth-v3{
    min-height:100%;
  }
}
.fm-next-page[data-mode="real"] .fm-next-app[data-embed="false"] .fm-next-auth-v3:has([data-auth-form="login"]) .fm-auth-head{
  min-height:60px;
  padding-block:8px;
}
.fm-next-page[data-mode="real"] .fm-next-app[data-embed="false"] .fm-next-auth-v3 .fm-auth-card:has([data-auth-form="login"]){
  padding-top:2px;
  padding-bottom:20px;
}
.fm-next-page[data-mode="real"] .fm-next-app[data-embed="false"] .fm-next-auth-v3 .fm-auth-card:has([data-auth-form="login"]) .fm-auth-brand{
  margin-top:0;
  margin-bottom:16px;
}
.fm-next-page[data-mode="real"] .fm-next-app[data-embed="false"] .fm-next-auth-v3 .fm-auth-card:has([data-auth-form="login"]) .fm-auth-title{
  margin-bottom:18px;
}
.fm-next-page[data-mode="real"] .fm-next-app[data-embed="false"] .fm-next-auth-v3 .fm-auth-card:has([data-auth-form="login"]) .fm-auth-title p{
  margin-top:6px;
}
.fm-next-page[data-mode="real"] .fm-next-app[data-embed="false"] .fm-next-auth-v3 .fm-auth-card:has([data-auth-form="login"]) .fm-auth-form{
  gap:11px;
}
.fm-next-page[data-mode="real"] .fm-next-app[data-embed="false"] .fm-next-auth-v3 .fm-auth-card:has([data-auth-form="login"]) .fm-auth-links{
  margin-top:14px;
}
.fm-next-page[data-mode="real"] .fm-next-app[data-embed="false"] .fm-next-auth-v3 .fm-auth-card:has([data-auth-form="login"]) .fm-auth-divider{
  margin:20px 0 14px;
}
.fm-next-page[data-mode="real"] .fm-next-app[data-embed="false"] .fm-next-auth-v3 .fm-auth-card:has([data-auth-form="login"]) .fm-auth-context{
  margin-top:16px;
}
.fm-next-page[data-mode="real"] .fm-next-app[data-embed="false"] .fm-next-auth-v3 .fm-auth-card:has([data-auth-form="login"]) .fm-auth-terms{
  margin-top:8px;
}
`;
  document.head.append(style);
}

installAuthHeightFix();
