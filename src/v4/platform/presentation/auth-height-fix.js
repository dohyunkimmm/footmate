const STYLE_ID='fm-auth-height-fix';

// Keep login spacing compact without changing field or button sizing.
function installAuthHeightFix(){
  if(document.getElementById(STYLE_ID))return;
  const style=document.createElement('style');
  style.id=STYLE_ID;
  style.textContent=`
.fm-next-page[data-mode="real"] .fm-next-app[data-embed="false"] :is([data-screen="auth"],.fm-next-auth-v3){
  width:100%;
  max-width:100%;
  min-width:0;
  overflow-x:hidden;
  overscroll-behavior-x:none;
  touch-action:pan-y pinch-zoom;
}
.fm-next-page[data-mode="real"] .fm-next-app[data-embed="false"] .fm-next-auth-v3{
  background:#fff;
}
.fm-next-page[data-mode="real"] .fm-next-app[data-embed="false"] .fm-next-auth-v3 .fm-auth-card{
  border:0;
  border-radius:0;
  background:transparent;
  box-shadow:none;
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
@media (min-width:700px){
  .fm-next-page[data-mode="real"] .fm-next-app[data-embed="false"] .fm-next-auth-v3{
    min-height:100%;
  }
  .fm-next-page[data-mode="real"] .fm-next-app[data-embed="false"] .fm-next-auth-v3:has([data-auth-form="login"]) .fm-auth-head{
    min-height:48px;
    padding-block:2px;
  }
  .fm-next-page[data-mode="real"] .fm-next-app[data-embed="false"] .fm-next-auth-v3 .fm-auth-card:has([data-auth-form="login"]){
    padding-top:0;
    padding-bottom:10px;
  }
  .fm-next-page[data-mode="real"] .fm-next-app[data-embed="false"] .fm-next-auth-v3 .fm-auth-card:has([data-auth-form="login"]) .fm-auth-brand{
    margin-bottom:10px;
  }
  .fm-next-page[data-mode="real"] .fm-next-app[data-embed="false"] .fm-next-auth-v3 .fm-auth-card:has([data-auth-form="login"]) .fm-auth-title{
    margin-bottom:12px;
  }
  .fm-next-page[data-mode="real"] .fm-next-app[data-embed="false"] .fm-next-auth-v3 .fm-auth-card:has([data-auth-form="login"]) .fm-auth-title p{
    margin-top:4px;
  }
  .fm-next-page[data-mode="real"] .fm-next-app[data-embed="false"] .fm-next-auth-v3 .fm-auth-card:has([data-auth-form="login"]) .fm-auth-form{
    gap:8px;
  }
  .fm-next-page[data-mode="real"] .fm-next-app[data-embed="false"] .fm-next-auth-v3 .fm-auth-card:has([data-auth-form="login"]) .fm-auth-links{
    margin-top:10px;
  }
  .fm-next-page[data-mode="real"] .fm-next-app[data-embed="false"] .fm-next-auth-v3 .fm-auth-card:has([data-auth-form="login"]) .fm-auth-divider{
    margin:12px 0 10px;
  }
  .fm-next-page[data-mode="real"] .fm-next-app[data-embed="false"] .fm-next-auth-v3 .fm-auth-card:has([data-auth-form="login"]) .fm-auth-context{
    margin-top:10px;
    padding-block:8px;
  }
  .fm-next-page[data-mode="real"] .fm-next-app[data-embed="false"] .fm-next-auth-v3 .fm-auth-card:has([data-auth-form="login"]) .fm-auth-terms{
    margin-top:4px;
  }
}
`;
  document.head.append(style);
}

installAuthHeightFix();
