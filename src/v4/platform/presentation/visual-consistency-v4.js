const STYLE_ID='fm-visual-consistency-v4';

if(!document.getElementById(STYLE_ID)){
  const style=document.createElement('style');
  style.id=STYLE_ID;
  style.textContent=String.raw`
/* FootMate Real App · Visual Consistency v4
   Extends Visual Hierarchy v3 to the remaining product journey only.
   Scope: Welcome, Setup, Auth, Checkout, Success, Schedule empty/secondary states.
   Preserve IA, copy, routes, domain/state ownership, matching/recommendation behavior and persistence. */
.fm-next-page[data-mode="real"] .fm-next-app:not([data-embed="true"]){
  --fm-v4-brand:#073d2b;
  --fm-v4-brand-2:#0f5b40;
  --fm-v4-accent:#d8ff73;
  --fm-v4-accent-soft:#f1f9d9;
  --fm-v4-ink:#102219;
  --fm-v4-muted:#687870;
  --fm-v4-line:rgba(17,58,40,.10);
  --fm-v4-line-strong:rgba(17,58,40,.17);
  --fm-v4-shadow:0 12px 32px rgba(8,43,29,.08);
}

/* 1. Welcome + Setup: carry the same branded hierarchy into first entry. */
.fm-next-page[data-mode="real"] .fm-next-app:not([data-embed="true"]) [data-screen="welcome"] .fm-next-intro{
  padding:calc(104px + env(safe-area-inset-top)) 22px calc(30px + env(safe-area-inset-bottom));
  background:
    radial-gradient(circle at 84% 12%,rgba(216,255,115,.27),transparent 24%),
    radial-gradient(circle at 10% 78%,rgba(15,91,64,.32),transparent 32%),
    linear-gradient(150deg,#041f17 0%,#073d2b 52%,#0f5b40 100%);
}
.fm-next-page[data-mode="real"] .fm-next-app:not([data-embed="true"]) [data-screen="welcome"] .fm-next-intro:before{
  opacity:.18;
  background-size:42px 42px;
  mask-image:linear-gradient(to bottom,#000 0%,rgba(0,0,0,.85) 45%,transparent 88%);
}
.fm-next-page[data-mode="real"] .fm-next-app:not([data-embed="true"]) [data-screen="welcome"] .fm-next-intro:after{
  width:250px;
  height:250px;
  right:-104px;
  top:116px;
  border-color:rgba(216,255,115,.20);
  box-shadow:0 0 0 44px rgba(216,255,115,.026),0 0 0 88px rgba(255,255,255,.016);
}
.fm-next-page[data-mode="real"] .fm-next-app:not([data-embed="true"]) [data-screen="welcome"] .fm-next-topbar--dark{
  background:linear-gradient(180deg,rgba(4,31,23,.92),rgba(4,31,23,0));
}
.fm-next-page[data-mode="real"] .fm-next-app:not([data-embed="true"]) [data-screen="welcome"] .fm-next-brand small{color:rgba(255,255,255,.62)}
.fm-next-page[data-mode="real"] .fm-next-app:not([data-embed="true"]) [data-screen="welcome"] .fm-next-intro-copy{
  transform:none!important;
  margin-top:auto;
  margin-bottom:26px;
}
.fm-next-page[data-mode="real"] .fm-next-app:not([data-embed="true"]) [data-screen="welcome"] .fm-next-intro h1{
  max-width:360px;
  color:#fff;
  font-size:clamp(38px,10.8vw,48px);
  line-height:1.08;
  letter-spacing:-.06em;
}
.fm-next-page[data-mode="real"] .fm-next-app:not([data-embed="true"]) [data-screen="welcome"] [data-welcome-ai-copy]{
  position:relative!important;
  left:auto!important;
  top:auto!important;
  margin:14px 0 0!important;
  color:rgba(255,255,255,.70)!important;
  font-size:14px!important;
  font-weight:700!important;
  line-height:1.55!important;
}
.fm-next-page[data-mode="real"] .fm-next-app:not([data-embed="true"]) [data-screen="welcome"] .fm-next-actions{gap:9px}
.fm-next-page[data-mode="real"] .fm-next-app:not([data-embed="true"]) [data-screen="welcome"] .fm-next-actions .fm-next-button--primary:first-child{
  border-color:var(--fm-v4-accent);
  background:var(--fm-v4-accent);
  color:var(--fm-v4-brand);
  box-shadow:0 12px 28px rgba(0,0,0,.18);
}
.fm-next-page[data-mode="real"] .fm-next-app:not([data-embed="true"]) [data-screen="welcome"] .fm-next-actions .fm-next-button--primary:not(:first-child){
  border:1px solid rgba(255,255,255,.22);
  background:rgba(255,255,255,.10);
  color:#fff;
  box-shadow:none;
  backdrop-filter:blur(10px);
}

.fm-next-page[data-mode="real"] .fm-next-app:not([data-embed="true"]) [data-screen="setup"]{
  background:linear-gradient(180deg,#fff 0%,#fff 70%,#f7faf7 100%);
}
.fm-next-page[data-mode="real"] .fm-next-app:not([data-embed="true"]) [data-screen="setup"] .fm-next-step-indicator{
  gap:7px;
  margin-top:22px;
  margin-bottom:26px;
}
.fm-next-page[data-mode="real"] .fm-next-app:not([data-embed="true"]) [data-screen="setup"] .fm-next-step-indicator span{
  height:4px;
  background:#e8ede9;
}
.fm-next-page[data-mode="real"] .fm-next-app:not([data-embed="true"]) [data-screen="setup"] .fm-next-step-indicator span.is-done{background:var(--fm-v4-brand)}
.fm-next-page[data-mode="real"] .fm-next-app:not([data-embed="true"]) [data-screen="setup"] .fm-next-step-indicator span.is-active{
  background:var(--fm-v4-accent);
  box-shadow:inset 0 0 0 1px rgba(7,61,43,.14);
}
.fm-next-page[data-mode="real"] .fm-next-app:not([data-embed="true"]) [data-screen="setup"] .fm-next-question{
  color:var(--fm-v4-ink);
  font-size:29px;
  letter-spacing:-.05em;
}
.fm-next-page[data-mode="real"] .fm-next-app:not([data-embed="true"]) [data-screen="setup"] .fm-next-question-copy{
  margin-bottom:20px;
  color:var(--fm-v4-muted);
}
.fm-next-page[data-mode="real"] .fm-next-app:not([data-embed="true"]) [data-screen="setup"] .fm-next-choice-grid{gap:10px}
.fm-next-page[data-mode="real"] .fm-next-app:not([data-embed="true"]) [data-screen="setup"] .fm-next-choice{
  position:relative;
  min-height:74px;
  padding:15px 16px;
  border:1px solid var(--fm-v4-line);
  border-radius:18px;
  background:#fff;
  box-shadow:0 5px 16px rgba(8,43,29,.035);
}
.fm-next-page[data-mode="real"] .fm-next-app:not([data-embed="true"]) [data-screen="setup"] .fm-next-choice:hover,
.fm-next-page[data-mode="real"] .fm-next-app:not([data-embed="true"]) [data-screen="setup"] .fm-next-choice:focus-visible{
  transform:translateY(-1px);
  border-color:var(--fm-v4-line-strong);
  box-shadow:var(--fm-v4-shadow);
}
.fm-next-page[data-mode="real"] .fm-next-app:not([data-embed="true"]) [data-screen="setup"] .fm-next-choice[aria-pressed="true"]{
  border-color:rgba(7,61,43,.26);
  background:linear-gradient(145deg,#f8fce9,var(--fm-v4-accent-soft));
  box-shadow:0 9px 24px rgba(8,43,29,.07),inset 4px 0 0 var(--fm-v4-brand-2);
}
.fm-next-page[data-mode="real"] .fm-next-app:not([data-embed="true"]) [data-screen="setup"] .fm-next-choice b{color:var(--fm-v4-ink)}
.fm-next-page[data-mode="real"] .fm-next-app:not([data-embed="true"]) [data-screen="setup"] .fm-next-choice span{color:var(--fm-v4-muted)}
.fm-next-page[data-mode="real"] .fm-next-app:not([data-embed="true"]) [data-screen="setup"] .fm-next-setup-footer{
  background:linear-gradient(180deg,rgba(255,255,255,0),rgba(255,255,255,.96) 28%,#fff 58%);
}
.fm-next-page[data-mode="real"] .fm-next-app:not([data-embed="true"]) [data-screen="setup"] .fm-next-setup-footer .fm-next-button{
  border-radius:14px;
  background:var(--fm-v4-brand);
  box-shadow:0 10px 24px rgba(7,61,43,.17);
}

/* 2. Auth → Checkout → Success: one coherent join journey. */
.fm-next-page[data-mode="real"] .fm-next-app:not([data-embed="true"]) .fm-next-auth-v3[data-screen="auth"]{
  background:
    radial-gradient(circle at 12% 8%,rgba(216,255,115,.18),transparent 24%),
    linear-gradient(180deg,#f8faf7 0%,#edf3ee 100%);
}
.fm-next-page[data-mode="real"] .fm-next-app:not([data-embed="true"]) .fm-next-auth-v3 .fm-auth-card{
  border-color:rgba(7,61,43,.09);
  background:
    radial-gradient(circle at 92% 0%,rgba(216,255,115,.09),transparent 28%),
    rgba(255,255,255,.96);
  box-shadow:0 20px 52px rgba(8,43,29,.10);
}
.fm-next-page[data-mode="real"] .fm-next-app:not([data-embed="true"]) .fm-next-auth-v3 .fm-auth-brand .fm-next-brand-mark{
  box-shadow:0 8px 20px rgba(7,61,43,.13),inset 0 0 0 1px rgba(7,61,43,.10);
}
.fm-next-page[data-mode="real"] .fm-next-app:not([data-embed="true"]) .fm-next-auth-v3 .fm-auth-title h1{
  color:var(--fm-v4-ink);
  letter-spacing:-.05em;
}
.fm-next-page[data-mode="real"] .fm-next-app:not([data-embed="true"]) .fm-next-auth-v3 .fm-auth-field input:focus{
  border-color:var(--fm-v4-brand-2);
  box-shadow:0 0 0 4px rgba(15,91,64,.10);
}
.fm-next-page[data-mode="real"] .fm-next-app:not([data-embed="true"]) .fm-next-auth-v3 .fm-auth-primary{
  background:linear-gradient(180deg,#0d4c36,var(--fm-v4-brand));
  box-shadow:0 11px 26px rgba(7,61,43,.18);
}
.fm-next-page[data-mode="real"] .fm-next-app:not([data-embed="true"]) .fm-next-auth-v3 .fm-auth-context{
  border:1px solid rgba(7,61,43,.08);
  background:var(--fm-v4-accent-soft);
  color:#355747;
}
.fm-next-page[data-mode="real"] .fm-next-app:not([data-embed="true"]) .fm-release-auth-status{
  margin:12px 0 0;
  padding:10px 12px;
  border:1px solid var(--fm-v4-line);
  border-radius:13px;
  background:#f7f9f7;
  color:var(--fm-v4-muted);
  font-size:11px;
  line-height:1.55;
  text-align:center;
}
.fm-next-page[data-mode="real"] .fm-next-app:not([data-embed="true"]) .fm-release-auth-status[data-tone="connected"]{background:#edf8f0;color:#315c45;border-color:#cde3d4}
.fm-next-page[data-mode="real"] .fm-next-app:not([data-embed="true"]) .fm-release-auth-status[data-tone="error"]{background:#fff1ef;color:#7c3c36;border-color:#e8c0bc}

.fm-next-page[data-mode="real"] .fm-next-app:not([data-embed="true"]) [data-screen="checkout"]{
  background:linear-gradient(180deg,#fff 0%,#f8faf7 100%);
}
.fm-next-page[data-mode="real"] .fm-next-app:not([data-embed="true"]) [data-screen="checkout"] .fm-next-checkout-summary{
  margin-top:14px;
  padding:18px;
  border:1px solid rgba(216,255,115,.13);
  border-radius:22px;
  background:
    radial-gradient(circle at 88% 8%,rgba(216,255,115,.22),transparent 27%),
    linear-gradient(145deg,#062f22 0%,#0a4934 68%,#0f5b40 100%);
  box-shadow:0 16px 38px rgba(7,61,43,.16);
}
.fm-next-page[data-mode="real"] .fm-next-app:not([data-embed="true"]) [data-screen="checkout"] .fm-next-checkout-summary small{color:var(--fm-v4-accent);font-weight:800}
.fm-next-page[data-mode="real"] .fm-next-app:not([data-embed="true"]) [data-screen="checkout"] .fm-next-checkout-summary h2{color:#fff;letter-spacing:-.04em}
.fm-next-page[data-mode="real"] .fm-next-app:not([data-embed="true"]) [data-screen="checkout"] .fm-next-checkout-meta span{
  border-color:rgba(255,255,255,.12);
  background:rgba(255,255,255,.08);
  color:rgba(255,255,255,.82);
}
.fm-next-page[data-mode="real"] .fm-next-app:not([data-embed="true"]) [data-screen="checkout"]>.fm-next-detail-section{
  border:1px solid var(--fm-v4-line);
  background:#fff;
  box-shadow:none;
}
.fm-next-page[data-mode="real"] .fm-next-app:not([data-embed="true"]) [data-screen="checkout"]>.fm-next-detail-section h2{
  display:flex;
  align-items:center;
  gap:8px;
  color:var(--fm-v4-ink);
}
.fm-next-page[data-mode="real"] .fm-next-app:not([data-embed="true"]) [data-screen="checkout"]>.fm-next-detail-section h2:before{
  content:"";
  width:7px;
  height:7px;
  border-radius:999px;
  background:var(--fm-v4-accent);
  box-shadow:0 0 0 3px rgba(7,61,43,.09);
}
.fm-next-page[data-mode="real"] .fm-next-app:not([data-embed="true"]) [data-screen="checkout"] .fm-next-payment-method,
.fm-next-page[data-mode="real"] .fm-next-app:not([data-embed="true"]) [data-screen="checkout"] .fm-participation-methods button[aria-checked="true"]{
  border-color:rgba(7,61,43,.18);
  background:linear-gradient(145deg,#f8fce9,var(--fm-v4-accent-soft));
}
.fm-next-page[data-mode="real"] .fm-next-app:not([data-embed="true"]) [data-screen="checkout"] .fm-next-pay-row--total{
  margin-top:8px;
  padding-top:13px;
  border-top:1px solid var(--fm-v4-line);
  color:var(--fm-v4-ink);
}
.fm-next-page[data-mode="real"] .fm-next-app:not([data-embed="true"]) [data-screen="checkout"] .fm-next-pay-row--total b{color:var(--fm-v4-brand);font-size:18px}
.fm-next-page[data-mode="real"] .fm-next-app:not([data-embed="true"]) [data-screen="checkout"] .fm-next-inline-note{
  border:1px solid rgba(7,61,43,.09);
  background:#f1f6f2;
  color:#4e6258;
}
.fm-next-page[data-mode="real"] .fm-next-app:not([data-embed="true"]) [data-screen="checkout"] [data-participation-submit]{
  border-radius:14px;
  background:var(--fm-v4-brand);
  box-shadow:0 10px 24px rgba(7,61,43,.17);
}

.fm-next-page[data-mode="real"] .fm-next-app:not([data-embed="true"]) [data-screen="success"]{
  padding-inline:22px;
  background:
    radial-gradient(circle at 50% 7%,rgba(216,255,115,.25),transparent 27%),
    linear-gradient(180deg,#fbfdf9 0%,#edf4ee 100%);
}
.fm-next-page[data-mode="real"] .fm-next-app:not([data-embed="true"]) [data-screen="success"] .fm-next-success-icon{
  width:68px;
  height:68px;
  border-radius:22px;
  background:linear-gradient(145deg,#0f5b40,var(--fm-v4-brand));
  box-shadow:0 18px 40px rgba(7,61,43,.19);
}
.fm-next-page[data-mode="real"] .fm-next-app:not([data-embed="true"]) [data-screen="success"] h1{
  color:var(--fm-v4-ink);
  font-size:31px;
  letter-spacing:-.05em;
}
.fm-next-page[data-mode="real"] .fm-next-app:not([data-embed="true"]) [data-screen="success"]>p{color:var(--fm-v4-muted);line-height:1.65}
.fm-next-page[data-mode="real"] .fm-next-app:not([data-embed="true"]) [data-screen="success"] .fm-next-ticket{
  position:relative;
  overflow:hidden;
  border:1px solid rgba(7,61,43,.11);
  border-radius:22px;
  background:#fff;
  box-shadow:0 13px 34px rgba(8,43,29,.07);
}
.fm-next-page[data-mode="real"] .fm-next-app:not([data-embed="true"]) [data-screen="success"] .fm-next-ticket:before{
  content:"";
  position:absolute;
  left:0;
  right:0;
  top:0;
  height:5px;
  background:linear-gradient(90deg,var(--fm-v4-brand),var(--fm-v4-accent));
}
.fm-next-page[data-mode="real"] .fm-next-app:not([data-embed="true"]) [data-screen="success"] .fm-next-ticket-time span:last-child{
  padding:4px 8px;
  border-radius:999px;
  background:var(--fm-v4-accent-soft);
  color:var(--fm-v4-brand);
  font-weight:800;
}
.fm-next-page[data-mode="real"] .fm-next-app:not([data-embed="true"]) [data-screen="success"] .fm-next-actions .fm-next-button--primary{
  background:var(--fm-v4-brand);
}

/* 3. Schedule secondary / empty states: give the lifecycle screen the same hierarchy. */
.fm-next-page[data-mode="real"] .fm-next-app:not([data-embed="true"]) [data-screen="schedule"] .fm-next-my-matches>.fm-next-section-head{
  margin-bottom:14px;
}
.fm-next-page[data-mode="real"] .fm-next-app:not([data-embed="true"]) [data-screen="schedule"] .fm-next-my-matches>.fm-next-section-head h2{
  color:var(--fm-v4-ink);
  letter-spacing:-.04em;
}
.fm-next-page[data-mode="real"] .fm-next-app:not([data-embed="true"]) [data-screen="schedule"] .fm-next-empty{
  position:relative;
  overflow:hidden;
  min-height:280px;
  padding:78px 24px 28px;
  border:1px solid var(--fm-v4-line);
  border-radius:22px;
  background:
    radial-gradient(circle at 50% 0%,rgba(216,255,115,.18),transparent 34%),
    linear-gradient(180deg,#fff 0%,#f8faf7 100%);
  box-shadow:none;
  color:var(--fm-v4-muted);
}
.fm-next-page[data-mode="real"] .fm-next-app:not([data-embed="true"]) [data-screen="schedule"] .fm-next-empty:before{
  content:"";
  position:absolute;
  left:50%;
  top:24px;
  width:46px;
  height:46px;
  transform:translateX(-50%);
  border:1px solid rgba(7,61,43,.16);
  border-radius:16px;
  background:
    linear-gradient(rgba(7,61,43,.06) 1px,transparent 1px),
    linear-gradient(90deg,rgba(7,61,43,.06) 1px,transparent 1px),
    var(--fm-v4-accent-soft);
  background-size:12px 12px;
  box-shadow:0 7px 18px rgba(7,61,43,.07);
}
.fm-next-page[data-mode="real"] .fm-next-app:not([data-embed="true"]) [data-screen="schedule"] .fm-next-empty .fm-next-button{
  min-width:150px;
  border-radius:14px;
  background:var(--fm-v4-brand);
}
.fm-next-page[data-mode="real"] .fm-next-app:not([data-embed="true"]) [data-screen="schedule"] .fm-next-upcoming{
  border:1px solid rgba(216,255,115,.12);
  border-radius:22px;
  background:
    radial-gradient(circle at 88% 10%,rgba(216,255,115,.21),transparent 27%),
    linear-gradient(145deg,#062f22,#0a4934 68%,#0f5b40);
  box-shadow:0 15px 36px rgba(7,61,43,.14);
}
.fm-next-page[data-mode="real"] .fm-next-app:not([data-embed="true"]) [data-screen="schedule"] .fm-next-status-card{
  border-color:var(--fm-v4-line);
  box-shadow:none;
}
.fm-next-page[data-mode="real"] .fm-next-app:not([data-embed="true"]) [data-screen="schedule"] .fm-next-status-card.is-current{
  border-color:rgba(7,61,43,.17);
  background:linear-gradient(145deg,#f8fce9,#fff);
  box-shadow:0 8px 22px rgba(8,43,29,.05);
}

/* 4. Edge-state consistency: preserve semantics, align visual grammar. */
.fm-next-page[data-mode="real"] .fm-next-app:not([data-embed="true"]) :is(.fm-ai-loading,.fm-ai-empty,.fm-discovery-empty,.fm-participation-state){
  border-radius:18px;
}
.fm-next-page[data-mode="real"] .fm-next-app:not([data-embed="true"]) .fm-ai-loading{
  border-color:rgba(7,61,43,.14);
  background:#f7faf7;
}
.fm-next-page[data-mode="real"] .fm-next-app:not([data-embed="true"]) .fm-ai-empty,
.fm-next-page[data-mode="real"] .fm-next-app:not([data-embed="true"]) .fm-discovery-empty{
  border-color:var(--fm-v4-line);
  background:linear-gradient(180deg,#fff,#f8faf8);
}
.fm-next-page[data-mode="real"] .fm-next-app:not([data-embed="true"]) .fm-participation-state[data-participation-panel="pending"]{
  border-color:#bed5c6;
  background:#f2f8f4;
}
.fm-next-page[data-mode="real"] .fm-next-app:not([data-embed="true"]) .fm-participation-state.is-failure{
  border-color:#e0b3af;
  background:#fff3f2;
}
.fm-next-page[data-mode="real"] .fm-next-app:not([data-embed="true"]) .fm-participation-state[data-participation-panel="canceled"]{
  border-color:#d8dfda;
  background:#f7f9f7;
}

@media(max-width:430px){
  .fm-next-page[data-mode="real"] .fm-next-app:not([data-embed="true"]) [data-screen="welcome"] .fm-next-intro{
    padding-inline:20px;
    padding-bottom:calc(26px + env(safe-area-inset-bottom));
  }
  .fm-next-page[data-mode="real"] .fm-next-app:not([data-embed="true"]) [data-screen="welcome"] .fm-next-intro h1{font-size:40px}
  .fm-next-page[data-mode="real"] .fm-next-app:not([data-embed="true"]) [data-screen="setup"] .fm-next-question{font-size:27px}
  .fm-next-page[data-mode="real"] .fm-next-app:not([data-embed="true"]) [data-screen="success"]{padding-inline:20px}
}

@media(prefers-reduced-motion:reduce){
  .fm-next-page[data-mode="real"] .fm-next-app:not([data-embed="true"]) *,
  .fm-next-page[data-mode="real"] .fm-next-app:not([data-embed="true"]) *::before,
  .fm-next-page[data-mode="real"] .fm-next-app:not([data-embed="true"]) *::after{
    transition-duration:.01ms!important;
    animation-duration:.01ms!important;
    animation-iteration-count:1!important;
  }
}
`;
  document.head.append(style);
}

document.documentElement.dataset.footmateVisualConsistency='4';
