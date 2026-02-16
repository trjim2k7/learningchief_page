(function(){
  // Catalog filtering
  const age=document.querySelector('[data-filter-age]');
  const sub=document.querySelector('[data-filter-subject]');
  const q=document.querySelector('[data-filter-q]');
  const items=[...document.querySelectorAll('[data-item]')];
  function run(){
    const a=age?.value||''; const s=sub?.value||''; const qq=(q?.value||'').toLowerCase();
    items.forEach(el=>{
      const okA=!a||el.dataset.age===a;
      const okS=!s||el.dataset.subject===s;
      const okQ=!qq||el.textContent.toLowerCase().includes(qq);
      el.style.display=(okA&&okS&&okQ)?'block':'none';
    });
  }
  [age,sub,q].forEach(e=>e&&e.addEventListener('input',run));
  run();

  // Parent dashboard child switch
  const sel=document.querySelector('[data-child-select]');
  const name=document.querySelector('[data-child-name]');
  const streak=document.querySelector('[data-kpi-streak]');
  const comp=document.querySelector('[data-kpi-comp]');
  const math=document.querySelector('[data-kpi-math]');
  const eng=document.querySelector('[data-kpi-eng]');
  const next=document.querySelector('[data-next-action]');
  const data={
    ava:{name:'Ava (Age 7)',streak:'7',comp:'82%',math:'+18%',eng:'+14%',next:'Fractions visual model + 10-minute review.'},
    leo:{name:'Leo (Age 10)',streak:'11',comp:'89%',math:'+12%',eng:'+21%',next:'Inference reading passage + short writing reflection.'},
    mia:{name:'Mia (Age 8)',streak:'4',comp:'63%',math:'+9%',eng:'+8%',next:'Times tables game + confidence booster worksheet.'}
  };
  function render(){
    const k=sel?.value||'ava',d=data[k]; if(!d||!name) return;
    name.textContent=d.name; streak.textContent=d.streak; comp.textContent=d.comp; math.textContent=d.math; eng.textContent=d.eng; next.textContent=d.next;
  }
  sel&&sel.addEventListener('change',render); render();
})();
