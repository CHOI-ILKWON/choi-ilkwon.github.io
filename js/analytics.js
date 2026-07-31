// 방문 측정 (Google Analytics 4)
//
// 페이지마다 코드를 붙이지 않고 이 파일 하나만 불러오게 한다.
// 측정 ID 를 바꾸거나 이벤트를 추가할 때 여기만 고치면 사이트 전체에 반영된다.
(function () {
  var ID = 'G-BL4VM4LDVL';

  var s = document.createElement('script');
  s.async = true;
  s.src = 'https://www.googletagmanager.com/gtag/js?id=' + ID;
  document.head.appendChild(s);

  window.dataLayer = window.dataLayer || [];
  window.gtag = function () { window.dataLayer.push(arguments); };
  gtag('js', new Date());
  gtag('config', ID);

  // 앱으로 나가는 클릭을 따로 잡는다.
  // 소개 페이지를 몇 명이 봤는지보다 "몇 명이 앱으로 넘어갔는지"가 중요하다.
  var APPS = {
    'sanitary-pipe-calc.pages.dev': 'sanitary',
    '/valve-calc': 'valve',
    '/hvac-calc': 'hvac',
    '/duct-calc': 'duct',
    '/fire-suppression-calc': 'fire',
    '/sprinkler-app': 'sprinkler',
    '/hvac-specification': 'spec'
  };

  document.addEventListener('click', function (e) {
    var a = e.target && e.target.closest ? e.target.closest('a[href]') : null;
    if (!a) return;
    var href = a.getAttribute('href') || '';

    for (var key in APPS) {
      if (href.indexOf(key) >= 0) {
        // 어느 위치의 버튼이 눌렸는지는 링크의 utm_content 로 구분한다
        var m = href.match(/utm_content=([^&]+)/);
        gtag('event', 'app_open', {
          app_id: APPS[key],
          placement: m ? decodeURIComponent(m[1]) : '(없음)',
          page: location.pathname
        });
        return;
      }
    }

    // 메일 문의도 전환에 가까운 행동이라 함께 잡는다
    if (href.indexOf('mailto:') === 0) {
      gtag('event', 'contact_mail', { page: location.pathname });
    }
  });
})();
