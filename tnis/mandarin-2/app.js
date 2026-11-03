// ───────── helpers ─────────
const $ = (sel, el = document) => el.querySelector(sel);
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const split = (x) => { const [h, p, e] = x.split("|"); return { h, p: p || "", e: e || "" }; };
const shuffle = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const today = () => Math.floor((Date.now() - new Date().getTimezoneOffset() * 60000) / 86400000);
const INTERVALS = [0, 1, 2, 4, 7, 14];

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
function grade(id, ok, hinted) {
  const it = item(id);
  it.seen++;
  const t = today();
  if (ok && hinted) { it.d = t + 1; }
  else if (ok) { if (it.last !== t || it.b === 0) it.b = Math.min(it.b + 1, 5); it.d = t + INTERVALS[it.b]; }
  else { it.b = 0; it.d = t; }
  it.last = t;
  store.items[id] = it; save();
}
const known = (h) => item("w:" + h).b >= 2;
function stationStats(st) {
  const ws = stWords(st); const k = ws.filter(known).length;
  const seen = ws.some((h) => item("w:" + h).seen > 0);
  return { k, n: ws.length, mastered: ws.length > 0 && k / ws.length >= 0.8, started: seen };
}

// ───────── speech (vocabulary only) ─────────
let zhVoice = null;
function pickVoice() {
  try { const vs = speechSynthesis.getVoices(); zhVoice = vs.find((v) => /zh[-_]CN/i.test(v.lang)) || vs.find((v) => /^zh/i.test(v.lang)) || null; } catch (e) { zhVoice = null; }
}
if ("speechSynthesis" in window) { pickVoice(); speechSynthesis.onvoiceschanged = pickVoice; }
function speak(text) {
  if (!zhVoice) return false;
  try { speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(text); u.voice = zhVoice; u.lang = zhVoice.lang; u.rate = 0.8; speechSynthesis.speak(u); return true; } catch (e) { return false; }
}

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

