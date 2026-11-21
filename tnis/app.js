// ───────── helpers ─────────
const $ = (sel, el = document) => el.querySelector(sel);
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const split = (x) => { const [h, p, e] = x.split("|"); return { h, p: p || "", e: e || "" }; };
const shuffle = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const today = () => Math.floor((Date.now() - new Date().getTimezoneOffset() * 60000) / 86400000);
const INTERVALS = [0, 1, 2, 4, 7, 14];
// Teacher setting in data.js. "review": first try of the day right = learned. Otherwise: right on two different days.
const REVIEW = typeof MODE !== "undefined" && MODE === "review";

// ───────── content index ─────────
const WORDS = {};          // hanzi -> {h,p,e,st}
STATIONS.forEach((st) => st.words.forEach((w) => { const o = split(w); o.st = st.id; WORDS[o.h] = o; }));
const ST = Object.fromEntries(STATIONS.map((s) => [s.id, s]));
const OPEN = STATIONS.filter((s) => !s.locked);
const stWords = (st) => st.words.map((w) => split(w).h);

// ───────── storage (per device, optional) ─────────
const KEY = "m2map.v1";
let store = { items: {}, streak: 0, lastDay: -1, reviews: 0, pinyin: false };
try { const raw = localStorage.getItem(KEY); if (raw) store = Object.assign(store, JSON.parse(raw)); } catch (e) {}
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(store)); } catch (e) {} };
const item = (id) => store.items[id] || { b: 0, d: 0, seen: 0 };
function grade(id, ok, hinted, retry) {
  const it = item(id);
  const t = today();
  const firstToday = it.last !== t;
  it.seen++;
  if (REVIEW) {
    // pinyin hint is fine (the exam has pinyin); a retry or a second try on the same day is not
    if (ok && !retry && firstToday) { it.b = Math.max(it.b, 2); it.d = t + INTERVALS[it.b]; }
    else if (ok) { it.d = t + 1; }
    else { it.b = 0; it.d = t; it.w = (it.w || 0) + 1; }
    it.last = t; store.items[id] = it; save(); return;
  }
  hinted = hinted || retry;
  if (ok && hinted) { it.d = t + 1; }
  else if (ok) { if (it.last !== t || it.b === 0) it.b = Math.min(it.b + 1, 5); it.d = t + INTERVALS[it.b]; }
  else { it.b = 0; it.d = t; it.w = (it.w || 0) + 1; }
  it.last = t;
  store.items[id] = it; save();
}
const known = (h) => item("w:" + h).b >= 2;
const practised = (h) => item("w:" + h).seen > 0;
// Everything a station asks students to master: its words, grammar items and sentences.
const itemIds = (st) => [...stWords(st).map((h) => "w:" + h), ...grammarItems([st]).map(idOf), ...sentItems([st])];
const knownId = (id) => item(id).b >= 2;
const seenId = (id) => item(id).seen > 0;
const onceId = (id) => !REVIEW && item(id).b === 1; // right once, needs another day
function stationStats(st) {
  const ids = itemIds(st); const k = ids.filter(knownId).length; const p = ids.filter(seenId).length;
  const part = (pre) => { const x = ids.filter((id) => pre.some((q) => id.startsWith(q))); return { k: x.filter(knownId).length, p: x.filter(seenId).length, n: x.length }; };
  return { k, p, once: ids.filter(onceId).length, n: ids.length, mastered: ids.length > 0 && k / ids.length >= 0.8, started: p > 0, w: part(["w:"]), g: part(["f:", "e:"]), o: part(["o:"]) };
}
function allStats() {
  const ids = [...new Set(OPEN.flatMap(itemIds))];
  const part = (pre) => { const x = ids.filter((id) => pre.some((q) => id.startsWith(q))); return { k: x.filter(knownId).length, p: x.filter(seenId).length, n: x.length }; };
  return { k: ids.filter(knownId).length, p: ids.filter(seenId).length, once: ids.filter(onceId).length, n: ids.length, w: part(["w:"]), g: part(["f:", "e:"]), o: part(["o:"]) };
}
// three-layer bar: solid = learned, middle = right once, light = practised
const pc = (x, n) => (n ? Math.max(0, x) / n * 100 : 0);
const meter2 = (k, p, n, o = 0) => `<span class="meter" role="img" aria-label="${p} practised, ${o} right once, ${k} learned, of ${n} items"><i style="width:${pc(k, n)}%"></i><i class="st" style="width:${pc(o, n)}%"></i><i class="pr" style="width:${pc(p - k - o, n)}%"></i></span>`;
// right once today: these lock in as learned if they are right again on another day
const lockTomorrow = () => Object.values(store.items).filter((it) => it.b === 1 && it.last === today()).length;
const lockLine = () => { if (REVIEW) return ""; const x = lockTomorrow(); return x ? `<p class="lock">🔒 <b>${x}</b> right today. Get them right again tomorrow and they lock in as <b>learned</b>.</p>` : ""; };

// ───────── speech (vocabulary only) ─────────
let zhVoice = null;
function pickVoice() {
  // Prefer natural (neural / online) Mandarin voices; never Cantonese or Taiwan voices. Same ranking as the Lexuefang pages.
  try {
    const RANK = [/xiaoxiao|xiaoyi|yunxi|natural|online/i, /google.*(普通话|mandarin|chinese)|google/i, /lili|yu-?shu|tingting|ting-ting|premium|enhanced|增强/i, /huihui|kangkang|yaoyao/i];
    const vs = speechSynthesis.getVoices().filter((v) => /^(zh|cmn)/i.test(v.lang) && !/(HK|TW|yue|Hant)/i.test(v.lang + v.name));
    const score = (v) => { const i = RANK.findIndex((r) => r.test(v.name)); return (i < 0 ? 9 : i) + (/CN|Hans/i.test(v.lang) ? 0 : 0.5); };
    zhVoice = vs.sort((x, y) => score(x) - score(y))[0] || null;
  } catch (e) { zhVoice = null; }
}
if ("speechSynthesis" in window) { pickVoice(); speechSynthesis.onvoiceschanged = pickVoice; }
function speak(text) {
  if (!zhVoice) return false;
  try { speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(text); u.voice = zhVoice; u.lang = zhVoice.lang; u.rate = 0.85; speechSynthesis.speak(u); return true; } catch (e) { return false; }
}

// One speaker UI for everything students can listen to.
const CAN_SPEAK = "speechSynthesis" in window;
const SPK_SVG = '<svg class="spk-ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9H4z" fill="currentColor"/><path d="M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
const SPK_IN = CAN_SPEAK ? `<span class="spk spk-in" aria-hidden="true">${SPK_SVG}</span>` : "";
const spk = (text) => CAN_SPEAK ? `<button type="button" class="spk" data-say="${esc(text)}" aria-label="Listen: ${esc(text)}">${SPK_SVG}</button>` : "";

