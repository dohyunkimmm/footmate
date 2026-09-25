/* FootMate Case Study · final clarity pass for KPI copy and release summary. */
(function(){
  let applied=false;

  function setText(root,selector,text){
    const node=root?.querySelector(selector);
    if(node)node.textContent=text;
    return node;
  }

  function patch(){
    if(applied)return true;
    if(document.documentElement.dataset.footmateCaseStudyStructuredCopy!=='3')return false;

    const slides=[...document.querySelectorAll('.slide:not([hidden])')];
    if(slides.length!==13)return false;

    const validation=slides[11];
    const measurementLines=validation?.querySelectorAll('.fm-next-cs-note .fm-cs-line')||[];
    if(measurementLines[0]){
      measurementLines[0].textContent='결과 없음 · 참가 실패 · 체크인 완료 · AI 검색 사용률 정의 · 외부 분석 도구 미연동 · 운영·테스트 계정·시뮬레이션 제외 · 표본·기간·기준값 우선 확보';
    }
    if(measurementLines[1])measurementLines[1].remove();

    const release=slides[12];
    if(!release)return false;
    setText(release,'.fm-next-story h2','구현 결과와 다음 과제를 정리했습니다.');
    setText(release,'.fm-next-story-lead','실제 연결 범위와 사용자 검증을 확인했고, 실제 이용자 KPI와 결제 검증은 다음 단계로 남겼습니다.');

    const summary=release.querySelectorAll('.fm-next-review-summary>div');
    const items=[
      ['구현','AI · Supabase · Resend · Push'],
      ['검증','행동 과업 · iOS · Android'],
      ['다음 단계','실제 결제 · 이용자 KPI · 수익성']
    ];
    items.forEach(([label,value],index)=>{
      const item=summary[index];
      if(!item)return;
      const labelNode=setText(item,'span',label);
      const valueNode=setText(item,'b',value);
      if(labelNode&&valueNode)item.insertBefore(document.createTextNode(' '),valueNode);
    });

    release.querySelector('.fm-next-cs-outcomes')?.remove();
    release.querySelector('.fm-next-cs-final')?.remove();

    document.documentElement.dataset.footmateCaseStudyFinalClarity='1';
    applied=true;
    return true;
  }

  if(!patch()){
    let tries=0;
    const timer=setInterval(()=>{
      tries+=1;
      if(patch()||tries>80)clearInterval(timer);
    },25);
  }
})();
