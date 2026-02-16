(function(){
  const year=document.querySelector('[data-year]');
  if(year) year.textContent=new Date().getFullYear();

  // catalog filters
  const age=document.querySelector('[data-age]');
  const subject=document.querySelector('[data-subject]');
  const q=document.querySelector('[data-q]');
  const items=[...document.querySelectorAll('[data-item]')];
  function filter(){
    const a=age?.value||''; const s=subject?.value||''; const qq=(q?.value||'').toLowerCase();
    items.forEach(el=>{
      const okA=!a||el.dataset.age===a;
      const okS=!s||el.dataset.subject===s;
      const okQ=!qq||el.textContent.toLowerCase().includes(qq);
      el.style.display=(okA&&okS&&okQ)?'block':'none';
    });
  }
  [age,subject,q].forEach(el=>el&&el.addEventListener('input',filter));
  filter();

  // dashboard child switch
  const child=document.querySelector('[data-child]');
  if(child){
    const db={
      ava:{name:'Ava (7)',streak:'7',completion:'82%',math:'+18%',eng:'+14%',next:'Fractions visual model + short recap.'},
      leo:{name:'Leo (10)',streak:'11',completion:'89%',math:'+12%',eng:'+21%',next:'Inference reading passage + reflection.'},
      mia:{name:'Mia (8)',streak:'4',completion:'63%',math:'+9%',eng:'+8%',next:'Times tables booster + confidence quiz.'}
    };
    function render(){
      const d=db[child.value]; if(!d) return;
      document.querySelector('[data-name]').textContent=d.name;
      document.querySelector('[data-streak]').textContent=d.streak;
      document.querySelector('[data-completion]').textContent=d.completion;
      document.querySelector('[data-math]').textContent=d.math;
      document.querySelector('[data-eng]').textContent=d.eng;
      document.querySelector('[data-next]').textContent=d.next;
    }
    child.addEventListener('change',render); render();
  }
})();