// ───────── frames (sentence builder) ─────────
function frameHTML(f, fi, sid) {
  const slots = f.t.filter((x) => typeof x === "object");
  return `<div class="frame" data-sid="${sid}" data-fi="${fi}">
    <div class="frame-q"><span class="zh">${esc(split(f.q).h)}</span> <span class="en">${esc(split(f.q).e)}</span></div>
    <div class="builder" aria-live="polite"></div>
    <div class="frame-actions">
      <button class="btn ghost small" data-act="shuffle" type="button">New sentence</button>
      <span class="hint">Tap a coloured part to change it.</span>
    </div>
    <div class="example"><span class="label">Example</span> <span class="zh">${esc(split(f.ex).h)}</span><span class="py">${esc(split(f.ex).p)}</span><span class="en">${esc(split(f.ex).e)}</span></div>
  </div>`;
}
const frameState = {};
function renderBuilder(el) {
  const st = ST[el.dataset.sid], f = st.frames[+el.dataset.fi];
  const key = el.dataset.sid + ":" + el.dataset.fi;
  const slots = f.t.filter((x) => typeof x === "object");
  if (!frameState[key]) frameState[key] = slots.map(() => 0);
  const idx = frameState[key];
  slots.forEach((s, i) => { if (s.link !== undefined) idx[i] = idx[s.link]; });
  let si = 0, zh = "", py = [];
  f.t.forEach((tok) => {
    if (typeof tok === "string") { const o = split(tok); zh += `<span class="fixed">${esc(o.h)}</span>`; py.push(o.p); }
    else { const i = si++; const o = split(tok.s[idx[i]]); const linked = tok.link !== undefined;
      zh += `<button type="button" class="slot c${i % 4}${linked ? " linked" : ""}" data-slot="${i}" aria-label="Change this part">${esc(o.h)}</button>`; py.push(o.p); }
  });
  const pyStr = py.join(" ").replace(/ ([,.!?])/g, "$1");
  el.querySelector(".builder").innerHTML = `<div class="b-zh">${zh}</div><div class="py b-py">${esc(pyStr)}</div>`;
}
document.addEventListener("click", (ev) => {
  const slot = ev.target.closest(".slot");
  const fr = ev.target.closest(".frame");
  if (!fr) return;
  const st = ST[fr.dataset.sid], f = st.frames[+fr.dataset.fi];
  const key = fr.dataset.sid + ":" + fr.dataset.fi;
  const slots = f.t.filter((x) => typeof x === "object");
  if (slot) {
    let i = +slot.dataset.slot; if (slots[i].link !== undefined) i = slots[i].link;
    frameState[key][i] = (frameState[key][i] + 1) % slots[i].s.length; renderBuilder(fr);
  } else if (ev.target.closest('[data-act="shuffle"]')) {
    frameState[key] = slots.map((s) => Math.floor(Math.random() * s.s.length)); renderBuilder(fr);
  }
});

// ───────── views ─────────
const main = $("#main");
function setTab(name) { document.querySelectorAll(".tab").forEach((t) => t.setAttribute("aria-current", t.dataset.tab === name ? "page" : "false")); }

// ───────── map lines ─────────
// Review mode: one line per exam unit (Semester Exam Planner), stations in week order.
// Stations outside the exam keep their own line (locked ones join the last unit).
function mapLines() {
  const base = ZONES.map((z) => ({ ...z, sts: STATIONS.filter((s) => s.zone === z.id) }));
  if (!(REVIEW && typeof EXAM !== "undefined" && EXAM.units)) return base;
  const used = new Set();
  const lines = EXAM.units.map((u, i) => {
    const sts = u.stations.map((id) => ST[id]).filter(Boolean).sort((a, b) => a.week - b.week);
    sts.forEach((st) => used.add(st.id));
    return { id: "unit" + i, name: u.label, zh: u.zh || "", color: (ZONES[i % ZONES.length] || ZONES[0]).color, sts };
  });
  const locked = STATIONS.filter((st) => !used.has(st.id) && st.locked);
  if (locked.length && lines.length) { lines[lines.length - 1].sts.push(...locked); locked.forEach((st) => used.add(st.id)); }
  base.forEach((z) => { const rest = z.sts.filter((st) => !used.has(st.id)); if (rest.length) lines.push({ ...z, name: z.name + " · basics", sts: rest }); });
  return lines;
}
const lineOf = (st) => mapLines().find((z) => z.sts.includes(st)) || ZONES.find((z) => z.id === st.zone);
function viewMap() {
  setTab("map");
  const A = allStats();
  let html = REVIEW ? "" : `<section class="today">
      <div><h2>Daily review</h2>
      <p>10 quick questions, about 5 minutes. They mix this week's focus, recent lessons and last year, and bring back the words you got wrong.</p>
      <p class="focus"><span class="label">This week's focus</span> ${FOCUS.stations.map((id) => `<a href="#s-${id}" class="chip">${esc(ST[id].title)}</a>`).join(" ")}<br><span class="en">${esc(FOCUS.why)}</span></p></div>
      <div class="today-side"><div class="stat"><b>${store.streak}</b><span>day<br>streak</span></div>
      <a class="btn primary" href="#review">Start</a></div>
    </section>`;
  html += `<p class="map-intro">Each station is something you have learned. Open one to review its words and sentence patterns. ${REVIEW ? reviewIntro() : A.p ? `You have practised <b>${A.p}</b> of ${A.n} items · <b>${A.once}</b> right once · <b>${A.k}</b> learned.` : `Start with the Daily review or open any station.`}</p>${lockLine()}`;
  mapLines().forEach((z) => {
    const sts = z.sts;
    html += `<section class="line" style="--c: var(${z.color})"><h3 class="line-name"><span class="line-badge">${esc(z.name)}</span><span class="en zh">${esc(z.zh)}</span></h3><ol class="stops">`;
    sts.forEach((s) => {
      if (s.locked) {
        html += `<li class="stop locked"><span class="dot" aria-hidden="true"></span><div class="stop-body"><span class="stop-title">${esc(s.title)}</span><span class="en">${esc(s.en)} · ${esc(s.when)}</span><span class="pill">Opens next week</span></div></li>`;
        return;
      }
      const ss = stationStats(s);
      const state = ss.mastered ? "mastered" : ss.started ? "started" : "new";
      const label = ss.mastered ? "Mastered" : ss.started ? "Learning" : "Not reviewed yet";
      html += `<li class="stop ${state}"><a href="#s-${s.id}"><span class="dot" aria-hidden="true"></span><div class="stop-body">
        <span class="stop-title">${esc(s.title)}</span><span class="en">${esc(s.en)} · ${esc(s.when)}</span>
        ${meter2(ss.k, ss.p, ss.n, ss.once)}
        <span class="pill ${state}">${label} · ${ss.p}/${ss.n} practised${ss.once ? ` · ${ss.once} right once` : ""}${ss.k ? ` · ${ss.k} learned` : ""}</span></div></a></li>`;
    });
    html += `</ol></section>`;
  });
  main.innerHTML = html;
}

function wordCard(h) {
  const w = WORDS[h]; const k = known(h);
  return `<button type="button" class="word${k ? " known" : ""}" data-h="${esc(h)}" aria-label="${esc(h)}, ${esc(w.e)}">
    ${SPK_IN}<span class="w-zh">${esc(h)}</span><span class="py w-py">${esc(w.p)}</span><span class="w-en">${esc(w.e)}</span>${k ? '<span class="tick" aria-hidden="true">✓</span>' : ""}</button>`;
}
document.addEventListener("click", (ev) => {
  const c = ev.target.closest(".word"); if (!c) return;
  c.classList.toggle("open"); speak(c.dataset.h);
});

