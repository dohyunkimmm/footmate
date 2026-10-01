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
`;
  document.head.append(style);
}

installLayoutDensityFix();
