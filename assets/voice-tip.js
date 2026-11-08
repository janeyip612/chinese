/* Sound tips: a small box under the page that says which Chinese voice this device is using
   and how to get a more natural one. Shared by every learning page on this site.
   Use: <script src="../../assets/voice-tip.js"></script>, then voiceTip.render("en" | "vi") after load
   (it also renders itself once with English). Pages with a language switch call render again. */
(function () {
  "use strict";
  // Same ranking the pages use when they pick a voice: neural/online voices first.
  var RANK = [/xiaoxiao|xiaoyi|yunxi|natural|online/i, /google.*(普通话|mandarin|chinese)|google/i, /lili|yu-?shu|tingting|ting-ting|premium|enhanced|增强/i, /huihui|kangkang|yaoyao/i];
  function best() {
    try {
      var vs = speechSynthesis.getVoices().filter(function (v) { return /^(zh|cmn)/i.test(v.lang) && !/(HK|TW|yue|Hant)/i.test(v.lang + v.name); });
      if (!vs.length) return null;
      var score = function (v) { var i = RANK.findIndex(function (r) { return r.test(v.name); }); return (i < 0 ? 9 : i) + (/CN|Hans/i.test(v.lang) ? 0 : 0.5); };
      vs.sort(function (a, b) { return score(a) - score(b); });
      var v = vs[0]; // natural = Edge neural / Google voices, or an Apple voice the user downloaded as Enhanced/Premium
      return { v: v, good: score(v) < 1.6 || /enhanced|premium|增强|高品质|nâng cao/i.test(v.name) };
    } catch (e) { return null; }
  }
  var ua = navigator.userAgent;
  var plat = /iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1) ? "ios"
    : /Android/.test(ua) ? "android" : /CrOS/.test(ua) ? "cros" : /Macintosh/.test(ua) ? "mac" : /Windows/.test(ua) ? "win" : "other";
  var edge = /Edg\//.test(ua);
  var T = {
    en: {
      sumGood: "🔊 Sound: natural voice ✓", sumBad: "🔊 Make the Chinese voice sound better", sumNone: "🔊 No Chinese sound? Read this",
      good: "This device is using a natural voice: ", bad: "This device is using a basic voice, so the tones may sound robotic: ",
      none: "This device has no Mandarin voice yet, so the sound can't play.", test: "▶ Test the voice", here: "On this device", others: "Other devices",
      ios: "iPhone / iPad: Settings → Accessibility → Read & Speak (older versions: Spoken Content) → Voices → Chinese (China mainland) → download Lili or Yu-shu (Enhanced). Then close this page and open it again.",
      mac: "Mac: System Settings → Accessibility → Read & Speak (older macOS: Spoken Content) → click ⓘ next to System voice → Chinese (China mainland) on the left → download Lili or Yushu (Enhanced or Premium) → Done. Then reload this page. Opening the page in Chrome or Edge also works.",
      win: "Windows: open this page in Microsoft Edge. It has the most natural Chinese voices (Xiaoxiao, Yunxi), but only when you are online. Chrome is the next best.",
      winEdge: "Windows + Edge: the natural voices (Xiaoxiao, Yunxi) need the internet. Check you are online, then reload this page.",
      android: "Android: use Chrome. Then Settings → Accessibility (or System) → Text-to-speech → Preferred engine: Speech Services by Google → Install voice data → Chinese (Mandarin). Reload this page.",
      cros: "Chromebook: stay online. Chrome then uses the Google Mandarin voice.",
      other: "Use Chrome or Microsoft Edge for the best Chinese voices."
    },
    vi: {
      sumGood: "🔊 Âm thanh: giọng đọc tự nhiên ✓", sumBad: "🔊 Cách để giọng đọc tiếng Trung hay hơn", sumNone: "🔊 Không nghe được tiếng Trung? Đọc ở đây",
      good: "Thiết bị đang dùng giọng đọc tự nhiên: ", bad: "Thiết bị đang dùng giọng đọc cơ bản, thanh điệu có thể nghe như máy: ",
      none: "Thiết bị chưa có giọng đọc tiếng Phổ thông nên chưa phát được âm thanh.", test: "▶ Nghe thử", here: "Trên thiết bị này", others: "Thiết bị khác",
      ios: "iPhone / iPad: Cài đặt → Trợ năng → Read & Speak (bản cũ: Nội dung được đọc) → Giọng nói → Tiếng Trung (Trung Quốc đại lục) → tải Lili hoặc Yu-shu (Nâng cao). Sau đó đóng trang này và mở lại.",
      mac: "Mac: Cài đặt hệ thống → Trợ năng → Read & Speak (macOS cũ: Nội dung được đọc) → bấm ⓘ cạnh Giọng hệ thống → chọn Tiếng Trung (Trung Quốc đại lục) ở bên trái → tải Lili hoặc Yushu (Nâng cao hoặc Cao cấp) → Xong. Sau đó tải lại trang. Mở trang bằng Chrome hoặc Edge cũng được.",
      win: "Windows: mở trang này bằng Microsoft Edge. Edge có giọng tiếng Trung tự nhiên nhất (Xiaoxiao, Yunxi), nhưng cần có mạng. Chrome là lựa chọn thứ hai.",
      winEdge: "Windows + Edge: giọng tự nhiên (Xiaoxiao, Yunxi) cần có mạng. Hãy kiểm tra kết nối mạng rồi tải lại trang.",
      android: "Android: dùng Chrome. Vào Cài đặt → Trợ năng (hoặc Hệ thống) → Chuyển văn bản thành giọng nói → Công cụ ưu tiên: Dịch vụ lời nói của Google → Cài đặt dữ liệu giọng nói → Tiếng Trung (Phổ thông). Tải lại trang.",
      cros: "Chromebook: giữ kết nối mạng, Chrome sẽ dùng giọng Phổ thông của Google.",
      other: "Hãy dùng Chrome hoặc Microsoft Edge để có giọng tiếng Trung tốt nhất."
    }
  };
  var lang = "en", box = null, wasOpen = false;
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function css() {
    if (document.getElementById("vtip-css")) return;
    var s = document.createElement("style"); s.id = "vtip-css";
    s.textContent = ".vtip{max-width:980px;margin:12px auto 28px;padding:0 16px;font-size:14px;line-height:1.5;color:var(--muted,#5d6877)}" +
      ".vtip details{border:1px solid var(--line,var(--rule,#d9dfe6));border-radius:12px;background:var(--surface,#fff);padding:10px 14px}" +
      ".vtip details.bad{border-color:var(--accent,#c8102e)}" +
      ".vtip summary{cursor:pointer;font-weight:600;color:var(--ink,#1b2430)}" +
      ".vtip p{margin:8px 0 0}.vtip b{color:var(--ink,#1b2430)}.vtip ul{margin:6px 0 0;padding-left:18px}.vtip li{margin:4px 0}" +
      ".vtip button{margin-top:8px;border:1px solid var(--line,var(--rule,#d9dfe6));background:var(--bg,#f4f6f8);color:var(--ink,#1b2430);border-radius:8px;padding:6px 12px;font:inherit;cursor:pointer}";
    document.head.appendChild(s);
  }
  function render(l) {
    if (l) lang = T[l] ? l : "en";
    var t = T[lang], ok = "speechSynthesis" in window, b = ok ? best() : null;
    css();
    if (!box) {
      box = document.createElement("div"); box.className = "vtip";
      var main = document.querySelector("main"); (main && main.parentNode ? main.parentNode : document.body).appendChild(box);
    } else { var d0 = box.querySelector("details"); wasOpen = !!(d0 && d0.open); }
    var cls = !b ? "bad" : b.good ? "" : "bad";
    var status = !b ? t.none : (b.good ? t.good : t.bad) + "<b>" + esc(b.v.name) + "</b>";
    var key = plat === "win" && edge ? "winEdge" : plat;
    var others = ["ios", "mac", "win", "android"].filter(function (k) { return k !== plat; });
    box.innerHTML = '<details class="' + cls + '"' + (wasOpen ? " open" : "") + "><summary>" + (!b ? t.sumNone : b.good ? t.sumGood : t.sumBad) + "</summary>" +
      "<p>" + status + "</p>" + (b ? '<button type="button" class="vtip-test">' + t.test + "</button>" : "") +
      "<p><b>" + t.here + ":</b> " + esc(t[key]) + "</p>" +
      "<p><b>" + t.others + ":</b></p><ul>" + others.map(function (k) { return "<li>" + esc(t[k]) + "</li>"; }).join("") + "</ul></details>";
    var btn = box.querySelector(".vtip-test");
    if (btn) btn.onclick = function () {
      try { var u = new SpeechSynthesisUtterance("你好！我是学生。"); u.voice = b.v; u.lang = b.v.lang; u.rate = 0.85; speechSynthesis.cancel(); speechSynthesis.speak(u); } catch (e) {}
    };
  }
  window.voiceTip = { render: render };
  function start() { render(); if ("speechSynthesis" in window) try { speechSynthesis.addEventListener("voiceschanged", function () { render(); }); } catch (e) {} }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();
})();
