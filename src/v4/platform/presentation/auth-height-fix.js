const STYLE_ID='fm-auth-height-fix';

function installAuthHeightFix(){
  if(document.getElementById(STYLE_ID))return;
  const style=document.createElement('style');
  style.id=STYLE_ID;
  style.textContent=`
@media (min-width:700px){
  .fm-next-page[data-mode="real"] .fm-next-app[data-embed="false"] .fm-next-auth-v3{
    min-height:calc(100dvh - 64px);
  }
}
`;
  document.head.append(style);
}

installAuthHeightFix();
