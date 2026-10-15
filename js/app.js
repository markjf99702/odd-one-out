// The reader: turns pages, keeps flags and saves, draws endings as care labels and the Found panel.
// The story itself is window.STORY (js/story.js, built from story/*.json by tools/build.mjs).
const STORY = window.STORY;
(function () {
  const byId = Object.create(null);
  STORY.forEach(p => byId[p.id] = p);
  const ENDINGS = STORY.filter(p => p.ending);
  const REGION = { d: "The Drum", u: "Under the Dryer", h: "The House", o: "Outside", x: "The Odd Sock Dimension", w: "The Washer", j: "The Junk Drawer", s: "The Drum" };
  const KEY = "odd-one-out.v1";
  const OLD_KEY = "odd-one-out-v1"; // what the first Artifact copy saved under
  const ADDRESS = "https://odd-one-out.junkdrawer.works/";
  const store = {
    get() { try { return JSON.parse(localStorage.getItem(KEY) || localStorage.getItem(OLD_KEY)) || null; } catch (e) { return null; } },
    set(v) { try { localStorage.setItem(KEY, JSON.stringify(v)); } catch (e) {} }
  };
  const saved = store.get() || {};
  let state = { at: "start", flags: [], hist: [], cycles: 0, found: [], seen: [], begun: false };
  function boot(data) {
    const src = (data && data.at) ? data : saved;
    if (src && src.at && byId[src.at]) state = Object.assign(state, src);
    if (!(data && data.at)) state.begun = false;
    state.found = Array.from(new Set((state.found || []).concat(saved.found || [])));
    render(false);
  }
  window.claude?.hot?.snapshot?.(() => state);
  function save() { store.set(state); }

  const esc = s => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const fmt = t => t.split(/\n\s*\n/).map(par => "<p>" + esc(par.trim()).replace(/\*([^*]+)\*/g, "<em>$1</em>") + "</p>").join("");
  const art = k => (window.SOCK_ART && (window.SOCK_ART[k] || window.SOCK_ART.title)) || "";
  const regionOf = id => REGION[id === "start" ? "d" : id[0]] || "Somewhere";

  const CARE = {
    good: ['<circle cx="16" cy="16" r="11" fill="none" stroke="currentColor" stroke-width="2.5"/><path d="M10 16l4 4 8-9" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>', "Tumble dry low. Keep with pair."],
    bittersweet: ['<path d="M5 9h22l-3 16H8z" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round"/><path d="M9 14q3.5-3 7 0t7 0" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>', "Hand wash gently. Handle with feeling."],
    bad: ['<rect x="5" y="5" width="22" height="22" rx="3" fill="none" stroke="currentColor" stroke-width="2.5"/><path d="M9 9l14 14M23 9L9 23" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" fill="none"/>', "Do not tumble. Do not pass go."],
    weird: ['<path d="M16 4l13 23H3z" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round"/><circle cx="16" cy="19" r="3" fill="currentColor"/>', "Bleach as needed. Reality sold separately."]
  };
  const careSvg = k => '<svg viewBox="0 0 32 32" aria-hidden="true">' + CARE[k][0] + "</svg>";

  const page = document.getElementById("page");
  const SIZES = ["1rem", "1.075rem", "1.2rem", "1.32rem"];
  let sizeIx = 1;
  try { const v = parseInt(localStorage.getItem(KEY + ".size"), 10); if (v >= 0 && v < SIZES.length) sizeIx = v; } catch (e) {}
  document.documentElement.style.setProperty("--story-size", SIZES[sizeIx]);
  function deck() {
    let h = '<span class="deck">';
    if (window.SockSound && SockSound.ok) h += '<button class="pill" type="button" data-act="sound" aria-pressed="' + SockSound.on + '" title="Ambient sound for each place">Sound</button>';
    if (window.SockVoice && SockVoice.ok) h += '<button class="pill" type="button" data-act="narrate" aria-pressed="' + SockVoice.on + '" title="Read each page aloud">Narrate</button>';
    return h + '<button class="pill" type="button" data-act="size" title="Text size" aria-label="Change text size">Aa</button></span>';
  }
  const regionKey = id => (id === "start" ? "d" : id[0]);
  function narrate() {
    if (!window.SockVoice || !SockVoice.on) return;
    if (!state.begun) return SockVoice.read(["Odd One Out.", "The dryer buzzes. You wake alone in the warm dark, a striped left sock with a darned toe, and Pim is gone. Find your pair before you become a rag."]);
    const p = byId[state.at];
    const chunks = [p.title + "."].concat(p.text.replace(/\*/g, "").split(/\n\s*\n/));
    if (p.ending) chunks.push("The end. " + p.ending.name + ".");
    else { const bs = page.querySelectorAll(".choices .choice span:last-child"); bs.forEach((b, i) => chunks.push("Choice " + (i + 1) + ". " + b.textContent + ".")); }
    SockVoice.read(chunks);
  }
  const FOOT = '<footer class="jd-foot"><a href="https://junkdrawer.works/">Part of junkdrawer.works</a><span aria-hidden="true">·</span><a href="https://junkdrawer.works/privacy.html">Privacy</a></footer>';
  function cover() {
    const cont = state.at !== "start" && byId[state.at];
    let h = '<div class="porthole">' + art("title") + "</div>";
    h += '<section class="cover"><h1>Odd<br><span>One</span> Out</h1>';
    h += '<p class="tagline">The dryer buzzes. You wake alone in the warm dark, a striped left sock with a darned toe, and Pim is gone. Find your pair before you become a rag.</p>';
    h += '<div class="specs"><span>' + STORY.length + " passages</span><span>" + ENDINGS.length + " endings</span><span>7 regions</span><span>Cold wash only</span></div>";
    h += '<div class="where"><span>Before you begin</span>' + deck() + "</div>";
    h += '<button class="choice primary" type="button" data-act="begin">' + (cont ? "Keep tumbling" : "Begin") + "</button>";
    if (cont) h += '<button class="choice" type="button" data-act="fresh">Start over from the buzzer</button><p class="hint">You left off at \u201c' + esc(cont.title) + '\u201d.</p>';
    else h += '<p class="hint">Tap a choice or press its number. Back undoes a choice. Found lists the endings you have reached. Sound plays a different ambience in each place.</p>';
    h += FOOT + "</section>";
    page.innerHTML = h;
    document.getElementById("backBtn").disabled = true;
    document.getElementById("foot").textContent = state.found.length + " of " + ENDINGS.length + " endings found";
    if (window.SockSound) SockSound.region("d");
  }
  function celebrate() {
    const layer = document.createElement("div"); layer.className = "confetti"; layer.setAttribute("aria-hidden", "true");
    const cols = ["var(--teal)", "var(--mustard)", "var(--red)", "var(--pim)"];
    for (let i = 0; i < 40; i++) {
      const c = document.createElement("i");
      c.style.left = Math.random() * 100 + "%"; c.style.background = cols[i % 4];
      c.style.animationDuration = 2.4 + Math.random() * 2.4 + "s"; c.style.animationDelay = Math.random() * 1.2 + "s";
      layer.appendChild(c);
    }
    document.body.appendChild(layer); setTimeout(() => layer.remove(), 6500);
  }
  function render(anim) {
    if (!state.begun) return cover();
    const p = byId[state.at];
    if (!p) { state.at = "start"; return render(anim); }
    if (p.flag && !state.flags.includes(p.flag)) state.flags.push(p.flag);
    if (!state.seen.includes(p.id)) state.seen.push(p.id);
    let h = '<div class="porthole">' + art(p.art) + "</div>";
    h += '<div class="where"><span><b>' + esc(regionOf(p.id)) + "</b></span><span>Cycle " + (state.cycles + 1) + "</span>" + deck() + "</div>";
    h += '<h1 class="ptitle" tabindex="-1">' + esc(p.title) + "</h1>";
    h += '<div class="story">' + fmt(p.text) + "</div>";
    if (p.ending) {
      const k = CARE[p.ending.kind] ? p.ending.kind : "weird";
      if (!state.found.includes(p.id)) state.found.push(p.id);
      if (anim && p.ending.kind === "good") setTimeout(celebrate, 250);
      if (anim && window.SockSound) SockSound.motif(p.ending.kind);
      const n = ENDINGS.findIndex(e => e.id === p.id) + 1;
      h += '<section class="label" aria-label="Ending">';
      h += '<div class="kicker"><span>Ending ' + n + " of " + ENDINGS.length + "</span><span>" + state.found.length + " found</span></div>";
      h += '<div class="ename">' + esc(p.ending.name) + "</div>";
      h += '<div class="care">' + ["good", "bittersweet", "bad", "weird"].map(x => x === k ? careSvg(x) : careSvg(x).replace("<svg", '<svg style="opacity:.22"')).join("") + "</div>";
      h += '<div><span class="kind kind-' + k + '">' + k + "</span></div>";
      h += '<div class="fine">' + CARE[k][1] + " " + "Visited " + state.seen.length + " of " + STORY.length + " places. 80% wool, 20% nylon, 100% you.</div>";
      const trail = state.hist.map(x => x.at).concat(p.id).filter((id, i, a) => byId[id] && a[i - 1] !== id).map(id => byId[id].title);
      h += '<div class="route"><b>Your tumble</b>' + trail.map(esc).join(" &rarr; ") + "</div>";
      h += '<div class="copyline"><button class="tbtn" type="button" data-act="copy">Copy my ending</button><span class="copied" id="copied" aria-live="polite"></span></div>';
      h += "</section>";
      h += '<div class="endbtns"><button class="choice" type="button" data-act="restart">Start a new tumble</button>';
      h += '<button class="choice" type="button" data-act="back">Undo that last choice</button></div>';
    } else {
      const has = f => state.flags.includes(f);
      const ch = (p.choices || []).filter(c => [].concat(c.requires || []).every(has) && ![].concat(c.unless || []).some(has));
      h += '<ol class="choices">' + ch.map((c, i) => '<li><button class="choice" type="button" data-to="' + esc(c.to) + '"><span class="num">' + (i + 1) + "</span><span>" + esc(c.label) + "</span></button></li>").join("") + "</ol>";
    }
    page.innerHTML = h;
    if (anim) { page.classList.remove("fade"); void page.offsetWidth; page.classList.add("fade"); window.scrollTo({ top: 0, behavior: "instant" in window ? "instant" : "auto" }); page.querySelector(".ptitle").focus({ preventScroll: true }); }
    document.getElementById("backBtn").disabled = state.hist.length === 0;
    document.getElementById("foot").textContent = state.found.length + " of " + ENDINGS.length + " endings found · " + STORY.length + " passages in the drum";
    if (window.SockSound) SockSound.region(regionKey(p.id));
    if (anim) narrate();
    save();
  }
  function go(to) {
    if (!byId[to]) return;
    state.hist.push({ at: state.at, flags: state.flags.slice() });
    if (state.hist.length > 300) state.hist.shift();
    state.at = to; state.cycles++;
    if (window.SockSound) SockSound.turn();
    render(true);
  }
  function back() {
    if (!state.begun) return; // the cover shows where you left off, and Back (or Backspace) leaves it there
    const prev = state.hist.pop();
    if (!prev) return;
    state.at = prev.at; state.flags = prev.flags; state.cycles = Math.max(0, state.cycles - 1);
    render(true);
  }
  function restart() { state = { at: "start", flags: [], hist: [], cycles: 0, found: state.found, seen: state.seen, begun: true }; closeLF(); render(true); }

  page.addEventListener("click", e => {
    const b = e.target.closest("button"); if (!b) return;
    if (b.dataset.to) go(b.dataset.to);
    else if (b.dataset.act === "restart") restart();
    else if (b.dataset.act === "back") back();
    else if (b.dataset.act === "begin") { state.begun = true; render(true); }
    else if (b.dataset.act === "fresh") { restart(); }
    else if (b.dataset.act === "copy") {
      const p = byId[state.at], msg = "Odd One Out: I reached \u201c" + p.ending.name + "\u201d (" + p.ending.kind + ") after " + state.cycles + " choices. " + state.found.length + " of " + ENDINGS.length + " endings found. " + ADDRESS;
      const done = t => { const c = document.getElementById("copied"); if (c) c.textContent = t; };
      const fallback = () => { done(msg); const el = document.getElementById("copied"); if (el) { const r = document.createRange(); r.selectNodeContents(el); const sel = getSelection(); sel.removeAllRanges(); sel.addRange(r); } };
      try { navigator.clipboard.writeText(msg).then(() => done("Copied"), fallback); } catch (err) { fallback(); }
    }
    else if (b.dataset.act === "sound") { b.setAttribute("aria-pressed", String(SockSound.toggle())); if (SockSound.on) SockSound.region(state.begun ? regionKey(state.at) : "d"); }
    else if (b.dataset.act === "narrate") { b.setAttribute("aria-pressed", String(SockVoice.toggle())); narrate(); }
    else if (b.dataset.act === "size") { sizeIx = (sizeIx + 1) % SIZES.length; document.documentElement.style.setProperty("--story-size", SIZES[sizeIx]); try { localStorage.setItem(KEY + ".size", String(sizeIx)); } catch (e) {} }
  });
  document.addEventListener("keydown", e => {
    if (!document.getElementById("lf").hidden) { if (e.key === "Escape") closeLF(); return; }
    const n = parseInt(e.key, 10);
    if (n >= 1 && n <= 9) { const bs = page.querySelectorAll(".choices .choice"); if (bs[n - 1]) bs[n - 1].click(); }
    if (e.key === "Backspace") back();
  });
  document.getElementById("backBtn").onclick = back;

  const lf = document.getElementById("lf");
  function openLF() {
    const f = state.found;
    document.getElementById("lfSub").textContent = f.length + " of " + ENDINGS.length + " endings found. " + state.seen.length + " of " + STORY.length + " places visited.";
    document.getElementById("lfMeter").style.width = (100 * f.length / ENDINGS.length) + "%";
    document.getElementById("lfTags").innerHTML = ENDINGS.map((e, i) => f.includes(e.id)
      ? '<li class="tag"><span class="k kind-' + esc(e.ending.kind) + '">' + (i + 1) + " · " + esc(e.ending.kind) + '</span><span class="t">' + esc(e.ending.name) + '</span><span class="k" style="color:var(--muted)">' + esc(regionOf(e.id)) + "</span></li>"
      : '<li class="tag missing"><span class="k">' + (i + 1) + (e.id.includes("secret") ? " · secret" : " · unclaimed") + "</span><span class=\"t\">? ? ?</span><span class=\"k\">" + esc(regionOf(e.id)) + "</span></li>").join("");
    const order = ["d", "u", "h", "o", "x", "w", "j"];
    document.getElementById("lfMap").innerHTML = order.map(r => {
      const ps = STORY.filter(p => (p.id === "start" ? "d" : p.id[0]) === r);
      if (!ps.length) return "";
      const v = ps.filter(p => state.seen.includes(p.id)).length;
      return '<div class="reg"><span class="rn">' + esc(REGION[r]) + " · " + v + "/" + ps.length + '</span><div class="dots">' + ps.map(p => '<span class="' + (p.ending ? "e " : "") + (state.seen.includes(p.id) ? "v" : "") + '" title="' + (state.seen.includes(p.id) ? esc(p.title) : "unvisited") + '"></span>').join("") + "</div></div>";
    }).join("");
    lf.hidden = false; document.getElementById("lfClose").focus();
  }
  function closeLF() { lf.hidden = true; }
  document.getElementById("lfBtn").onclick = openLF;
  document.getElementById("lfClose").onclick = closeLF;
  document.getElementById("restartBtn").onclick = restart;
  let wipeArmed = false;
  document.getElementById("wipeBtn").onclick = function () {
    if (!wipeArmed) { wipeArmed = true; this.textContent = "Tap again to forget"; return; }
    wipeArmed = false; this.textContent = "Forget my endings";
    state.found = []; state.seen = [state.at]; save(); openLF();
  };

  window.claude?.hot?.ready ? window.claude.hot.ready(boot) : boot(window.claude?.hot?.data ?? {});
  if ("serviceWorker" in navigator && /^https?:$/.test(location.protocol)) navigator.serviceWorker.register("sw.js").catch(() => {});
})();