function viewMap() {
  setTab("map");
  const totalK = Object.keys(WORDS).filter(known).length;
  let html = `<section class="today">
      <div><h2>Daily review</h2>
      <p>10 quick questions, about 5 minutes. They mix this week's focus, recent lessons and last year, and bring back the words you got wrong.</p>
      <p class="focus"><span class="label">This week's focus</span> ${FOCUS.stations.map((id) => `<a href="#s-${id}" class="chip">${esc(ST[id].title)}</a>`).join(" ")}<br><span class="en">${esc(FOCUS.why)}</span></p></div>
      <div class="today-side"><div class="stat"><b>${store.streak}</b><span>day<br>streak</span></div>
      <a class="btn primary" href="#review">Start</a></div>
    </section>
    <p class="map-intro">Each station is something you have learned. Open one to review its words and sentence patterns. You know <b>${totalK}</b> of ${Object.keys(WORDS).length} words so far.</p>`;
  ZONES.forEach((z) => {
    const sts = STATIONS.filter((s) => s.zone === z.id);
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
        <span class="meter" role="img" aria-label="${ss.k} of ${ss.n} words known"><i style="width:${ss.n ? (ss.k / ss.n) * 100 : 0}%"></i></span>
        <span class="pill ${state}">${label} · ${ss.k}/${ss.n}</span></div></a></li>`;
    });
    html += `</ol></section>`;
  });
  main.innerHTML = html;
}

function wordCard(h) {
  const w = WORDS[h]; const k = known(h);
  return `<button type="button" class="word${k ? " known" : ""}" data-h="${esc(h)}" aria-label="${esc(h)}, ${esc(w.e)}">
    <span class="w-zh">${esc(h)}</span><span class="py w-py">${esc(w.p)}</span><span class="w-en">${esc(w.e)}</span>${k ? '<span class="tick" aria-hidden="true">✓</span>' : ""}</button>`;
}
document.addEventListener("click", (ev) => {
  const c = ev.target.closest(".word"); if (!c) return;
  c.classList.toggle("open"); speak(c.dataset.h);
});

function viewStation(id) {
  const s = ST[id]; if (!s || s.locked) return viewMap();
  setTab("map");
  const z = ZONES.find((z) => z.id === s.zone);
  const ss = stationStats(s);
  let html = `<a class="back" href="#map">← Map</a>
  <header class="st-head" style="--c: var(${z.color})"><span class="line-badge">${esc(z.name)}</span>
    <h2>${esc(s.title)}</h2><p class="en">${esc(s.en)} · ${esc(s.when)} · ${ss.k}/${ss.n} words known</p></header>
  <section class="block"><h3>Words</h3>
    <p class="hint">Tap a word to see the pinyin and meaning${zhVoice ? " and hear it" : ""}.</p>
    <div class="words">${stWords(s).map(wordCard).join("")}</div>
    ${s.review ? `<p class="also"><span class="label">Also used</span> ${s.review.map((h) => `<button type="button" class="chip word-chip" data-h="${esc(h)}">${esc(h)}</button>`).join(" ")}</p>` : ""}
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
  const w = WORDS[c.dataset.h]; c.textContent = c.textContent === c.dataset.h && w ? `${c.dataset.h} ${w.p} · ${w.e}` : c.dataset.h; speak(c.dataset.h);
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
  return { ...base, kind: "Listen and pick the word", en: "", listen: h, prompt: `<button type="button" class="btn ghost play" data-say="${esc(h)}">▶ Play again</button>`, opts: opts.map((o) => ({ t: o.h, p: o.p, zh: true, ok: o === w })) };
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
function priority(ids) { // due first, weakest first, then random
  const t = today();
  return shuffle(ids).sort((a, b) => { const A = item(a), B = item(b); const da = A.d <= t ? 0 : 1, db = B.d <= t ? 0 : 1; return da - db || A.b - B.b; });
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
  return qs;
}
function buildPractice(sid) {
  const s = ST[sid];
  const words = priority(stWords(s).map((h) => "w:" + h)).slice(0, 6).map((id) => wordQ(id.slice(2)));
  const gIds = priority(grammarItems([s]).map(idOf)).slice(0, 2);
  const gs = grammarItems([s]).filter((g) => gIds.includes(idOf(g))).map((g) => grammarQ(...g));
  const extra = priority(stWords(s).map((h) => "w:" + h)).slice(6, 6 + (2 - gs.length)).map((id) => wordQ(id.slice(2)));
  return shuffle([...words, ...gs, ...extra]);
}

// ───────── quiz runner ─────────
let quiz = null;
function startQuiz(qs, mode, sid) { quiz = { qs, i: 0, right: 0, mode, sid, wrong: [] }; showQ(); }
document.addEventListener("click", (ev) => {
  if (ev.target.id !== "hint" || !quiz) return;
  quiz.qs[quiz.i].hinted = true; document.querySelector(".quiz").classList.add("hinted");
  const h = document.querySelector(".q-hintpy"); if (h) h.hidden = false; ev.target.disabled = true;
  ev.target.textContent = "Pinyin shown: this one comes back tomorrow";
});
function showQ() {
  const q = quiz.qs[quiz.i];
  const back = quiz.mode === "station" ? `#s-${quiz.sid}` : "#map";
  main.innerHTML = `<a class="back" href="${back}">← Leave</a>
  <section class="quiz">
    <div class="q-progress" role="progressbar" aria-valuemin="0" aria-valuemax="${quiz.qs.length}" aria-valuenow="${quiz.i}"><i style="width:${(quiz.i / quiz.qs.length) * 100}%"></i></div>
    <p class="q-count">${quiz.i + 1} / ${quiz.qs.length}</p>
    <h2 class="q-kind">${esc(q.kind)} <span class="en-h">${esc(q.en)}</span></h2>
    <div class="q-prompt">${q.prompt}</div>
    <div class="q-opts">${q.opts.map((o, j) => `<button type="button" class="opt${o.zh ? " zh" : ""}" data-j="${j}">${esc(o.t)}${o.p ? `<span class="opt-py">${esc(o.p)}</span>` : ""}</button>`).join("")}</div>
    ${!q.noHint && (q.hintPy || q.opts.some((o) => o.p)) ? `<button type="button" class="btn ghost small hint-btn" id="hint">Show pinyin (hint)</button>` : ""}
    ${q.hintPy ? `<p class="q-hintpy" hidden>${esc(q.hintPy)}</p>` : ""}
    <div class="q-feedback" aria-live="polite"></div>
  </section>`;
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
  if (q.answer) fb += `<p class="fb-word"><span class="zh">${esc(q.answer.h)}</span> <span class="py-always">${esc(q.answer.p)}</span> · ${esc(q.answer.e)}</p>`;
  if (q.after) fb += `<p class="fb-word"><span class="zh">${esc(q.after)}</span></p>`;
  const last = quiz.i === quiz.qs.length - 1;
  fb += `<button type="button" class="btn primary next">${last ? "See results" : "Next"}</button>`;
  $(".q-feedback").innerHTML = fb; $(".next").focus();
  if (q.answer && !q.listen) speak(q.answer.h);
});
document.addEventListener("click", (ev) => {
  if (!ev.target.closest(".next") || !quiz) return;
  quiz.i++;
  if (quiz.i < quiz.qs.length) return showQ();
  if (quiz.mode === "review") {
    const t = today();
    if (store.lastDay !== t) { store.streak = store.lastDay === t - 1 ? store.streak + 1 : 1; store.lastDay = t; }
    store.reviews++; save();
  }
  const n = quiz.qs.length, r = quiz.right;
  const back = quiz.mode === "station" ? `#s-${quiz.sid}` : "#map";
  main.innerHTML = `<section class="done">
    <h2>${r}/${n}</h2>
    <p>${r === n ? "All correct!" : r >= n * 0.7 ? "Well done." : "Good effort. The words you missed will come back in your next review."}</p>
    ${quiz.mode === "review" ? `<p class="streak"><b>${store.streak}</b> day streak</p>` : ""}
    ${quiz.wrong.length ? `<div class="missed"><h3>Have another look</h3><ul>${quiz.wrong.map((q) => q.answer ? `<li><span class="zh">${esc(q.answer.h)}</span> <span class="py-always">${esc(q.answer.p)}</span> · ${esc(q.answer.e)}</li>` : `<li><span class="zh">${esc(q.after || "")}</span></li>`).join("")}</ul></div>` : ""}
    <div class="done-actions"><a class="btn primary" href="${back}">${quiz.mode === "station" ? "Back to station" : "Back to map"}</a></div>
  </section>`;
  quiz = null;
});

// ───────── progress ─────────
function viewProgress() {
  setTab("progress");
  const sts = OPEN.map((s) => ({ s, ...stationStats(s) }));
  const m = sts.filter((x) => x.mastered).length;
  const totalK = Object.keys(WORDS).filter(known).length;
  const d = new Date(); const ds = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  const code = `Mandarin II learning map · ${ds} · stations mastered ${m}/${sts.length} · words known ${totalK}/${Object.keys(WORDS).length} · streak ${store.streak} days · reviews ${store.reviews}`;
  main.innerHTML = `<section class="block"><h2>My progress</h2>
    <div class="tiles"><div class="tile"><b>${m}</b><span>/${sts.length}<br>stations mastered</span></div>
    <div class="tile"><b>${totalK}</b><span>/${Object.keys(WORDS).length}<br>words known</span></div>
    <div class="tile"><b>${store.streak}</b><span>day<br>streak</span></div></div>
    <p class="hint">A word counts as known after you get it right on two different days. A station is mastered when you know 80% of its words.</p>
  </section>
  <section class="block"><h3>Send to your teacher</h3>
    <p class="hint">Copy this line and paste it into Google Classroom when your teacher asks.</p>
    <div class="code"><code id="pcode">${esc(code)}</code><button type="button" class="btn ghost small" id="copy">Copy</button></div>
  </section>
  <section class="block"><h3>By station</h3><ul class="plist">${sts.map((x) => `<li><a href="#s-${x.s.id}"><span class="zh">${esc(x.s.title)}</span><span class="meter"><i style="width:${x.n ? (x.k / x.n) * 100 : 0}%"></i></span><span class="num">${x.k}/${x.n}</span>${x.mastered ? '<span class="tick">✓</span>' : ""}</a></li>`).join("")}</ul></section>
  <section class="block reset"><button type="button" class="btn ghost small" id="reset">Reset my progress</button><span id="reset-confirm" hidden> Are you sure? <button type="button" class="btn danger small" id="reset-yes">Yes, reset</button></span></section>`;
}
document.addEventListener("click", async (ev) => {
  if (ev.target.id === "copy") { try { await navigator.clipboard.writeText($("#pcode").textContent); ev.target.textContent = "Copied"; } catch (e) { ev.target.textContent = "Select the text and copy it"; } }
  if (ev.target.id === "reset") $("#reset-confirm").hidden = false;
  if (ev.target.id === "reset-yes") { store = { items: {}, streak: 0, lastDay: -1, reviews: 0, pinyin: store.pinyin }; save(); viewProgress(); }
});

// ───────── pinyin toggle & routing ─────────
const pyBtn = $("#pinyin");
function applyPinyin() { document.body.classList.toggle("show-py", !!store.pinyin); pyBtn.setAttribute("aria-pressed", !!store.pinyin); }
pyBtn.addEventListener("click", () => { store.pinyin = !store.pinyin; save(); applyPinyin(); });
applyPinyin();

function route() {
  const h = location.hash.slice(1);
  if (h === "review") { setTab("review"); return startQuiz(buildReview(), "review"); }
  if (h === "progress") return viewProgress();
  if (h.startsWith("s-")) return viewStation(h.slice(2));
  if (h.startsWith("p-") && ST[h.slice(2)]) { setTab("map"); return startQuiz(buildPractice(h.slice(2)), "station", h.slice(2)); }
  quiz = null; viewMap();
}
window.addEventListener("hashchange", route);
route();
