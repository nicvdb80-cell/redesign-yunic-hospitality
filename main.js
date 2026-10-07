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
  var TIME_KEY = 'yunic-music-time';

  var audio = document.createElement('audio');
  audio.src = 'background-track.mp3';
  audio.loop = true;
  /* 'metadata' (not 'none') so duration loads immediately on every page,
     letting us restore the saved playback position before audio starts */
  audio.preload = 'metadata';
  document.body.appendChild(audio);

  /* carry playback position across page navigations so the track
     continues from where it left off instead of restarting at 0:00 */
  function restoreTime() {
    var t = parseFloat(localStorage.getItem(TIME_KEY));
    if (!isNaN(t) && t > 0 && isFinite(audio.duration) && audio.duration > 0) {
      audio.currentTime = t % audio.duration;
    }
  }
  audio.addEventListener('loadedmetadata', restoreTime);
  if (audio.readyState >= 1) restoreTime();

  function saveTime() {
    if (!isNaN(audio.currentTime)) {
      localStorage.setItem(TIME_KEY, String(audio.currentTime));
    }
  }
  window.setInterval(function () {
    if (!audio.paused) saveTime();
  }, 1000);
  window.addEventListener('pagehide', saveTime);
  window.addEventListener('beforeunload', saveTime);

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

  /* testimonial slider — one at a time, swipeable (drag left/right) + dots + autoplay */
  var slider = document.querySelector('.t-slider');
  if (slider) {
    var viewport = slider.querySelector('.t-viewport');
    var track = slider.querySelector('.t-track');
    var slides = Array.prototype.slice.call(slider.querySelectorAll('.t-slide'));
    var dotsWrap = slider.querySelector('.t-dots');
    if (slides.length > 1 && track && viewport && dotsWrap) {
      var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      var delay = parseInt(slider.getAttribute('data-autoplay'), 10) || 7000;
      var idx = 0, timer = null, W = 0, startX = 0, dragging = false;

      var dots = slides.map(function (s, i) {
        var b = document.createElement('button');
        b.type = 'button';
        b.setAttribute('role', 'tab');
        b.setAttribute('aria-label', 'Testimonial ' + (i + 1));
        if (i === 0) { b.className = 'is-active'; b.setAttribute('aria-selected', 'true'); }
        b.addEventListener('click', function () { go(i); start(); });
        dotsWrap.appendChild(b);
        return b;
      });

      function setX(px) { track.style.transform = 'translate3d(' + px + 'px,0,0)'; }
      function render() {
        W = viewport.clientWidth;
        setX(-idx * W);
        dots.forEach(function (d, i) {
          var a = i === idx;
          d.classList.toggle('is-active', a);
          d.setAttribute('aria-selected', a ? 'true' : 'false');
        });
      }
      function go(n) { idx = ((n % slides.length) + slides.length) % slides.length; render(); }
      function next() { go(idx + 1); }
      function start() { if (!reduce) { stop(); timer = window.setInterval(next, delay); } }
      function stop() { if (timer) { window.clearInterval(timer); timer = null; } }

      /* drag / swipe via pointer events (covers mouse + touch) */
      track.addEventListener('pointerdown', function (e) {
        dragging = true; startX = e.clientX; W = viewport.clientWidth;
        track.classList.add('is-dragging'); stop();
        try { track.setPointerCapture(e.pointerId); } catch (_) {}
      });
      track.addEventListener('pointermove', function (e) {
        if (!dragging) return;
        var dx = e.clientX - startX, base = -idx * W, pos = base + dx;
        if ((idx === 0 && dx > 0) || (idx === slides.length - 1 && dx < 0)) pos = base + dx * 0.35;
        setX(pos);
      });
      function end(e) {
        if (!dragging) return;
        dragging = false;
        track.classList.remove('is-dragging');
        var dx = (typeof e.clientX === 'number' ? e.clientX : startX) - startX;
        var threshold = Math.min(80, W * 0.18);
        if (dx <= -threshold) idx = Math.min(idx + 1, slides.length - 1);
        else if (dx >= threshold) idx = Math.max(idx - 1, 0);
        render();
        start();
      }
      track.addEventListener('pointerup', end);
      track.addEventListener('pointercancel', end);
      track.addEventListener('dragstart', function (e) { e.preventDefault(); });

      slider.addEventListener('mouseenter', stop);
      slider.addEventListener('mouseleave', start);
      slider.addEventListener('focusin', stop);
      slider.addEventListener('focusout', start);
      document.addEventListener('visibilitychange', function () {
        if (document.hidden) stop(); else start();
      });
      window.addEventListener('resize', render, { passive: true });

      render();
      start();
    } else if (dotsWrap) {
      dotsWrap.style.display = 'none';
    }
  }
})();
