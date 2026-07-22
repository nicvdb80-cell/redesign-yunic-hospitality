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

/* background music: entry gate on first visit + site-wide toggle */
(function () {
  'use strict';
  var STORAGE_KEY = 'yunic-music';
  var SESSION_KEY = 'yunic-entered';

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

  /* try to resume automatically on each new page within the same visit if
     the visitor already has it on; browsers generally allow this once
     there has been a real click earlier in the session */
  function tryResume() {
    if (localStorage.getItem(STORAGE_KEY) === 'on') {
      audio.play().catch(function () {});
    }
  }

  /* one-time entry gate: shown once per browser session (not on every
     page navigation), gives a single click that both reveals the site
     and starts the music with real user-gesture permission */
  if (!sessionStorage.getItem(SESSION_KEY)) {
    var gate = document.createElement('div');
    gate.className = 'entry-gate';
    gate.innerHTML =
      '<div class="eg-inner">' +
        '<img src="yunic-logo-gold.png" alt="Yunic Hospitality" class="eg-logo">' +
        '<p class="eg-word">Yunic Hospitality</p>' +
        '<button type="button" class="btn eg-enter"><span>Enter</span></button>' +
        '<button type="button" class="eg-skip">Continue without sound</button>' +
      '</div>';
    document.body.appendChild(gate);
    document.body.style.overflow = 'hidden';

    function dismiss(withSound) {
      sessionStorage.setItem(SESSION_KEY, '1');
      if (withSound) {
        audio.play().then(function () {
          localStorage.setItem(STORAGE_KEY, 'on');
        }).catch(function () {});
      }
      gate.classList.add('closing');
      document.body.style.overflow = '';
      window.setTimeout(function () {
        gate.remove();
      }, 650);
    }

    gate.querySelector('.eg-enter').addEventListener('click', function () { dismiss(true); });
    gate.querySelector('.eg-skip').addEventListener('click', function () { dismiss(false); });
  } else {
    tryResume();
  }
})();
