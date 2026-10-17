/* Datahooks page headers.
   The homepage hero has its own script (in index.html). Inner pages use this one:
   <header class="page-head sig-head" data-signal="teams|hook|leak|meet|still"><canvas class="signal"></canvas> ...
   The motion sits to the right of the headline on desktop and in a band above it on phones.
   With reduced motion, each mode draws its resolved state once and stays still. */
(function () {
  var head = document.querySelector('.sig-head');
  if (!head) return;
  var cv = head.querySelector('canvas.signal');
  if (!cv || !cv.getContext) return;

  var mode = head.dataset.signal || 'still';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var c = cv.getContext('2d'), dpr = Math.min(window.devicePixelRatio || 1, 2), w = 0, h = 0, R;
  var INK = [26, 26, 46], CORAL = [201, 61, 98], SLATE = [104, 120, 158], SAGE = [74, 128, 104];
  var on = true, t0 = performance.now();

  var clamp = function (t) { return Math.max(0, Math.min(1, t)); };
  var ease = function (t) { t = clamp(t); return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
  var rgba = function (col, a) { return 'rgba(' + col[0] + ',' + col[1] + ',' + col[2] + ',' + a + ')'; };
  var mixc = function (a, b, t) { return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t].map(Math.round); };
  var phone = function () { return w < 900; };
  function dot(x, y, r, col, a) { c.fillStyle = rgba(col, a); c.beginPath(); c.arc(x, y, r, 0, 6.283); c.fill(); }
  function label(text, x, y, align, col, size, weight) {
    c.font = (weight || 500) + ' ' + (size || 14) + 'px Inter, system-ui, sans-serif';
    c.textAlign = align || 'left'; c.textBaseline = 'middle'; c.fillStyle = col; c.fillText(text, x, y);
  }

  // where the motion lives
  function region() {
    if (phone()) return { x: 20, y: 20, w: w - 40, h: Math.min(170, h * .3) };
    var text = head.querySelector('.inner');
    var right = text ? text.getBoundingClientRect().left - cv.getBoundingClientRect().left + Math.min(640, text.offsetWidth) + 48 : w * .58;
    var x = Math.max(right, w * .56);
    return { x: x, y: 40, w: Math.max(260, w - x - 48), h: h - 80 };
  }

  // the clean grid every header shares
  var GAP = 24, grid = [];
  function seedGrid() {
    grid = [];
    var cols = Math.ceil(w / GAP) + 1, rows = Math.ceil(h / GAP) + 1, ox = (w % GAP) / 2, oy = (h % GAP) / 2;
    for (var r = 0; r < rows; r++) for (var k = 0; k < cols; k++) grid.push({ x: ox + k * GAP, y: oy + r * GAP });
  }
  function drawGrid(a) { for (var i = 0; i < grid.length; i++) dot(grid[i].x, grid[i].y, 1.2, INK, a); }

  /* ---------- teams: three groups pulling different ways line up into one row ---------- */
  var teams;
  function seedTeams() {
    var names = [['Marketing', CORAL], ['Sales', SLATE], ['Finance', SAGE]], per = phone() ? 18 : 26;
    teams = names.map(function (n, gi) {
      var cx = R.x + R.w * (phone() ? [.18, .5, .82][gi] : [.2, .62, .4][gi]);
      var cy = R.y + R.h * (phone() ? .42 : [.3, .38, .72][gi]);
      var pts = [];
      for (var i = 0; i < per; i++) {
        var a = Math.random() * 6.283, d = Math.sqrt(Math.random()) * (phone() ? 34 : 56);
        pts.push({ hx: cx + Math.cos(a) * d, hy: cy + Math.sin(a) * d, ph: Math.random() * 6.283, sp: .6 + Math.random() * .8 });
      }
      return { name: n[0], col: n[1], cx: cx, cy: cy, pts: pts };
    });
    // the shared row: every point gets a slot, interleaved across the three teams
    var all = [], k = 0;
    for (var i = 0; i < per; i++) for (var g = 0; g < 3; g++) all.push(teams[g].pts[i]);
    var rowY = R.y + R.h * (phone() ? .5 : .52), x0 = R.x + 8, step = (R.w - 16) / (all.length - 1);
    all.forEach(function (p) { p.rx = x0 + (k++) * step; p.ry = rowY; });
  }
  function drawTeams(now) {
    var CYCLE = 9000, p = reduce ? .6 : ((now - t0) % CYCLE) / CYCLE;
    var g = p < .25 ? 0 : p < .45 ? ease((p - .25) / .2) : p < .85 ? 1 : 1 - ease((p - .85) / .15);
    drawGrid(.08);
    teams.forEach(function (t, gi) {
      var col = mixc(t.col, INK, g * .85);
      t.pts.forEach(function (q) {
        // apart, each team drifts on its own; together, they sit in one row
        var dx = Math.sin(now / 900 * q.sp + q.ph) * 6, dy = Math.cos(now / 1100 * q.sp + q.ph) * 6;
        if (reduce) { dx = dy = 0; }
        var x = q.hx + dx + (q.rx - q.hx - dx) * g, y = q.hy + dy + (q.ry - q.hy - dy) * g;
        dot(x, y, 2.6, col, .9);
      });
      var la = 1 - clamp(g * 2.5);
      if (la > 0) label(t.name, t.cx, t.cy - (phone() ? 46 : 74), 'center', rgba(t.col, la), phone() ? 13 : 14, 600);
    });
    var ra = clamp((g - .7) / .3);
    if (ra > 0) label('One version of the truth', R.x + R.w / 2, R.y + R.h * (phone() ? .5 : .52) + (phone() ? 26 : 34), 'center', rgba(INK, ra), phone() ? 13 : 15, 600);
  }

  /* ---------- hook: datahooks light up in the clean data, one at a time ---------- */
  var HOOKS = ['Conferences drive the wins', 'Buyers drop off at the lead form', 'Renewals follow the first 30 days', 'One region closes faster'];
  var hookSpots = [];
  function seedHook() {
    hookSpots = (phone() ? [[.22, .45], [.7, .55], [.4, .4], [.78, .45]] : [[.25, .28], [.68, .55], [.32, .78], [.72, .2]])
      .map(function (s) { return { x: R.x + R.w * s[0], y: R.y + R.h * s[1] }; });
  }
  function drawHook(now) {
    var SLOT = 3400, n = reduce ? 0 : Math.floor((now - t0) / SLOT), lt = reduce ? .5 : ((now - t0) % SLOT) / SLOT;
    var k = n % HOOKS.length, s = hookSpots[k];
    var g = lt < .12 ? ease(lt / .12) : lt < .82 ? 1 : 1 - ease((lt - .82) / .18);
    var rad = phone() ? 48 : 92;
    for (var i = 0; i < grid.length; i++) {
      var q = grid[i], d = Math.hypot(q.x - s.x, q.y - s.y);
      if (d < rad) {
        var f = g * (1 - d / rad * .35), pull = g * .45;
        dot(q.x + (s.x - q.x) * pull, q.y + (s.y - q.y) * pull, 1.2 + f * 1.8, mixc(INK, CORAL, f), .1 + .9 * f);
      } else dot(q.x, q.y, 1.2, INK, .1);
    }
    var lx = s.x + rad * .62 + 10, align = 'left';
    if (lx + 220 > w - 16) { lx = s.x - rad * .62 - 10; align = 'right'; }
    label(HOOKS[k], lx, s.y, align, rgba(CORAL, clamp((g - .3) / .5)), phone() ? 13 : 15, 600);
  }

  /* ---------- leak: records slip out of the bottom of the CRM ---------- */
  var leakPts = [], leaked = 0, lastLeak = 0;
  function seedLeak() {
    leakPts = [];
    var gap = phone() ? 14 : 18, cols = Math.floor(R.w / gap), rows = Math.floor((R.h * .7) / gap);
    var ox = R.x + (R.w - (cols - 1) * gap) / 2, oy = R.y + 10;
    for (var r = 0; r < rows; r++) for (var k = 0; k < cols; k++) leakPts.push({ x: ox + k * gap, y: oy + r * gap, hx: ox + k * gap, hy: oy + r * gap, vy: 0, falling: false, a: 1 });
    leaked = 0;
  }
  function drawLeak(now) {
    drawGrid(.06);
    if (!reduce && now - lastLeak > 260) {
      lastLeak = now;
      var j = (Math.random() * leakPts.length) | 0, q = leakPts[j];
      if (!q.falling) { q.falling = true; q.vy = 0; leaked += 3200 + Math.round(Math.random() * 9) * 1000; }
    }
    var bottom = R.y + R.h;
    leakPts.forEach(function (q) {
      if (q.falling && !reduce) {
        q.vy += .12; q.y += q.vy; q.a = clamp(1 - (q.y - (bottom - 60)) / 60);
        if (q.a <= 0) { q.falling = false; q.y = q.hy; q.vy = 0; q.a = 0; q.back = now; }
      }
      if (!q.falling && q.a < 1 && q.back) { q.a = clamp((now - q.back) / 2400); }
      dot(q.x, q.y, 2.2, q.falling ? CORAL : INK, q.falling ? q.a : .35 * q.a);
    });
    var tx = phone() ? R.x : R.x, ty = bottom - (phone() ? 6 : 14);
    if (reduce) leaked = 412000;
    label('Example: $' + leaked.toLocaleString() + ' leaked this quarter', tx, ty, 'left', rgba(CORAL, 1), phone() ? 13 : 15, 600);
  }

  /* ---------- meet: two sides that see the data differently come together ---------- */
  var sides;
  function seedMeet() {
    var per = phone() ? 30 : 44;
    sides = [{ name: 'What sales sees', col: SLATE, cx: R.x + R.w * .2 }, { name: 'What marketing sees', col: CORAL, cx: R.x + R.w * .8 }].map(function (s) {
      s.cy = R.y + R.h * .5; s.pts = [];
      for (var i = 0; i < per; i++) {
        var a = Math.random() * 6.283, d = Math.sqrt(Math.random()) * (phone() ? 30 : 50);
        s.pts.push({ ox: Math.cos(a) * d, oy: Math.sin(a) * d, ph: Math.random() * 6.283 });
      }
      return s;
    });
    // meeting point: one packed cluster in the middle
    var all = sides[0].pts.concat(sides[1].pts), mx = R.x + R.w * .5, my = R.y + R.h * .5, rad = phone() ? 34 : 54;
    all.forEach(function (q, k) { var a = k * 2.39996, r = rad * Math.sqrt((k + .5) / all.length); q.mx = mx + Math.cos(a) * r; q.my = my + Math.sin(a) * r; });
  }
  function drawMeet(now) {
    var CYCLE = 9000, p = reduce ? .6 : ((now - t0) % CYCLE) / CYCLE;
    var g = p < .22 ? 0 : p < .45 ? ease((p - .22) / .23) : p < .85 ? 1 : 1 - ease((p - .85) / .15);
    drawGrid(.08);
    sides.forEach(function (s) {
      var col = mixc(s.col, INK, g * .8);
      s.pts.forEach(function (q) {
        var dx = reduce ? 0 : Math.sin(now / 1000 + q.ph) * 4, dy = reduce ? 0 : Math.cos(now / 1200 + q.ph) * 4;
        var x = s.cx + q.ox + dx, y = s.cy + q.oy + dy;
        dot(x + (q.mx - x) * g, y + (q.my - y) * g, 2.4, col, .9);
      });
      var la = 1 - clamp(g * 2.5);
      if (la > 0) label(s.name, s.cx, s.cy - (phone() ? 48 : 72), 'center', rgba(s.col, la), phone() ? 13 : 14, 600);
    });
    var ra = clamp((g - .7) / .3);
    if (ra > 0) label('One answer', R.x + R.w * .5, R.y + R.h * .5 + (phone() ? 52 : 78), 'center', rgba(INK, ra), phone() ? 13 : 15, 600);
  }

  /* ---------- setup ---------- */
  var draws = { teams: drawTeams, hook: drawHook, leak: drawLeak, meet: drawMeet, still: function () { drawGrid(.1); } };
  var seeds = { teams: seedTeams, hook: seedHook, leak: seedLeak, meet: seedMeet, still: function () {} };
  if (!draws[mode]) mode = 'still';
  function size() {
    var r = cv.getBoundingClientRect(); w = r.width; h = r.height;
    cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr); c.setTransform(dpr, 0, 0, dpr, 0, 0);
    R = region(); seedGrid(); seeds[mode]();
  }
  function frame(now) {
    c.clearRect(0, 0, w, h);
    draws[mode](now);
  }
  size();
  var still = reduce || mode === 'still';
  window.addEventListener('resize', function () { size(); if (still) frame(performance.now()); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { if (still) frame(performance.now()); });
  if (still) { frame(performance.now()); return; }
  new IntersectionObserver(function (es) { on = es[0].isIntersecting; }).observe(cv);
  (function loop(now) { requestAnimationFrame(loop); if (on) frame(now); })(performance.now());
})();
