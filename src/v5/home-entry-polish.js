const root=document.getElementById('footmate-next');

if(root){
  const STYLE_ID='fm-home-entry-polish';
  const ensureStyle=()=>{
    if(document.getElementById(STYLE_ID))return;
    const style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent=`
      .fm-next-page[data-mode="real"] .fm-next-app:not([data-embed="true"]) [data-screen="home"]{padding-bottom:164px}
      .fm-next-page[data-mode="real"] [data-screen="home"] > .fm-next-greeting{display:none!important}
      .fm-next-page[data-mode="real"] [data-screen="home"] .fm-ai-card[data-ia-role="primary-assistant"] .fm-ai-conditions{
        flex-wrap:nowrap!important;
        gap:4px!important;
        overflow:hidden;
        align-items:center;
      }
      .fm-next-page[data-mode="real"] [data-screen="home"] .fm-ai-card[data-ia-role="primary-assistant"] .fm-ai-conditions span{
        flex:0 0 auto;
        white-space:nowrap;
        padding-inline:6px!important;
        font-size:9px!important;
      }
      @media(max-width:374px){
        .fm-next-page[data-mode="real"] [data-screen="home"] .fm-ai-card[data-ia-role="primary-assistant"] .fm-ai-conditions{gap:3px!important}
        .fm-next-page[data-mode="real"] [data-screen="home"] .fm-ai-card[data-ia-role="primary-assistant"] .fm-ai-conditions span{padding-inline:5px!important;font-size:8.5px!important}
      }
    `;
    document.head.append(style);
  };

  function polishHome(){
    const screen=root.querySelector('[data-screen="home"]');
    if(!screen)return;

    const topbar=screen.querySelector(':scope > .fm-next-topbar');
    const profileButton=topbar?.querySelector('[data-action="nav-profile"]');
    if(profileButton){
      const spacer=document.createElement('span');
      spacer.style.width='44px';
      spacer.setAttribute('aria-hidden','true');
      profileButton.replaceWith(spacer);
    }

    const title=screen.querySelector('.fm-ai-card[data-product-ai="home"] .fm-ai-head strong, .fm-ai-card[data-ai-assistant] .fm-ai-head strong');
    if(title&&title.textContent!=='AI에게 원하는 경기를 검색해보세요.')title.textContent='AI에게 원하는 경기를 검색해보세요.';

    const conditions=screen.querySelector('.fm-ai-card[data-product-ai="home"] [data-ai-conditions], .fm-ai-card[data-ai-assistant] [data-ai-conditions]');
    if(conditions){
      const visibleChips=[...conditions.children].filter(node=>node instanceof HTMLElement&&!node.hidden);
      if(visibleChips.length>=6)visibleChips[0].hidden=true;
    }
  }

  let scheduled=false;
  const schedule=()=>{
    if(scheduled)return;
    scheduled=true;
    requestAnimationFrame(()=>{
      scheduled=false;
      ensureStyle();
      polishHome();
    });
  };

  new MutationObserver(schedule).observe(root,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:['data-ai-state','data-product-ai','data-ia-role']});
  schedule();
}
