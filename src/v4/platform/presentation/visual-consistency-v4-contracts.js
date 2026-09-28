const STYLE_ID='fm-visual-consistency-v4-contracts';

if(!document.getElementById(STYLE_ID)){
  const style=document.createElement('style');
  style.id=STYLE_ID;
  style.textContent=String.raw`
/* Visual Consistency v4 · compatibility contracts
   Keep approved Welcome geometry/white-first surface while extending the V3 language elsewhere. */
.fm-next-page[data-mode="real"] .fm-next-app:not([data-embed="true"]) [data-screen="welcome"] .fm-next-intro{
  padding:96px 22px 34px;
  background:
    radial-gradient(circle at 86% 12%,rgba(216,255,115,.18),transparent 24%),
    linear-gradient(155deg,#fff 0%,#f8faf7 58%,#f3f7f3 100%);
  color:#132019;
}
.fm-next-page[data-mode="real"] .fm-next-app:not([data-embed="true"]) [data-screen="welcome"] .fm-next-intro:before{
  opacity:.38;
  background-image:
    linear-gradient(rgba(29,104,74,.07) 1px,transparent 1px),
    linear-gradient(90deg,rgba(29,104,74,.07) 1px,transparent 1px);
  background-size:46px 46px;
  mask-image:linear-gradient(to bottom,#000,transparent 62%);
}
.fm-next-page[data-mode="real"] .fm-next-app:not([data-embed="true"]) [data-screen="welcome"] .fm-next-intro:after{
  width:270px;
  height:270px;
  right:-118px;
  top:120px;
  border-color:rgba(29,104,74,.11);
  box-shadow:0 0 0 48px rgba(29,104,74,.026),0 0 0 96px rgba(29,104,74,.014);
}
.fm-next-page[data-mode="real"] .fm-next-app:not([data-embed="true"]) [data-screen="welcome"] .fm-next-topbar--dark{
  background:rgba(255,255,255,.86);
  border-bottom:1px solid rgba(20,55,40,.07);
  color:#132019;
  backdrop-filter:blur(18px);
  -webkit-backdrop-filter:blur(18px);
}
.fm-next-page[data-mode="real"] .fm-next-app:not([data-embed="true"]) [data-screen="welcome"] .fm-next-brand small{color:#637269}
.fm-next-page[data-mode="real"] .fm-next-app:not([data-embed="true"]) [data-screen="welcome"] .fm-next-intro-copy{
  margin-top:0;
  margin-bottom:0;
  transform:translateY(-88px)!important;
}
.fm-next-page[data-mode="real"] .fm-next-app:not([data-embed="true"]) [data-screen="welcome"] .fm-next-intro h1{
  max-width:430px;
  color:#132019;
  font-size:clamp(38px,12vw,56px);
  line-height:1.08;
  letter-spacing:-.065em;
}
.fm-next-page[data-mode="real"] .fm-next-app:not([data-embed="true"]) [data-screen="welcome"] [data-welcome-ai-copy]{
  position:absolute!important;
  left:0!important;
  top:100%!important;
  margin:10px 0 0!important;
  color:#56655d!important;
  font-size:15px!important;
  font-weight:700!important;
  line-height:1.5!important;
  letter-spacing:-.02em!important;
}
.fm-next-page[data-mode="real"] .fm-next-app:not([data-embed="true"]) [data-screen="welcome"] .fm-next-actions{gap:10px}
.fm-next-page[data-mode="real"] .fm-next-app:not([data-embed="true"]) :is(
  [data-screen="welcome"] .fm-next-actions .fm-next-button--primary,
  [data-screen="setup"] .fm-next-setup-footer .fm-next-button--primary
){
  min-height:54px;
  height:54px;
  padding:0 20px;
  border:1px solid #073d2b!important;
  border-radius:16px;
  background:#073d2b!important;
  color:#fff!important;
  box-shadow:0 10px 24px rgba(7,61,43,.17)!important;
  font-size:15px;
  font-weight:700;
  letter-spacing:-.015em;
  justify-content:center;
}
.fm-next-page[data-mode="real"] .fm-next-app:not([data-embed="true"]) [data-screen="welcome"] .fm-next-actions .fm-next-button--primary:hover,
.fm-next-page[data-mode="real"] .fm-next-app:not([data-embed="true"]) [data-screen="setup"] .fm-next-setup-footer .fm-next-button--primary:hover{
  border-color:#0f5b40!important;
  background:#0f5b40!important;
}

/* WCAG AA: default provider status must clear the 4.5:1 threshold at 11px. */
.fm-next-page[data-mode="real"] .fm-next-app:not([data-embed="true"]) .fm-release-auth-status{
  color:#5c6d64;
}

/* Keep the established joined-Schedule compactness contract. */
.fm-next-page[data-mode="real"] .fm-next-app:not([data-embed="true"]) [data-screen="schedule"] .fm-next-upcoming{
  padding:19px;
}

@media(max-width:430px){
  .fm-next-page[data-mode="real"] .fm-next-app:not([data-embed="true"]) [data-screen="welcome"] .fm-next-intro{
    padding:96px 22px 34px;
  }
  .fm-next-page[data-mode="real"] .fm-next-app:not([data-embed="true"]) [data-screen="welcome"] .fm-next-intro h1{
    font-size:clamp(38px,12vw,56px);
  }
}
`;
  document.head.append(style);
}
