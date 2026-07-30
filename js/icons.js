// 제품 아이콘 — data-icon="키" 를 가진 요소에 SVG 를 넣는다.
// 같은 아이콘이 홈 타일과 각 페이지 rail 카드에 반복되므로 한 곳에서 관리한다.
// 선 두께·크기를 통일해서 7개가 한 세트로 보이게 했다. 색은 부모의 --accent 를 따른다.
(function () {
  var ICONS = {
    // 위생배관 — 주관에서 갈라지는 분기와 물방울
    sanitary:
      '<path d="M5 30h14a4 4 0 0 0 4-4V14"/>' +
      '<path d="M23 22h12a4 4 0 0 1 4 4v8"/>' +
      '<path d="M19 30v8"/>' +
      '<circle cx="23" cy="11" r="1.6" fill="currentColor" stroke="none"/>' +
      '<path d="M35 8c0 0-4 4.6-4 7a4 4 0 0 0 8 0c0-2.4-4-7-4-7z"/>',

    // 밸브 — 게이트밸브 기호(나비형) + 스템·핸들
    valve:
      '<path d="M9 18v12l12-6z"/>' +
      '<path d="M39 18v12l-12-6z"/>' +
      '<path d="M24 24v-9"/>' +
      '<path d="M18 12h12"/>' +
      '<path d="M4 24h5M39 24h5"/>',

    // HVAC 부하 — 온도계와 열 흐름
    hvac:
      '<path d="M20 8a4 4 0 0 1 8 0v18a7 7 0 1 1-8 0z"/>' +
      '<path d="M24 20v10"/>' +
      '<circle cx="24" cy="35" r="3.2" fill="currentColor" stroke="none"/>' +
      '<path d="M34 14h8M34 21h6M34 28h8"/>',

    // 덕트 — 사각 덕트와 풍향
    duct:
      '<path d="M6 16h20v16H6z"/>' +
      '<path d="M26 20h10a6 6 0 0 1 6 6v10"/>' +
      '<path d="M11 22v4M16 22v4M21 22v4"/>' +
      '<path d="M38 32l4 5 4-5"/>',

    // 소방 — 불꽃과 방패
    fire:
      '<path d="M24 6s-9 9-9 15a9 9 0 0 0 18 0c0-6-9-15-9-15z"/>' +
      '<path d="M24 17s-3.5 3.6-3.5 6a3.5 3.5 0 0 0 7 0c0-2.4-3.5-6-3.5-6z" fill="currentColor" stroke="none"/>' +
      '<path d="M10 30v6c0 4 6 7 14 7s14-3 14-7v-6"/>',

    // 스프링클러 — 헤드와 살수
    sprinkler:
      '<path d="M8 10h32"/>' +
      '<path d="M24 10v7"/>' +
      '<path d="M17 17h14l-3 5H20z"/>' +
      '<path d="M13 30c1.5 4 3 6 3 6M22 32v7M32 30c-1.5 4-3 6-3 6"/>',

    // 시방서 — 문서와 체크
    spec:
      '<path d="M12 6h16l8 8v28H12z"/>' +
      '<path d="M28 6v8h8"/>' +
      '<path d="M18 24l3 3 6-6"/>' +
      '<path d="M18 33h12"/>'
  };

  var svg = function (key) {
    var body = ICONS[key];
    if (!body) return '';
    return '<svg class="picon" viewBox="0 0 48 48" aria-hidden="true" focusable="false" ' +
      'fill="none" stroke="currentColor" stroke-width="2" ' +
      'stroke-linecap="round" stroke-linejoin="round">' + body + '</svg>';
  };

  var nodes = document.querySelectorAll('[data-icon]');
  for (var i = 0; i < nodes.length; i++) {
    var key = nodes[i].getAttribute('data-icon');
    if (ICONS[key]) nodes[i].innerHTML = svg(key);
  }
})();
