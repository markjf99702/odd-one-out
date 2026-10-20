/* Odd One Out: illustration set. Defines window.SOCK_ART = { key: '<svg>' }.
   Colors come only from CSS variables: --a-ink --a-paper --a-shade --a-teal
   --a-mustard --a-red --a-pim --a-warm --a-cool */
(function () {
  var K = 'stroke="var(--a-ink)" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"';
  var T = 'stroke="var(--a-ink)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"';
  function F(c) { return c === 'none' ? 'fill="none"' : 'fill="var(--a-' + c + ')"'; }
  function P(d, c, thin) { return '<path d="' + d + '" ' + F(c || 'none') + ' ' + (thin ? T : K) + '/>'; }
  function C(x, y, r, c, thin) { return '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" ' + F(c || 'none') + ' ' + (thin ? T : K) + '/>'; }
  function E(x, y, rx, ry, c, thin) { return '<ellipse cx="' + x + '" cy="' + y + '" rx="' + rx + '" ry="' + ry + '" ' + F(c || 'none') + ' ' + (thin ? T : K) + '/>'; }
  function R(x, y, w, h, c, rx, thin) { return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="' + (rx || 0) + '" ' + F(c || 'none') + ' ' + (thin ? T : K) + '/>'; }
  function D(x, y, r, c) { return '<circle cx="' + x + '" cy="' + y + '" r="' + (r || 2) + '" ' + F(c || 'ink') + '/>'; }
  function G(tr, inner) { return '<g transform="' + tr + '">' + inner + '</g>'; }
  function eyes(x, y, gap, r) { gap = gap || 6; r = r || 2.2; return D(x - gap / 2, y, r) + D(x + gap / 2, y, r); }
  function smile(x, y, w) { w = w || 6; return P('M' + (x - w / 2) + ',' + y + ' Q' + x + ',' + (y + w * 0.6) + ' ' + (x + w / 2) + ',' + y, 'none', 1); }
  function frown(x, y, w) { w = w || 6; return P('M' + (x - w / 2) + ',' + (y + w * 0.4) + ' Q' + x + ',' + (y - w * 0.3) + ' ' + (x + w / 2) + ',' + (y + w * 0.4), 'none', 1); }
  function spark(x, y, s, c) { s = s || 6; return P('M' + x + ',' + (y - s) + ' Q' + x + ',' + y + ' ' + (x + s) + ',' + y + ' Q' + x + ',' + y + ' ' + x + ',' + (y + s) + ' Q' + x + ',' + y + ' ' + (x - s) + ',' + y + ' Q' + x + ',' + y + ' ' + x + ',' + (y - s) + 'Z', c || 'warm', 1); }
  function heart(x, y, s, c) { return G('translate(' + x + ' ' + y + ') scale(' + (s || 1) + ')', P('M0,6 C-12,-2 -8,-12 0,-6 C8,-12 12,-2 0,6Z', c || 'red', 1)); }
  function dash(x1, y1, x2, y2) { return P('M' + x1 + ',' + y1 + ' L' + x2 + ',' + y2, 'none', 1); }
  function fluff(cx, cy, r, n, c) {
    var d = '', i, a, b, rr;
    for (i = 0; i <= n; i++) {
      a = i / n * Math.PI * 2; b = (i - 0.5) / n * Math.PI * 2; rr = r * 1.18;
      var px = (cx + Math.cos(a) * r).toFixed(1), py = (cy + Math.sin(a) * r).toFixed(1);
      if (i === 0) d += 'M' + px + ',' + py;
      else d += ' Q' + (cx + Math.cos(b) * rr).toFixed(1) + ',' + (cy + Math.sin(b) * rr).toFixed(1) + ' ' + px + ',' + py;
    }
    return P(d + 'Z', c || 'shade');
  }
  var SOCK = 'M-9,-22 L9,-22 L9,4 Q9,8 14,8 L22,8 Q30,8 30,15 Q30,22 22,22 L-1,22 Q-9,22 -9,14 Z';
  /* hero: teal with mustard stripes, red heel, dot eyes */
  function sock(x, y, s, r, mood) {
    s = s || 1; r = r || 0;
    var face = mood === 'sad'
      ? D(-3.5, -6, 2) + D(3.5, -6, 2) + P('M-3,1 Q0,-1.5 3,1', 'none', 1)
      : mood === 'sleep'
      ? P('M-6,-6 Q-3.5,-3.5 -1,-6 M1,-6 Q3.5,-3.5 6,-6', 'none', 1)
      : D(-3.5, -6, 2.2) + D(3.5, -6, 2.2);
    return G('translate(' + x + ' ' + y + ') rotate(' + r + ') scale(' + s + ')',
      '<path d="' + SOCK + '" ' + F('teal') + '/>' +
      '<rect x="-9" y="-22" width="18" height="6" ' + F('mustard') + '/>' +
      '<rect x="-9" y="-13" width="18" height="4" ' + F('mustard') + '/>' +
      '<rect x="-9" y="0" width="18" height="4" ' + F('mustard') + '/>' +
      '<path d="M-9,12 L-9,14 Q-9,22 -1,22 L4,22 Q4,13 -9,12Z" ' + F('red') + '/>' +
      P('M24,13 l3,3 M27,13 l-3,3', 'none', 1) +
      P(SOCK, 'none') + face);
  }
  /* Pim: lilac right sock, mirrored, calm closed eyes */
  function pim(x, y, s, r, open) {
    s = s || 1; r = r || 0;
    var face = open ? D(-3.5, -6, 2.2) + D(3.5, -6, 2.2)
      : P('M-6,-6 Q-3.5,-3.5 -1,-6 M1,-6 Q3.5,-3.5 6,-6', 'none', 1);
    return G('translate(' + x + ' ' + y + ') rotate(' + r + ') scale(' + (-s) + ' ' + s + ')',
      '<path d="' + SOCK + '" ' + F('pim') + '/>' +
      '<rect x="-9" y="-22" width="18" height="6" ' + F('shade') + '/>' +
      P('M-5,-11 h2 M3,-11 h2 M-1,-2 h2 M-5,8 h2', 'none', 1) +
      P(SOCK, 'none') + face);
  }
  function svg(label, body) {
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 180" role="img" aria-label="' + label + '">' +
      '<rect width="320" height="180" ' + F('paper') + '/>' + body + '</svg>';
  }
  function floor(y) { return P('M0,' + y + ' H320', 'none') + dash(30, y + 10, 50, y + 10) + dash(140, y + 14, 165, y + 14) + dash(250, y + 9, 275, y + 9); }

  var A = {};

  A.drum = svg('Inside the dryer drum: tumbling laundry swirls around a small striped sock',
    C(160, 90, 82, 'shade') + C(160, 90, 66, 'paper', 1) +
    '<circle cx="160" cy="90" r="74" fill="none" stroke="var(--a-ink)" stroke-width="2.5" stroke-dasharray="4 9" stroke-linecap="round"/>' +
    P('M160,8 l-8,16 h16 Z', 'ink', 1) + P('M89,131 l17,-3 -8,-14 Z', 'ink', 1) + P('M231,131 l-17,-3 8,-14 Z', 'ink', 1) +
    P('M112,62 q14,-10 28,0 q-4,14 -14,14 q-10,0 -14,-14Z', 'pim', 1) +
    P('M186,52 q18,-6 26,8 l-10,12 q-12,-10 -16,-20Z', 'warm', 1) +
    P('M190,118 q16,4 20,-10 l8,6 q-8,18 -28,16Z', 'cool', 1) +
    sock(150, 98, 1.05, -18) +
    P('M126,108 q-8,10 -4,22 M210,84 q8,8 4,20', 'none', 1) +
    P('M270,40 q14,10 0,20 M283,34 q22,16 0,32 M50,120 q-14,-10 0,-20 M37,126 q-22,-16 0,-32', 'none', 1));

  A.lint_trap = svg('The lint trap, a swirling gray slot, with a nervous sock leaning away from its edge',
    R(70, 30, 180, 120, 'shade', 14) + R(92, 50, 136, 80, 'cool', 8, 1) +
    P('M160,90 m-34,0 a34,22 0 1,1 68,0 a26,16 0 1,1 -52,0 a18,11 0 1,1 36,0 a10,6 0 1,1 -20,0', 'none', 1) +
    fluff(116, 62, 7, 7, 'paper') + fluff(208, 118, 8, 7, 'paper') + fluff(200, 60, 5, 6, 'paper') +
    P('M70,58 H50 M70,122 H50', 'none') + D(84, 40, 2.5) + D(236, 40, 2.5) + D(84, 140, 2.5) + D(236, 140, 2.5) +
    sock(276, 128, 1, 14) + P('M300,96 q4,6 0,9 q-4,-3 0,-9Z', 'cool', 1) +
    P('M262,92 l-8,-6 M268,86 l-4,-9', 'none', 1));

  A.fitted_sheet = svg('Duchess Fitsworth, a towering fitted sheet with scrunched elastic corners and a crown, frowns down at a small sock',
    P('M80,150 Q70,90 96,52 Q160,34 224,52 Q250,90 240,150 Q160,162 80,150Z', 'warm') +
    P('M80,150 q-4,-14 8,-22 q-2,10 8,14 q-2,8 -16,8Z M240,150 q4,-14 -8,-22 q2,10 -8,14 q2,8 16,8Z M96,52 q-6,10 4,18 q2,-10 12,-14Z M224,52 q6,10 -4,18 q-2,-10 -12,-14Z', 'shade', 1) +
    P('M88,138 l4,4 M92,134 l4,4 M232,138 l-4,4 M228,134 l-4,4', 'none', 1) +
    P('M134,48 l6,-22 12,14 8,-18 8,18 12,-14 6,22 Z', 'mustard') + D(160, 30, 3, 'red') +
    D(146, 84, 3.2) + D(174, 84, 3.2) + P('M138,74 l12,4 M182,74 l-12,4', 'none', 1) + frown(160, 100, 18) +
    P('M110,120 q10,8 20,0 M190,120 q10,8 20,0 M150,132 q10,6 20,0', 'none', 1) +
    sock(276, 146, 0.75, 8) + floor(166));

  A.dryer_sheet = svg('Old Bounce, a wise dryer sheet with closed eyes, floats in curls of fading scent above a sock',
    P('M104,40 L208,30 Q222,80 214,128 L110,136 Q96,90 104,40Z', 'paper') +
    P('M118,52 l8,-1 M150,48 l8,-1 M190,44 l8,-1 M120,120 l8,-1 M178,116 l8,-1', 'none', 1) +
    P('M140,78 q6,5 12,0 M170,76 q6,5 12,0', 'none', 1) + smile(160, 98, 18) +
    P('M150,66 q8,-4 14,0 M168,64 q8,-4 14,0', 'none', 1) +
    P('M60,60 q-10,-12 2,-22 q10,-8 0,-18 M250,90 q12,-10 2,-22 q-8,-10 4,-18 M232,150 q10,-8 0,-16', 'none') +
    spark(52, 110, 6) + spark(268, 40, 5) + spark(80, 150, 4) +
    sock(56, 140, 0.85, -6));

  A.mitten = svg('Mitt, a lonely child\'s mitten with a sly grin and one raised eyebrow, sidles up to a sock',
    P('M120,150 L118,80 Q116,36 152,34 Q190,34 188,78 L196,66 Q212,58 216,74 Q218,88 196,110 L194,150Z', 'cool') +
    R(112, 140, 90, 22, 'warm', 6) + P('M122,145 v12 M134,145 v12 M146,145 v12 M158,145 v12 M170,145 v12 M182,145 v12 M194,145 v12', 'none', 1) +
    P('M130,52 l6,6 l-6,6 M150,52 l6,6 l-6,6 M170,52 l6,6 l-6,6', 'none', 1) +
    D(140, 92, 3) + D(170, 92, 3) + P('M132,80 q8,-6 16,-2 M164,84 q6,-2 12,0', 'none', 1) +
    P('M140,110 q14,10 28,-4', 'none', 1) +
    sock(258, 132, 1, 6) + P('M230,104 q-3,-8 2,-12', 'none', 1));

  A.coin = svg('Vernon the quarter, rattling and gossiping, rolls toward a sock',
    E(150, 90, 52, 54, 'shade') +
    '<ellipse cx="150" cy="90" rx="44" ry="46" fill="none" stroke="var(--a-ink)" stroke-width="2.5" stroke-dasharray="3 6" stroke-linecap="round"/>' +
    D(134, 80, 3.4) + D(166, 80, 3.4) + E(150, 104, 10, 8, 'red', 1) +
    P('M126,68 q8,-6 16,0 M158,68 q8,-6 16,0', 'none', 1) +
    P('M82,70 l-14,-4 M80,90 l-18,0 M82,110 l-14,4 M218,70 l14,-4 M218,110 l14,4', 'none', 1) +
    P('M196,30 q22,-10 40,0 q4,16 -16,18 l-10,8 2,-9 q-18,-4 -16,-17Z', 'paper', 1) + D(208, 33, 1.6) + D(216, 33, 1.6) + D(224, 33, 1.6) +
    sock(262, 136, 0.95, 4) + floor(164));

  A.behind = svg('The dim gap beneath the dryer, lint tufts and a bottle cap, a sock peering into the dark',
    R(-4, 10, 328, 54, 'shade') + P('M20,64 v10 M300,64 v10', 'none') + D(40, 36, 3) + D(280, 36, 3) +
    R(-4, 74, 328, 110, 'cool') + floor(150) +
    fluff(70, 130, 12, 8, 'shade') + fluff(232, 120, 9, 7, 'shade') + fluff(286, 138, 6, 6, 'shade') +
    E(180, 142, 14, 5, 'red', 1) + P('M168,140 v-6 h24 v6', 'red', 1) +
    P('M110,96 q30,-10 60,0', 'none', 1) + D(126, 108, 2.4, 'warm') + D(140, 112, 2.4, 'warm') +
    sock(40, 104, 0.9, -12));

  A.dust_bunny = svg('King Fluffington the Ninth, an enormous dust bunny wearing a tiny crown, receives a bowing sock',
    P('M136,56 Q126,14 140,12 Q150,18 148,54 M180,54 Q182,14 194,14 Q204,22 190,58', 'shade') +
    fluff(166, 100, 50, 16, 'shade') +
    P('M156,46 l3,-12 6,7 4,-10 4,10 6,-7 3,12Z', 'mustard', 1) +
    D(150, 94, 3.4) + D(182, 94, 3.4) + D(166, 108, 3, 'red') +
    P('M140,116 l-14,2 M140,110 l-14,-3 M192,116 l14,2 M192,110 l14,-3', 'none', 1) +
    D(120, 70, 1.6) + D(214, 132, 1.6) + D(200, 64, 1.6) + D(128, 140, 1.6) +
    sock(262, 148, 0.8, 38) + floor(166));

  var crowd = '';
  [[34, 80, -6], [84, 66, 8], [134, 60, -3], [192, 66, 5], [244, 82, -8], [292, 68, 4]].forEach(function (p) {
    crowd += G('translate(' + p[0] + ' ' + p[1] + ') rotate(' + p[2] + ') scale(0.9)',
      P(SOCK, 'shade') + P('M-5,-6 h3 M2,-6 h3', 'none', 1) + P('M-3,3 q3,-2 6,0', 'none', 1));
  });
  A.sock_crowd = svg('The Hall of the Unpaired: rows of droopy single socks, with our striped sock standing in front',
    crowd + R(-4, 112, 328, 72, 'cool', 0, 1) + sock(154, 134, 1.15, 0) +
    P('M126,106 q-6,-8 0,-14 M196,106 q6,-8 0,-14', 'none', 1));

  A.earring = svg('Lady Garnet, a lost earring fortune teller, glows above a sock in the dark',
    P('M160,14 q-14,0 -14,14 q0,10 14,12', 'none') + C(160, 44, 5, 'mustard', 1) +
    P('M160,52 L182,84 L160,128 L138,84Z', 'red') + P('M138,84 h44 M160,52 L152,84 L160,128 L168,84Z', 'none', 1) +
    D(152, 92, 2.4, 'paper') + D(168, 92, 2.4, 'paper') +
    spark(110, 60, 8) + spark(214, 72, 10) + spark(198, 128, 5) + spark(120, 120, 5) +
    E(160, 158, 60, 8, 'shade', 1) +
    sock(70, 146, 0.85, 0) + P('M232,140 q12,-30 30,-8 q10,14 -10,18', 'pim', 1));

  A.vent_duct = svg('The ribbed flexible vent duct, a sock sailing through it toward daylight',
    E(36, 90, 30, 70, 'shade') + E(86, 90, 26, 60, 'shade') + E(132, 90, 22, 51, 'shade') + E(172, 90, 19, 43, 'shade') +
    E(208, 90, 16, 36, 'shade') + E(238, 90, 13, 30, 'shade') + E(264, 90, 11, 24, 'warm') +
    P('M36,20 L264,66 M36,160 L264,114', 'none') +
    P('M286,78 l14,-6 M288,90 h18 M286,102 l14,6', 'none', 1) +
    sock(120, 92, 0.9, -76) + P('M64,74 h-20 M70,90 h-26 M64,106 h-20', 'none', 1));

  A.basket = svg('A laundry basket heaped with warm clothes, a sock perched on top',
    P('M60,82 L260,82 L240,162 L80,162Z', 'shade') +
    P('M70,104 H252 M75,124 H247 M80,144 H242', 'none', 1) +
    P('M110,92 v62 M140,92 v62 M170,92 v62 M200,92 v62', 'none', 1) +
    P('M64,86 Q80,50 120,62 Q150,40 180,60 Q220,46 256,86Z', 'pim') + P('M90,70 q20,-6 30,6 M182,62 q22,0 36,12', 'none', 1) +
    P('M196,70 q30,-24 44,-6 l-16,16Z', 'cool', 1) +
    sock(150, 36, 0.9, 10) + P('M120,24 q-6,-8 0,-14 M136,18 q-6,-8 0,-14', 'none', 1) + floor(166));

  A.hallway = svg('A long hallway in perspective with a runner rug and a giant slipper, a tiny sock setting off',
    P('M0,40 L110,70 L210,70 L320,40', 'none') + P('M0,180 L110,120 L210,120 L320,180', 'none') +
    R(110, 70, 100, 50, 'shade', 0, 1) + R(146, 82, 28, 38, 'warm', 3, 1) +
    P('M120,180 L146,120 L174,120 L200,180Z', 'red') + P('M136,160 h48 M142,140 h36', 'none', 1) +
    P('M20,64 L60,74 L60,140 L20,160Z', 'cool', 1) + P('M300,64 L260,74 L260,140 L300,160Z', 'cool', 1) +
    P('M226,170 Q232,140 262,144 Q300,148 306,170Z', 'mustard') + P('M238,154 q20,-6 40,0', 'none', 1) +
    sock(150, 150, 0.7, 0));

  A.dog = svg('Biscuit, a beaming golden retriever, holds a striped sock gently in his mouth',
    P('M96,58 Q86,30 120,28 L200,28 Q234,30 224,58 Q238,110 200,140 L120,140 Q82,110 96,58Z', 'mustard') +
    P('M96,58 Q70,64 74,110 Q90,120 104,96 M224,58 Q250,64 246,110 Q230,120 216,96', 'warm') +
    D(134, 70, 4) + D(186, 70, 4) + E(160, 98, 14, 9, 'red', 1) + E(156, 95, 4, 2.5, 'warm') +
    P('M146,112 q14,12 28,0', 'none', 1) + P('M154,118 q6,18 12,0', 'red', 1) +
    sock(210, 124, 0.9, -70, 'sad') +
    heart(64, 40, 0.8) + P('M40,150 q10,-10 20,0 q10,10 20,0', 'none', 1) + floor(166));

  A.cat = svg('Professor, a gray cat with spectacles, peers down with disdain at a small sock',
    P('M120,160 Q104,110 128,82 L122,46 L144,64 Q160,58 176,64 L198,46 L192,82 Q216,110 200,160Z', 'shade') +
    P('M200,150 q40,6 34,-30 q-4,-16 10,-20', 'none') +
    C(146, 86, 9, 'paper', 1) + C(174, 86, 9, 'paper', 1) + P('M155,86 h10', 'none', 1) +
    P('M141,88 h10 M169,88 h10', 'none', 1) + P('M156,100 l4,4 4,-4Z', 'red', 1) +
    P('M126,100 l-20,-4 M126,106 l-20,4 M194,100 l20,-4 M194,106 l20,4', 'none', 1) +
    sock(66, 146, 0.8, -4) + P('M86,104 q8,-10 16,0', 'none', 1) + floor(166));

  A.couch = svg('Deep couch cushions with crumbs and a coin in the crack, a sock peeking out of the gap',
    R(40, 40, 240, 70, 'cool', 18) + R(20, 80, 40, 80, 'cool', 14) + R(260, 80, 40, 80, 'cool', 14) +
    R(56, 96, 104, 44, 'cool', 10) + R(160, 96, 104, 44, 'cool', 10) + R(56, 140, 208, 18, 'shade', 4) +
    P('M80,58 h4 M120,70 h4 M200,56 h4 M240,72 h4', 'none', 1) +
    sock(160, 96, 0.75, 0) + C(196, 102, 6, 'mustard', 1) +
    D(138, 102, 2, 'warm') + D(176, 104, 2, 'warm') + D(126, 100, 1.6, 'warm') +
    P('M50,162 v10 M270,162 v10', 'none') + floor(172));

  A.stairs = svg('A staircase rising like a mountain, a tiny sock at the bottom looking up at a flag on the summit',
    P('M20,168 H80 V140 H120 V112 H160 V84 H200 V56 H240 V28 H310 V168Z', 'shade') +
    P('M80,168 V140 M120,140 V112 M160,112 V84 M200,84 V56 M240,56 V28', 'none', 1) +
    P('M274,28 V6 M274,6 l18,6 -18,6', 'red', 1) +
    P('M90,150 h20 M130,122 h20 M170,94 h20 M210,66 h20', 'none', 1) +
    sock(44, 146, 0.75, -8) + P('M60,108 l6,-8 M50,104 v-10', 'none', 1));

  A.bedroom = svg('A bedroom at dusk: a bed, a window and the tall dresser, a sock crossing the rug',
    R(30, 24, 70, 56, 'cool', 6) + P('M65,24 v56 M30,52 h70', 'none', 1) + C(84, 40, 6, 'warm', 1) +
    P('M118,120 V82 Q118,70 130,70 H150 V120', 'pim') + R(118, 98, 120, 40, 'warm', 8) + E(146, 92, 14, 7, 'paper', 1) +
    P('M124,138 v12 M232,138 v12', 'none') +
    R(250, 40, 60, 110, 'shade', 4) + R(258, 50, 44, 26, 'mustard', 3, 1) + R(258, 84, 44, 26, 'shade', 3, 1) + R(258, 118, 44, 26, 'shade', 3, 1) +
    D(280, 63, 2.5) + D(280, 97, 2.5) + D(280, 131, 2.5) +
    E(150, 164, 70, 8, 'red', 1) + sock(80, 150, 0.7, 0));

  A.drawer = svg('The foot of the dresser: the top sock drawer is open far above, a lilac toe hanging over its edge',
    R(70, 30, 180, 140, 'shade', 6) + R(64, 22, 192, 14, 'shade', 4) +
    R(80, 60, 160, 32, 'mustard', 4) + P('M78,58 Q110,40 130,58 Q160,42 190,58 Q220,44 242,58', 'pim', 1) +
    R(86, 102, 148, 28, 'shade', 4, 1) + R(86, 136, 148, 28, 'shade', 4, 1) +
    D(160, 116, 3) + D(160, 150, 3) + D(160, 78, 3) +
    pim(206, 74, 0.85, 200, 0) + spark(250, 18, 6) + spark(66, 50, 5) +
    sock(40, 150, 0.8, -10) + P('M60,116 l6,-10 M48,112 v-10', 'none', 1) + floor(172));

  A.reunion = svg('Reunited: the striped sock and Pim, the lilac sock, lean together surrounded by hearts and sparkles',
    C(160, 96, 66, 'warm') +
    sock(140, 104, 1.6, 8) + pim(180, 104, 1.6, -8, 1) +
    P('M154,128 q6,6 12,0', 'none', 1) +
    heart(160, 26, 1.3) + heart(106, 40, 0.8) + heart(214, 40, 0.8) +
    spark(60, 80, 9) + spark(260, 80, 9) + spark(80, 140, 6) + spark(244, 140, 6) + spark(40, 30, 5) + spark(282, 30, 5) +
    floor(168));

  A.yard = svg('The back yard: grass, a fence and a round tree under the sun, a sock in the grass',
    C(270, 36, 18, 'warm') + P('M270,8 v-4 M298,36 h4 M290,16 l3,-3 M290,56 l3,3', 'none', 1) +
    P('M0,70 h320 M0,96 h320', 'none', 1) + P('M20,60 v50 M60,60 v50 M100,60 v50 M140,60 v50 M180,60 v50 M220,60 v50', 'none', 1) +
    R(74, 70, 12, 70, 'shade') + C(80, 54, 30, 'teal') + D(70, 46, 3, 'red') + D(92, 60, 3, 'red') +
    P('M0,130 Q80,116 160,128 Q240,138 320,124 V180 H0Z', 'teal') +
    P('M30,150 l4,-8 4,8 M110,160 l4,-8 4,8 M250,150 l4,-8 4,8 M290,166 l4,-8 4,8', 'none', 1) +
    sock(190, 132, 0.85, 20));

  A.crow = svg('Margo the crow perches by her nest of shiny and soft treasures, eyeing a sock',
    P('M30,120 Q120,104 300,124', 'none') +
    P('M180,112 Q170,140 220,144 Q270,140 262,112Z', 'shade') + P('M186,120 l12,14 M206,116 l4,22 M230,118 l-6,20 M250,116 l-10,18', 'none', 1) +
    C(204, 108, 6, 'mustard', 1) + R(226, 98, 12, 12, 'shade', 2, 1) + spark(214, 92, 5) +
    P('M70,108 Q60,70 92,56 Q116,48 128,66 L150,74 L128,80 Q130,104 108,114Z', 'cool') +
    P('M86,84 q16,-6 26,10 q-16,10 -26,-10Z', 'cool', 1) + C(112, 66, 4, 'paper', 1) + D(113, 66, 1.8) +
    P('M80,112 l-6,10 M96,114 l2,10', 'none', 1) + P('M72,100 L40,116 L52,104 L42,98Z', 'cool', 1) +
    sock(150, 150, 0.8, -20) + P('M152,110 q4,-6 10,-4', 'none', 1));

  A.clothesline = svg('A clothesline flapping in the wind, a sock pinned among shirts',
    P('M20,170 V30 M300,170 V30', 'none') + P('M20,40 Q160,70 300,40', 'none', 1) +
    P('M50,48 L92,54 L96,108 L58,104Z', 'pim') + P('M200,56 L250,50 L258,96 L210,104Z', 'warm') +
    sock(150, 82, 0.9, 6) + R(140, 52, 6, 14, 'shade', 2, 1) + R(66, 44, 6, 12, 'shade', 2, 1) + R(228, 46, 6, 12, 'shade', 2, 1) +
    P('M106,130 q24,-10 48,0 q24,10 48,0 M140,150 q20,-8 40,0', 'none', 1) +
    P('M0,170 H320', 'none'));

  A.drain = svg('A curbside storm drain with dark bars and rippling water, a sock teetering on the edge',
    R(-4, 120, 328, 64, 'shade') + P('M-4,120 H324', 'none') +
    R(110, 128, 120, 38, 'cool', 4) + P('M126,130 v34 M142,130 v34 M158,130 v34 M174,130 v34 M190,130 v34 M206,130 v34 M222,130 v34', 'none', 1) +
    P('M0,100 Q40,90 80,100 Q120,110 160,100 Q200,90 240,100 Q280,110 320,100', 'none', 1) +
    P('M0,80 h320', 'none', 1) + D(60, 60, 2, 'cool') + D(200, 40, 2, 'cool') + D(270, 66, 2, 'cool') + D(120, 30, 2, 'cool') +
    P('M118,148 q-10,-4 -20,4 M244,146 q10,-4 20,4', 'none', 1) +
    sock(150, 100, 0.85, 30) + P('M190,72 q4,6 0,9 q-4,-3 0,-9Z', 'cool', 1));

  A.laundromat = svg('The laundromat across the street: a row of round washer windows behind glass, a sock on the sidewalk',
    R(20, 20, 280, 130, 'shade', 4) + R(60, 6, 200, 26, 'warm', 6) +
    P('M90,19 h40 M146,19 h12 M174,19 h60', 'none', 1) +
    R(36, 44, 248, 90, 'cool', 4, 1) +
    C(76, 92, 22, 'paper', 1) + C(136, 92, 22, 'paper', 1) + C(196, 92, 22, 'paper', 1) + C(256, 92, 22, 'paper', 1) +
    P('M64,96 q12,8 24,0 M124,96 q12,8 24,0 M184,96 q12,8 24,0 M244,96 q12,8 24,0', 'none', 1) +
    sock(200, 98, 0.35, 30) + D(70, 86, 2, 'pim') + D(130, 84, 2, 'red') +
    P('M0,150 H320', 'none') + sock(96, 154, 0.55, 0) + floor(170));

  A.portal = svg('A soft fold in reality swirls open in pastel rings, a sock slipping inside',
    E(160, 90, 96, 70, 'pim') + E(160, 90, 72, 52, 'warm', 1) + E(160, 90, 48, 34, 'cool', 1) + E(160, 90, 24, 17, 'paper', 1) +
    P('M64,90 Q100,40 160,38 M256,90 Q220,140 160,142', 'none', 1) +
    spark(40, 30, 8) + spark(286, 40, 6) + spark(36, 150, 5) + spark(290, 146, 8) +
    D(70, 40, 2) + D(250, 150, 2) + D(30, 90, 2) + D(296, 92, 2) +
    sock(166, 88, 0.85, 130));

  A.odd_world = svg('The Odd Sock Dimension: floating thread spools over pastel hills, a sock wed to a tea cozy, a glove holding a sock',
    P('M0,140 Q60,110 120,134 Q190,160 250,124 Q290,108 320,124 V180 H0Z', 'pim') +
    P('M0,160 Q90,140 160,160 Q240,176 320,150 V180 H0Z', 'shade', 1) +
    G('rotate(-14 60 40)', R(46, 26, 28, 30, 'warm', 4, 1) + R(42, 22, 36, 6, 'shade', 2, 1) + R(42, 54, 36, 6, 'shade', 2, 1)) +
    G('rotate(18 260 36)', R(248, 22, 24, 26, 'teal', 4, 1) + R(244, 18, 32, 6, 'shade', 2, 1) + R(244, 46, 32, 6, 'shade', 2, 1)) +
    P('M78,48 Q120,70 160,40 Q200,10 244,44', 'none', 1) +
    P('M84,126 Q84,92 112,92 Q140,92 140,126Z', 'red') + C(112, 88, 5, 'mustard', 1) + D(104, 108, 2) + D(120, 108, 2) +
    sock(72, 116, 0.6, 6) + heart(96, 76, 0.6, 'pim') +
    P('M214,120 v-22 q0,-6 5,-6 v-8 q5,-4 8,0 v-2 q5,-4 8,0 v2 q5,-3 7,1 v20 q0,15 -12,15Z', 'mustard') +
    sock(200, 112, 0.5, -10) + spark(160, 90, 6) + spark(290, 84, 5) + spark(30, 84, 4));

  A.rag = svg('The Rag Life: a sock cut flat into a ragged striped cloth with a sad little face, draped over a bucket',
    P('M100,124 L106,166 Q160,176 214,166 L220,124Z', 'shade') + E(160, 124, 60, 10, 'cool') +
    P('M108,70 L212,62 Q216,100 210,132 Q200,142 190,132 Q180,144 168,134 Q156,144 146,134 Q134,144 124,134 Q112,140 110,128Z', 'teal') +
    P('M109,80 L212,72 L213,82 L109,90Z M110,108 L214,100 L213,110 L110,118Z', 'mustard', 1) +
    R(186, 84, 18, 14, 'red', 3, 1) + P('M118,94 l6,6 M124,94 l-6,6', 'none', 1) +
    D(150, 97, 2.6) + D(170, 96, 2.6) + P('M152,105 q8,-5 16,0', 'none', 1) +
    P('M140,146 q2,8 0,10 q-2,-4 0,-10Z M182,146 q2,8 0,10 q-2,-4 0,-10Z', 'cool', 1) +
    P('M212,62 l8,-6 M108,70 l-6,-8', 'none', 1) + floor(172));

  A.garbage = svg('The Garbage: a lidded trash can with a sad sock peeking out, buzzing flies and a banana peel',
    P('M110,60 L210,60 L200,166 L120,166Z', 'shade') + P('M134,76 L140,156 M160,76 V156 M186,76 L180,156', 'none', 1) +
    G('rotate(-18 110 54)', R(100, 44, 120, 14, 'shade', 4) + R(146, 34, 28, 10, 'shade', 4, 1)) +
    sock(196, 48, 0.75, 30, 'sad') +
    P('M232,60 q6,-8 12,0 q6,8 12,0 M248,38 q4,-6 8,0', 'none', 1) + D(244, 52, 2.6) + D(258, 32, 2.6) +
    P('M60,166 Q70,140 82,150 M82,150 Q94,140 100,166 M82,150 V140', 'mustard', 1) +
    P('M222,166 q6,-10 14,-4 q6,4 0,4', 'none', 1) + floor(166));

  A.moon = svg('A night scene: a sock sits on a rooftop under a big moon and stars',
    R(0, 0, 320, 180, 'cool', 0, 1) + C(236, 54, 30, 'warm') + C(246, 46, 5, 'shade', 1) + C(226, 66, 3.5, 'shade', 1) +
    spark(60, 30, 6) + spark(140, 52, 5) + spark(290, 110, 4) + spark(30, 90, 4) +
    D(100, 20, 2, 'warm') + D(180, 22, 2, 'warm') + D(80, 76, 2, 'warm') + D(300, 20, 2, 'warm') +
    P('M-4,150 L90,110 L184,150Z', 'shade') + R(-4, 150, 200, 34, 'shade') + R(120, 104, 18, 30, 'shade', 0, 1) +
    R(40, 156, 22, 18, 'warm', 2, 1) + R(130, 156, 22, 18, 'warm', 2, 1) +
    P('M196,184 V140 L260,120 L324,140 V184', 'shade') + R(250, 150, 20, 22, 'warm', 2, 1) +
    sock(88, 92, 0.7, -6));

  A.washer = svg('A front-loading washer full of soapy water and bubbles, a sock spinning inside',
    R(80, 14, 160, 156, 'shade', 12) + P('M80,44 H240', 'none', 1) + C(112, 29, 7, 'paper', 1) + R(150, 23, 50, 12, 'cool', 3, 1) +
    C(160, 106, 52, 'paper') + C(160, 106, 42, 'cool', 1) +
    P('M118,110 Q140,96 160,110 Q180,124 202,110', 'none', 1) +
    sock(156, 104, 0.7, 60) +
    C(130, 86, 5, 'paper', 1) + C(186, 128, 4, 'paper', 1) + C(190, 84, 6, 'paper', 1) +
    C(262, 60, 7, 'paper', 1) + C(276, 40, 4, 'paper', 1) + C(56, 120, 6, 'paper', 1) + C(44, 96, 4, 'paper', 1) +
    P('M90,170 v6 M230,170 v6', 'none'));

  A.title = svg('Cover: the striped sock and Pim the lilac sock in front of a glowing dryer porthole',
    R(40, 10, 240, 168, 'shade', 16) + R(56, 22, 60, 10, 'cool', 4, 1) + C(250, 27, 6, 'mustard', 1) + C(230, 27, 6, 'red', 1) +
    C(160, 106, 62, 'paper') + C(160, 106, 50, 'warm', 1) +
    P('M126,84 Q146,70 166,78 M184,124 Q170,140 146,138', 'none', 1) +
    sock(134, 118, 1.25, 6) + pim(186, 118, 1.25, -6) +
    heart(160, 80, 0.8) + spark(24, 40, 8) + spark(298, 60, 7) + spark(20, 150, 5) + spark(300, 152, 6));


  /* ---------- second wave ---------- */
  function line(d, c, w, dashArr) { return '<path d="' + d + '" fill="none" stroke="var(--a-' + c + ')" stroke-width="' + (w || 3) + '" stroke-linecap="round" stroke-linejoin="round"' + (dashArr ? ' stroke-dasharray="' + dashArr + '"' : '') + '/>'; }
  function q(x, y, s) { return G('translate(' + x + ' ' + y + ') scale(' + (s || 1) + ')', P('M-5,-6 Q-5,-12 0,-12 Q6,-12 6,-6 Q6,-2 0,0 V3', 'none', 1) + D(0, 9, 2.2)); }
  function zz(x, y, s) { return G('translate(' + x + ' ' + y + ') scale(' + (s || 1) + ')', P('M0,0 h8 l-8,8 h8', 'none', 1)); }
  function button(x, y, r, c) { return C(x, y, r, c || 'paper') + D(x - r * 0.3, y - r * 0.3, r * 0.14 + 0.6) + D(x + r * 0.3, y - r * 0.3, r * 0.14 + 0.6) + D(x - r * 0.3, y + r * 0.3, r * 0.14 + 0.6) + D(x + r * 0.3, y + r * 0.3, r * 0.14 + 0.6); }
  function acorn(x, y, s) { return G('translate(' + x + ' ' + y + ') scale(' + (s || 1) + ')', E(0, 3, 6, 7, 'mustard', 1) + P('M-7,-1 Q0,-8 7,-1Z', 'shade', 1) + P('M0,-5 v-3', 'none', 1)); }
  function cozyDome(x, y, s, face) {
    return G('translate(' + x + ' ' + y + ') scale(' + (s || 1) + ')',
      P('M-30,0 Q-30,-46 0,-46 Q30,-46 30,0Z', 'warm') + C(0, -50, 6, 'red', 1) +
      P('M-20,-30 l10,10 10,-10 10,10 10,-10 M-26,-12 l10,10 M-6,-12 l10,10', 'none', 1) +
      (face ? D(-9, -22, 2.4) + D(9, -22, 2.4) + smile(0, -15, 10) : ''));
  }
  /* a mismatched partner sock: gray with a pink toe and argyle lines */
  function oddSock(x, y, s, r) {
    s = s || 1; r = r || 0;
    return G('translate(' + x + ' ' + y + ') rotate(' + r + ') scale(' + (-s) + ' ' + s + ')',
      '<path d="' + SOCK + '" ' + F('shade') + '/>' +
      '<path d="M14,8 L22,8 Q30,8 30,15 Q30,22 22,22 L16,22 Q12,15 14,8Z" ' + F('pim') + '/>' +
      P('M-9,-20 L9,-4 M9,-20 L-9,-4', 'none', 1) + P(SOCK, 'none') +
      D(-3.5, -9, 2.2) + D(3.5, -9, 2.2) + smile(0, -3, 6));
  }

  A.madame_purl = svg('Madame Purl, a towering sock puppet stitched from a thousand lost socks, with dinner-plate button eyes, leans down toward a small striped sock',
    P('M0,160 Q160,146 320,160 V180 H0Z', 'shade') +
    P('M108,180 L108,44 Q108,8 160,8 Q212,8 212,44 L212,180Z', 'pim') +
    R(116, 112, 30, 22, 'warm', 3, 1) + R(176, 118, 28, 26, 'cool', 3, 1) + R(146, 144, 26, 22, 'mustard', 3, 1) + R(114, 148, 24, 24, 'red', 3, 1) + R(188, 20, 18, 16, 'warm', 3, 1) +
    P('M120,108 l4,4 M134,108 l4,4 M180,114 l4,4 M196,114 l4,4 M150,140 l4,4 M164,140 l4,4', 'none', 1) +
    P('M112,90 H208', 'none', 1) + '<path d="M112,96 H208" fill="none" stroke="var(--a-ink)" stroke-width="2.5" stroke-dasharray="3 5" stroke-linecap="round"/>' +
    button(138, 50, 15) + button(184, 50, 15) +
    P('M136,72 Q160,96 186,72 Q160,82 136,72Z', 'red', 1) +
    spark(60, 40, 7) + spark(270, 30, 6) + spark(250, 96, 4) +
    sock(262, 146, 0.8, -6) + P('M246,108 l-6,-8 M256,106 v-10', 'none', 1));

  var card = function (x, y, rot, c) { return G('rotate(' + rot + ' ' + x + ' ' + y + ')', R(x - 20, y - 28, 40, 56, c, 6) + q(x, y, 1.3)); };
  A.quiz = svg('Madame Purl\'s enormous button eye looms over three question cards laid out in front of a sock',
    P('M-4,-4 H150 Q160,40 120,66 Q70,92 -4,70Z', 'pim') +
    R(14, 46, 20, 16, 'warm', 3, 1) + P('M-4,64 Q60,84 116,62', 'none', 1) +
    button(84, 30, 18) + P('M58,4 q26,-6 50,4', 'none', 1) +
    card(160, 92, -8, 'warm') + card(212, 86, 2, 'cool') + card(264, 94, 10, 'warm') +
    sock(96, 144, 0.85, 4) + P('M120,108 l6,-8 M130,112 l8,-4', 'none', 1) + floor(168));

  A.suitors = svg('The suitors line up: a scorched oven mitt, a winking leather driving glove and a round quilted tea cozy, facing a sock',
    sock(40, 132, 0.8, 0) + P('M60,96 l6,-8 M52,92 v-10', 'none', 1) +
    P('M96,150 L94,96 Q94,64 120,64 Q146,64 146,96 L152,88 Q162,82 164,94 Q164,108 146,122 L146,150Z', 'red') +
    R(90, 140, 62, 14, 'warm', 4, 1) + E(132, 112, 7, 5, 'shade', 1) + D(110, 90, 2.6) + D(128, 90, 2.6) + smile(119, 100, 12) +
    R(178, 64, 9, 40, 'shade', 4) + R(189, 58, 9, 44, 'shade', 4) + R(200, 62, 9, 40, 'shade', 4) + R(211, 70, 9, 34, 'shade', 4) +
    P('M176,96 L222,96 L224,138 Q222,150 200,150 Q178,150 176,138Z', 'shade') +
    P('M178,112 Q164,108 162,96 Q164,90 170,94 L178,104', 'shade') +
    D(192, 116, 2.6) + P('M204,116 q4,-3 8,0', 'none', 1) + P('M192,130 q8,4 16,0', 'none', 1) +
    cozyDome(268, 150, 1, true) + heart(268, 72, 0.8) + heart(246, 86, 0.5) +
    floor(152));

  A.tea_cozy = svg('A tea cozy as big as a cottage, with a round door where an argyle sock in an apron waves a sock inside, steam rising from the spout',
    P('M0,158 Q160,146 320,158 V180 H0Z', 'pim') +
    P('M96,128 L62,98 L56,104 L88,142Z', 'cool') + line('M58,90 q-8,-10 0,-18 q8,-8 0,-16', 'ink', 2.5) +
    P('M246,96 Q286,98 282,128 Q278,150 248,146', 'none') +
    P('M90,160 Q90,52 170,52 Q250,52 250,160Z', 'warm') + C(170, 44, 10, 'red') +
    P('M112,98 l18,18 18,-18 18,18 18,-18 18,18 18,-18 18,18 M104,130 l18,18 M234,130 l-18,18', 'none', 1) +
    D(144, 82, 3) + D(196, 82, 3) + P('M156,90 q14,10 28,0', 'none', 1) +
    P('M148,160 V132 Q148,112 170,112 Q192,112 192,132 V160Z', 'shade') +
    G('translate(166 140) scale(-0.65 0.65)', P(SOCK, 'cool') + P('M-9,-20 L9,-4 M9,-20 L-9,-4 M-9,-4 L9,12', 'none', 1) + R(-11, -2, 22, 16, 'paper', 3, 1) + D(-3.5, -9, 2.2) + D(3.5, -9, 2.2)) +
    sock(36, 140, 0.75, -4) + spark(282, 30, 6) + spark(36, 30, 5));

  A.bakery = svg('Knit and Knead, a bakery where a leather glove kneads dough beside its beloved gym sock, a striped sock at the counter',
    R(70, 6, 180, 24, 'mustard', 6) + P('M88,18 h22 M120,18 h8 M138,18 h24 M172,18 h8 M190,18 h42', 'none', 1) +
    P('M20,62 H300', 'none', 1) + E(56, 52, 16, 8, 'warm', 1) + E(96, 52, 14, 8, 'warm', 1) + E(226, 52, 16, 8, 'warm', 1) + E(268, 52, 14, 8, 'warm', 1) +
    P('M48,50 l4,-3 M60,50 l4,-3 M220,50 l4,-3 M232,50 l4,-3', 'none', 1) +
    P('M96,112 L96,84 L94,64 Q94,58 99,58 Q104,58 104,64 L105,82 L106,56 Q106,50 111,50 Q116,50 116,56 L116,82 L118,60 Q118,54 123,54 Q128,54 128,60 L127,84 L132,76 Q136,70 141,74 Q144,78 140,86 L130,104 L130,112Z', 'cool') +
    D(106, 92, 2.4) + D(118, 92, 2.4) + smile(112, 100, 8) +
    G('translate(196 92) rotate(8) scale(-1 1)', P(SOCK, 'paper') + R(-9, -22, 18, 4, 'red', 0, 1) + R(-9, -15, 18, 4, 'red', 0, 1) + D(-3.5, -6, 2.2) + D(3.5, -6, 2.2) + smile(0, 1, 6)) +
    heart(158, 70, 0.8) +
    R(30, 112, 260, 60, 'shade', 6) + E(160, 110, 30, 9, 'warm') + P('M144,108 q6,4 12,0 M162,108 q6,4 12,0', 'none', 1) +
    P('M50,132 H270', 'none', 1) +
    sock(270, 136, 0.7, -4));

  A.spin_clock = svg('The Spin Clock: a clock tower whose face is a dryer porthole with a tiny drum turning inside, tally marks chalked on its wall',
    R(56, 118, 38, 34, 'warm', 6) + P('M56,126 h38', 'none', 1) + R(214, 124, 48, 28, 'red', 3) + P('M220,132 h36', 'none', 1) +
    R(120, 32, 80, 140, 'shade', 4) + P('M110,36 L160,4 L210,36Z', 'red') +
    C(160, 72, 30, 'paper') + C(160, 72, 21, 'cool', 1) +
    line('M160,72 m-14,-6 a15,15 0 0,1 26,-4', 'ink', 2.5) + P('M174,56 l4,6 -7,1', 'none', 1) +
    sock(156, 78, 0.35, 40) + D(166, 64, 2, 'pim') + D(150, 82, 2, 'red') +
    P('M132,118 v14 M137,118 v14 M142,118 v14 M147,118 v14 M129,130 l22,-10 M164,118 v14 M169,118 v14 M174,118 v14 M179,118 v14 M161,130 l22,-10 M134,142 v12 M139,142 v12', 'none', 1) +
    G('translate(80 150) scale(0.8)', '<path d="M-9,-38 L9,-38 L9,4 Q9,8 14,8 L22,8 Q30,8 30,15 Q30,22 22,22 L-1,22 Q-9,22 -9,14 Z" ' + F('paper') + ' ' + K + '/>' + R(-9, -38, 18, 6, 'red', 0, 1) + D(-3.5, -20, 2) + D(3.5, -20, 2) + P('M-4,-12 h8', 'none', 1)) +
    P('M104,104 L96,170', 'none') +
    sock(290, 150, 0.75, -4) + P('M276,112 l-6,-8 M286,110 v-10', 'none', 1) + floor(172));

  A.return_spool = svg('The Return Spool: a huge wooden spool sends threads across a pastel sky, and a sock grips the red one leading up toward a far-off dresser',
    P('M0,150 Q100,136 200,150 Q260,158 320,146 V180 H0Z', 'pim') +
    line('M100,80 Q50,60 6,70', 'ink', 2.5) + line('M100,110 Q50,130 10,118', 'ink', 2.5) + line('M190,70 Q220,30 250,10', 'ink', 2.5) +
    line('M100,96 Q60,96 30,40 Q24,30 40,26 Q50,40 30,44', 'cool', 3) +
    R(110, 46, 70, 86, 'warm', 6) + R(98, 36, 94, 14, 'shade', 5) + R(98, 128, 94, 14, 'shade', 5) +
    P('M112,62 Q145,70 178,62 M112,78 Q145,86 178,78 M112,94 Q145,102 178,94 M112,110 Q145,118 178,110', 'none', 1) +
    line('M180,100 Q228,122 244,86 Q258,52 282,42', 'red', 5) +
    R(278, 10, 30, 36, 'shade', 3, 1) + R(282, 16, 22, 8, 'mustard', 2, 1) + R(282, 30, 22, 10, 'shade', 2, 1) +
    sock(228, 136, 0.8, -12) + spark(60, 20, 6) + spark(220, 24, 5) + spark(300, 100, 4));

  A.lighthouse = svg('A lighthouse made from a rolled-up bath mat, its lint-ball lamp beaming over a fluffy white sea, two striped socks on the gallery and one on the shore',
    P('M184,34 L320,8 L320,62Z', 'warm', 1) +
    P('M140,170 L150,60 L190,60 L200,170Z', 'cool') +
    P('M147,96 L193,96 L194,108 L146,108Z M144,130 L196,130 L197,142 L143,142Z', 'warm', 1) +
    P('M142,172 l-4,6 M152,172 l-2,6 M162,172 v6 M172,172 v6 M182,172 l2,6 M192,172 l4,6', 'none', 1) +
    R(150, 34, 40, 24, 'paper') + fluff(170, 44, 9, 8, 'warm') +
    P('M144,32 L170,14 L196,32Z', 'red') + R(132, 56, 76, 8, 'shade', 3) +
    sock(141, 44, 0.4, 0) + sock(195, 44, 0.4, 0) +
    P('M0,130 Q30,120 70,128 Q100,134 116,144 L116,180 H0Z', 'pim') +
    P('M116,148 Q130,138 144,148 Q158,138 172,148 Q186,138 200,148 Q214,138 228,148 Q242,138 256,148 Q270,138 284,148 Q298,138 312,148 Q320,142 324,148 V184 H116Z', 'paper') +
    P('M130,166 q8,-6 16,0 M200,164 q8,-6 16,0 M262,168 q8,-6 16,0', 'none', 1) +
    sock(56, 112, 0.8, -4) + spark(40, 30, 5) + spark(100, 40, 4) + spark(250, 100, 5));

  A.fading = svg('Fading: a sock goes translucent and starts to unravel while a quilted tea cozy settles over it like a hug, the memory of its pair a blur',
    E(160, 158, 120, 12, 'pim', 1) +
    '<g opacity="0.4">' + sock(150, 110, 1.6, 0) + '</g>' +
    G('translate(150 110) scale(1.6)', '<path d="' + SOCK + '" fill="none" stroke="var(--a-ink)" stroke-width="1.8" stroke-dasharray="3 4" stroke-linecap="round"/>') +
    line('M198,140 q12,6 8,16 q-6,10 6,16', 'teal', 3) +
    G('rotate(-20 70 50)', cozyDome(70, 64, 0.9, true)) +
    P('M96,74 l10,8 M90,84 l8,10', 'none', 1) +
    E(250, 50, 42, 30, 'paper', 1) + C(208, 92, 5, 'paper', 1) + C(196, 104, 3, 'paper', 1) +
    '<g opacity="0.45">' + pim(250, 54, 0.75, 0) + '</g>' + q(274, 40, 0.8));

  A.wedding = svg('Happily Cozied: a sock and a tea cozy wed under an arch of clothes pegs, with a three-tier lint cake and hearts',
    P('M0,156 Q160,144 320,156 V180 H0Z', 'pim') +
    P('M60,156 V70 Q60,20 130,20 Q200,20 200,70 V156', 'none') +
    R(56, 52, 8, 18, 'shade', 2, 1) + R(86, 22, 8, 18, 'shade', 2, 1) + R(126, 12, 8, 18, 'shade', 2, 1) + R(166, 22, 8, 18, 'shade', 2, 1) + R(196, 52, 8, 18, 'shade', 2, 1) +
    cozyDome(148, 150, 1.25, true) + sock(108, 128, 0.85, 14) +
    heart(130, 46, 1.1) + heart(96, 72, 0.6) + heart(178, 70, 0.6) +
    R(236, 128, 64, 26, 'warm', 4) + R(244, 104, 48, 24, 'pim', 4) + R(252, 84, 32, 20, 'paper', 4) +
    fluff(268, 76, 7, 7, 'shade') + P('M240,138 q8,6 16,0 q8,6 16,0 q8,6 16,0 M248,114 q7,5 14,0 q7,5 14,0', 'none', 1) +
    spark(30, 40, 6) + spark(240, 30, 6) + spark(300, 60, 4));

  A.needle = svg('The New Matchmaker: a sock holds a giant needle and stitches threads between lonely things, an oven mitt and a dish towel joined by a heart',
    P('M0,158 Q160,146 320,158 V180 H0Z', 'shade') +
    line('M206,40 Q160,20 120,44 Q90,62 64,52', 'red', 3) + line('M206,40 Q190,90 260,96', 'cool', 3) +
    R(30, 30, 30, 40, 'red', 8) + P('M60,46 Q72,40 70,54 L60,62', 'red', 1) + D(40, 46, 2) + D(50, 46, 2) + smile(45, 54, 6) +
    R(90, 48, 34, 44, 'cool', 4) + P('M90,58 h34 M90,82 h34', 'none', 1) + D(101, 68, 2) + D(113, 68, 2) + smile(107, 74, 6) +
    heart(76, 26, 0.9) +
    R(252, 84, 30, 28, 'warm', 6) + P('M256,92 l6,4 M268,92 l6,4', 'none', 1) + D(262, 102, 2) + D(272, 102, 2) +
    G('rotate(28 214 92)', R(208, 30, 12, 128, 'shade', 6) + E(214, 44, 2.5, 8, 'paper', 1) + P('M208,150 L214,172 L220,150Z', 'shade', 1)) +
    sock(160, 128, 1.15, -6) + R(260, 136, 40, 6, 'teal', 2, 1) + R(260, 142, 40, 6, 'mustard', 2, 1) + spark(290, 30, 6) + spark(150, 60, 4));

  function throneScene(seated) {
    return R(18, 40, 30, 130, 'shade', 4) + fluff(33, 36, 18, 9, 'shade') + R(272, 40, 30, 130, 'shade', 4) + fluff(287, 36, 18, 9, 'shade') +
      C(33, 90, 7, 'red', 1) + C(287, 90, 7, 'mustard', 1) + C(33, 124, 7, 'mustard', 1) + C(287, 124, 7, 'red', 1) +
      R(124, 28, 72, 70, 'red', 10) + R(112, 92, 96, 56, 'red', 8) + R(118, 92, 84, 14, 'warm', 4, 1) +
      P('M108,148 V164 M212,148 V164', 'none') + E(160, 166, 80, 6, 'cool', 1);
  }
  var ringPull = function (x, y, s) { return G('translate(' + x + ' ' + y + ') scale(' + (s || 1) + ')', P('M-14,-6 Q-14,-14 -6,-14 H6 Q14,-14 14,-6 Q14,2 6,2 H-6 Q-14,2 -14,-6Z M-8,-6 Q-8,-9 -5,-9 H5 Q8,-9 8,-6 Q8,-3 5,-3 H-5 Q-8,-3 -8,-6Z', 'mustard', 1)); };
  A.throne = svg('The Court of Lint: King Fluffington on a bottle-cap throne between pillars of fluff, a paperclip relic held high, a sock bowing',
    throneScene() +
    fluff(160, 80, 28, 12, 'shade') + ringPull(160, 50, 0.9) + D(150, 76, 3) + D(170, 76, 3) + D(160, 88, 2.6, 'red') +
    R(70, 96, 8, 70, 'shade', 3, 1) + P('M64,96 V50 Q64,40 74,40 Q84,40 84,50 V86 Q84,92 78,92 Q72,92 72,86 V54', 'none') + spark(74, 28, 6) +
    fluff(100, 156, 9, 7, 'shade') + D(97, 154, 1.6) + D(103, 154, 1.6) + fluff(226, 156, 8, 7, 'shade') + D(223, 154, 1.6) + D(229, 154, 1.6) +
    sock(250, 140, 0.75, 38));

  A.crowned = svg('Long Live the Lint: a striped sock wearing a ring-pull crown sits on the bottle-cap throne while dust bunny courtiers bring petitions',
    throneScene() +
    sock(156, 86, 1.25, 0) + ringPull(156, 50, 1.2) + spark(126, 34, 5) + spark(190, 30, 5) +
    fluff(86, 150, 12, 8, 'shade') + D(82, 146, 1.8) + D(90, 146, 1.8) +
    G('rotate(-12 100 132)', R(96, 116, 22, 28, 'paper', 3) + P('M100,124 h14 M100,130 h14 M100,136 h8', 'none', 1)) +
    fluff(236, 152, 10, 8, 'shade') + D(232, 150, 1.8) + D(240, 150, 1.8) +
    P('M250,140 Q262,110 252,92 Q262,90 266,96 Q272,112 260,142', 'none'));

  var farRow = '';
  [[30, 50], [70, 44], [250, 46], [290, 52]].forEach(function (p) {
    farRow += G('translate(' + p[0] + ' ' + p[1] + ') scale(0.55)', P(SOCK, 'shade') + P('M-5,-6 h3 M2,-6 h3', 'none', 1));
  });
  A.recruiter = svg('Argyle, head of recruitment for the Hall of the Unpaired, beams from behind his desk with a clipboard and the open Registry of the Lost',
    farRow +
    G('translate(140 84) scale(-1.1 1.1)', P(SOCK, 'cool') + P('M-9,-20 L9,-2 M9,-20 L-9,-2 M-9,-2 L9,16', 'none', 1) + P(SOCK, 'none') + D(-3.5, -9, 2.4) + D(3.5, -9, 2.4) + P('M-5,-2 Q0,4 5,-2', 'none', 1)) +
    R(152, 64, 26, 36, 'shade', 3) + R(157, 72, 16, 22, 'paper', 1, 1) + P('M160,78 h10 M160,84 h10 M160,90 h6', 'none', 1) + R(160, 60, 10, 6, 'mustard', 2, 1) +
    R(70, 108, 150, 58, 'warm', 4) + P('M80,124 H210', 'none', 1) +
    P('M84,108 Q104,98 124,106 Q144,98 164,108 L164,112 Q144,104 124,110 Q104,104 84,112Z', 'paper', 1) +
    P('M90,106 h12 M134,104 h12', 'none', 1) +
    sock(262, 148, 0.85, 0) + P('M246,110 l-6,-8 M256,108 v-10', 'none', 1) + floor(170));

  A.hammock = svg('The Warm Spot: a striped sock asleep in a hair-tie hammock strung between stacks of bottle caps, other hammocks swaying in the dark',
    E(160, 162, 120, 14, 'warm') +
    P('M20,40 Q50,60 80,40 M240,36 Q270,56 300,36', 'none', 1) + G('translate(50 46) scale(0.45)', P(SOCK, 'shade')) + G('translate(270 42) scale(0.45)', P(SOCK, 'shade')) +
    R(36, 66, 26, 30, 'red', 4) + R(36, 96, 26, 30, 'mustard', 4) + R(36, 126, 26, 30, 'red', 4) +
    R(258, 66, 26, 30, 'mustard', 4) + R(258, 96, 26, 30, 'red', 4) + R(258, 126, 26, 30, 'mustard', 4) +
    P('M62,78 Q160,150 258,78 Q160,124 62,78Z', 'pim') +
    sock(160, 100, 0.95, -90, 'sleep') +
    P('M62,78 Q160,150 258,78', 'none') + P('M100,104 l12,14 M130,112 l6,14 M190,112 l-6,14 M220,104 l-12,14', 'none', 1) +
    zz(196, 62, 1) + zz(212, 44, 1.3) + zz(232, 22, 1.6));

  A.vacuum = svg('The Annual Cleaning: the roaring Long Hose of a vacuum slurps up dust bunnies while a sock hides under a bottle cap',
    P('M0,0 L90,0 L40,60Z', 'warm', 1) + P('M0,0 L40,60 M0,30 L30,70', 'none', 1) +
    line('M330,-10 Q230,-2 222,94', 'ink', 34) + line('M330,-10 Q230,-2 222,94', 'shade', 27) +
    P('M300,4 l4,-14 M270,6 l0,-16 M246,14 l-6,-12 M234,34 l-14,-6 M226,58 l-15,-2 M223,80 l-15,0', 'none', 1) +
    R(168, 92, 112, 30, 'shade', 8) + P('M176,122 H272', 'none') + P('M180,104 h20 M248,104 h20', 'none', 1) +
    P('M150,124 h-24 M156,134 h-34 M150,144 h-20', 'none', 1) +
    G('rotate(-30 150 82)', fluff(150, 82, 10, 8, 'shade')) + D(146, 80, 1.8) + D(154, 80, 1.8) + P('M136,80 h-14 M138,88 h-12', 'none', 1) +
    fluff(108, 110, 7, 7, 'shade') + D(105, 109, 1.5) + D(111, 109, 1.5) + P('M96,110 h-10', 'none', 1) +
    G('rotate(-10 60 140)', R(26, 126, 72, 30, 'red', 5) + P('M34,128 v26 M44,128 v26 M54,128 v26 M64,128 v26 M74,128 v26 M84,128 v26', 'none', 1)) +
    sock(108, 146, 0.8, 8) + P('M128,104 l4,-8 M120,102 v-9', 'none', 1) +
    floor(166));

  A.vault = svg('The Royal Treasury door: felted lint studded with thumbtacks and locked with a diary padlock, Pinsworth the hairpin picking it while a sock keeps watch',
    R(104, 22, 116, 150, 'shade', 22) + P('M112,40 l-6,-2 M112,80 l-6,0 M112,120 l-6,2 M212,50 l6,-2 M212,100 l6,0 M212,140 l6,2', 'none', 1) +
    C(120, 38, 5, 'mustard', 1) + C(204, 38, 5, 'mustard', 1) + C(120, 156, 5, 'mustard', 1) + C(204, 156, 5, 'mustard', 1) +
    R(124, 48, 76, 22, 'warm', 4, 1) + P('M132,59 h14 M152,59 h22 M180,59 h12', 'red', 1) +
    P('M152,106 V94 Q152,82 164,82 Q176,82 176,94 V106', 'none') + R(144, 102, 40, 34, 'mustard', 5) + C(164, 114, 4, 'paper', 1) + P('M164,118 v8', 'none', 1) +
    spark(226, 30, 5) + spark(98, 70, 4) +
    P('M268,154 Q284,144 272,132 L176,116', 'none') + P('M268,154 L170,122', 'none') + D(268, 140, 2.2) + D(276, 146, 2.2) +
    P('M286,124 q6,-4 10,2', 'none', 1) +
    sock(54, 148, 0.85, -4) + P('M76,108 l6,-8 M66,104 v-10', 'none', 1) + floor(172));

  A.squirrel = svg('Pocket the squirrel, all nerves and magnificent tail, clutches an acorn beside an oak while a sock considers the deal',
    R(-4, 0, 44, 180, 'shade') + P('M10,20 q6,20 0,40 M26,70 q-6,20 0,40 M12,120 q6,16 0,32', 'none', 1) +
    P('M0,158 Q160,148 320,160 V180 H0Z', 'teal') +
    P('M172,146 Q240,154 236,96 Q232,40 190,46 Q214,66 204,98 Q196,122 172,124Z', 'red') +
    P('M206,62 q8,8 10,22 M214,98 q6,10 0,24', 'none', 1) +
    E(148, 120, 30, 34, 'red') + E(146, 128, 16, 22, 'warm', 1) +
    P('M132,64 L134,44 L146,58Z M164,58 L170,40 L176,60Z', 'red', 1) +
    C(154, 76, 22, 'red') + C(144, 72, 6, 'paper', 1) + D(145, 72, 2.6) + C(164, 72, 6, 'paper', 1) + D(165, 72, 2.6) +
    D(154, 86, 2.6) + P('M148,92 q6,4 12,0', 'none', 1) +
    acorn(148, 108, 1.1) + P('M120,96 l-10,-4 M118,106 l-12,0 M186,90 l8,-6', 'none', 1) +
    acorn(236, 154, 0.9) + acorn(300, 152, 0.9) +
    sock(270, 136, 0.85, -4));

  var shingles = '';
  for (var sr = 0; sr < 4; sr++) {
    var sd = '';
    for (var sx = -10; sx < 330; sx += 22) { var yy = 100 - sx * 0.07 + sr * 16 + (sr % 2) * 0; sd += 'M' + (sx + (sr % 2) * 11) + ',' + yy.toFixed(1) + ' q11,8 22,0 '; }
    shingles += P(sd, 'none', 1);
  }
  A.rooftop = svg('The roof: a desert of shingles with a leaf-choked gutter and a downspout, rain clouds piling up as a sock crosses',
    fluff(70, 30, 22, 9, 'shade') + fluff(110, 26, 18, 8, 'shade') + P('M50,58 l-6,12 M70,60 l-6,12 M96,52 l-6,12 M118,48 l-6,12', 'none', 1) +
    P('M0,94 L320,72 V160 L0,178Z', 'red') + shingles +
    P('M0,174 L320,156 L320,170 L0,188Z', 'cool') + P('M30,172 q6,-8 12,-2 M120,166 q6,-8 12,-2 M220,160 q6,-8 12,-2', 'teal', 1) +
    R(296, 156, 16, 30, 'cool', 2) +
    E(110, 126, 22, 6, 'none', 1) +
    P('M222,40 h30 M232,52 h40 M210,28 h20', 'none', 1) +
    sock(190, 100, 0.85, -6) + spark(270, 24, 5));

  A.nest = svg('Nest Egg: in a crow\'s nest full of spoons, keys and tinsel, a sock lines the bottom and keeps three speckled eggs warm',
    line('M-4,150 Q140,128 324,156', 'ink', 10) + line('M-4,150 Q140,128 324,156', 'shade', 5) +
    line('M90,40 Q100,50 96,90', 'cool', 4) + E(90, 36, 6, 9, 'cool', 1) +
    G('rotate(30 246 70)', R(242, 50, 8, 34, 'mustard', 3, 1) + C(246, 46, 8, 'mustard', 1)) +
    P('M180,64 l6,-10 6,10 6,-10 6,10 6,-10', 'none', 1) +
    sock(160, 86, 1, -90) +
    E(120, 90, 11, 14, 'cool') + D(116, 86, 1.8) + D(123, 94, 1.8) +
    E(96, 96, 11, 14, 'cool') + D(92, 92, 1.8) + D(100, 100, 1.8) +
    E(208, 92, 11, 14, 'cool') + D(204, 88, 1.8) + D(212, 96, 1.8) +
    P('M62,100 Q66,154 160,154 Q254,154 258,100Z', 'warm') +
    P('M70,108 L150,148 M110,104 L200,150 M170,104 L246,140 M250,108 L170,150 M210,104 L120,150 M150,104 L76,136', 'none', 1) +
    P('M264,96 q4,-14 18,-12 q10,2 10,14 q-10,6 -28,-2Z', 'paper', 1) + P('M270,92 h14', 'none', 1));

  A.sea = svg('Adventure Sock: a striped sock rides a swell on the open sea, a gull apologizing overhead and the sun on the horizon',
    C(60, 40, 22, 'warm') + P('M60,8 v-4 M92,40 h4 M24,40 h-4 M84,16 l3,-3 M36,16 l-3,-3', 'none', 1) +
    P('M0,110 Q40,100 80,108 Q120,116 160,82 Q200,100 240,106 Q280,112 320,104 V180 H0Z', 'cool') +
    P('M0,140 Q40,128 80,140 Q120,152 160,140 Q200,128 240,140 Q280,152 320,140 V180 H0Z', 'teal', 1) +
    P('M140,90 q10,-8 20,-8 q10,0 20,8', 'none', 1) + P('M40,124 q8,-6 16,0 M250,122 q8,-6 16,0 M90,160 q8,-6 16,0 M200,162 q8,-6 16,0', 'none', 1) +
    sock(160, 60, 1.05, -14) +
    E(236, 36, 14, 7, 'paper') + P('M226,34 Q216,18 204,24 M244,34 Q252,16 266,20', 'none') + P('M222,38 l-10,2 6,-6Z', 'mustard', 1) + D(228, 34, 1.8) +
    P('M256,50 q4,6 0,9', 'none', 1) + spark(290, 76, 5));

  A.dollhouse = svg('Doll Size: a shrunken striped sock on a porcelain doll\'s foot beside her tiny yellow sock, a dollhouse on the sunny windowsill',
    R(8, 8, 304, 128, 'cool', 6, 1) + P('M160,8 V136 M8,70 H312', 'none', 1) + C(274, 36, 12, 'warm', 1) +
    R(28, 64, 100, 72, 'warm', 2) + P('M20,68 L78,26 L136,68Z', 'red') + R(42, 80, 22, 20, 'paper', 2, 1) + R(90, 80, 22, 20, 'paper', 2, 1) + R(64, 106, 26, 30, 'pim', 3, 1) +
    R(-4, 134, 328, 16, 'shade', 3) +
    P('M200,138 L208,90 L236,90 L244,138Z', 'pim') + P('M208,96 L196,120 M236,96 L250,118', 'none') +
    C(222, 74, 16, 'paper') + D(216, 74, 2) + D(228, 74, 2) + P('M212,68 l-3,-3 M216,67 l-1,-4 M228,67 l1,-4 M232,68 l3,-3', 'none', 1) + smile(222, 81, 6) +
    P('M206,58 Q222,46 238,58', 'mustard') +
    P('M212,138 V152 M232,138 V152', 'none') +
    sock(210, 162, 0.55, 0) + G('translate(234 162) scale(0.55)', P(SOCK, 'mustard') + P('M-5,-6 h3 M2,-6 h3', 'none', 1)) +
    heart(270, 116, 0.7) + spark(170, 110, 5));

  A.mismatch = svg('Close Enough: a striped sock and a gray sock with a pink toe lean together in a cozy drawer, clearly not a match and clearly happy',
    R(20, 40, 280, 130, 'mustard', 8) + R(34, 54, 252, 116, 'warm', 4, 1) +
    E(64, 150, 20, 12, 'cool', 1) + P('M50,148 q14,-8 28,0', 'none', 1) + E(256, 150, 20, 12, 'shade', 1) + P('M242,148 q14,-8 28,0', 'none', 1) +
    sock(132, 120, 1.25, 8) + oddSock(190, 120, 1.25, -8) +
    P('M150,52 q5,-5 10,0 q5,5 10,0 M150,60 q5,-5 10,0 q5,5 10,0', 'none', 1) +
    heart(110, 34, 0.7) + heart(214, 34, 0.7) + spark(30, 20, 5) + spark(290, 20, 5));


  /* ---------- washer and extra ---------- */
  function water(y) { return P('M-4,' + y + ' Q36,' + (y - 10) + ' 76,' + y + ' Q116,' + (y + 10) + ' 156,' + y + ' Q196,' + (y - 10) + ' 236,' + y + ' Q276,' + (y + 10) + ' 324,' + y + ' V184 H-4Z', 'cool'); }
  function bubbles() { return C(30, 30, 6, 'paper', 1) + C(46, 50, 4, 'paper', 1) + C(290, 40, 7, 'paper', 1) + C(274, 22, 4, 'paper', 1) + C(300, 70, 3, 'paper', 1); }
  function gymSock(x, y, s, r, extra) {
    return G('translate(' + x + ' ' + y + ') rotate(' + (r || 0) + ') scale(' + (s || 1) + ')',
      P(SOCK, 'paper') + R(-9, -22, 18, 4, 'red', 0, 1) + R(-9, -15, 18, 4, 'red', 0, 1) + D(-3.5, -6, 2.2) + D(3.5, -6, 2.2) + (extra || ''));
  }
  var trunks = function (x, y, s) {
    return G('translate(' + x + ' ' + y + ') scale(' + (s || 1) + ')',
      P('M-80,-14 H80 L92,16 Q50,26 10,16 Q0,8 -10,16 Q-50,26 -92,16Z', 'red') + R(-80, -22, 160, 10, 'warm', 4) +
      P('M-6,-12 q-6,14 -14,16 M6,-12 q6,14 14,16', 'none', 1) +
      P('M-60,0 v-8 M-64,-6 q4,-4 8,0 M50,2 v-8 M46,-4 q4,-4 8,0 M-30,10 v-8 M-34,4 q4,-4 8,0', 'none', 1) +
      D(-16, -2, 2.6) + D(16, -2, 2.6) + P('M-14,6 Q-6,2 0,6 Q6,2 14,6', 'none', 1));
  };

  A.captain_trunks = svg('Captain Trunks, a pair of swim trunks floating like a raft on a soapy sea, with a striped sock aboard and a glowing pod above',
    bubbles() + E(240, 34, 16, 12, 'teal', 1) + P('M232,30 q8,-6 16,4', 'none', 1) + spark(214, 24, 5) +
    water(124) + trunks(160, 114, 1) + sock(186, 84, 0.85, -6) +
    P('M30,150 q10,-8 20,0 M120,160 q10,-8 20,0 M260,152 q10,-8 20,0', 'none', 1) +
    gymSock(40, 136, 0.5, -20) + gymSock(290, 140, 0.5, 18));

  A.pod = svg('The Pod Speaks: a glowing detergent pod turns in the water, shedding blue swirls and prophecies, as a sock listens',
    water(140) +
    P('M88,60 l-18,-10 M86,90 h-22 M232,60 l18,-10 M234,90 h22 M110,30 l-10,-16 M210,30 l10,-16', 'none', 1) +
    P('M110,50 Q110,28 136,28 H184 Q210,28 210,50 V100 Q210,122 184,122 H136 Q110,122 110,100Z', 'cool') +
    P('M112,76 Q130,58 160,76 Q190,94 208,76 V100 Q208,120 184,120 H136 Q112,120 112,100Z', 'teal', 1) +
    C(186, 50, 10, 'warm', 1) +
    P('M142,70 q6,-5 12,0 M166,70 q6,-5 12,0', 'none', 1) + E(160, 92, 6, 4, 'paper', 1) +
    line('M130,124 q-10,14 6,22 q14,8 0,18', 'teal', 3) + line('M190,124 q10,12 -4,22', 'teal', 3) +
    sock(262, 128, 0.8, 8) + spark(50, 40, 6) + spark(276, 30, 5));

  A.odd_lot = svg('The Odd Lot: three soggy gym socks, one with an eye patch, paddle in a ring around a striped sock and a dissolving receipt',
    water(110) +
    gymSock(70, 104, 0.95, -14, P('M-8,-10 L8,-2', 'none', 1) + E(3.5, -6, 4, 3.5, 'red', 1)) +
    gymSock(250, 104, 0.95, 14) + gymSock(212, 140, 0.6, -6) +
    P('M44,124 q-10,4 -14,-4 M276,124 q10,4 14,-4', 'none', 1) +
    sock(156, 100, 1, 0) +
    G('rotate(-10 150 150)', R(126, 140, 46, 24, 'paper', 3) + P('M132,148 h30 M132,154 h20', 'none', 1)) + C(176, 160, 3, 'paper', 1) + C(182, 150, 2, 'paper', 1) +
    spark(160, 30, 6) + P('M112,40 q8,-12 16,0 M196,40 q8,-12 16,0', 'none', 1));

  A.red_sweatshirt = svg('The Red Sweatshirt: a huge cheerful red sweatshirt with rosy lettering opens its sleeves for a hug in pink-tinted water, a striped sock hesitating',
    '<rect x="0" y="0" width="320" height="180" fill="var(--a-red)" opacity="0.18"/>' +
    water(150) +
    P('M150,14 Q120,10 112,40 L74,58 L40,104 L60,116 L96,84 L100,150 L210,150 L214,84 L250,116 L270,104 L236,58 L198,40 Q190,10 160,14Z', 'red') +
    P('M124,40 Q160,64 186,40', 'none', 1) +
    R(122, 76, 66, 22, 'paper', 4, 1) + P('M130,87 h8 M144,87 h8 M158,87 h8 M172,87 h8', 'red', 1) +
    D(140, 112, 2.6) + D(170, 112, 2.6) + P('M144,120 Q155,130 166,120', 'none', 1) +
    R(206, 120, 10, 14, 'paper', 2, 1) +
    heart(150, 160, 0.6) + heart(98, 164, 0.5) +
    sock(276, 148, 0.8, -8) + P('M260,110 l-6,-8 M270,108 v-10', 'none', 1));

  A.pink_forever = svg('Pink Forever: the striped sock, dyed rose and coral, sits beside its pink twin on a girl\'s bed, hearts all around',
    R(-4, 110, 328, 74, 'pim') + P('M-4,110 H324', 'none') + P('M20,130 l10,10 10,-10 M100,150 l10,10 10,-10 M240,134 l10,10 10,-10', 'none', 1) +
    C(70, 50, 22, 'warm', 1) + R(240, 28, 50, 40, 'cool', 6, 1) +
    G('translate(130 104) rotate(4) scale(1.3)',
      '<path d="' + SOCK + '" ' + F('paper') + '/>' + '<path d="' + SOCK + '" fill="var(--a-red)" opacity="0.45"/>' +
      '<rect x="-9" y="-22" width="18" height="6" ' + F('red') + '/>' + '<rect x="-9" y="-13" width="18" height="4" ' + F('red') + '/>' + '<rect x="-9" y="0" width="18" height="4" ' + F('red') + '/>' +
      '<path d="M-9,12 L-9,14 Q-9,22 -1,22 L4,22 Q4,13 -9,12Z" ' + F('red') + '/>' + P('M24,13 l3,3 M27,13 l-3,3', 'none', 1) +
      P(SOCK, 'none') + D(-3.5, -6, 2.2) + D(3.5, -6, 2.2) + smile(0, 1, 6)) +
    G('translate(196 104) rotate(-4) scale(-1.3 1.3)', P(SOCK, 'red') + R(-9, -22, 18, 6, 'warm', 0, 1) + P(SOCK, 'none') + D(-3.5, -6, 2.2) + D(3.5, -6, 2.2) + smile(0, 1, 6)) +
    heart(160, 40, 1.2) + heart(120, 26, 0.7) + heart(204, 26, 0.7) + spark(30, 90, 5) + spark(296, 90, 5));

  A.ghost_shirt = svg('The Bleached: the ghost of a concert T-shirt, splotched pale and so thin you can see through it, drifts moaning toward a startled sock',
    water(150) +
    '<g opacity="0.75">' + P('M110,30 L80,44 L60,80 L84,90 L96,70 L100,150 Q120,140 140,152 Q160,140 180,152 Q200,140 220,150 L224,70 L236,90 L260,80 L240,44 L210,30 Q160,48 110,30Z', 'paper') + '</g>' +
    E(130, 80, 14, 9, 'shade', 1) + E(196, 110, 12, 8, 'shade', 1) + E(150, 128, 8, 6, 'shade', 1) +
    E(146, 96, 6, 8, 'shade', 1) + E(176, 96, 6, 8, 'shade', 1) + E(161, 116, 7, 9, 'shade', 1) +
    P('M50,30 q10,-8 20,0 M270,30 q10,-8 20,0', 'none', 1) +
    sock(276, 144, 0.75, 14, 'sad') + P('M292,104 l6,-8 M300,110 l8,-4', 'none', 1));

  A.gasket = svg('The Rubber Reef: three pious pennies and a hair tie live in the folds of the washer door seal, where a sock rests while the storm passes',
    C(160, 90, 150, 'shade') + C(160, 90, 120, 'paper', 1) + C(160, 90, 104, 'cool', 1) +
    P('M30,40 Q40,90 30,140 M50,30 Q62,90 50,150 M290,40 Q280,90 290,140 M270,30 Q258,90 270,150', 'none', 1) +
    P('M72,140 Q120,176 160,176 Q200,176 248,140', 'none', 1) +
    C(100, 40, 9, 'mustard', 1) + D(97, 38, 1.5) + D(103, 38, 1.5) + C(220, 40, 9, 'mustard', 1) + D(217, 38, 1.5) + D(223, 38, 1.5) +
    C(160, 24, 9, 'mustard', 1) + D(157, 22, 1.5) + D(163, 22, 1.5) + spark(160, 6, 4) +
    E(72, 120, 10, 6, 'red', 1) + fluff(250, 120, 10, 7, 'paper') +
    P('M110,110 q16,-14 32,0 q16,14 32,0 q16,-14 32,0', 'none', 1) +
    sock(150, 150, 0.9, -90, 'sleep') + zz(178, 112, 1) + zz(192, 98, 1.3));

  var holes = '';
  for (var hy = 22; hy < 180; hy += 22) for (var hx = 16 + ((hy / 22) % 2) * 11; hx < 320; hx += 22) holes += D(hx, hy, 3, 'shade');
  A.spin_wall = svg('The Turning: flattened against the steel drum wall full of little holes, a sock spins beside Captain Trunks pinned spread-eagle',
    R(0, 0, 320, 180, 'cool') + holes +
    line('M20,150 Q160,190 300,150', 'paper', 3) + line('M10,30 Q160,-10 310,30', 'paper', 3) +
    G('rotate(-8 214 92)', P('M170,60 H258 L278,140 L236,146 L216,98 L194,146 L152,140Z', 'red') + R(170, 52, 88, 12, 'warm', 4) +
      D(204, 80, 2.6) + D(226, 80, 2.6) + P('M206,90 q9,6 18,0', 'none', 1)) +
    G('translate(92 96) scale(1.25 0.9)', sock(0, 0, 1, -30)) +
    P('M60,132 l-6,10 M88,140 l-2,12 M120,134 l4,10', 'teal', 1) + P('M40,64 q-10,10 -6,24 M150,40 q12,-6 22,2', 'none', 1));

  A.drain_hose = svg('Down the Drain Hose: a ribbed gray hose bends down the wall, a striped sock lodged at the bend catching sequins and threads',
    R(240, -4, 84, 188, 'shade') + P('M240,-4 V184', 'none') +
    line('M-10,60 Q120,50 170,90 Q210,124 244,170', 'ink', 52) + line('M-10,60 Q120,50 170,90 Q210,124 244,170', 'shade', 45) +
    P('M20,36 v46 M50,34 v46 M80,36 v46 M108,40 l-4,46 M136,50 l-10,42 M182,68 l-28,38 M206,92 l-30,32 M224,118 l-34,22', 'none', 1) +
    line('M-10,60 Q120,50 170,90 Q210,124 244,170', 'cool', 16) +
    sock(186, 112, 0.9, -40) +
    spark(150, 92, 5, 'mustard') + D(130, 70, 2.5, 'red') + D(110, 64, 2.5, 'pim') + P('M96,60 q6,-6 12,0', 'red', 1) +
    P('M40,140 q8,-6 16,0 M70,160 q8,-6 16,0', 'none', 1));

  A.new_sage = svg('The New Sage: a striped sock glowing with lavender scent sits on the drum fin, telling three frightened new socks it will be all right',
    C(160, 90, 150, 'shade') + C(160, 90, 132, 'paper', 1) +
    P('M110,100 L160,74 L210,100Z', 'shade') +
    sock(160, 62, 0.95, 0) + C(160, 58, 34, 'none', 1) +
    P('M120,40 q-10,-12 2,-22 q8,-8 0,-16 M204,36 q10,-10 0,-20 q-8,-8 2,-16', 'pim') +
    spark(110, 64, 5) + spark(212, 66, 5) +
    G('translate(90 140) scale(0.6)', P(SOCK, 'cool') + D(-3.5, -6, 2.2) + D(3.5, -6, 2.2)) +
    G('translate(150 150) scale(0.55)', P(SOCK, 'warm') + D(-3.5, -6, 2.2) + D(3.5, -6, 2.2)) +
    G('translate(214 142) scale(-0.6 0.6)', P(SOCK, 'pim') + D(-3.5, -6, 2.2) + D(3.5, -6, 2.2)) +
    P('M240,150 Q260,140 286,148 L282,160 Q260,154 244,162Z', 'paper', 1));

  /* kitchen junk drawer */
  var tie = 'M168,32 q6,-8 12,0 q6,8 12,0 q6,-8 12,0';
  A.junk_drawer = svg('The kitchen junk drawer: dead batteries, rubber bands, a twist tie, birthday candles, soy sauce packets, a takeout menu, a tape measure, and a striped sock peeking around',
    R(22, 6, 276, 150, 'warm', 10) + R(36, 16, 248, 126, 'shade', 6, 1) +
    P('M48,30 L108,22 L114,70 L54,78Z', 'paper', 1) + P('M48,30 L108,22 L110,34 L50,42Z', 'red', 1) + P('M58,54 L102,48 M60,63 L96,58 M61,72 L104,66', 'none', 1) +
    line('M118,36 a14,8 0 1,0 28,0 a14,8 0 1,0 -28,0 M254,128 a11,6 0 1,0 22,0 a11,6 0 1,0 -22,0', 'red', 4) +
    line(tie, 'ink', 8) + line(tie, 'mustard', 3.5) +
    P('M236,56 L204,58 L204,66 L236,64Z M212,58 v4 M220,57 v4 M228,57 v4 M201,55 v14', 'warm', 1) + R(232, 26, 42, 42, 'mustard', 11) + C(253, 47, 9, 'shade', 1) +
    P('M52,96 l30,5 l-2,14 l-30,-5Z M52,120 l30,-3 l1.5,14 l-30,3Z', 'cool', 1) + P('M82,101 l8,1.4 l-2,14 l-8,-1.4Z M82,117 l8,-0.8 l1.5,14 l-8,0.8Z', 'mustard', 1) +
    P('M106,112 L132,96 L136,102 L110,118Z M110,130 L140,124 L141.5,131 L111.5,137Z', 'pim', 1) + P('M114,107 l4,6 M122,102 l4,6 M134,99 l5,-3 M118,128 l1.5,7 M128,126 l1.5,7 M141,127.5 l6,-1', 'none', 1) +
    P('M206,84 L238,88 L236,108 L204,104Z M216,112 L246,106 L250,126 L220,132Z', 'paper', 1) + P('M224,89 Q229,96 224,101 Q219,96 224,89Z M234,112 Q239,119 234,124 Q229,119 234,112Z', 'ink') +
    sock(172, 92, 1, -6) + P('M152,70 L146,66 M151,79 H144 M201,64 L207,60', 'none', 1) +
    R(14, 138, 292, 38, 'warm', 8) + R(136, 151, 48, 11, 'shade', 5, 1));

  A.junk_key = svg('In the junk drawer, a small brass key with a hopeful little face lies beside a striped sock, dreaming of a keyhole and a question mark',
    R(-4, -4, 328, 188, 'shade') + R(-4, 150, 328, 34, 'warm') + P('M-4,150 H324', 'none') + dash(40, 164, 70, 164) + dash(214, 168, 250, 168) +
    P('M180,112 V132 H188 V125 H195 V134 H203 V112Z', 'mustard') +
    R(128, 102, 82, 15, 'mustard', 4) + C(108, 109, 28, 'mustard') + C(108, 90, 5, 'shade', 1) +
    eyes(108, 108, 11, 2.6) + smile(108, 117, 10) + P('M98,101 l6,-3 M112,98 l6,3', 'none', 1) + D(94, 116, 3, 'red') + D(122, 116, 3, 'red') +
    E(160, 40, 48, 28, 'paper') + C(118, 74, 3.5, 'paper', 1) + C(127, 65, 5, 'paper', 1) +
    D(146, 33, 7.5) + P('M141,36 L137,54 H155 L151,36Z', 'ink') + q(178, 43, 1.35) +
    sock(258, 108, 1.4, 6) + spark(62, 62, 6) + spark(232, 70, 4, 'mustard'));

  A.junk_chopstick = svg('Beside the edge of the junk drawer, a single wooden chopstick with a sweet face lies next to a striped sock, a little heart floating between them',
    R(-4, -4, 328, 188, 'shade') + R(-4, -4, 328, 44, 'warm') + P('M-4,40 H324', 'none') +
    P('M20,18 q30,-6 60,0 M140,26 q30,6 60,0 M236,14 q24,-5 48,0', 'none', 1) +
    line('M40,76 a12,7 0 1,0 24,0 a12,7 0 1,0 -24,0', 'red', 4) + D(112, 164, 2.5) + D(180, 160, 2) +
    P('M30,122 L34,146 L230,128 Q236,125 230,121 Z', 'warm') +
    P('M94,122 V140.5 L103,139.6 V121.8Z', 'red', 1) +
    eyes(64, 132, 8, 2.4) + smile(64, 138, 8) + D(52, 137, 2.5, 'red') + D(76, 136, 2.5, 'red') +
    sock(264, 110, 1.25, 0) + heart(232, 80, 1.2) + spark(200, 64, 5) + spark(276, 52, 4, 'mustard'));

  window.SOCK_ART = A;
})();
