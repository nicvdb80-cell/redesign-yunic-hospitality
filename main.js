/* Yunic Hospitality — shared interactions */
(function () {
  'use strict';

  /* nav scroll state */
  var nav = document.getElementById('siteNav');
  function onScroll() {
    if (nav) nav.classList.toggle('scrolled', window.scrollY > 24);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* mobile menu */
  var toggle = document.querySelector('.nav-toggle');
  var overlay = document.querySelector('.menu-overlay');
  if (toggle && overlay) {
    toggle.addEventListener('click', function () {
      var open = overlay.classList.toggle('open');
      toggle.classList.toggle('open', open);
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      document.body.style.overflow = open ? 'hidden' : '';
    });
    overlay.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        overlay.classList.remove('open');
        toggle.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });
  }

  /* reveal on scroll */
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.18, rootMargin: '0px 0px -6% 0px' });
  document.querySelectorAll('.rv, .not-list, .u-line, .svc-list, .hero-visual').forEach(function (el) {
    io.observe(el);
  });

  /* gentle parallax on photo bands + hero arch */
  var px = document.querySelectorAll('[data-parallax]');
  if (px.length && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    var ticking = false;
    function move() {
      px.forEach(function (el) {
        var r = el.getBoundingClientRect();
        var p = (r.top + r.height / 2 - window.innerHeight / 2) / window.innerHeight;
        el.style.transform = 'translateY(' + (p * -34).toFixed(1) + 'px)';
      });
      ticking = false;
    }
    window.addEventListener('scroll', function () {
      if (!ticking) { requestAnimationFrame(move); ticking = true; }
    }, { passive: true });
    move();
  }

  /* gallery filters */
  var filters = document.querySelectorAll('.gal-filters button');
  if (filters.length) {
    filters.forEach(function (btn) {
      btn.addEventListener('click', function () {
        filters.forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        var cat = btn.getAttribute('data-filter');
        document.querySelectorAll('.gal-item').forEach(function (item) {
          item.classList.toggle('hide', cat !== 'all' && item.getAttribute('data-cat') !== cat);
        });
      });
    });
  }

  /* footer year */
  var y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();
})();

/* background music, site-wide toggle, preference remembered across pages */
(function () {
  'use strict';
  var STORAGE_KEY = 'yunic-music';

  var audio = document.createElement('audio');
  audio.src = 'background-track.mp3';
  audio.loop = true;
  audio.preload = 'none';
  document.body.appendChild(audio);

  var btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'music-toggle';
  btn.setAttribute('aria-pressed', 'false');
  btn.setAttribute('aria-label', 'Play background music');
  btn.innerHTML = '<span class="mt-bars" aria-hidden="true"><i></i><i></i><i></i></span>';
  document.body.appendChild(btn);

  function reflect(playing) {
    btn.classList.toggle('is-playing', playing);
    btn.setAttribute('aria-pressed', playing ? 'true' : 'false');
    btn.setAttribute('aria-label', playing ? 'Pause background music' : 'Play background music');
  }

  audio.addEventListener('play', function () { reflect(true); });
  audio.addEventListener('pause', function () { reflect(false); });

  btn.addEventListener('click', function () {
    if (audio.paused) {
      audio.play().then(function () {
        localStorage.setItem(STORAGE_KEY, 'on');
      }).catch(function () {});
    } else {
      audio.pause();
      localStorage.setItem(STORAGE_KEY, 'off');
    }
  });

  /* try to resume automatically on each new page if the visitor had it playing;
     browsers may block this until there has been a real click on this page,
     in which case the button simply waits, showing as available to tap */
  if (localStorage.getItem(STORAGE_KEY) === 'on') {
    audio.play().catch(function () {});
  }
})();
