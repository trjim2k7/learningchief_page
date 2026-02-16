(function(){
  const tabs=[...document.querySelectorAll('[data-f4-tab]')];
  const panes=[...document.querySelectorAll('[data-f4-pane]')];
  function activate(id){
    tabs.forEach(t=>t.dataset.active=(t.dataset.f4Tab===id?'1':'0'));
    panes.forEach(p=>p.style.display=(p.dataset.f4Pane===id?'block':'none'));
  }
  tabs.forEach(t=>t.addEventListener('click',()=>activate(t.dataset.f4Tab)));
  if(tabs.length) activate(tabs[0].dataset.f4Tab);
})();
