// 제품 데모 장면 자동 재생 시퀀서
// [data-scene] 컨테이너가 화면에 들어오면 내부 [data-step] 요소를
// 순서대로 나타나게 하고, 끝나면 잠시 후 처음부터 반복한다.
(function () {
  function countUp(el) {
    var target = parseFloat(el.getAttribute('data-count')) || 0;
    var suffix = el.getAttribute('data-suffix') || '';
    var dur = 900;
    var t0 = performance.now();
    function tick(t) {
      var p = Math.min((t - t0) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  function playScene(scene) {
    var steps = scene.querySelectorAll('[data-step]');
    var i = 0;
    function next() {
      if (i >= steps.length) {
        setTimeout(function () {
          steps.forEach(function (el) { el.classList.remove('on'); });
          scene.querySelectorAll('[data-count]').forEach(function (el) {
            el.textContent = '0' + (el.getAttribute('data-suffix') || '');
          });
          i = 0;
          setTimeout(next, 900);
        }, 3000);
        return;
      }
      var el = steps[i++];
      el.classList.add('on');
      el.querySelectorAll('[data-count]').forEach(countUp);
      if (el.hasAttribute('data-count')) countUp(el);
      setTimeout(next, parseInt(el.getAttribute('data-delay') || '700', 10));
    }
    next();
  }

  var scenes = document.querySelectorAll('[data-scene]');
  if (!scenes.length) return;

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    scenes.forEach(function (scene) {
      scene.querySelectorAll('[data-step]').forEach(function (el) { el.classList.add('on'); });
      scene.querySelectorAll('[data-count]').forEach(function (el) {
        el.textContent = el.getAttribute('data-count') + (el.getAttribute('data-suffix') || '');
      });
    });
    return;
  }

  var started = new WeakSet();
  function start(scene) {
    if (started.has(scene)) return;
    started.add(scene);
    playScene(scene);
  }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { start(e.target); io.unobserve(e.target); }
    });
  }, { threshold: 0.3 });
  scenes.forEach(function (s) { io.observe(s); });

  // 숨김 탭에서 열렸다가 보여지는 경우 폴백
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) return;
    scenes.forEach(function (s) {
      var r = s.getBoundingClientRect();
      if (r.top < window.innerHeight && r.bottom > 0) start(s);
    });
  });
})();
