// Rendert GuardAI-News-Posts aus posts.json über Chrome headless
// Feed: <id>-1.jpg (Titel), <id>-2.jpg (Infos), cta.jpg (gemeinsam), 1080x1350
// Story: <id>.jpg, 1080x1920
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const dir = path.dirname(new URL(import.meta.url).pathname).replace(/^\/([A-Z]:)/, '$1');
const posts = JSON.parse(fs.readFileSync(path.join(dir, process.env.POSTS || 'posts.json'), 'utf8'));
const only = process.argv[2];
const chrome = ['C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe'].find(fs.existsSync);
const out = path.join(dir, process.env.OUT || 'out');
fs.mkdirSync(out, { recursive: true });

const css = (w, h) => `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=DM+Serif+Display&display=swap');
*{box-sizing:border-box;margin:0}
html,body{width:${w}px;height:${h}px;overflow:hidden;background:#05070b}
.p{position:relative;width:${w}px;height:${h}px;font-family:Inter,sans-serif;color:#fff}
.bg{position:absolute;inset:0;background-size:cover;background-position:var(--pos,center);filter:brightness(1.12) contrast(1.08) saturate(1.1)}
.sh{position:absolute;inset:0;background:linear-gradient(180deg,rgba(4,6,10,.93) 0%,rgba(4,6,10,.84) 30%,rgba(4,6,10,.5) 45%,rgba(4,6,10,0) 62%,rgba(4,6,10,0) 80%,rgba(4,6,10,.8) 100%)}
.sh.bottom{background:linear-gradient(180deg,rgba(4,6,10,.25) 0%,rgba(4,6,10,0) 25%,rgba(4,6,10,.55) 50%,rgba(4,6,10,.95) 72%)}
.sh.dim{background:rgba(4,6,10,.86)}
.txt{position:absolute;left:72px;right:72px;top:${h > 1400 ? 200 : 84}px}
.txt.bottom{top:auto;bottom:${h > 1400 ? 300 : 150}px}
.k{font-size:22px;font-weight:600;letter-spacing:.18em;text-transform:uppercase;color:rgba(255,255,255,.72);margin-bottom:26px;display:flex;gap:14px;align-items:center}
.k i{display:inline-block;width:38px;height:2px;background:#5b8cff}
h1{font-family:'DM Serif Display',serif;font-weight:400;font-size:var(--fs,88px);line-height:1.02;letter-spacing:-.01em}
h1 em,h2 em{font-style:normal;color:#6f9bff}
h2{font-family:'DM Serif Display',serif;font-weight:400;font-size:64px;line-height:1.05;margin-bottom:44px}
.big{font-family:Inter;font-weight:800;font-size:150px;letter-spacing:-.04em;line-height:1;color:#6f9bff;margin-bottom:10px}
.sub{margin-top:30px;font-size:31px;line-height:1.38;color:rgba(255,255,255,.86);max-width:860px}
.sub b,.pts b{color:#fff;font-weight:700}
ol{list-style:none;padding:0;counter-reset:n}
.pts li{counter-increment:n;position:relative;padding:0 0 0 78px;margin-bottom:34px;font-size:31px;line-height:1.4;color:rgba(255,255,255,.88)}
.pts li::before{content:counter(n,decimal-leading-zero);position:absolute;left:0;top:2px;font-weight:700;font-size:24px;color:#6f9bff;letter-spacing:.05em}
.src{position:absolute;left:72px;bottom:${h > 1400 ? 120 : 58}px;font-size:17px;color:rgba(255,255,255,.5);max-width:600px;line-height:1.35}
.brand{position:absolute;right:72px;bottom:${h > 1400 ? 112 : 54}px;text-align:right}
.brand .n{font-size:34px;font-weight:700;letter-spacing:-.01em}
.brand .n span{color:#6f9bff}
.brand .u{font-size:18px;color:rgba(255,255,255,.6);margin-top:2px}
.cta{display:inline-block;margin-top:34px;padding:18px 30px;border:1.5px solid rgba(111,155,255,.8);border-radius:999px;font-size:26px;font-weight:600;color:#fff;background:rgba(31,79,216,.35)}
.note{position:absolute;left:72px;bottom:58px;font-size:17px;color:rgba(255,255,255,.5)}
`;

const fileUrl = f => 'file:///' + f.replace(/\\/g, '/');
const img = id => fileUrl(path.join(dir, 'img', id + '.jpg'));
const brand = `<div class="brand"><div class="n">Guard<span>AI</span></div><div class="u">Ihr digitaler Compliance-Officer</div></div>`;

function shoot(name, w, h, body) {
  const html = `<!doctype html><html><head><meta charset="utf-8"><style>${css(w, h)}</style></head><body><div class="p">${body}</div></body></html>`;
  const hf = path.join(out, name + '.html');
  fs.writeFileSync(hf, html);
  const png = path.join(out, name + '.png');
  execFileSync(chrome, ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--allow-file-access-from-files', '--virtual-time-budget=6000', `--window-size=${w},${h}`, `--screenshot=${png}`, fileUrl(hf)], { stdio: 'ignore' });
  console.log('ok', name);
}

const cover = p => `<div class="bg" style="background-image:url('${img(p.img)}');--pos:${p.pos || 'center'}"></div>
<div class="sh ${p.layout === 'bottom' ? 'bottom' : ''}"></div>
<div class="txt ${p.layout === 'bottom' ? 'bottom' : ''}" style="--fs:${p.fs || 88}px">
<div class="k"><i></i>${p.kicker}</div>
${p.big ? `<div class="big">${p.big}</div>` : ''}
<h1>${p.title}</h1>
${p.sub ? `<p class="sub">${p.sub}</p>` : ''}
${p.cta ? `<div class="cta">${p.cta}</div>` : ''}
</div>
${p.src ? `<div class="src">${p.src}</div>` : ''}${brand}`;

const info = p => `<div class="bg" style="background-image:url('${img(p.img)}');--pos:${p.pos || 'center'};filter:blur(6px) brightness(.9)"></div>
<div class="sh dim"></div>
<div class="txt"><div class="k"><i></i>${p.infoKicker || 'Was das für Sie heißt'}</div>
<h2>${p.infoTitle}</h2><ol class="pts">${p.points.map(x => `<li>${x}</li>`).join('')}</ol></div>
<div class="note">${p.note || 'Allgemeine Information, keine Rechtsberatung.'}</div>${brand}`;

if (!only || only === 'cta') {
  shoot('cta', 1080, 1350, `<div class="bg" style="background-image:url('${img('photo-1606229365485-93a3b8ee0385')}');--pos:center 0%"></div><div class="sh"></div>
<div class="txt"><div class="k"><i></i>GuardAI · Ihr digitaler Compliance-Officer</div>
<h1>Prüfen Sie Ihre Website, E-Mails und Verträge.<br><em>In zwei Minuten.</em></h1>
<p class="sub">Mit Fundstelle, Rechtsgrundlage und Formulierungsvorschlag. <b>Free: 5 Prüfungen pro Monat.</b></p>
<div class="cta">Link in der Bio · guardai.cloud</div></div>${brand}`);
}

for (const p of posts) {
  if (only && only !== 'cta' && p.id !== only) continue;
  if (only === 'cta') continue;
  if (p.type === 'story') {
    shoot(p.id, 1080, 1920, cover(p));
  } else {
    shoot(p.id + '-1', 1080, 1350, cover(p));
    shoot(p.id + '-2', 1080, 1350, info(p));
  }
}
