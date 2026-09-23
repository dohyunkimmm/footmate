/* FootMate Case Study · reader-facing English copy and navigation polish.
   Presentation only: preserves product facts, routes, state ownership, provider boundaries, and the 13-section IA. */
(function(){
  let applied=false;

  const tocMeta=[
    ['Overview','AI Match Assistant'],
    ['Problem','Faster Match Decisions'],
    ['Persona · JTBD','After-Work Confidence'],
    ['Product Thesis','Continuous Decision Flow'],
    ['Decision 01','Value Before Account'],
    ['Decision 02','Remembered Preferences'],
    ['Decision 03','Decision-Centered Detail'],
    ['Sign in · Join','Context Through Join'],
    ['Matchday · Return','Check-in to Next Match'],
    ['Recovery','Preserve, Then Recover'],
    ['Domain · AI Boundary','Ownership & Guardrails'],
    ['Validation','Automated · Human · AI QA'],
    ['Production Boundary','Connected & Verified']
  ];

  const kickers=[
    '',
    '02 · Problem',
    '03 · Persona · JTBD',
    '04 · Product Thesis',
    '05 · Decision 01',
    '06 · Decision 02',
    '07 · Decision 03',
    '08 · Sign in · Join',
    '09 · Matchday · Return',
    '10 · Recovery',
    '11 · Domain · AI Boundary',
    '12 · Validation',
    '13 · Production Boundary'
  ];

  function card(title,copy,meta=''){
    return `<article class="fm-next-cs-card">${meta?`<small>${meta}</small>`:''}<h3>${title}</h3><p>${copy}</p></article>`;
  }

  function setStory(slide,kicker,title,lead,body,aside=''){
    const story=slide?.querySelector('.fm-next-story');
    if(!story)return;
    story.innerHTML=`<div class="fm-next-story-copy"><div class="fm-next-story-kicker">${kicker}</div><h2>${title}</h2><p class="fm-next-story-lead">${lead}</p>${body}</div>${aside?`<aside class="fm-next-story-aside">${aside}</aside>`:''}`;
  }

  function installStyle(){
    if(document.getElementById('fm-case-study-language-polish'))return;
    const style=document.createElement('style');
    style.id='fm-case-study-language-polish';
    style.textContent=`
      html[data-fm-next-case-study="true"] .sidebar{
        scrollbar-width:none;
        -ms-overflow-style:none;
      }
      html[data-fm-next-case-study="true"] .sidebar::-webkit-scrollbar{
        display:none;
        width:0;
        height:0;
      }
      html[data-fm-next-case-study="true"] .toc-s{
        white-space:nowrap;
        overflow:visible;
        text-overflow:clip;
        font-size:10px;
      }
      html[data-fm-next-case-study="true"] .fm-next-story-kicker,
      html[data-fm-next-case-study="true"] .fm-next-cover-frame-meta{
        text-transform:none!important;
      }
      html[data-fm-next-case-study="true"] .fm-next-cover-frame-meta{
        color:#3c4043!important;
        font-weight:700;
      }
      html[data-fm-next-case-study="true"] .fm-next-cover-frame-meta:before{
        background:#188038!important;
      }
    `;
    document.head.appendChild(style);
  }

  function patchCover(slide){
    const root=slide?.querySelector('.fm-next-cover');
    if(!root)return;
    const kicker=root.querySelector('.fm-next-cover-kicker');
    if(kicker)kicker.textContent='FootMate · AI Match Assistant';
    const title=root.querySelector('h1');
    if(title)title.innerHTML='<span class="fm-next-cover-title-line">Find the right match.</span><span class="fm-next-cover-title-line">Keep the context through matchday.</span>';
    const lead=root.querySelector('.fm-next-cover-lead');
    if(lead)lead.innerHTML='FootMate helps players <strong>understand why a match fits, join without losing their selection, and carry the same context into matchday and the next search.</strong>';
    const actions=[...root.querySelectorAll('.fm-next-cover-actions a,.fm-next-cover-actions button')];
    if(actions[0])actions[0].innerHTML='Open Real App <span aria-hidden="true">↗</span>';
    if(actions[1])actions[1].innerHTML='Start with the Problem <span aria-hidden="true">→</span>';
    const flow=root.querySelector('.fm-next-cover-flow');
    if(flow)flow.innerHTML='<b>Find</b><i>→</i><b>Decide</b><i>→</i><b>Join</b><i>→</i><b>Play</b><i>→</i><b>Return</b>';
    const proof=root.querySelector('.fm-next-cover-proof');
    if(proof)proof.innerHTML=
      '<div><b>Value Before Account</b><span>See recommendations before creating an account.</span></div>'+
      '<div><b>Explainable Recommendation</b><span>Understand level, distance, position, and availability before deciding.</span></div>'+
      '<div><b>Continuity After Joining</b><span>Carry the same context into matchday and the next search.</span></div>';
    const meta=root.querySelector('.fm-next-cover-frame-meta');
    if(meta)meta.textContent='Live Interaction';
    const note=root.querySelector('.fm-next-cover-note');
    if(note)note.innerHTML='AI Match Assistant<br>Natural-language interpretation → deterministic ranking';
    const visual=root.querySelector('.fm-next-cover-visual');
    if(visual)visual.setAttribute('aria-label','FootMate app preview');
    const frame=root.querySelector('iframe');
    if(frame)frame.title='FootMate Real App flow preview';
  }

  function patch(){
    if(applied)return true;
    if(document.documentElement.dataset.footmateCaseStudyRelease!=='5.1.1'||document.documentElement.dataset.footmateCaseStudySections!=='13')return false;
    const slides=[...document.querySelectorAll('.slide:not([hidden])')];
    if(slides.length!==13||!slides[0]?.querySelector('.fm-next-cover'))return false;

    installStyle();

    const toc=[...document.querySelectorAll('.toc-item:not([hidden])')];
    toc.forEach((item,index)=>{
      if(!tocMeta[index])return;
      const title=item.querySelector('.toc-t');
      const sub=item.querySelector('.toc-s');
      if(title)title.textContent=tocMeta[index][0];
      if(sub)sub.textContent=tocMeta[index][1];
    });
    const sidebarSub=document.querySelector('.sb-sub');
    if(sidebarSub)sidebarSub.textContent='AI-assisted discovery · 13 sections';
    const mobileLink=document.querySelector('.cs-mobile-head a');
    if(mobileLink)mobileLink.textContent='View App ↗';
    document.querySelector('.sidebar')?.setAttribute('aria-label','Case Study Table of Contents');
    document.querySelector('.btn-prev')?.setAttribute('aria-label','Previous section');
    document.querySelector('.btn-next')?.setAttribute('aria-label','Next section');
    document.querySelector('.dots')?.setAttribute('aria-label','Case Study section navigation');
    [...document.querySelectorAll('.dot:not([hidden])')].forEach((dot,index)=>dot.setAttribute('aria-label',`Section ${index+1}`));

    patchCover(slides[0]);

    setStory(slides[1],kickers[1],
      'Choosing one match still takes too many separate checks.',
      'Time, distance, level, position, remaining spots, and price were scattered across the decision. After joining, schedule and matchday information became another disconnected flow.',
      `<div class="fm-next-cs-grid three">${card('Fragmented Decision Inputs','Players had to recombine match details in their head before making a decision.')}${card('Account Asked Too Early','Requiring sign-in before showing recommendation value makes the service harder to evaluate.')}${card('Flow Breaks After Joining','Schedule, check-in, and post-match actions felt like separate products instead of one journey.')}</div>`,
      '<div class="fm-next-cs-quote"><span>Core Question</span><b>How can a player choose a match with confidence, faster?</b></div>'
    );

    setStory(slides[2],kickers[2],
      'After work, choose a nearby match without overthinking it.',
      'The primary user plays futsal once or twice a week on weekday evenings. They need to judge fit and travel time quickly, then keep the next action clear after joining.',
      '<div class="fm-next-cs-persona"><div><span>Typical Context</span><b>Weekday evenings · within 30 minutes · 1–2 times a week</b></div><div><span>Decision Criteria</span><b>Level · distance · position · remaining spots</b></div><div><span>Main Concerns</span><b>Skill gap · closing spots · cancellation rules · matchday changes</b></div></div>',
      '<div class="fm-next-cs-jtbd"><small>JTBD</small><p>“Among the matches I can play today, I want to <strong>understand why one fits me</strong> and never lose track of the next action after I join.”</p></div>'
    );

    setStory(slides[3],kickers[3],
      'Build one continuous decision flow instead of adding more features.',
      'From discovery to the next search, filters, selections, and participation state stay connected so users do not repeat the same decision at every step.',
      '<div class="fm-next-cs-loop"><b>Find</b><span>Discover a fit</span><i>→</i><b>Decide</b><span>Understand why</span><i>→</i><b>Join</b><span>Preserve context</span><i>→</i><b>Play</b><span>Matchday</span><i>→</i><b>Return</b><span>Find the next match</span></div>',
      '<div class="fm-next-cs-principles">'+
        card('Bring Decision Criteria Together','Time, distance, level, position, availability, and price should not be recombined across separate screens.')+
        card('Preserve Selection Context','Filters, selected match, and participation state survive transitions and reloads.')+
        card('Offer the Next Action by State','Both normal and recovery paths make the next available action explicit.')+
      '</div>'
    );

    setStory(slides[4],kickers[4],
      'Show recommendation value before asking for an account.',
      'First-time users can explore recommendations and match detail before authentication. Sign-in appears only when the user starts the participation contract.',
      '<div class="fm-next-cs-before-after"><div><small>Before</small><b>Landing → Sign in → Setup → Recommendation</b><p>Account creation blocks the product value.</p></div><div class="is-after"><small>After</small><b>Value → Conditions → Recommendation → Detail → Sign in to Join</b><p>Authentication follows participation intent.</p></div></div>',
      '<div class="fm-next-cs-decision"><span>Design Principle</span><b>Sign-in is not the gate to discovery. It is the point where participation begins.</b></div>'
    );

    setStory(slides[5],kickers[5],
      'Remember useful preferences without replacing explainable ranking.',
      'Saved profile data, preferred area and time, match format, and recent views reduce repeated setup. The deterministic recommendation engine still owns candidates, ranking, and recommendation reasons.',
      '<div class="fm-next-cs-reco"><div class="fm-next-cs-reco-card"><span>Recent preferences · Suwon Yeongtong</span><h3>Strong Match for Your Preferences</h3><div><b>Preferred Area</b><b>Weekday Evening</b><b>MF Spot Open</b></div><strong>Top Recommendation</strong></div><div class="fm-next-cs-stack"><p><b>1.</b> Saved Profile</p><p><b>2.</b> Preferred Area · Time · Format</p><p><b>3.</b> Recent Views</p><p><b>4.</b> Current Match Conditions · Availability</p></div></div>',
      '<div class="fm-next-cs-note">Personalization is an input signal, not an opaque AI score. Ranking ownership and visible reasons remain deterministic.</div>'
    );

    setStory(slides[6],kickers[6],
      'Design match detail around the participation decision.',
      'Information follows the order users actually evaluate: time and place → fit reasons → spots and position → facilities and operations → cancellation and refund. Save and compare remain secondary actions.',
      '<div class="fm-next-cs-detail-order"><span>Time · Place</span><i>↓</i><span>Fit Reasons</span><i>↓</i><span>Spots · Position</span><i>↓</i><span>Facilities · Operations</span><i>↓</i><span>Cancellation · Refund</span></div>',
      '<div class="fm-next-cs-sticky"><small>Primary Action</small><b>Join Match</b><p>Secondary actions do not compete with the one decision the user needs to make now.</p></div>'
    );

    setStory(slides[7],kickers[7],
      'Preserve the chosen match through authentication and participation.',
      'The selected match and return destination survive the move to sign-in. Real App keeps authentication and payment simulated, while Closed Beta connects authentication and participation to Supabase.',
      '<div class="fm-next-cs-auth-flow"><div><small>Explore</small><b>Recommendation · Detail</b></div><i>→</i><div><small>Participation Intent</small><b>Join Match</b></div><i>→</i><div class="is-focus"><small>Authentication</small><b>Sign in</b></div><i>→</i><div><small>Participation State</small><b>Success · Failure · Cancel</b></div></div><div class="fm-next-cs-state-line"><span>Selected Match</span><i>→</i><span>Authentication</span><i>→</i><span>Join Request</span><i>→</i><span>Success | Failure | Cancel</span></div>',
      '<div class="fm-next-cs-scope"><span>Connected Boundary</span><b>Real App: simulated auth/payment · Closed Beta: Supabase Auth/participation</b><p>Google and Kakao OAuth were verified with real Production sign-in. A real payment gateway is not connected.</p></div>'
    );

    setStory(slides[8],kickers[8],
      'Let the current match state reshape the home priority.',
      'Participation moves through upcoming → matchday → checked-in → postgame. Post-match difficulty, completion, and repeat intent inform future recommendations only as supporting signals.',
      '<div class="fm-next-cs-day-states"><div><small>Upcoming</small><b>Next Match</b><p>Schedule · preparation</p></div><div class="is-focus"><small>Matchday</small><b>Time to Kickoff</b><p>Directions · check-in · operations help</p></div><div><small>Checked In</small><b>Ready to Play</b><p>Matchday state confirmed</p></div><div><small>Postgame</small><b>How Did It Feel?</b><p>Difficulty · completion · repeat intent</p></div></div>',
      '<div class="fm-next-cs-note">Return signals do not become a public reputation score and never trigger automatic participation decisions.</div>'
    );

    setStory(slides[9],kickers[9],
      'Preserve context first, then offer the next action.',
      'Zero results, full capacity, payment failure, and matchday issues differ in cause, but recovery follows one rule: keep what is still valid and immediately expose the next available action.',
      '<div class="fm-next-cs-recovery"><div><b>No Results</b><span>Relax conditions · change area or time</span></div><div><b>Capacity Full</b><span>Join waitlist · find a similar match</span></div><div><b>Payment Failure</b><span>Retry · change payment method</span></div><div><b>Matchday Issue</b><span>Retry check-in · ask operations for help</span></div></div>',
      '<div class="fm-next-cs-decision"><span>Recovery Principle</span><b>Design the error cause, preserved state, and next action as one recovery contract.</b></div>'
    );

    setStory(slides[10],kickers[10],
      'Separate state ownership, provider boundaries, and AI authority.',
      'Recommendation owns candidates, ranking, and recommendation reasons. Participation owns join state. Matchday owns check-in and operations state. Return owns post-match signals. AI interprets natural-language conditions but does not invent match facts, prices, capacity, ranking, or execute participation.',
      '<div class="fm-next-cs-agent"><b>Context</b><i>→</i><b>Plan</b><i>→</i><b>Tools</b><i>→</i><b>Guardrail</b><i>→</i><b>Observe</b></div><div class="fm-next-cs-modes"><div class="is-focus"><small>Recommendation</small><h3>Ranking Ownership</h3><p>Candidates, ranking, reasons, and Fallback remain owned by the deterministic recommendation engine.</p></div><div><small>Participation · Matchday · Return</small><h3>State Ownership</h3><p>Join, check-in, and post-match states stay separated so screens do not reimplement domain responsibility.</p></div><div><small>AI · Providers · HITL</small><h3>Integration & Execution Boundary</h3><p>Real App uses AI Gateway with sample matches. Closed Beta uses Supabase-backed data. Participation and payment require human confirmation.</p></div></div>',
      '<div class="fm-next-cs-note">Connected: Vercel AI Gateway · Supabase · Resend · Web Push · Storage. Not connected: real payment gateway · external analytics.</div>'
    );

    setStory(slides[11],kickers[11],
      'Keep automated QA, human verification, and AI-assisted review separate.',
      'Automated QA covers Regression, Browser E2E, axe, state and recovery contracts, responsive behavior, changed-surface Visual Regression, and exact Production HTTP · AI · Chromium smoke. Human QA verifies real sign-in, email delivery, and browser/OS Web Push. AI-assisted review checks duplication, terminology, section-role conflict, and Source of Truth drift without deciding PASS.',
      '<div class="fm-next-cs-metrics"><div class="fm-next-cs-metric"><b>13</b><span>Case Study Sections</span></div><div class="fm-next-cs-metric"><b>320–430</b><span>Responsive Widths</span></div><div class="fm-next-cs-metric"><b>0 px</b><span>Case Study Visual Diff</span></div><div class="fm-next-cs-metric"><b>HTTP + AI + Chromium</b><span>Production Smoke</span></div></div><div class="fm-next-cs-grid three">'+
        card('Automated QA','Repeatedly verifies ranking ownership, reload restoration, Fallback, Beta participation and recovery, accessibility, responsive behavior, and Visual Regression.')+
        card('Human QA','Verifies outcomes that require a real person to observe them, including Google/Kakao sign-in, transactional email delivery, and browser/OS Web Push.')+
        card('AI-Assisted QA','Cross-checks duplication, terminology, section roles, and implementation-to-copy consistency without replacing the release gate.')+
      '</div>',
      '<div class="fm-next-cs-note">Case Study Visual Regression compares the approved Ubuntu/Chromium baseline and the actual screenshot in the same gate.</div>'
    );

    setStory(slides[12],kickers[12],
      'Only describe capabilities that are actually connected and verified.',
      'Real App has connected AI inference while deterministic runtime logic owns recommendation ranking; match records and transactional providers remain sample or simulated. Closed Beta connects Supabase Auth, matches, capacity, join/cancel, check-in, OAuth, email, Web Push, and media.',
      '<div class="fm-next-cs-outcomes"><div><b>Real App</b><p>Connected AI Gateway · deterministic ranking · sample match data · simulated auth/payment/capacity/notifications</p></div><div><b>Closed Beta</b><p>Supabase Auth/matches/capacity/participation · OAuth · email · Web Push · media</p></div><div><b>Not Connected</b><p>Real payment gateway · external analytics</p></div></div>',
      '<div class="fm-next-cs-final"><span>Production Standard</span><b>Only capabilities with verified integration and QA evidence are described as Production. Everything else remains explicitly simulated or not connected.</b><a href="/app" target="_blank" rel="noopener">Open FootMate Real App ↗</a></div>'
    );

    document.documentElement.lang='en';
    document.documentElement.dataset.footmateCaseStudyLanguage='en';
    applied=true;
    window.refreshCaseStudyNavigation?.();
    return true;
  }

  if(patch())return;
  const observer=new MutationObserver(()=>{if(patch())observer.disconnect()});
  observer.observe(document.documentElement,{attributes:true,childList:true,subtree:true});
  let attempts=0;
  (function retry(){attempts+=1;if(patch()){observer.disconnect();return}if(attempts<80)requestAnimationFrame(retry)})();
})();