function viewStation(id) {
  const s = ST[id]; if (!s || s.locked) return viewMap();
  setTab("map");
  const z = lineOf(s);
  const ss = stationStats(s);
  let html = `<a class="back" href="#map">← Map</a>
  <header class="st-head" style="--c: var(${z.color})"><span class="line-badge">${esc(z.name)}</span>
    <h2>${esc(s.title)}</h2><p class="en">${esc(s.en)} · ${esc(s.when)} · ${ss.p}/${ss.n} practised${ss.once ? ` · ${ss.once} right once` : ""} · ${ss.k} learned</p></header>
  <section class="block"><h3>Words</h3>
    <p class="hint">Tap a word to see the pinyin and meaning${zhVoice ? " and hear it" : ""}.</p>
    <div class="words">${stWords(s).map(wordCard).join("")}</div>
    ${s.review ? `<p class="also"><span class="label">Also used</span> ${s.review.map((h) => `<button type="button" class="chip word-chip" data-h="${esc(h)}">${SPK_IN}<span class="ct">${esc(h)}</span></button>`).join(" ")}</p>` : ""}
  </section>`;
  if (s.frames.length) html += `<section class="block"><h3>Sentence patterns</h3><div class="frames">${s.frames.map((f, i) => frameHTML(f, i, s.id)).join("")}</div></section>`;
  if (s.youzai) html += `<section class="block"><h3>有 or 在? <span class="en-h">Same picture, two sentences</span></h3>${youzaiHTML()}</section>`;
  if (s.errors) html += `<section class="block"><h3>Which one is right?</h3>${s.errors.map((e, i) => errorHTML(e, i)).join("")}</section>`;
  if (s.tip) html += `<section class="block tipbox"><h3>Tip</h3><p>${esc(s.tip)}</p></section>`;
  html += `<div class="practice"><a class="btn primary" href="#p-${s.id}">Practise this station</a></div>`;
  main.innerHTML = html;
  main.querySelectorAll(".frame").forEach(renderBuilder);
  window.scrollTo(0, 0);
}
document.addEventListener("click", (ev) => {
  const c = ev.target.closest(".word-chip"); if (!c) return;
  const w = WORDS[c.dataset.h]; const ct = c.querySelector(".ct"); ct.textContent = ct.textContent === c.dataset.h && w ? `${c.dataset.h} ${w.p} · ${w.e}` : c.dataset.h; speak(c.dataset.h);
});

function youzaiHTML() {
  return `<div class="youzai">
    <svg viewBox="0 0 240 110" role="img" aria-label="A bank in front of a school">
      <rect x="20" y="16" width="110" height="64" rx="4" class="yz-school"/><text x="75" y="54" text-anchor="middle" class="yz-t">学校</text>
      <rect x="150" y="40" width="70" height="40" rx="4" class="yz-bank"/><text x="185" y="66" text-anchor="middle" class="yz-t">银行</text>
      <line x1="10" y1="92" x2="230" y2="92" class="yz-road"/></svg>
    <div class="yz-side">
      <div class="seg" role="group" aria-label="Which comes first">
        <button type="button" data-yz="place" aria-pressed="true">Place first</button><button type="button" data-yz="thing" aria-pressed="false">Thing first</button></div>
      <p class="yz-sent" aria-live="polite"><mark class="m-place">学校旁边</mark><b>有</b><mark class="m-thing">银行</mark>。</p>
      <p class="hint yz-rule">Place first → 有.</p></div></div>`;
}
document.addEventListener("click", (ev) => {
  const b = ev.target.closest("[data-yz]"); if (!b) return;
  const box = b.closest(".youzai"); box.querySelectorAll("[data-yz]").forEach((x) => x.setAttribute("aria-pressed", x === b));
  const place = b.dataset.yz === "place";
  box.querySelector(".yz-sent").innerHTML = place ? `<mark class="m-place">学校旁边</mark><b>有</b><mark class="m-thing">银行</mark>。` : `<mark class="m-thing">银行</mark><b>在</b><mark class="m-place">学校旁边</mark>。`;
  box.querySelector(".yz-rule").textContent = place ? "Place first → 有." : "Thing first → 在.";
});

function errorHTML(e, i) {
  const opts = shuffle([e.ok, ...e.bad]);
  return `<div class="err" data-tip="${esc(e.tip)}">${opts.map((o) => `<button type="button" class="opt" data-ok="${o === e.ok}">${esc(o)}</button>`).join("")}<p class="err-tip" hidden></p></div>`;
}
document.addEventListener("click", (ev) => {
  const b = ev.target.closest(".err .opt"); if (!b) return;
  const box = b.closest(".err");
  box.querySelectorAll(".opt").forEach((o) => { o.disabled = true; if (o.dataset.ok === "true") o.classList.add("right"); });
  if (b.dataset.ok !== "true") b.classList.add("wrong");
  const t = box.querySelector(".err-tip"); t.hidden = false; t.textContent = (b.dataset.ok === "true" ? "Right! " : "Not this one. ") + box.dataset.tip;
});

// ───────── questions ─────────
function wordQ(h) {
  const w = WORDS[h]; const st = ST[w.st];
  const sameZone = Object.values(WORDS).filter((x) => x.h !== h && ST[x.st].zone === st.zone && !ST[x.st].locked);
  const pool = shuffle(sameZone.length >= 3 ? sameZone : Object.values(WORDS).filter((x) => x.h !== h));
  const dist = []; for (const x of pool) { if (dist.length === 3) break; if (!dist.some((d) => d.e === x.e) && x.e !== w.e) dist.push(x); }
  const types = ["meaning", "reverse"]; types.push(zhVoice ? "listen" : "pinyin");
  const type = types[Math.floor(Math.random() * types.length)];
  const opts = shuffle([w, ...dist]);
  const base = { id: "w:" + h, answer: w };
  if (type === "meaning") return { ...base, kind: "What does this mean?", en: "", hintPy: w.p, prompt: `<span class="q-zh">${esc(h)}</span>`, opts: opts.map((o) => ({ t: o.e, ok: o === w })) };
  if (type === "reverse") return { ...base, kind: "Which word means this?", en: "", prompt: `<span class="q-en">${esc(w.e)}</span>`, opts: opts.map((o) => ({ t: o.h, p: o.p, zh: true, ok: o === w })) };
  if (type === "pinyin") return { ...base, kind: "Pick the characters for this pinyin", en: "", noHint: true, prompt: `<span class="q-py">${esc(w.p)}</span>`, opts: opts.map((o) => ({ t: o.h, p: o.p, zh: true, ok: o === w })) };
  return { ...base, kind: "Listen and pick the word", en: "", listen: h, prompt: `<button type="button" class="btn ghost play" data-say="${esc(h)}">${SPK_SVG} Play again</button>`, opts: opts.map((o) => ({ t: o.h, p: o.p, zh: true, ok: o === w })) };
}
function grammarQ(sid, kind, i) {
  const s = ST[sid];
  if (kind === "f") {
    const f = s.fill[i];
    return { id: `f:${sid}:${i}`, kind: "Fill the gap", en: f.en, prompt: `<span class="q-sent">${esc(f.q).replace("___", '<span class="blank">　　</span>')}</span>`, opts: shuffle(f.o.map((t, j) => ({ t, p: WORDS[t] ? WORDS[t].p : "", zh: true, ok: j === f.a }))), after: f.q.replace("___", f.o[f.a]) };
  }
  const e = s.errors[i];
  return { id: `e:${sid}:${i}`, kind: "Which sentence is right?", en: "", prompt: "", opts: shuffle([{ t: e.ok, zh: true, ok: true }, ...e.bad.map((b) => ({ t: b, zh: true, ok: false }))]), after: e.tip };
}
function grammarItems(stations) {
  const out = [];
  stations.forEach((s) => { (s.fill || []).forEach((_, i) => out.push([s.id, "f", i])); (s.errors || []).forEach((_, i) => out.push([s.id, "e", i])); });
  return out;
}
const idOf = (g) => (g[1] === "f" ? `f:${g[0]}:${g[2]}` : `e:${g[0]}:${g[2]}`);
function priority(ids) { // due first, then never-tried before tried, weakest first, then random
  const t = today();
  return shuffle(ids).sort((a, b) => { const A = item(a), B = item(b); const da = A.d <= t ? 0 : 1, db = B.d <= t ? 0 : 1; return da - db || (A.seen > 0) - (B.seen > 0) || A.b - B.b; });
}
function buildReview() {
  const recent = OPEN.filter((s) => s.week >= CURRENT_WEEK - 2);
  const mid = OPEN.filter((s) => s.week > 0 && s.week < CURRENT_WEEK - 2);
  const old = OPEN.filter((s) => s.week === 0);
  const focus = FOCUS.stations.map((id) => ST[id]).filter((s) => s && !s.locked);
  const used = new Set();
  const take = (sts, n) => { const ids = priority(sts.flatMap(stWords).map((h) => "w:" + h)).filter((id) => !used.has(id)).slice(0, n); ids.forEach((id) => used.add(id)); return ids.map((id) => id.slice(2)); };
  const qs = [...take(focus, 3), ...take(recent, 2), ...take(mid, 2), ...take(old, 2)].map(wordQ);
  const gs = grammarItems(focus.length ? focus : OPEN); const gIds = priority(gs.map(idOf));
  const g = gs.find((x) => idOf(x) === gIds[0]);
  if (g) qs.splice(Math.floor(Math.random() * qs.length), 0, grammarQ(...g));
  const fo = sentItems(focus); const oIds = priority(fo.length ? fo : sentItems(OPEN));
  if (oIds.length) { // swap one word question for one sentence
    let li = -1; qs.forEach((q, j) => { if (q.id.startsWith("w:")) li = j; });
    if (li >= 0 && qs.length >= 10) qs.splice(li, 1);
    qs.splice(Math.floor(Math.random() * (qs.length + 1)), 0, orderQ(oIds[0]));
  }
  return qs;
}
function buildPractice(sid) { // 5 words + 2 grammar + 3 sentences (6 words when a station has no sentences yet)
  const s = ST[sid];
  const os = priority(sentItems([s])).slice(0, 3).map(orderQ);
  const nw = os.length ? 5 : 6;
  const wIds = priority(stWords(s).map((h) => "w:" + h));
  const words = wIds.slice(0, nw).map((id) => wordQ(id.slice(2)));
  const gIds = priority(grammarItems([s]).map(idOf)).slice(0, 2);
  const gs = grammarItems([s]).filter((g) => gIds.includes(idOf(g))).map((g) => grammarQ(...g));
  const extra = wIds.slice(nw, nw + (2 - gs.length)).map((id) => wordQ(id.slice(2)));
  return shuffle([...words, ...gs, ...extra, ...os]);
}

