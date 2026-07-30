// 스크린샷 클릭 → 전체화면 라이트박스, 한 번 더 클릭 → 100% 원본 크기(스크롤 탐색)
(function () {
  var targets = document.querySelectorAll('img[data-zoom]');
  if (!targets.length) return;

  var box = document.createElement('div');
  box.className = 'lightbox';
  box.innerHTML =
    '<button class="lightbox__close" aria-label="닫기">✕</button>' +
    '<img alt="">' +
    '<p class="lightbox__cap">클릭: 100% 크기로 확대 · ESC 또는 ✕: 닫기</p>';
  document.body.appendChild(box);

  var img = box.querySelector('img');
  var cap = box.querySelector('.lightbox__cap');

  function open(src, alt) {
    img.src = src;
    img.alt = alt || '';
    box.classList.remove('zoomed');
    box.classList.add('open');
    cap.textContent = '클릭: 100% 크기로 확대 · ESC 또는 ✕: 닫기';
    document.body.style.overflow = 'hidden';
  }
  function close() {
    box.classList.remove('open', 'zoomed');
    document.body.style.overflow = '';
  }

  targets.forEach(function (t) {
    t.addEventListener('click', function () {
      open(t.currentSrc || t.src, t.alt);
    });
  });

  img.addEventListener('click', function (e) {
    e.stopPropagation();
    var zoomed = box.classList.toggle('zoomed');
    cap.textContent = zoomed
      ? '원본 크기 — 드래그/스크롤로 이동 · 클릭하면 축소'
      : '클릭: 100% 크기로 확대 · ESC 또는 ✕: 닫기';
  });
  box.addEventListener('click', function (e) {
    if (e.target === box) close();
  });
  box.querySelector('.lightbox__close').addEventListener('click', close);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && box.classList.contains('open')) close();
  });
})();
