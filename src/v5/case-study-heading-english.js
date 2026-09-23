/* FootMate Case Study · English story headings only.
   Keeps cover, body copy, labels, data, IA, links, and interactions unchanged. */
(function(){
  const headings=[
    'Choosing one match still takes too many separate checks.',
    'After work, choose a nearby match without overthinking it.',
    'Build one continuous decision flow instead of adding more features.',
    'Show recommendation value before asking for an account.',
    'Remember useful preferences without replacing explainable ranking.',
    'Design match detail around the participation decision.',
    'Preserve the chosen match through authentication and participation.',
    'Let the current match state reshape the home priority.',
    'Preserve context first, then offer the next action.',
    'Separate state ownership, provider boundaries, and AI authority.',
    'Keep automated QA, human verification, and AI-assisted review separate.',
    'Only describe capabilities that are actually connected and verified.'
  ];

  let attempts=0;
  function apply(){
    const slides=[...document.querySelectorAll('.slide:not([hidden])')];
    if(slides.length!==13){
      if(attempts++<80)setTimeout(apply,50);
      return;
    }
    headings.forEach((heading,index)=>{
      const title=slides[index+1]?.querySelector('.fm-next-story h2');
      if(title)title.textContent=heading;
    });
  }

  apply();
})();