// ───────── sentence building (data in sentences.js) ─────────
const SENT = typeof SENTENCES !== "undefined" ? SENTENCES : {};
const sentItems = (stations) => stations.flatMap((s) => (SENT[s.id] || []).map((_, i) => `o:${s.id}:${i}`));
function orderQ(id) {
  const [, sid, i] = id.split(":"); const x = SENT[sid][+i];
  let bank = shuffle(x.t.map((_, k) => k));
  if (bank.length > 1 && bank.every((k, j) => k === j)) bank = bank.slice(1).concat(bank[0]);
  return { id, type: "order", kind: "Build the sentence", en: "", x, bank, tray: [], tries: 0, opts: [], prompt: `<span class="q-en q-en-s">${esc(x.en)}</span>` };
}
function orderTile(tk, k, where, used) {
  return `<button type="button" class="otile${used ? " used" : ""}" data-${where}="${k}"${used ? ' tabindex="-1" aria-hidden="true"' : ""}><span class="zh">${esc(tk[0])}</span>${tk[1] ? `<span class="opt-py">${esc(tk[1])}</span>` : ""}</button>`;
}
function renderOrder() {
  const q = quiz && quiz.qs[quiz.i]; const box = $(".q-order"); if (!q || !box) return;
  box.innerHTML = `<div class="otray${q.state ? " " + q.state : ""}">${q.tray.length ? q.tray.map((k) => orderTile(q.x.t[k], k, "tr", false)).join("") + `<span class="oend zh">${esc(q.x.e)}</span>` : '<span class="oph">Tap the words below in order.</span>'}</div>
    <div class="obank">${q.bank.map((k) => orderTile(q.x.t[k], k, "bk", q.tray.includes(k))).join("")}</div>
    ${q.done ? "" : `<div class="orow"><button type="button" class="btn primary small" id="ocheck"${q.tray.length === q.x.t.length ? "" : " disabled"}>Check</button><button type="button" class="btn ghost small" id="oclear"${q.tray.length ? "" : " disabled"}>Clear</button>${q.tries ? '<button type="button" class="btn ghost small" id="oshow">Show answer</button>' : ""}</div>`}`;
}
document.addEventListener("click", (ev) => {
  if (!quiz) return; const q = quiz.qs[quiz.i]; if (!q || q.type !== "order" || q.done) return;
  const bk = ev.target.closest("[data-bk]"), tr = ev.target.closest("[data-tr]");
  if (bk) { const k = +bk.dataset.bk; if (!q.tray.includes(k)) { q.tray.push(k); q.state = ""; renderOrder(); } return; }
  if (tr) { q.tray = q.tray.filter((k) => k !== +tr.dataset.tr); q.state = ""; renderOrder(); return; }
  if (ev.target.id === "oclear") { q.tray = []; q.state = ""; renderOrder(); return; }
  if (ev.target.id === "oshow") { finishOrder(false); return; }
  if (ev.target.id === "ocheck") {
    q.tries++;
    const mine = q.tray.map((k) => q.x.t[k][0]).join("|");
    const ok = [q.x.t.map((t) => t[0])].concat(q.x.alt || []).some((a) => a.join("|") === mine);
    if (ok) { finishOrder(true); return; }
    q.state = "bad"; renderOrder();
    $(".q-feedback").innerHTML = `<p class="fb-no">Not quite. Change the order and check again${q.tries > 1 ? ", or show the answer" : ""}.</p>`;
  }
});
function finishOrder(ok) {
  const q = quiz.qs[quiz.i]; q.done = true;
  const first = ok && q.tries === 1;
  if (!ok) q.tray = q.x.t.map((_, k) => k);
  q.state = ok ? "ok" : "shown";
  grade(q.id, ok, q.hinted, !first);
  const zh = q.x.t.map((t) => t[0]).join("") + q.x.e; const py = q.x.t.map((t) => t[1]).filter(Boolean).join(" ");
  q.after = zh;
  if (first) quiz.right++; else quiz.wrong.push(q);
  renderOrder();
  const hb = document.getElementById("hint"); if (hb) hb.remove();
  const last = quiz.i === quiz.qs.length - 1;
  $(".q-feedback").innerHTML = `${first ? '<p class="fb-ok">Correct!</p>' : ok ? '<p class="fb-ok">Correct after a retry. This one comes back tomorrow.</p>' : '<p class="fb-no">Here is the answer.</p>'}
    <p class="fb-word"><span class="zh">${esc(zh)}</span>${spk(zh)}<br><span class="py-always">${esc(py)}</span><br>${esc(q.x.en)}</p>
    <button type="button" class="btn primary next">${last ? "See results" : "Next"}</button>`;
  $(".next").focus();
}

