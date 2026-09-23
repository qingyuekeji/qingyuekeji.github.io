(function(){
  "use strict";
  var I18N = window.I18N || {};
  var LANGS = ['en','zh','es'];
  var NEXT  = { en:'中文', zh:'ES', es:'EN' };
  var HTMLANG = { en:'en', zh:'zh-CN', es:'es' };
  var lang = localStorage.getItem('qy_lang') || 'en';
  if (LANGS.indexOf(lang) < 0) lang = 'en';

  function pick(v){
    if (!v) return null;
    if (v[lang] !== undefined && v[lang] !== '') return v[lang];
    if (v.en !== undefined) return v.en;
    return null;
  }

  function applyLang(l){
    lang = l;
    document.documentElement.lang = HTMLANG[l] || 'en';

    document.querySelectorAll('[data-i18n]').forEach(function(el){
      var t = pick(I18N[el.getAttribute('data-i18n')]);
      if (t !== null) el.textContent = t;
    });
    document.querySelectorAll('[data-i18n-ph]').forEach(function(el){
      var t = pick(I18N[el.getAttribute('data-i18n-ph')]);
      if (t) el.placeholder = t;
    });
    document.querySelectorAll('[data-i18n-title]').forEach(function(el){
      var t = pick(I18N[el.getAttribute('data-i18n-title')]);
      if (t) el.setAttribute('title', t);
    });
    document.querySelectorAll('[data-en]').forEach(function(el){
      var t = el.getAttribute('data-' + l);
      if (t === null || t === '') t = el.getAttribute('data-en');
      if (t !== null) el.textContent = t;
    });

    document.querySelectorAll('.lang-toggle').forEach(function(lt){
      lt.textContent = NEXT[lang] || '中文';
    });
    try { localStorage.setItem('qy_lang', l); } catch(e){}
  }
  applyLang(lang);

  document.addEventListener('click', function(ev){
    var lt = ev.target.closest('.lang-toggle');
    if (!lt) return;
    var i = LANGS.indexOf(lang);
    applyLang(LANGS[(i + 1) % LANGS.length]);
  });

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

  var lightbox = document.getElementById('lightbox');
  document.addEventListener('click', function(ev){
    var z = ev.target.closest('.zoomable');
    if (z && lightbox) {
      var src = z.getAttribute('data-zoom') || z.getAttribute('src') || (z.querySelector('img') && z.querySelector('img').src);
      if (src) { lightbox.querySelector('img').src = src; lightbox.classList.add('open'); }
    }
  });
  if (lightbox) lightbox.addEventListener('click', function(){ lightbox.classList.remove('open'); });

  var path = location.pathname.replace(/\/$/,'');
  document.querySelectorAll('nav.mainnav a, .mobile-nav a').forEach(function(a){
    var href = a.getAttribute('href');
    if (href && (href === path || (path && path.indexOf(href) === 0 && href !== '/'))) {
      if (href !== '/' || path === '/index.html') a.classList.add('active');
    }
  });

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
        .then(function(){
          var thanks = document.getElementById('form-thanks');
          if (thanks) thanks.style.display = 'block';
          form.reset(); btn.innerHTML = orig; btn.disabled = false;
        })
        .catch(function(){
          var subject = encodeURIComponent('Inquiry from ' + (obj.name||''));
          var body = encodeURIComponent('Name: '+(obj.name||'')+'\nCompany: '+(obj.company||'')+'\nEmail: '+(obj.email||'')+'\nCountry: '+(obj.country||'')+'\n\n'+(obj.message||''));
          window.location.href = 'mailto:' + email + '?subject=' + subject + '&body=' + body;
          btn.innerHTML = orig; btn.disabled = false;
        });
    });
  }
})();
