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
  var phone = function () { return w < 1100; };  // below this the motion moves into a band above the headline
  function dot(x, y, r, col, a) { c.fillStyle = rgba(col, a); c.beginPath(); c.arc(x, y, r, 0, 6.283); c.fill(); }
  function label(text, x, y, align, col, size, weight) {
    c.font = (weight || 500) + ' ' + (size || 14) + 'px Inter, system-ui, sans-serif';
    c.textAlign = align || 'left'; c.textBaseline = 'middle'; c.fillStyle = col; c.fillText(text, x, y);
  }

  // where the motion lives
  function region() {
    if (phone()) return { x: 20, y: 24, w: w - 40, h: Math.min(196, h * .34) };
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

  /* ---------- teams: three groups pulling different ways become a checklist of insights ---------- */
  var INSIGHTS = ['Americas sales team closed $5M', 'Paid ads drove $3M of pipeline', 'Techstars conference AOV: $50,200', 'Average time to close: 45 days'];
  var teams, slots;
  function seedTeams() {
    var names = [['Marketing', CORAL], ['Sales', SLATE], ['Finance', SAGE]];
    var box = phone() ? 18 : 26, gapRow = phone() ? R.h / INSIGHTS.length : Math.min(84, R.h / INSIGHTS.length);
    var top = R.y + (R.h - gapRow * (INSIGHTS.length - 1)) / 2, bx = R.x + 6;
    // targets: an outline of dots for each box, then a checkmark inside it
    slots = [];
    INSIGHTS.forEach(function (txt, i) {
      var cy = top + i * gapRow, x0 = bx, y0 = cy - box / 2, n = phone() ? 16 : 22;
      for (var k = 0; k < n; k++) {
        var d = (k / n) * box * 4, side = Math.floor(d / box), o = d - side * box;
        var px = side === 0 ? x0 + o : side === 1 ? x0 + box : side === 2 ? x0 + box - o : x0;
        var py = side === 0 ? y0 : side === 1 ? y0 + o : side === 2 ? y0 + box : y0 + box - o;
        slots.push({ x: px, y: py, row: i, check: false });
      }
      var path = [[.2, .52], [.42, .76], [.82, .22]], m = phone() ? 7 : 10;
      for (var k = 0; k < m; k++) {
        var u = k / (m - 1) * 2, seg = Math.min(1, Math.floor(u)), f = u - seg, A = path[seg], B = path[seg + 1];
        slots.push({ x: x0 + (A[0] + (B[0] - A[0]) * f) * box, y: y0 + (A[1] + (B[1] - A[1]) * f) * box, row: i, check: true });
      }
    });
    // the three teams, sized so every target gets a dot
    var per = Math.ceil(slots.length / 3);
    teams = names.map(function (n, gi) {
      var cx = R.x + R.w * (phone() ? [.18, .5, .82][gi] : [.22, .66, .44][gi]);
      var cy = R.y + R.h * (phone() ? .45 : [.28, .36, .72][gi]);
      var pts = [];
      for (var i = 0; i < per; i++) {
        var a = Math.random() * 6.283, d = Math.sqrt(Math.random()) * (phone() ? 36 : 60);
        pts.push({ hx: cx + Math.cos(a) * d, hy: cy + Math.sin(a) * d, ph: Math.random() * 6.283, sp: .6 + Math.random() * .8, team: gi });
      }
      return { name: n[0], col: n[1], cx: cx, cy: cy, pts: pts };
    });
    var all = [];
    for (var i = 0; i < per; i++) for (var g = 0; g < 3; g++) all.push(teams[g].pts[i]);
    all.forEach(function (q, k) { q.slot = slots[k] || null; });
    teams.gapRow = gapRow; teams.box = box; teams.top = top; teams.bx = bx;
  }
  function drawTeams(now) {
    var CYCLE = 12000, p = reduce ? .8 : ((now - t0) % CYCLE) / CYCLE;
    var out = p < .88 ? 0 : ease((p - .88) / .12);
    // each row: its box gathers, then its checkmark lands, then its insight shows
    function rowT(i) { return .2 + i * .09; }
    drawGrid(.08);
    teams.forEach(function (t) {
      t.pts.forEach(function (q) {
        var dx = reduce ? 0 : Math.sin(now / 900 * q.sp + q.ph) * 6, dy = reduce ? 0 : Math.cos(now / 1100 * q.sp + q.ph) * 6;
        var hx = q.hx + dx, hy = q.hy + dy;
        if (!q.slot) { dot(hx, hy, 2.4, t.col, .9 * (1 - ease((p - .2) / .2))); return; }
        var s0 = rowT(q.slot.row) + (q.slot.check ? .05 : 0);
        var g = ease((p - s0) / .1) * (1 - out);
        var col = q.slot.check ? mixc(t.col, CORAL, g) : mixc(t.col, INK, g);
        dot(hx + (q.slot.x - hx) * g, hy + (q.slot.y - hy) * g, q.slot.check ? 2.4 + g * .6 : 2.2, col, .9);
      });
      var la = 1 - clamp((p - .16) / .08) + clamp((p - .94) / .06);
      if (la > 0) label(t.name, t.cx, t.cy - (phone() ? 48 : 78), 'center', rgba(t.col, clamp(la)), phone() ? 13 : 14, 600);
    });
    INSIGHTS.forEach(function (txt, i) {
      var a = clamp((p - rowT(i) - .12) / .05) * (1 - out);
      if (a > 0) label(txt, teams.bx + teams.box + (phone() ? 12 : 18), teams.top + i * teams.gapRow, 'left', rgba(INK, a), phone() ? 13 : 16, 600);
    });
  }

  /* ---------- checks: each team's dots become its own check beside every insight ---------- */
  var INSIGHTS = ['Americas sales team closed $5M', 'Paid ads drove $3M of pipeline', 'AOV from the Techstars conference: $50,200', 'Average time to close: 45 days'];
  var TEAMS = [['Marketing', CORAL], ['Sales', SLATE], ['Finance', SAGE]];
  var chk;
  // fit a line of text into a width: shrink to a floor, then wrap onto two lines
  function fit(text, maxW, big, small) {
    for (var size = big; size >= small; size--) {
      c.font = '600 ' + size + 'px Inter, system-ui, sans-serif';
      if (c.measureText(text).width <= maxW) return { size: size, lines: [text] };
    }
    c.font = '600 ' + small + 'px Inter, system-ui, sans-serif';
    var words = text.split(' '), lines = [], cur = '';
    words.forEach(function (wd) {
      var t = cur ? cur + ' ' + wd : wd;
      if (cur && c.measureText(t).width > maxW) { lines.push(cur); cur = wd; } else cur = t;
    });
    lines.push(cur);
    return { size: small, lines: lines };
  }
  function seedChecks() {
    var ph = phone(), S = ph ? 15 : 22, gapB = ph ? 5 : 8, rowGap = ph ? 40 : Math.min(84, R.h / 4.3);
    var bx = R.x + (ph ? 0 : 8), by0 = R.y + (ph ? 8 : (R.h - rowGap * 3 - S) / 2);
    var labelX = bx + 3 * S + 2 * gapB + (ph ? 10 : 16), labelW = (ph ? w - 16 : R.x + R.w) - labelX;
    var teamPts = [[], [], []];
    var rows = INSIGHTS.map(function (text, i) {
      var y = by0 + i * rowGap;
      for (var tmi = 0; tmi < 3; tmi++) {
        var x = bx + tmi * (S + gapB), n = 3;
        for (var k = 0; k < n; k++) {   // outline, three points per side
          var u = k / n;
          [[x + u * S, y], [x + S, y + u * S], [x + S - u * S, y + S], [x, y + S - u * S]].forEach(function (pt) { teamPts[tmi].push({ x: pt[0], y: pt[1], row: i, tick: false }); });
        }
        var path = [[.2, .52], [.42, .74], [.82, .26]];
        for (var k = 0; k < 7; k++) {   // the tick
          var t = k / 6, seg = t < .4 ? 0 : 1, lt = seg === 0 ? t / .4 : (t - .4) / .6, A = path[seg], B = path[seg + 1];
          teamPts[tmi].push({ x: x + (A[0] + (B[0] - A[0]) * lt) * S, y: y + (A[1] + (B[1] - A[1]) * lt) * S, row: i, tick: true });
        }
      }
      return { text: text, y: y };
    });
    // one shared size: the largest that fits every insight on one line, wrapping only below the floor
    var big = ph ? 14 : 19, small = ph ? 12 : 15, common = big;
    rows.forEach(function (r) { var f = fit(r.text, labelW, big, small); if (f.lines.length === 1) common = Math.min(common, f.size); else common = small; });
    rows.forEach(function (r) { r.fitted = fit(r.text, labelW, common, common); });
    var clouds = TEAMS.map(function (n, gi) {
      return { name: n[0], col: n[1], cx: R.x + R.w * (ph ? [.18, .5, .82][gi] : [.2, .62, .4][gi]), cy: R.y + R.h * (ph ? .45 : [.3, .38, .72][gi]) };
    });
    var pts = [];
    teamPts.forEach(function (list, gi) {
      var cl = clouds[gi];
      list.forEach(function (sl) {
        var a = Math.random() * 6.283, d = Math.sqrt(Math.random()) * (ph ? 34 : 60);
        pts.push({ team: gi, hx: cl.cx + Math.cos(a) * d, hy: cl.cy + Math.sin(a) * d, ph: Math.random() * 6.283, sp: .6 + Math.random() * .8, slot: sl });
      });
    });
    chk = { rows: rows, clouds: clouds, pts: pts, S: S, labelX: labelX, labelW: labelW };
  }
  function drawChecks(now) {
    var CYCLE = 13000, p = reduce ? .8 : ((now - t0) % CYCLE) / CYCLE;
    var out = p < .9 ? 0 : ease((p - .9) / .1);
    var form = ease((p - .18) / .14) * (1 - out);                       // outlines form
    var tickAt = function (row, team) { return .36 + row * .1 + team * .02; }; // each row ticks, team by team
    drawGrid(.08);
    chk.pts.forEach(function (q) {
      var cl = chk.clouds[q.team], sl = q.slot;
      var dx = reduce ? 0 : Math.sin(now / 900 * q.sp + q.ph) * 6, dy = reduce ? 0 : Math.cos(now / 1100 * q.sp + q.ph) * 6;
      var hx = q.hx + dx, hy = q.hy + dy;
      var g = sl.tick ? ease((p - tickAt(sl.row, q.team)) / .06) * (1 - out) : form;
      var r = sl.tick ? 1.9 + g * .5 : 1.9 - g * .5, a = sl.tick ? .9 : .9 - g * .35;
      dot(hx + (sl.x - hx) * g, hy + (sl.y - hy) * g, r, cl.col, a);
    });
    var la = 1 - clamp(form * 2.5);
    if (la > 0) chk.clouds.forEach(function (t) { label(t.name, t.cx, t.cy - (phone() ? 46 : 78), 'center', rgba(t.col, la), phone() ? 13 : 14, 600); });
    chk.rows.forEach(function (r, i) {
      var a = clamp((p - tickAt(i, 2) - .03) / .05) * (1 - out);
      if (a <= 0) return;
      var f = r.fitted, lh = f.size * 1.25, y0 = r.y + chk.S / 2 - (f.lines.length - 1) * lh / 2;
      f.lines.forEach(function (ln, k) { label(ln, chk.labelX, y0 + k * lh, 'left', rgba(INK, a), f.size, 600); });
    });
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
  var draws = { checks: drawChecks, teams: drawTeams, hook: drawHook, leak: drawLeak, meet: drawMeet, still: function () { drawGrid(.1); } };
  var seeds = { checks: seedChecks, teams: seedTeams, hook: seedHook, leak: seedLeak, meet: seedMeet, still: function () {} };
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
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { seeds[mode](); if (still) frame(performance.now()); });
  if (still) { frame(performance.now()); return; }
  new IntersectionObserver(function (es) { on = es[0].isIntersecting; }).observe(cv);
  (function loop(now) { requestAnimationFrame(loop); if (on) frame(now); })(performance.now());
})();
