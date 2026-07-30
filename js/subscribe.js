/**
 * MEP Works — 무료 앱 소식 구독 모듈
 *
 * 무료 앱에 로그인 벽을 세우지 않는다. 무료 앱의 존재 이유가 마찰 0 이기 때문이다.
 * 대신 한참 쓰고 난 뒤에 작은 카드로 이메일만 물어본다. 거절하면 다시 묻지 않는다.
 *
 * 붙이는 법 — 앱의 index.html 맨 아래에 두 줄:
 *   <script src="subscribe.js?v=1"></script>
 *   <script>MEPSubscribe.init({ apiUrl:"...", appId:"valve", appName:"밸브 계통도 계산서" });</script>
 *
 * 모은 명단은 「구독」 시트에 쌓인다. 나중에 이 앱을 유료화할 때
 * "먼저 써주신 분" 명단이 되고, 뉴스레터 발송 대상이 된다.
 */
window.MEPSubscribe = (function () {
  'use strict';

  var cfg = null;
  var KEY = 'mep_subscribe_v1';

  function init(options) {
    cfg = Object.assign({
      apiUrl: '',
      appId: '',
      appName: '이 앱',
      delaySeconds: 90,     // 이만큼 써본 뒤에 물어본다
      snoozeDays: 30        // "나중에" 를 누르면 이 기간 동안 안 뜬다
    }, options || {});

    if (!cfg.apiUrl || !cfg.appId) return;
    if (!shouldAsk()) return;

    // 인쇄 중이거나 탭이 숨어 있으면 세지 않는다 — 실제로 쓴 시간만 센다
    var elapsed = 0;
    var timer = setInterval(function () {
      if (document.hidden) return;
      elapsed += 1;
      if (elapsed >= cfg.delaySeconds) {
        clearInterval(timer);
        if (shouldAsk()) show();
      }
    }, 1000);
  }

  function state() {
    try { return JSON.parse(localStorage.getItem(KEY) || '{}'); } catch (e) { return {}; }
  }

  function save(v) {
    try { localStorage.setItem(KEY, JSON.stringify(v)); } catch (e) { /* 저장 실패는 무시 */ }
  }

  function shouldAsk() {
    var s = state();
    if (s.done) return false;                       // 이미 신청함 — 다시 묻지 않는다
    if (s.snoozeUntil && Date.now() < s.snoozeUntil) return false;
    return true;
  }

  function show() {
    injectStyles();
    var box = document.createElement('div');
    box.className = 'mepsub';
    box.innerHTML =
      '<button class="mepsub__x" aria-label="닫기">✕</button>' +
      '<p class="mepsub__title">새 기능이 나오면 알려드릴까요?</p>' +
      '<p class="mepsub__desc">' + esc(cfg.appName) + '은 계속 고쳐지고 있습니다.<br>' +
      '기능이 추가되거나 기준이 바뀌면 메일로 한 번씩 알려드립니다.</p>' +
      '<div class="mepsub__form">' +
      '<input type="email" class="mepsub__in" id="mepsub-email" placeholder="이메일 주소" ' +
      'autocomplete="email" inputmode="email">' +
      '<button class="mepsub__go" id="mepsub-go">신청</button>' +
      '</div>' +
      '<p class="mepsub__status" id="mepsub-status"></p>' +
      '<button class="mepsub__later" id="mepsub-later">나중에</button>';
    document.body.appendChild(box);
    requestAnimationFrame(function () { box.classList.add('is-in'); });

    box.querySelector('.mepsub__x').onclick = function () { snooze(box); };
    box.querySelector('#mepsub-later').onclick = function () { snooze(box); };
    box.querySelector('#mepsub-go').onclick = function () { submit(box); };
    box.querySelector('#mepsub-email').addEventListener('keydown', function (e) {
      if (e.key === 'Enter') submit(box);
    });
  }

  function snooze(box) {
    var s = state();
    s.snoozeUntil = Date.now() + cfg.snoozeDays * 86400000;
    save(s);
    close(box);
  }

  function close(box) {
    box.classList.remove('is-in');
    setTimeout(function () { box.remove(); }, 240);
  }

  function submit(box) {
    var input = box.querySelector('#mepsub-email');
    var status = box.querySelector('#mepsub-status');
    var email = String(input.value || '').trim();

    if (!/^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(email)) {
      status.textContent = '이메일 주소를 다시 확인해 주세요.';
      status.className = 'mepsub__status is-err';
      input.focus();
      return;
    }

    status.textContent = '신청 중…';
    status.className = 'mepsub__status';
    box.querySelector('#mepsub-go').disabled = true;

    // Apps Script 는 OPTIONS 를 처리하지 못한다.
    // text/plain 으로 보내야 preflight 없이 통과한다.
    fetch(cfg.apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({
        action: 'subscribe',
        appId: cfg.appId,
        email: email,
        channel: detectChannel()
      })
    }).then(function (res) {
      return res.text();
    }).then(function (txt) {
      var data = {};
      try { data = JSON.parse(txt); } catch (e) { /* 응답이 깨져도 아래에서 처리 */ }
      if (data.ok) {
        var s = state();
        s.done = true;
        save(s);
        box.innerHTML = '<p class="mepsub__title">감사합니다.</p>' +
          '<p class="mepsub__desc">' + esc(data.message || '새 기능이 나오면 알려드리겠습니다.') + '</p>';
        setTimeout(function () { close(box); }, 2600);
      } else {
        status.textContent = data.message || '잠시 후 다시 시도해 주세요.';
        status.className = 'mepsub__status is-err';
        box.querySelector('#mepsub-go').disabled = false;
      }
    }).catch(function () {
      status.textContent = '연결이 안 됩니다. 잠시 후 다시 시도해 주세요.';
      status.className = 'mepsub__status is-err';
      box.querySelector('#mepsub-go').disabled = false;
    });
  }

  /** 어디서 왔는지 자동 추정 — 물어보지 않아도 채널 데이터가 남는다 */
  function detectChannel() {
    var q = new URLSearchParams(location.search);
    var utm = q.get('utm_source') || q.get('from');
    if (utm) return utm;
    var r = document.referrer || '';
    if (!r) return '';
    if (/naver/.test(r)) return '네이버';
    if (/google/.test(r)) return '구글검색';
    if (/youtube/.test(r)) return '유튜브';
    if (/instagram|threads/.test(r)) return '인스타/스레드';
    if (/choi-ilkwon|mepworks/.test(r)) return '소개사이트';
    try { return new URL(r).hostname; } catch (e) { return ''; }
  }

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function injectStyles() {
    if (document.getElementById('mepsub-css')) return;
    var st = document.createElement('style');
    st.id = 'mepsub-css';
    st.textContent = [
      '.mepsub{position:fixed;right:20px;bottom:20px;z-index:99999;width:320px;max-width:calc(100vw - 32px);',
      '  background:#fff;color:#1a2a4a;border:1px solid #dfe5f2;border-radius:16px;padding:20px 20px 16px;',
      '  box-shadow:0 12px 40px rgba(20,35,70,.18);font:13px/1.6 -apple-system,"Malgun Gothic",sans-serif;',
      '  opacity:0;transform:translateY(12px);transition:opacity .24s ease,transform .24s ease}',
      '.mepsub.is-in{opacity:1;transform:translateY(0)}',
      '.mepsub__x{position:absolute;top:10px;right:10px;border:0;background:none;cursor:pointer;',
      '  color:#9aa6bd;font-size:14px;line-height:1;padding:4px}',
      '.mepsub__x:hover{color:#5a6b85}',
      '.mepsub__title{font-size:15px;font-weight:700;margin:0 0 6px;padding-right:18px}',
      '.mepsub__desc{color:#5a6b85;margin:0 0 14px;font-size:12.5px}',
      '.mepsub__form{display:flex;gap:6px}',
      '.mepsub__in{flex:1;min-width:0;font:13px inherit;padding:9px 11px;border:1px solid #d0d8ee;',
      '  border-radius:9px;background:#fbfcfe;color:#1a2a4a}',
      '.mepsub__in:focus{outline:none;border-color:#2563eb;background:#fff}',
      '.mepsub__go{font:inherit;font-weight:600;padding:9px 15px;border-radius:9px;border:0;',
      '  background:#2563eb;color:#fff;cursor:pointer;white-space:nowrap}',
      '.mepsub__go:hover{background:#1d4fd0}',
      '.mepsub__go:disabled{opacity:.55;cursor:default}',
      '.mepsub__status{min-height:16px;margin:8px 0 0;font-size:12px;color:#5a6b85}',
      '.mepsub__status.is-err{color:#dc2626}',
      '.mepsub__later{display:block;margin:6px auto 0;border:0;background:none;cursor:pointer;',
      '  color:#9aa6bd;font:12px inherit;text-decoration:underline;padding:4px}',
      '.mepsub__later:hover{color:#5a6b85}',
      '@media (max-width:520px){.mepsub{right:12px;left:12px;bottom:12px;width:auto}}',
      '@media print{.mepsub{display:none!important}}'
    ].join('');
    document.head.appendChild(st);
  }

  return { init: init };
})();
