(function(){
  const age = document.querySelector('[data-age-select]');
  const subject = document.querySelector('[data-subject-select]');
  const out = document.querySelector('[data-reco]');
  function rec(){
    if(!age||!subject||!out) return;
    const a=age.value,s=subject.value;
    if(!a||!s){ out.textContent='Choose age and subject to get a recommended starting path.'; return; }
    const level = a==='6-8' ? 'Foundation' : 'Growth';
    out.textContent = `Recommended: ${level} ${s} Path · 4 weeks · 3 sessions/week.`;
  }
  if(age&&subject){ age.addEventListener('change',rec); subject.addEventListener('change',rec); rec(); }
})();
