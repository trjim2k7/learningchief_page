(function(){
  const els = document.querySelectorAll('[data-lc-year]');
  const year = new Date().getFullYear();
  els.forEach(el => el.textContent = year);
})();
