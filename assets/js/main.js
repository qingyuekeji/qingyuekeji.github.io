(function(){
  "use strict";
  var I18N = window.I18N || {};
  var lang = localStorage.getItem('qy_lang') || 'en';

  // apply translations
  function applyLang(l){
    lang = l;
    document.documentElement.lang = l === 'zh' ? 'zh-CN' : 'en';
    document.querySelectorAll('[data-i18n]').forEach(function(el){
      var k = el.getAttribute('data-i18n');
      var v = I18N[k];
      if (v && v[l] !== undefined) el.textContent = v[l];
    });
    document.querySelectorAll('[data-i18n-ph]').forEach(function(el){
      var k = el.getAttribute('data-i18n-ph');
      var v = I18N[k];
      if (v && v[l]) el.placeholder = v[l];
    });
    document.querySelectorAll('[data-i18n-title]').forEach(function(el){
      var k = el.getAttribute('data-i18n-title');
      var v = I18N[k];
      if (v && v[l]) el.setAttribute('title', v[l]);
    });
    // multi-lang elements toggle by data-en / data-zh
    document.querySelectorAll('[data-en][data-zh]').forEach(function(el){
      if (l === 'zh') { el.textContent = el.getAttribute('data-zh'); }
      else { el.textContent = el.getAttribute('data-en'); }
    });
    // lang toggle label shows the other language
    var lt = document.querySelector('.lang-toggle');
    if (lt) {
      var lbl = I18N['lang.label'];
      lt.textContent = (lbl && lbl[l]) ? lbl[l] : (l === 'zh' ? 'EN' : '中文');
    }
    try { localStorage.setItem('qy_lang', l); } catch(e){}
  }
  applyLang(lang);

  document.addEventListener('click', function(ev){
    var lt = ev.target.closest('.lang-toggle');
    if (lt) {
      // if currently zh, set en (the label shows what clicking does)
      var next = lang === 'en' ? 'zh' : 'en';
      var lbl = I18N['lang.label'];
      // The label currently displays the OTHER lang; clicking should toggle
      // We interpret: when in 'en', label shows '中文', clicking goes to 'zh'.
      applyLang(lang === 'en' ? 'zh' : 'en');
      return;
    }
  });

  // hamburger / mobile nav
  var hb = document.querySelector('.hamburger');
  var mn = document.querySelector('.mobile-nav');
  if (hb && mn) {
    hb.addEventListener('click', function(){ mn.classList.add('open'); document.body.style.overflow='hidden'; });
  }
  if (mn) {
    mn.querySelectorAll('a').forEach(function(a){
      a.addEventListener('click', function(){ mn.classList.remove('open'); document.body.style.overflow=''; });
    });
    var cc = mn.querySelector('.close');
    if (cc) cc.addEventListener('click', function(){ mn.classList.remove('open'); document.body.style.overflow=''; });
  }

  // lightbox for images with class zoomable
  var lightbox = document.getElementById('lightbox');
  function openLb(src){
    if (!lightbox) return;
    lightbox.querySelector('img').src = src;
    lightbox.classList.add('open');
  }
  document.addEventListener('click', function(ev){
    var z = ev.target.closest('.zoomable');
    if (z) {
      var src = z.getAttribute('data-zoom') || z.getAttribute('src') || (z.querySelector('img') && z.querySelector('img').src);
      if (src) openLb(src);
    }
  });
  if (lightbox) {
    lightbox.addEventListener('click', function(){ lightbox.classList.remove('open'); });
  }

  // active nav
  var path = location.pathname.replace(/\/$/,'');
  document.querySelectorAll('nav.mainnav a, .mobile-nav a').forEach(function(a){
    var href = a.getAttribute('href');
    if (href && (href === path || (path && path.indexOf(href) === 0 && href !== '/'))) {
      if (href !== '/' || path === '/index.html') a.classList.add('active');
    }
  });

  // inquiry form -> formsubmit.co AJAX
  var form = document.getElementById('inquiry-form');
  if (form) {
    form.addEventListener('submit', function(e){
      e.preventDefault();
      var btn = form.querySelector('button[type=submit]');
      var data = new FormData(form);
      var email = form.getAttribute('data-email') || 'qyue2411@gmail.com';
      var obj = {}; data.forEach(function(v,k){ obj[k]=v; });
      var orig = btn.innerHTML;
      btn.disabled = true; btn.innerHTML = '...';
      fetch('https://formsubmit.co/ajax/' + email, {
        method:'POST', headers:{'Content-Type':'application/json','Accept':'application/json'},
        body: JSON.stringify(obj)
      }).then(function(r){ return r.json(); })
        .then(function(res){
          var thanks = document.getElementById('form-thanks');
          if (thanks) thanks.style.display = 'block';
          form.reset();
          btn.innerHTML = orig; btn.disabled = false;
        })
        .catch(function(){
          // fallback: mailto
          var subject = encodeURIComponent('Inquiry from ' + (obj.name||'') );
          var body = encodeURIComponent('Name: '+(obj.name||'')+'\nCompany: '+(obj.company||'')+'\nEmail: '+(obj.email||'')+'\nCountry: '+(obj.country||'')+'\n\n'+(obj.message||''));
          window.location.href = 'mailto:' + email + '?subject=' + subject + '&body=' + body;
          btn.innerHTML = orig; btn.disabled = false;
        });
    });
  }
})();
