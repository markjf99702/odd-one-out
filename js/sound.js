/* Ambient sound per region (WebAudio, generated, no files) and read-aloud narration. Both start only from a tap. */
window.SockSound = (function () {
  let ctx = null, master = null, cur = null, playing = null, want = "d", on = false;
  const AC = window.AudioContext || window.webkitAudioContext;
  function gain(v) { const g = ctx.createGain(); g.gain.value = v; return g; }
  function filt(type, f, q) { const n = ctx.createBiquadFilter(); n.type = type; n.frequency.value = f; if (q) n.Q.value = q; return n; }
  function noise(kind) {
    const len = ctx.sampleRate * 3, buf = ctx.createBuffer(1, len, ctx.sampleRate), d = buf.getChannelData(0);
    let b = 0;
    for (let i = 0; i < len; i++) { const w = Math.random() * 2 - 1; if (kind === "brown") { b = (b + 0.02 * w) / 1.02; d[i] = b * 3.5; } else d[i] = w * 0.5; }
    const s = ctx.createBufferSource(); s.buffer = buf; s.loop = true; return s;
  }
  function lfo(rate, depth, param) { const o = ctx.createOscillator(), g = gain(depth); o.frequency.value = rate; o.connect(g); g.connect(param); o.start(); return o; }
  function tone(f, type, vol, out) { const o = ctx.createOscillator(); o.type = type || "sine"; o.frequency.value = f; const g = gain(vol); o.connect(g); g.connect(out); o.start(); return o; }
  function bed(kind, ftype, f, q, vol, out) { const n = noise(kind), fl = filt(ftype, f, q), g = gain(vol); n.connect(fl); fl.connect(g); g.connect(out); n.start(); return { n, fl, g }; }
  function blip(f, dur, vol, type, out, to) {
    const t = ctx.currentTime, o = ctx.createOscillator(), g = gain(0);
    o.type = type || "sine"; o.frequency.setValueAtTime(f, t); if (to) o.frequency.exponentialRampToValueAtTime(to, t + dur);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + 0.012); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(out || master); o.start(t); o.stop(t + dur + 0.05);
  }
  function tick(out, vol, f) {
    const len = Math.floor(ctx.sampleRate * 0.03), buf = ctx.createBuffer(1, len, ctx.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3);
    const s = ctx.createBufferSource(); s.buffer = buf; const bp = filt("bandpass", f, 4), g = gain(vol);
    s.connect(bp); bp.connect(g); g.connect(out); s.start();
  }
  const SCAPES = {
    d(out, later) { // the drum after the buzzer: warm hum and cooling metal ticking
      const a = bed("brown", "lowpass", 380, 0, 0.55, out), hum = tone(58, "sine", 0.035, out);
      const loop = () => { tick(out, 0.2 + Math.random() * 0.25, 2200 + Math.random() * 2500); later(loop, 1200 + Math.random() * 3200); }; later(loop, 800);
      return [a.n, hum];
    },
    u(out) { // under the dryer: deep rumble and a draft from the vent
      const a = bed("brown", "lowpass", 140, 0, 0.9, out), w = bed("white", "bandpass", 900, 8, 0.02, out);
      return [a.n, w.n, lfo(0.07, 0.018, w.g.gain), lfo(0.05, 250, w.fl.frequency)];
    },
    h(out, later) { // the house: quiet room tone, a fridge, a clock
      const a = bed("brown", "lowpass", 260, 0, 0.35, out), fr = tone(60, "sine", 0.012, out);
      let alt = false; const loop = () => { tick(out, 0.07, alt ? 1800 : 2400); alt = !alt; later(loop, 1000); }; later(loop, 500);
      return [a.n, fr];
    },
    o(out, later) { // outside: gusting wind and birds
      const a = bed("white", "bandpass", 500, 0.8, 0.06, out);
      const loop = () => { const f = 2400 + Math.random() * 1600, k = 1 + Math.floor(Math.random() * 3); for (let i = 0; i < k; i++) later(() => blip(f, 0.09, 0.05, "sine", out, f * 1.35), i * 140); later(loop, 3000 + Math.random() * 6000); }; later(loop, 1500);
      return [a.n, lfo(0.11, 300, a.fl.frequency), lfo(0.07, 0.04, a.g.gain)];
    },
    x(out, later) { // the odd sock dimension: a shimmering pad with sparkles
      const pad = gain(1); pad.connect(out);
      const nodes = [261.63, 329.63, 392, 493.88].map((f, i) => tone(f * (1 + (i - 1.5) * 0.002), "sine", 0.028, pad));
      nodes.push(lfo(0.18, 0.4, pad.gain));
      const notes = [1046.5, 1174.7, 1318.5, 1568, 1760, 2093];
      const loop = () => { blip(notes[Math.floor(Math.random() * notes.length)], 1.4, 0.03, "sine", out); later(loop, 900 + Math.random() * 2200); }; later(loop, 600);
      return nodes;
    },
    w(out, later) { // the washer: sloshing water, a motor, bubbles
      const a = bed("brown", "lowpass", 600, 2, 0.8, out), m = tone(48, "triangle", 0.02, out);
      const loop = () => { blip(180 + Math.random() * 220, 0.12, 0.05, "sine", out, 90); later(loop, 400 + Math.random() * 1600); }; later(loop, 700);
      return [a.n, lfo(0.35, 450, a.fl.frequency), m];
    }
  };
  function stopCur(fade) {
    if (!cur) return; const c = cur; cur = null; playing = null;
    c.ts.forEach(clearTimeout);
    const t = ctx.currentTime; c.out.gain.cancelScheduledValues(t); c.out.gain.setValueAtTime(c.out.gain.value, t); c.out.gain.linearRampToValueAtTime(0, t + fade);
    setTimeout(() => { c.nodes.forEach(n => { try { n.stop(); } catch (e) {} }); try { c.out.disconnect(); } catch (e) {} }, fade * 1000 + 150);
  }
  function region(key) {
    want = SCAPES[key] ? key : "d";
    if (!on || !ctx || playing === want) return;
    stopCur(1.2);
    const out = gain(0); out.connect(master);
    const ts = new Set(), later = (fn, ms) => { const t = setTimeout(() => { ts.delete(t); fn(); }, ms); ts.add(t); };
    const nodes = SCAPES[want](out, later);
    out.gain.setValueAtTime(0, ctx.currentTime); out.gain.linearRampToValueAtTime(1, ctx.currentTime + 1.5);
    cur = { out, nodes, ts }; playing = want;
  }
  function toggle() {
    if (!AC) return false;
    try {
      if (!ctx) { ctx = new AC(); master = ctx.createGain(); master.gain.value = 0.5; master.connect(ctx.destination); }
      on = !on;
      if (on) { ctx.resume(); region(want); } else stopCur(0.4);
    } catch (e) { on = false; }
    return on;
  }
  function turn() { if (on && ctx) blip(150, 0.16, 0.09, "sine", master, 70); }
  function motif(kind) {
    if (!on || !ctx) return;
    const seqs = { good: [523.25, 659.25, 783.99, 1046.5], bittersweet: [440, 523.25, 659.25, 587.33], bad: [392, 349.23, 311.13, 261.63], weird: [440, 622.25, 466.16, 698.46] };
    (seqs[kind] || seqs.weird).forEach((f, i) => setTimeout(() => blip(f, 0.7, 0.11, "triangle"), 300 + i * 170));
  }
  return { ok: !!AC, get on() { return on; }, toggle, region, turn, motif };
})();

window.SockVoice = (function () {
  const ok = "speechSynthesis" in window && typeof SpeechSynthesisUtterance === "function";
  let on = false;
  function stop() { if (ok) try { speechSynthesis.cancel(); } catch (e) {} }
  function voice() {
    try { const vs = speechSynthesis.getVoices(); return vs.find(v => /^en[-_](GB|US)/i.test(v.lang) && v.localService) || vs.find(v => /^en/i.test(v.lang)) || null; } catch (e) { return null; }
  }
  function read(chunks) {
    if (!ok || !on) return;
    stop();
    const v = voice();
    chunks.filter(Boolean).forEach(c => { const u = new SpeechSynthesisUtterance(c); if (v) u.voice = v; u.rate = 0.98; u.pitch = 1.05; try { speechSynthesis.speak(u); } catch (e) {} });
  }
  return { ok, get on() { return on; }, toggle() { on = !on; if (!on) stop(); return on; }, read, stop };
})();