// ───────── quiz runner ─────────
let quiz = null;
function startQuiz(qs, mode, sid) { quiz = { qs, i: 0, right: 0, mode, sid, wrong: [] }; showQ(); }
document.addEventListener("click", (ev) => {
  if (ev.target.id !== "hint" || !quiz) return;
  quiz.qs[quiz.i].hinted = true; document.querySelector(".quiz").classList.add("hinted");
  const h = document.querySelector(".q-hintpy"); if (h) h.hidden = false; ev.target.disabled = true;
  ev.target.textContent = REVIEW ? "Pinyin shown" : "Pinyin shown: this one comes back tomorrow";
});
function showQ() {
  const q = quiz.qs[quiz.i];
  const back = quiz.mode === "station" ? `#s-${quiz.sid}` : quiz.mode === "final" ? "#final" : quiz.mode === "fix" || quiz.mode === "new" ? "#progress" : "#map";
  main.innerHTML = `<a class="back" href="${back}">← Leave</a>
  <section class="quiz">
    <div class="q-progress" role="progressbar" aria-valuemin="0" aria-valuemax="${quiz.qs.length}" aria-valuenow="${quiz.i}"><i style="width:${(quiz.i / quiz.qs.length) * 100}%"></i></div>
    <p class="q-count">${quiz.i + 1} / ${quiz.qs.length}</p>
    <h2 class="q-kind">${esc(q.kind)} <span class="en-h">${esc(q.en)}</span></h2>
    <div class="q-prompt">${q.prompt}</div>
    ${q.type === "order" ? '<div class="q-order"></div>' : ""}<div class="q-opts">${q.opts.map((o, j) => `<button type="button" class="opt${o.zh ? " zh" : ""}" data-j="${j}">${esc(o.t)}${o.p ? `<span class="opt-py">${esc(o.p)}</span>` : ""}</button>`).join("")}</div>
    ${!q.noHint && (q.hintPy || q.type === "order" || q.opts.some((o) => o.p)) ? `<button type="button" class="btn ghost small hint-btn" id="hint">Show pinyin (hint)</button>` : ""}
    ${q.hintPy ? `<p class="q-hintpy" hidden>${esc(q.hintPy)}</p>` : ""}
    <div class="q-feedback" aria-live="polite"></div>
  </section>`;
  if (q.type === "order") renderOrder();
  if (q.listen) setTimeout(() => speak(q.listen), 250);
}
document.addEventListener("click", (ev) => {
  const p = ev.target.closest("[data-say]"); if (p) { speak(p.dataset.say); return; }
  const b = ev.target.closest(".q-opts .opt"); if (!b || !quiz) return;
  const q = quiz.qs[quiz.i]; const o = q.opts[+b.dataset.j];
  document.querySelectorAll(".q-opts .opt").forEach((x, j) => { x.disabled = true; if (q.opts[j].ok) x.classList.add("right"); });
  if (!o.ok) b.classList.add("wrong");
  grade(q.id, o.ok, q.hinted); const hb = document.getElementById("hint"); if (hb) hb.remove(); if (o.ok) quiz.right++; else quiz.wrong.push(q);
  let fb = o.ok ? `<p class="fb-ok">Correct!</p>` : `<p class="fb-no">Not quite.</p>`;
  if (q.answer) fb += `<p class="fb-word">${spk(q.answer.h)}<span class="zh">${esc(q.answer.h)}</span> <span class="py-always">${esc(q.answer.p)}</span> · ${esc(q.answer.e)}</p>`;
  if (q.after) fb += `<p class="fb-word"><span class="zh">${esc(q.after)}</span></p>`;
  const last = quiz.i === quiz.qs.length - 1;
  fb += `<button type="button" class="btn primary next">${last ? "See results" : "Next"}</button>`;
  $(".q-feedback").innerHTML = fb; $(".next").focus();
  if (q.answer && !q.listen) speak(q.answer.h);
});
document.addEventListener("click", (ev) => {
  if (!ev.target.closest(".next") || !quiz) return;
  if (quiz.mode === "fix") { // a wrong answer comes back later in the same set (at most twice)
    const q = quiz.qs[quiz.i]; quiz.rep = quiz.rep || {};
    if (quiz.wrong.includes(q) && (quiz.rep[q.id] || 0) < 2) { quiz.rep[q.id] = (quiz.rep[q.id] || 0) + 1; const again = qOf(q.id); again.repeat = true; quiz.qs.push(again); }
  }
  quiz.i++;
  if (quiz.i < quiz.qs.length) return showQ();
  if (quiz.mode === "review") {
    const t = today();
    if (store.lastDay !== t) { store.streak = store.lastDay === t - 1 ? store.streak + 1 : 1; store.lastDay = t; }
    store.reviews++; save();
  }
  const n = quiz.qs.length, r = quiz.right;
  const back = quiz.mode === "station" ? `#s-${quiz.sid}` : quiz.mode === "final" ? "#final" : quiz.mode === "fix" || quiz.mode === "new" ? "#progress" : "#map";
  main.innerHTML = `<section class="done">
    <h2>${r}/${n}</h2>
    <p>${r === n ? "All correct!" : r >= n * 0.7 ? "Well done." : "Good effort. The words you missed will come back in your next review."}</p>
    ${quiz.mode === "review" ? `<p class="streak"><b>${store.streak}</b> day streak</p>` : ""}
    ${quiz.wrong.length ? `<div class="missed"><h3>Have another look</h3><ul>${quiz.wrong.map((q) => q.answer ? `<li>${spk(q.answer.h)}<span class="zh">${esc(q.answer.h)}</span> <span class="py-always">${esc(q.answer.p)}</span> · ${esc(q.answer.e)}</li>` : `<li>${q.type === "order" ? spk(q.after) : ""}<span class="zh">${esc(q.after || "")}</span></li>`).join("")}</ul></div>` : ""}
    ${quiz.mode === "station" ? (() => { const ss = stationStats(ST[quiz.sid]); return `<p class="hint">You have practised <b>${ss.p}</b> of ${ss.n} items in this station${ss.p < ss.n ? ". The next set starts with the ones you haven't done yet." : "."}</p>`; })() : ""}
    ${lockLine()}
    ${quiz.mode === "fix" ? `<p class="lock">Done for today. Tomorrow, get these right on the first try and they count as learned.</p>` : ""}
    <div class="done-actions">${quiz.mode === "station" ? `<button type="button" class="btn primary" id="again" data-sid="${esc(quiz.sid)}">Practise another set</button> <a class="btn ghost" href="${back}">Back to station</a>` : `<a class="btn primary" href="${back}">${quiz.mode === "final" ? "Back to final review" : back === "#progress" ? "Back to My progress" : "Back to map"}</a>`}</div>
  </section>`;
  quiz = null;
});

document.addEventListener("click", (ev) => {
  if (ev.target.id !== "again") return;
  const sid = ev.target.dataset.sid; if (!ST[sid]) return;
  startQuiz(buildPractice(sid), "station", sid); window.scrollTo(0, 0);
});

