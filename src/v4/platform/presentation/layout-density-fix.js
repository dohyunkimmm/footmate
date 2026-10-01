// Real App low-content spacing ownership: keep compact density scoped away from embeds.
const STYLE_ID='fm-layout-density-fix';

function installLayoutDensityFix(){
  if(document.getElementById(STYLE_ID))return;
  const style=document.createElement('style');
  style.id=STYLE_ID;
  style.textContent=`
.fm-next-page[data-mode="real"] .fm-next-app:not([data-embed="true"]) [data-screen="setup"] .fm-next-setup-footer{
  margin-top:20px;
}
.fm-next-page[data-mode="real"] .fm-next-app:not([data-embed="true"]) [data-screen="schedule"] .fm-next-empty{
  min-height:220px;
}
.fm-next-page[data-mode="real"] .fm-next-app:not([data-embed="true"]) [data-screen="discover"] .fm-discovery-empty{
  min-height:260px;
}
@media(max-width:430px){
  .fm-next-page[data-mode="real"] .fm-next-app:not([data-embed="true"]) [data-screen="discover"] .fm-discovery-empty{
    min-height:0;
    padding:22px 20px 24px;
    margin-bottom:80px;
  }
}
`;
  document.head.append(style);
}

installLayoutDensityFix();
