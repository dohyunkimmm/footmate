/* Editorial grouping preserves the existing copy and interactive evidence. */
(function(){
  window.installFootMateEditorialFinish=function(slides){
    const recovery=slides[9];
    const map=recovery.querySelector('.fm-p0-recovery-map');
    const strip=recovery.querySelector('.fm-evidence-recovery-strip');
    const layout=document.createElement('div');layout.className='fm-editorial-recovery-layout';
    map.before(layout);layout.append(map,strip);
    const heading=document.createElement('h3');heading.className='fm-editorial-evidence-heading';heading.textContent='핵심 결정 03 · 실패 후 다음 행동';strip.prepend(heading);
    const note=slides[5].querySelector('.fm-next-cs-note');
    const label=document.createElement('span');label.className='fm-editorial-decision-label';label.textContent='핵심 결정 02 · 추천 이유';note.prepend(label);note.classList.add('fm-editorial-decision');
    // Keep evidence actions together so one extra button cannot enlarge all three cards.
    slides[11].querySelectorAll('.fm-p1-evidence-grid>.fm-next-cs-card').forEach(card=>{
      const actions=document.createElement('div');actions.className='fm-editorial-evidence-actions';
      card.querySelectorAll('.fm-proof-link,.fm-improvement-open').forEach(node=>actions.appendChild(node));card.appendChild(actions);
    });
    document.documentElement.dataset.fmEditorialFinish='true';
  };
})();