// ───────── progress ─────────
// practise = both lists in one line; wrong / pending = separate "Wrong" and "Settling" questions (leave empty if the form has none).
// Google Form (TNIS - Mandarin II - Map response). Email is collected by the form itself.
const FORM = "https://docs.google.com/forms/d/e/1FAIpQLSdt7wE3ZQj08PjTeTSLUEbONj93_-Kc1NmGLZy-MzDcER0c8Q/viewform";
const ENTRY = { code: "entry.67431962", words: "entry.1732415521", stations: "entry.797420897", reviews: "entry.754972983", detail: "entry.1174386476", practise: "entry.1853318961", wrong: "entry.1650655630", pending: "entry.786948827" };
const b64e = (str) => btoa(String.fromCharCode(...new TextEncoder().encode(str))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
const b64d = (b) => { b = b.replace(/-/g, "+").replace(/_/g, "/"); while (b.length % 4) b += "="; return new TextDecoder().decode(Uint8Array.from(atob(b), (c) => c.charCodeAt(0))); };
// Code format v3: "M2." + base64url("3|day|streak|reviews|lastDay|<hanzi><b>[!]…|<id>=<b>[!],…|<flagged hanzi>,…")
// b = 0–5 (0 = practised, last answer wrong); "!" = was wrong at least once. v2 codes (b > 0 only) still restore.
function makeCode() {
  let w = ""; const g = [];
  for (const [id, it] of Object.entries(store.items)) {
    if (!(it.seen > 0) && !(it.b > 0)) continue;
    const v = (it.b || 0) + ((it.w || 0) > 0 ? "!" : "");
    if (id.startsWith("w:")) w += id.slice(2) + v; else g.push(id + "=" + v);
  }
  const f = Object.keys(store.flags || {}).filter((h) => store.flags[h]).join(",");
  return "M2." + b64e(["3", today(), store.streak, store.reviews, store.lastDay, w, g.join(","), f].join("|"));
}
function restoreCode(code) {
  const c = String(code || "").replace(/\s+/g, "");
  if (!c.startsWith("M2.")) throw new Error("bad");
  const parts = b64d(c.slice(3)).split("|");
  if (!(parts[0] === "2" || parts[0] === "3") || parts.length < 7) throw new Error("bad");
  const t = today(); const made = Number.isFinite(+parts[1]) ? Math.min(+parts[1], t) : t - 1; const items = {};
  // last = the day the code was made, so an answer on that same day doesn't count as a second day
  const put = (id, v) => { const m = String(v).match(/^(\d)(!?)$/); if (!m) return; const n = Math.min(5, +m[1]);
    const it = { b: n, d: n ? made + INTERVALS[n] : t, seen: 1, last: made }; if (m[2] || n === 0) it.w = 1; items[id] = it; };
  for (const m of parts[5].matchAll(/(\D+?)(\d)(!?)/g)) put("w:" + m[1], m[2] + m[3]);
  for (const kv of parts[6].split(",").filter(Boolean)) { const k = kv.lastIndexOf("="); put(kv.slice(0, k), kv.slice(k + 1)); }
  const flags = {}; (parts[7] || "").split(",").filter(Boolean).forEach((h) => { flags[h] = true; });
  store = { items, flags, streak: +parts[2] || 0, reviews: +parts[3] || 0, lastDay: Number.isFinite(+parts[4]) ? +parts[4] : -1, pinyin: store.pinyin };
  save();
}
const wChip = (h) => { const w = WORDS[h] || { p: "", e: "" }; return `<span class="wchip">${spk(h)}<span class="zh">${esc(h)}</span><span class="py">${esc(w.p)}</span><span class="en">${esc(w.e)}</span></span>`; };
// ───────── exam review (MODE "review") ─────────
const dayOf = (iso) => { const [y, m, d] = iso.split("-").map(Number); return Math.floor(Date.UTC(y, m - 1, d) / 86400000); };
const daysToExam = () => (typeof EXAM !== "undefined" ? dayOf(EXAM.date) - today() : null);
function examStats() {
  const partOf = (s) => EXAM.weights.find((w) => s.week >= w.from && s.week <= w.to) || null;
  const units = EXAM.units.map((u) => {
    const sts = u.stations.map((id) => ST[id]).filter((x) => x && !x.locked);
    const ids = [...new Set(sts.flatMap(itemIds))];
    return { ...u, sts, ids, n: ids.length, k: ids.filter(knownId).length, p: ids.filter(seenId).length };
  });
  const owner = {}; units.forEach((u) => u.sts.forEach((st) => itemIds(st).forEach((id) => { owner[id] = st; })));
  const all = Object.keys(owner);
  const partN = new Map(EXAM.weights.map((w) => [w, all.filter((id) => partOf(owner[id]) === w).length]));
  const wt = (id) => { const w = partOf(owner[id]); return w ? w.weight / (partN.get(w) || 1) : 0; };
  let tot = 0, got = 0; all.forEach((id) => { const x = wt(id); tot += x; if (knownId(id)) got += x; });
  return { units, all, owner, wt, ready: tot ? Math.round((got / tot) * 100) : 0 };
}
const qOf = (id) => { if (id.startsWith("w:")) return wordQ(id.slice(2)); if (id.startsWith("o:")) return orderQ(id); const [k, sid, i] = id.split(":"); return grammarQ(sid, k, +i); };
// items to fix: practised but not learned yet, last-answered-wrong first
const fixIds = (es) => es.all.filter((id) => item(id).seen > 0 && item(id).b < 2);
function buildFix() {
  const ids = fixIds(examStats());
  const wrong = ids.filter((id) => item(id).b === 0 && (item(id).w || 0) > 0);
  return [...priority(wrong), ...priority(ids.filter((id) => !wrong.includes(id)))].slice(0, 10).map(qOf);
}
// new items: the station whose unpractised items count most for the exam
function newStation(es) {
  let best = null, bv = 0;
  es.units.forEach((u) => u.sts.forEach((st) => { const ids = itemIds(st).filter((id) => !(item(id).seen > 0)); const v = ids.reduce((a, id) => a + es.wt(id), 0); if (v > bv) { bv = v; best = { s: st, ids }; } }));
  return best;
}
function buildNew() { const ns = newStation(examStats()); return ns ? shuffle(ns.ids).slice(0, 10).map(qOf) : []; }
function hskStats() {
  if (typeof HSK1 === "undefined") return null;
  const onMap = HSK1.filter((h) => WORDS[h]);
  return { n: HSK1.length, map: onMap.length, k: onMap.filter(known).length, p: onMap.filter(practised).length };
}
function reviewIntro() {
  if (typeof EXAM === "undefined") return "";
  const es = examStats(); const d = daysToExam();
  return `<b>Final exam review:</b> you are <b>${es.ready}%</b> ready${d > 0 ? ` · ${d} days to go` : ""}. Practise a station, then <a href="#progress">see what's left →</a>`;
}
function viewProgressReview(msg) {
  setTab("progress");
  const es = examStats(); const d = daysToExam(); const A = allStats(); const H = hskStats();
  const sts = OPEN.map((s) => ({ s, ...stationStats(s) })); const m = sts.filter((x) => x.mastered).length;
  const fixN = fixIds(es).length; const newN = es.all.filter((id) => !(item(id).seen > 0)).length; const ns = newStation(es);
  const code = makeCode();
  const wrongW = Object.keys(WORDS).filter((h) => { const it = item("w:" + h); return it.seen > 0 && it.b === 0 && (it.w || 0) > 0; }).slice(0, 25);
  const notYetW = Object.keys(WORDS).filter((h) => { const it = item("w:" + h); return it.seen > 0 && it.b < 2 && !wrongW.includes(h); }).slice(0, 25);
  const params = new URLSearchParams({ usp: "pp_url" });
  params.set(ENTRY.code, code);
  params.set(ENTRY.words, `exam ready ${es.ready}% · ${es.units.map((u) => `${u.label.split(" · ")[0]} ${u.k}/${u.n}`).join(" · ")} · to fix ${fixN} · not practised ${newN} | learned ${A.k}/${A.n} · practised ${A.p}${H ? ` | HSK1 ${H.k}/${H.n}` : ""}`);
  params.set(ENTRY.stations, `${m}/${sts.length}`);
  params.set(ENTRY.reviews, `${store.reviews} (streak ${store.streak} days)`);
  params.set(ENTRY.detail, sts.map((x) => `${x.s.title} ${x.k}/${x.n}`).join("; "));
  params.set(ENTRY.practise, `Wrong: ${wrongW.join("、") || "none"} | Not yet learned: ${notYetW.join("、") || "none"}`);
  if (ENTRY.wrong) params.set(ENTRY.wrong, wrongW.join("、") || "none");
  if (ENTRY.pending) params.set(ENTRY.pending, notYetW.join("、") || "none");
  const formUrl = FORM ? FORM + "?" + params.toString() : "";
  const dateTxt = new Date(EXAM.date + "T00:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "long" });
  main.innerHTML = `<section class="block"><h2>Final exam review</h2>
    <p class="hint">${esc(EXAM.name)}: from ${esc(dateTxt)}${d > 0 ? ` · <b>${d}</b> days to go` : ""}</p>
    <div class="ready"><b>${es.ready}%</b><span>ready for the exam</span></div>
    <ul class="plist exam">${es.units.map((u) => `<li><span class="pname"><span class="zh">${esc(u.label.split(" · ")[0])}</span><span class="en">${esc(u.label.split(" · ").slice(1).join(" · "))}</span></span>${meter2(u.k, u.p, u.n)}<span class="num">${u.k}/${u.n}<small>learned</small></span><span>${u.n && u.k === u.n ? "✓" : ""}</span></li>`).join("")}</ul>
    <p class="hint"><b>Learned</b> = right on your first try of the day. A pinyin hint is fine: the exam paper has pinyin too. Weeks 1–8 count for 35% of the exam, Weeks 10–15 for 65%.</p>
  </section>
  <section class="block"><h3>What to review next</h3>
    <h4 class="step">1 · By station</h4>
    <p class="hint">Open a station on the map and practise it. Dark = learned · light = practised.</p>
    <ul class="plist">${es.units.flatMap((u) => u.sts).map((st) => ({ s: st, ...stationStats(st) })).map((x) => `<li><a href="#s-${x.s.id}"><span class="pname"><span class="zh">${esc(x.s.title)}</span><span class="en">${esc(x.s.when)}</span></span>${meter2(x.k, x.p, x.n)}<span class="num">${x.k}/${x.n}<small>${x.p} practised</small></span>${x.n && x.k === x.n ? '<span class="tick">✓</span>' : "<span></span>"}</a></li>`).join("")}</ul>
    <h4 class="step">2 · Fix my mistakes</h4>
    ${fixN ? `<p><a class="btn primary" href="#fix">Fix my mistakes</a></p><p class="hint">${fixN} items you got wrong or haven't learned yet. A wrong answer comes back in the same set until you get it right. Something you fix today counts as learned when you get it right on the first try on another day.</p>` : `<p class="hint">No mistakes to fix right now.</p>`}
    <h4 class="step">3 · Try new items</h4>
    ${newN ? `<p><a class="btn ghost" href="#new">Try new items</a></p><p class="hint">${newN} exam items you haven't practised yet${ns ? ` · next: ${esc(ns.s.title)} (${esc(ns.s.when)})` : ""}.</p>` : `<p class="hint">You have practised every exam item. Well done!</p>`}
  </section>
  ${H ? `<section class="block"><h3>HSK 1 route</h3>
    <ul class="plist exam"><li><span class="pname"><span class="zh">HSK 1</span><span class="en">300 words</span></span>${meter2(H.k, H.p, H.n)}<span class="num">${H.k}/${H.n}<small>learned</small></span><span></span></li></ul>
    <p class="hint">Your map has ${H.map} of the 300 HSK 1 words so far. You will meet the rest next term, on the way to the HSK 1 test.</p>
  </section>` : ""}
  ${formUrl ? `<section class="block"><h3>Send to your teacher</h3>
    <p class="hint">The form opens with your progress already filled in. Sign in with your school account, check it, then press Submit.</p>
    <a class="btn primary" id="send" href="${esc(formUrl)}" target="_blank" rel="noopener">Send to teacher</a>
  </section>` : ""}
  <details class="block more"${msg ? " open" : ""}><summary>My progress code</summary>
    <p class="hint">Your progress is saved only in this browser. Keep this code: it brings your progress back on a new computer.</p>
    <div class="code"><code id="pcode" style="font-family:ui-monospace,monospace;font-size:12px;word-break:break-all;max-height:4.6em;overflow:auto">${esc(code)}</code><button type="button" class="btn ghost small" id="copy">Copy</button></div>
    <p class="hint" style="margin-top:12px">New computer or lost your progress? Paste your code here (or ask your teacher for your last code):</p>
    <div class="code"><input id="rcode" type="text" placeholder="${esc(code.slice(0, 3))}…" style="flex:1;min-width:220px;font:inherit;padding:6px 8px;border:1px solid var(--line, #d1d5db);border-radius:6px"><button type="button" class="btn ghost small" id="restore">Restore</button></div>
    ${msg ? `<p class="hint" role="status" style="margin-top:8px"><b>${esc(msg)}</b></p>` : ""}
  </details>
  <section class="block reset"><button type="button" class="btn ghost small" id="reset">Reset my progress</button><span id="reset-confirm" hidden> Are you sure? <button type="button" class="btn danger small" id="reset-yes">Yes, reset</button></span></section>`;
}
function viewProgress(msg) {
  if (REVIEW && typeof EXAM !== "undefined") return viewProgressReview(msg);
  setTab("progress");
  const sts = OPEN.map((s) => ({ s, ...stationStats(s) }));
  const m = sts.filter((x) => x.mastered).length;
  const N = Object.keys(WORDS).length;
  const A = allStats();
  const code = makeCode();
  // Wrong = last answer was wrong (b 0). Settling = right once, needs a second day (b 1).
  const wrongW = Object.keys(WORDS).filter((h) => { const it = item("w:" + h); return it.seen > 0 && it.b === 0; }).slice(0, 25);
  const settlingW = Object.keys(WORDS).filter((h) => item("w:" + h).b === 1).slice(0, 25);
  const params = new URLSearchParams({ usp: "pp_url" });
  params.set(ENTRY.code, code);
  params.set(ENTRY.words, `${A.p}/${A.n} practised · ${A.once} right once · ${A.k} learned | learned: words ${A.w.k}/${A.w.n} · grammar ${A.g.k}/${A.g.n} · sentences ${A.o.k}/${A.o.n}`);
  params.set(ENTRY.stations, `${m}/${sts.length}`);
  params.set(ENTRY.reviews, `${store.reviews} (streak ${store.streak} days)`);
  params.set(ENTRY.detail, sts.map((x) => `${x.s.title} ${x.k}/${x.n}`).join("; "));
  params.set(ENTRY.practise, `Wrong: ${wrongW.join("、") || "none"} | Settling: ${settlingW.join("、") || "none"}`);
  if (ENTRY.wrong) params.set(ENTRY.wrong, wrongW.join("、") || "none");
  if (ENTRY.pending) params.set(ENTRY.pending, settlingW.join("、") || "none");
  const formUrl = FORM + "?" + params.toString();
  main.innerHTML = `<section class="block"><h2>My progress</h2>
    <div class="tiles"><div class="tile"><b>${A.p}</b><span>/${A.n}<br>practised</span></div>
    <div class="tile"><b>${A.once}</b><span>right once<br>lock in tomorrow</span></div>
    <div class="tile"><b>${A.k}</b><span>/${A.n}<br>learned</span></div>
    <div class="tile"><b>${m}</b><span>/${sts.length}<br>stations mastered</span></div>
    <div class="tile"><b>${store.streak}</b><span>day<br>streak</span></div></div>
    <p class="hint">Three steps for every word, grammar point and sentence: <b>Practised</b> = you have answered it. <b>Right once</b> = you got it right; it's on its way. <b>Learned</b> = you got it right again on another day, so it really stays in your memory. A station is mastered when you have learned 80% of it.</p>
    ${lockLine()}
  </section>
  <section class="block"><h3>Send to your teacher</h3>
    <p class="hint">The form opens with your progress already filled in. Sign in with your school account, check it, then press Submit.</p>
    <a class="btn primary" id="send" href="${esc(formUrl)}" target="_blank" rel="noopener">Send to teacher</a>
  </section>
  <section class="block"><h3>My progress code</h3>
    <p class="hint">Your progress is saved only in this browser. Keep this code: it brings your progress back on a new device or browser.</p>
    <div class="code"><code id="pcode" style="font-family:ui-monospace,monospace;font-size:12px;word-break:break-all;max-height:4.6em;overflow:auto">${esc(code)}</code><button type="button" class="btn ghost small" id="copy">Copy</button></div>
    <p class="hint" style="margin-top:12px">New computer or lost your progress? Paste your code here (or ask your teacher for your last code):</p>
    <div class="code"><input id="rcode" type="text" placeholder="M2.…" style="flex:1;min-width:220px;font:inherit;padding:6px 8px;border:1px solid var(--line, #d1d5db);border-radius:6px"><button type="button" class="btn ghost small" id="restore">Restore</button></div>
    ${msg ? `<p class="hint" role="status" style="margin-top:8px"><b>${esc(msg)}</b></p>` : ""}
  </section>
  ${wrongW.length || settlingW.length ? `<section class="block"><h3>Words to practise</h3>
    ${wrongW.length ? `<p class="hint"><b>Got wrong last time</b> (${wrongW.length})</p><div class="wlist">${wrongW.map(wChip).join("")}</div>` : ""}
    ${settlingW.length ? `<p class="hint" style="margin-top:8px"><b>Right once, get it right again on another day</b> (${settlingW.length})</p><div class="wlist">${settlingW.map(wChip).join("")}</div>` : ""}
  </section>` : ""}
  <section class="block"><h3>By station</h3><p class="hint">Dark = learned · middle = right once · light = practised</p><ul class="plist">${sts.map((x) => `<li><a href="#s-${x.s.id}"><span class="pname"><span class="zh">${esc(x.s.title)}</span><span class="en">${esc(x.s.en)}</span></span>${meter2(x.k, x.p, x.n, x.once)}<span class="num">${x.p}/${x.n}<small>${x.once} once · ${x.k} learned</small></span>${x.mastered ? '<span class="tick">✓</span>' : "<span></span>"}</a></li>`).join("")}</ul></section>
  <section class="block reset"><button type="button" class="btn ghost small" id="reset">Reset my progress</button><span id="reset-confirm" hidden> Are you sure? <button type="button" class="btn danger small" id="reset-yes">Yes, reset</button></span></section>`;
}
document.addEventListener("click", async (ev) => {
  if (ev.target.id === "copy") { try { await navigator.clipboard.writeText($("#pcode").textContent); ev.target.textContent = "Copied"; } catch (e) { ev.target.textContent = "Select the text and copy it"; } }
  if (ev.target.id === "restore") {
    try { restoreCode($("#rcode").value); viewProgress("Progress restored. Welcome back!"); }
    catch (e) { viewProgress("That code doesn't work. Copy the whole code, starting with M2."); }
  }
  if (ev.target.id === "reset") $("#reset-confirm").hidden = false;
  if (ev.target.id === "reset-yes") { store = { items: {}, flags: {}, streak: 0, lastDay: -1, reviews: 0, pinyin: store.pinyin }; save(); viewProgress(); }
});


// ───────── final review: word wall + sentence building ─────────
store.flags = store.flags || {};
// A word needs work if the student marked it, the last answer was wrong, or it was ever wrong and isn't learned yet.
const needsWork = (h) => { const it = item("w:" + h); return !!store.flags[h] || (it.seen > 0 && it.b === 0) || ((it.w || 0) > 0 && it.b < 2); };
const zoneStations = (z) => OPEN.filter((s) => z === "all" || s.zone === z);
const zoneWords = (z) => [...new Set(zoneStations(z).flatMap(stWords))].filter((h) => WORDS[h]);
const fin = { z: "all", only: false, oz: "all" };
function wallCard(h) {
  const w = WORDS[h]; const fl = !!store.flags[h];
  const cls = needsWork(h) ? " need" : known(h) ? " known" : "";
  return `<div class="wcard${cls}"><button type="button" class="word" data-h="${esc(h)}" aria-label="${esc(h)}, ${esc(w.e)}">${SPK_IN}<span class="w-zh">${esc(h)}</span><span class="py w-py">${esc(w.p)}</span><span class="w-en">${esc(w.e)}</span></button>
    <button type="button" class="flag" data-flag="${esc(h)}" aria-pressed="${fl}">${fl ? "★ Not sure" : "☆ Not sure?"}</button></div>`;
}
function viewFinal() {
  setTab("final");
  const zs = [["all", "All units", "全部"], ...ZONES.map((z) => [z.id, z.name, z.zh])];
  const chips = (cur, attr) => zs.map(([id, n, zh]) => `<button type="button" class="chip zchip" data-${attr}="${id}" aria-pressed="${cur === id}">${esc(zh)} <span class="en">${esc(n)}</span></button>`).join("");
  const words = zoneWords(fin.z); const need = words.filter(needsWork); const shown = fin.only ? need : words;
  const os = sentItems(zoneStations(fin.oz)); const ok = os.filter(knownId).length;
  main.innerHTML = `<section class="block"><h2>总复习 · Final review</h2><p class="hint">The final exam covers everything from Week 1. Use the word wall to find the words you still need, then practise sentences unit by unit or all mixed.</p></section>
  <section class="block"><h3>生词墙 · Word wall</h3>
    <p class="hint"><b class="k-need">Red</b> = words to practise: you got them wrong, or you marked them ★ Not sure. <b class="k-ok">Green</b> = learned. Tap a word for its pinyin and meaning. Tap ☆ to mark a word you haven't remembered yet; tap it again when you know it.</p>
    <div class="zrow">${chips(fin.z, "wz")}</div>
    <div class="wall-bar"><label class="only"><input type="checkbox" id="only"${fin.only ? " checked" : ""}> Only words to practise (${need.length} of ${words.length})</label>
      ${need.length ? `<a class="btn primary small" href="#fw-${fin.z}">Practise these words</a>` : ""}</div>
    <div class="words wall">${shown.length ? shown.map(wallCard).join("") : '<p class="hint">Nothing to practise here. Well done!</p>'}</div>
  </section>
  <section class="block"><h3>排词成句 · Sentence building</h3>
    <p class="hint">Put the words in the right order. Choose one unit, or mix all units.</p>
    <div class="zrow">${chips(fin.oz, "oz")}</div>
    <p class="hint">${os.length} sentences · ${ok} learned</p>
    ${os.length ? `<a class="btn primary" href="#fo-${fin.oz}">Start: ${Math.min(10, os.length)} sentences</a>` : '<p class="hint">No sentences in this unit yet.</p>'}
  </section>`;
}
function viewFinalKeep() { const y = window.scrollY; viewFinal(); window.scrollTo(0, y); }
document.addEventListener("click", (ev) => {
  const f = ev.target.closest("[data-flag]");
  if (f) { const h = f.dataset.flag; if (store.flags[h]) delete store.flags[h]; else store.flags[h] = true; save(); return viewFinalKeep(); }
  const wz = ev.target.closest("[data-wz]"); if (wz) { fin.z = wz.dataset.wz; return viewFinalKeep(); }
  const oz = ev.target.closest("[data-oz]"); if (oz) { fin.oz = oz.dataset.oz; return viewFinalKeep(); }
});
document.addEventListener("change", (ev) => { if (ev.target.id === "only") { fin.only = ev.target.checked; viewFinalKeep(); } });
const buildFinalWords = (z) => priority(zoneWords(z).filter(needsWork).map((h) => "w:" + h)).slice(0, 10).map((id) => wordQ(id.slice(2)));
const buildFinalOrder = (z) => priority(sentItems(zoneStations(z))).slice(0, 10).map(orderQ);

// ───────── pinyin toggle & routing ─────────
const pyBtn = $("#pinyin");
function applyPinyin() { document.body.classList.toggle("show-py", !!store.pinyin); pyBtn.setAttribute("aria-pressed", !!store.pinyin); }
pyBtn.addEventListener("click", () => { store.pinyin = !store.pinyin; save(); applyPinyin(); });
applyPinyin();

function route() {
  const h = location.hash.slice(1);
  if (h === "review") { setTab("review"); return startQuiz(buildReview(), "review"); }
  if (h === "progress") return viewProgress();
  if ((h === "fix" || h === "new") && REVIEW && typeof EXAM !== "undefined") { setTab("progress"); const qs = h === "fix" ? buildFix() : buildNew(); if (qs.length) { window.scrollTo(0, 0); return startQuiz(qs, h); } return viewProgress(); }
  if (h === "final") { quiz = null; return viewFinal(); }
  if (h.startsWith("fw-") || h.startsWith("fo-")) { setTab("final"); const z = h.slice(3); const qs = h[1] === "w" ? buildFinalWords(z) : buildFinalOrder(z); if (qs.length) { window.scrollTo(0, 0); return startQuiz(qs, "final"); } return viewFinal(); }
  if (h.startsWith("s-")) return viewStation(h.slice(2));
  if (h.startsWith("p-") && ST[h.slice(2)]) { setTab("map"); return startQuiz(buildPractice(h.slice(2)), "station", h.slice(2)); }
  quiz = null; viewMap();
}
window.addEventListener("hashchange", route);
route();
