// 스크롤 진입 시 요소를 부드럽게 드러내는 공통 스크립트
(function () {
  var items = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window)) {
    items.forEach(function (el) { el.classList.add('is-in'); });
    return;
  }
  // 백그라운드 탭 등으로 IO가 지연되더라도 첫 화면 요소는 반드시 드러나도록 폴백
  var revealInitial = function () {
    items.forEach(function (el) {
      if (el.getBoundingClientRect().top < window.innerHeight) {
        el.classList.add('is-in');
      }
    });
  };
  window.addEventListener('load', function () { setTimeout(revealInitial, 600); });
  document.addEventListener('visibilitychange', function () {
    if (!document.hidden) setTimeout(revealInitial, 100);
  });

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-in');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
  items.forEach(function (el) { io.observe(el); });

  // 데모 iframe은 화면에 가까워졌을 때만 로드 (초기 로딩 가볍게)
  var frames = document.querySelectorAll('iframe[data-src]');
  if (frames.length) {
    var fio = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var f = entry.target;
          f.src = f.getAttribute('data-src');
          fio.unobserve(f);
        }
      });
    }, { rootMargin: '400px' });
    frames.forEach(function (f) { fio.observe(f); });
  }
})();
