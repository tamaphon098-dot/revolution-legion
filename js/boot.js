// Boot: pick the language, translate the static HTML, then load that language's build of the game.
// Japanese is the source (www/js). Other languages are generated into www/l/<lang>/ by tools/i18n_build.mjs.
export const LANGS = [
  ['ja', '日本語'], ['en', 'English'], ['zh-TW', '繁體中文'], ['zh-CN', '简体中文'], ['ko', '한국어'], ['es', 'Español'], ['pt-BR', 'Português (BR)'],
];
const IDS = LANGS.map((l) => l[0]);

function pick() {
  const q = new URLSearchParams(location.search).get('lang');
  if (IDS.includes(q)) return q;
  try { const s = localStorage.getItem('rl_lang'); if (IDS.includes(s)) return s; } catch { /* storage blocked */ }
  for (const raw of navigator.languages || [navigator.language || 'en']) {
    const l = String(raw).toLowerCase();
    if (l.startsWith('ja')) return 'ja';
    if (l.startsWith('zh')) return /tw|hk|mo|hant/.test(l) ? 'zh-TW' : 'zh-CN';
    if (l.startsWith('ko')) return 'ko';
    if (l.startsWith('es')) return 'es';
    if (l.startsWith('pt')) return 'pt-BR';
    if (l.startsWith('en')) return 'en';
  }
  return 'en';
}

export function setLang(id) {
  try { localStorage.setItem('rl_lang', id); } catch { /* storage blocked */ }
  location.reload();
}

// surface startup failures (start() is async and otherwise fails silently)
window.addEventListener('unhandledrejection', (e) => { globalThis.RL_ERR = String((e.reason && e.reason.stack) || e.reason); document.documentElement.dataset.err = globalThis.RL_ERR.slice(0, 400); console.error('startup error', e.reason); });
window.addEventListener('error', (e) => { globalThis.RL_ERR = String((e.error && e.error.stack) || e.message); document.documentElement.dataset.err = globalThis.RL_ERR.slice(0, 400); });

const lang = pick();
globalThis.RL_LANG = lang;
globalThis.RL_LANGS = LANGS;
globalThis.RL_SET_LANG = setLang;
document.documentElement.lang = lang;

async function translateHtml() {
  const dict = await fetch(`l/${lang}/html.json`).then((r) => r.json());
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    const t = n.nodeValue.trim();
    if (t && dict[t] !== undefined) n.nodeValue = n.nodeValue.replace(t, dict[t]);
  }
  document.querySelectorAll('[aria-label],[title],[alt]').forEach((el) => {
    for (const a of ['aria-label', 'title', 'alt']) { const v = el.getAttribute(a); if (v && dict[v] !== undefined) el.setAttribute(a, dict[v]); }
  });
}

(async () => {
  if (lang !== 'ja') {
    try { await translateHtml(); await import(`../l/${lang}/main.js`); return; } catch (e) { console.warn('language build missing, falling back to Japanese', e); }
  }
  await import('./main.js');
})();
// dev server only: show any runtime error on screen (helps headless screenshot debugging)
if (location.port === '5180' && ['localhost', '127.0.0.1'].includes(location.hostname)) {
  const show = () => { if (!globalThis.RL_ERR || document.getElementById('rlErr')) return; const d = document.createElement('pre'); d.id = 'rlErr'; d.style.cssText = 'position:fixed;left:0;right:0;bottom:0;z-index:99;background:#a22633;color:#fff;font:11px monospace;white-space:pre-wrap;margin:0;padding:4px'; d.textContent = globalThis.RL_ERR.slice(0, 700); document.body.appendChild(d); };
  window.addEventListener('error', () => setTimeout(show, 0));
  window.addEventListener('unhandledrejection', () => setTimeout(show, 0));
}
