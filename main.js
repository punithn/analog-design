(function () {
  var root = document.documentElement, $ = function (id) { return document.getElementById(id); };
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Hero demo: elevation drawing + BOQ with sign-off gate (sample data)
  var d = $('demo');
  if (d) {
    var base = [
      { n: 'Wardrobe carcass, 18 mm BWP ply', ref: 'A-201', q: 14.5, u: 'sqm', r: 2400 },
      { n: 'Fluted wall panel, oak veneer', ref: 'A-305', q: 2.8, u: 'sqm', r: 1850 },
      { n: 'Study desk, laminate top', ref: 'A-310', q: 1, u: 'nos', r: 28500 },
      { n: 'Skirting, painted MDF', ref: 'A-102', q: null, u: 'rm', r: 420 }
    ], notes = {
      studio: 'A locked record of what was agreed.',
      maker: 'Clear scopes and quantities, not a drawing set to interpret.',
      client: 'Cost and progress you can verify and sign off.'
    }, rows, st, act = $('act'), els = d.querySelectorAll('.arch .el'), tg = d.querySelectorAll('.tg');
    var inr = function (n) { return '\u20B9' + Math.round(n).toLocaleString('en-IN'); };
    var fl = ''; for (var x = 198; x <= 322; x += 8) fl += 'M' + x + ' 40V240'; $('flutes').setAttribute('d', fl);
    function hl(t) { d.querySelectorAll('[data-i]').forEach(function (n) { n.classList.toggle('hl', !!t && n.dataset.i === t.dataset.i); }); }
    function render(f) {
      var miss = rows.some(function (r) { return r.q == null; }), tot = 0, v = d.dataset.view;
      $('rows').innerHTML = rows.map(function (r, i) {
        var m = r.q == null; if (!m) tot += r.q * r.r;
        return '<tr data-i="' + i + '"' + (i === f ? ' class="flash"' : '') + '><td class="c-item">' + r.n +
          (st === 'frozen' ? '<svg class="ic sm lk"><use href="#i-lock"/></svg>' : '') + '</td><td class="c-ref">' + r.ref +
          '</td><td class="c-qty">' + (m ? '<button class="link" data-fix="' + i + '">Add detail</button>' : r.q + ' ' + r.u) +
          '</td><td class="c-rate">' + inr(r.r) + '/' + r.u + '</td><td class="c-amt">' + (m ? 'Pending' : inr(r.q * r.r)) + '</td></tr>';
      }).join('');
      rows.forEach(function (r, i) {
        var m = r.q == null;
        tg[i].textContent = v === 'studio' ? r.ref + (m ? ' \u00B7 missing' : '') : v === 'maker' ? (m ? 'Qty missing' : r.q + ' ' + r.u) : (m ? 'Cost pending' : inr(r.q * r.r));
        els[i].classList.remove('flash');
        if (i === f) { void els[i].getBoundingClientRect(); els[i].classList.add('flash'); }
      });
      $('g3').classList.toggle('miss', miss);
      $('arch').classList.toggle('frozen', st === 'frozen');
      d.classList.toggle('is-frozen', st === 'frozen');
      $('rev').textContent = st === 'frozen' ? 'REV A \u00B7 LOCKED' : st === 'reopened' ? 'REV B \u00B7 SIGN-OFF REQUIRED' : 'REV A \u00B7 DRAFT';
      $('tot').textContent = inr(tot);
      var s = miss ? ['i-next', 'Draft. 1 item is missing from the drawings.']
        : st === 'frozen' ? ['i-lock', 'Approved and frozen. Any edit reopens sign-off.']
        : st === 'reopened' ? ['i-next', 'Quantity edited. Sign-off reopened.']
        : ['i-check', 'Draft is complete and ready to approve.'];
      $('sIcon').setAttribute('href', '#' + s[0]); $('sText').textContent = s[1];
      act.textContent = st === 'frozen' ? 'Edit a quantity' : 'Approve and freeze';
      act.classList.toggle('ghost', st === 'frozen');
      act.disabled = miss;
      act.title = miss ? 'Add the missing detail first' : '';
    }
    function reset() { rows = base.map(function (r) { return Object.assign({}, r); }); st = 'draft'; render(); }
    function setView(v) {
      d.dataset.view = v; $('note').textContent = notes[v];
      d.querySelectorAll('.tabs button').forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.v === v); });
      if (rows) render();
    }
    d.addEventListener('mouseover', function (e) { hl(e.target.closest('[data-i]')); });
    d.addEventListener('mouseout', function () { hl(null); });
    d.addEventListener('click', function (e) {
      var t = e.target.closest('button'); if (!t) return;
      if (t.dataset.v) setView(t.dataset.v);
      else if (t.dataset.fix) { rows[t.dataset.fix].q = 4.4; render(+t.dataset.fix); }
      else if (t === act) {
        if (st === 'frozen') { rows[0].q += 1; st = 'reopened'; render(0); } else { st = 'frozen'; render(); }
      } else if (t.id === 'reset') reset();
    });
    setView('studio'); reset();
  }

  // Theme: Paper / Night
  $('theme').addEventListener('click', function () {
    var t = root.dataset.theme === 'night' ? 'paper' : 'night';
    root.dataset.theme = t;
    try { localStorage.setItem('analogi-theme', t); } catch (e) {}
  });

  // Overlay menu
  var ov = $('overlay'), openBtn = $('menuBtn'), closeBtn = $('closeBtn');
  function setMenu(open) {
    ov.classList.toggle('open', open);
    ov.setAttribute('aria-hidden', !open);
    openBtn.setAttribute('aria-expanded', open);
    document.body.style.overflow = open ? 'hidden' : '';
    (open ? closeBtn : openBtn).focus({ preventScroll: true });
  }
  openBtn.addEventListener('click', function () { setMenu(true); });
  closeBtn.addEventListener('click', function () { setMenu(false); });
  ov.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && ov.classList.contains('open')) setMenu(false); });

  // Reveal on scroll (once)
  var rv = document.querySelectorAll('.rv');
  if (!('IntersectionObserver' in window) || reduce) { rv.forEach(function (n) { n.classList.add('in'); }); }
  else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: .15 });
    rv.forEach(function (n, i) { n.style.transitionDelay = (i % 3) * 80 + 'ms'; io.observe(n); });
  }

  // Page number in the rail follows the section in view
  var no = $('pageno');
  if ('IntersectionObserver' in window) {
    var so = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) no.textContent = e.target.dataset.n; });
    }, { rootMargin: '-45% 0px -50% 0px' });
    document.querySelectorAll('[data-n]').forEach(function (s) { so.observe(s); });
  }
})();
