#!/usr/bin/env node
/**
 * capturar.mjs — prints por seção de uma página (desktop e mobile) para comparar com o Figma.
 *
 * Uso:
 *   node capturar.mjs <pagina.html> [--saida pasta] [--larguras 1440,390]
 *
 * Gera <saida>/<largura>/NN-<secao>[-parte].png (uma imagem por seção do <body>,
 * fatiada na altura da tela) + visao-geral-<largura>.png, e reporta:
 *   - erros de JavaScript no console
 *   - arquivos/recursos que não carregaram (404, arquivo inexistente)
 *   - overflow horizontal (página "vazando" para o lado), com os elementos culpados
 * Saída padrão: .pagesfront/capturas/<pagina>/ na raiz do projeto.
 * Código de saída 1 se houver erro de JS, recurso quebrado ou overflow.
 *
 * Usa o Chrome/Edge instalado (defina CHROME_PATH para forçar outro). Node 22+, sem dependências.
 */
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { spawn } from 'node:child_process';
import { pathToFileURL } from 'node:url';

const argv = process.argv.slice(2);
let pagina = null, saida = null, larguras = [1440, 390];
for (let i = 0; i < argv.length; i++) {
  const a = argv[i];
  if (a === '--saida') saida = argv[++i];
  else if (a === '--larguras') larguras = argv[++i].split(',').map(Number).filter(Boolean);
  else if (a === '-h' || a === '--help') { console.log(fs.readFileSync(new URL(import.meta.url), 'utf8').split('*/')[0]); process.exit(0); }
  else pagina = a;
}
if (!pagina || !fs.existsSync(pagina)) { console.error('Uso: node capturar.mjs <pagina.html> [--saida pasta] [--larguras 1440,390]'); process.exit(2); }
if (typeof WebSocket === 'undefined') { console.error('Precisa de Node 22+ (WebSocket global).'); process.exit(2); }
pagina = path.resolve(pagina);

// raiz do projeto = primeira pasta acima que tenha .pagesfront/ (senão, a pasta da página)
let raiz = path.dirname(pagina);
for (let d = raiz; ; d = path.dirname(d)) {
  if (fs.existsSync(path.join(d, '.pagesfront'))) { raiz = d; break; }
  if (path.dirname(d) === d) break;
}
const relPag = path.relative(raiz, pagina).split(path.sep).join('/');
const nomePag = relPag === 'index.html' ? 'com' : relPag.replace(/\/index\.html$/, '').replace(/\.html$/, '').replace(/[\/]/g, '-');
saida = path.resolve(saida || path.join(raiz, '.pagesfront', 'capturas', nomePag));

function acharNavegador() {
  const c = [process.env.CHROME_PATH];
  if (process.platform === 'win32') {
    for (const b of [process.env.PROGRAMFILES, process.env['PROGRAMFILES(X86)'], process.env.LOCALAPPDATA]) {
      if (b) c.push(path.join(b, 'Google/Chrome/Application/chrome.exe'), path.join(b, 'Microsoft/Edge/Application/msedge.exe'));
    }
  } else if (process.platform === 'darwin') {
    c.push('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge', '/Applications/Chromium.app/Contents/MacOS/Chromium');
  } else {
    c.push('/usr/bin/google-chrome', '/usr/bin/google-chrome-stable', '/usr/bin/chromium', '/usr/bin/chromium-browser', '/usr/bin/microsoft-edge', '/snap/bin/chromium');
  }
  return c.find((p) => p && fs.existsSync(p));
}

class CDP {
  constructor(url) { this.ws = new WebSocket(url); this.id = 0; this.pend = new Map(); this.ouvintes = []; }
  abrir() {
    return new Promise((res, rej) => {
      this.ws.onopen = res;
      this.ws.onerror = (e) => rej(e.error || new Error('falha no WebSocket'));
      this.ws.onmessage = (ev) => {
        const msg = JSON.parse(typeof ev.data === 'string' ? ev.data : ev.data.toString());
        if (msg.id && this.pend.has(msg.id)) {
          const { res: ok, rej: nok } = this.pend.get(msg.id);
          this.pend.delete(msg.id);
          msg.error ? nok(new Error(msg.error.message)) : ok(msg.result);
        } else if (msg.method) for (const o of this.ouvintes) o(msg);
      };
    });
  }
  send(method, params = {}, sessionId) {
    const id = ++this.id;
    this.ws.send(JSON.stringify({ id, method, params, ...(sessionId ? { sessionId } : {}) }));
    return new Promise((res, rej) => this.pend.set(id, { res, rej }));
  }
  esperar(method, sessionId, ms = 60000) {
    return new Promise((res, rej) => {
      const t = setTimeout(() => { tirar(); rej(new Error(`tempo esgotado esperando ${method}`)); }, ms);
      const o = (m) => { if (m.method === method && m.sessionId === sessionId) { clearTimeout(t); tirar(); res(m.params); } };
      const tirar = () => { this.ouvintes = this.ouvintes.filter((x) => x !== o); };
      this.ouvintes.push(o);
    });
  }
}

const BLOCOS_JS = `(() => {
  const util = ['pd', 'center', 'container'];
  const out = [];
  const push = (el) => {
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.position === 'fixed') return;
    const r = el.getBoundingClientRect();
    if (r.height < 4) return;
    const cls = typeof el.className === 'string' ? el.className.trim().split(/\\s+/).filter((c) => c && !util.includes(c))[0] : '';
    out.push({ nome: cls || el.tagName.toLowerCase(), y: Math.round(r.top + scrollY), h: Math.round(r.height) });
  };
  for (const el of document.body.children) {
    if (['SCRIPT', 'STYLE', 'NOSCRIPT', 'LINK', 'TEMPLATE'].includes(el.tagName)) continue;
    if (el.tagName === 'MAIN') [...el.children].forEach(push); else push(el);
  }
  return { blocos: out, altura: document.documentElement.scrollHeight, largura: document.documentElement.clientWidth };
})()`;

const OVERFLOW_JS = `(() => {
  const W = document.documentElement.clientWidth;
  const sw = Math.max(document.documentElement.scrollWidth, document.body.scrollWidth);
  if (sw <= W + 1) return { overflow: false };
  const caminho = (el) => { const p = []; for (let e = el; e && e !== document.body && p.length < 4; e = e.parentElement) { const c = typeof e.className === 'string' && e.className.trim() ? '.' + e.className.trim().split(/\\s+/)[0] : ''; p.unshift(e.tagName.toLowerCase() + c); } return p.join(' > '); };
  const recortado = (el) => { for (let e = el.parentElement; e && e !== document.body; e = e.parentElement) { const o = getComputedStyle(e).overflowX; if (o !== 'visible') return true; } return false; };
  const els = [];
  for (const el of document.querySelectorAll('body *')) {
    const r = el.getBoundingClientRect();
    if (!r.width || (r.right <= W + 1 && r.left >= -1)) continue;
    if (getComputedStyle(el).position === 'fixed' || recortado(el)) continue;
    els.push(caminho(el) + ' (' + Math.round(r.left) + 'px → ' + Math.round(r.right) + 'px)');
    if (els.length >= 8) break;
  }
  return { overflow: true, scrollWidth: sw, largura: W, els };
})()`;

const navegador = acharNavegador();
if (!navegador) { console.error('Chrome/Edge não encontrado. Instale um deles ou defina CHROME_PATH.'); process.exit(2); }
const userDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pagesfront-nav-'));
const proc = spawn(navegador, [
  '--headless=new', '--remote-debugging-port=0', `--user-data-dir=${userDir}`, '--no-first-run',
  '--no-default-browser-check', '--hide-scrollbars', '--mute-audio', '--disable-extensions', 'about:blank',
], { stdio: ['ignore', 'ignore', 'pipe'] });

const problemas = { js: [], recursos: [], overflow: {} };
const resumo = { pagina: relPag, saida: path.relative(raiz, saida).split(path.sep).join('/'), larguras: {} };
let codigo = 0;

try {
  const wsUrl = await new Promise((res, rej) => {
    let buf = '';
    const t = setTimeout(() => rej(new Error('o navegador não abriu em 30s')), 30000);
    proc.stderr.on('data', (d) => { buf += d; const m = buf.match(/DevTools listening on (ws:\/\/\S+)/); if (m) { clearTimeout(t); res(m[1]); } });
    proc.on('exit', (c) => rej(new Error(`o navegador fechou (código ${c})`)));
  });
  const cdp = new CDP(wsUrl);
  await cdp.abrir();
  const { targetId } = await cdp.send('Target.createTarget', { url: 'about:blank' });
  const { sessionId } = await cdp.send('Target.attachToTarget', { targetId, flatten: true });
  const S = (m, p) => cdp.send(m, p, sessionId);
  const urls = new Map();
  cdp.ouvintes.push((m) => {
    if (m.sessionId !== sessionId) return;
    const p = m.params;
    if (m.method === 'Runtime.exceptionThrown') problemas.js.push(p.exceptionDetails.exception?.description?.split('\n')[0] || p.exceptionDetails.text);
    if (m.method === 'Runtime.consoleAPICalled' && p.type === 'error') problemas.js.push('console.error: ' + p.args.map((a) => a.value ?? a.description ?? '').join(' '));
    if (m.method === 'Network.requestWillBeSent') urls.set(p.requestId, p.request.url);
    if (m.method === 'Network.loadingFailed' && !p.canceled) problemas.recursos.push(`${urls.get(p.requestId) || '?'} (${p.errorText})`);
    if (m.method === 'Network.responseReceived' && p.response.status >= 400) problemas.recursos.push(`${p.response.url} (HTTP ${p.response.status})`);
  });
  await S('Page.enable'); await S('Runtime.enable'); await S('Network.enable');
  const fileUrl = pathToFileURL(pagina).href;

  for (const largura of larguras) {
    const mobile = largura < 768;
    const vh = mobile ? 844 : 900;
    await S('Emulation.setDeviceMetricsOverride', { width: largura, height: vh, deviceScaleFactor: 1, mobile });
    const carregou = cdp.esperar('Page.loadEventFired', sessionId);
    await S('Page.navigate', { url: fileUrl });
    await carregou;
    await S('Runtime.evaluate', { expression: 'document.fonts.ready.then(() => true)', awaitPromise: true });
    // rola a página inteira para disparar lazy-load e animações de entrada
    await S('Runtime.evaluate', {
      expression: `(async () => { const h = document.documentElement.scrollHeight; for (let y = 0; y < h; y += 400) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 50)); } scrollTo(0, 0); await new Promise((r) => setTimeout(r, 700)); return true; })()`,
      awaitPromise: true,
    });
    const info = (await S('Runtime.evaluate', { expression: BLOCOS_JS, returnByValue: true })).result.value;
    const dir = path.join(saida, String(largura));
    fs.rmSync(dir, { recursive: true, force: true });
    fs.mkdirSync(dir, { recursive: true });
    const arquivos = [];
    for (const [i, b] of info.blocos.entries()) {
      const partes = Math.max(1, Math.ceil(b.h / vh));
      for (let k = 0; k < partes; k++) {
        const y = b.y + k * vh;
        const h = Math.min(vh, b.y + b.h - y);
        if (h < 4) continue;
        await S('Runtime.evaluate', { expression: `scrollTo(0, ${y}); new Promise((r) => setTimeout(r, 250))`, awaitPromise: true });
        const shot = await S('Page.captureScreenshot', { format: 'png', clip: { x: 0, y, width: info.largura, height: h, scale: 1 } });
        const nome = `${String(i + 1).padStart(2, '0')}-${b.nome.replace(/[^\w-]/g, '')}${partes > 1 ? `-${'abcdefghijklmnopqrstuvwxyz'[k] || k}` : ''}.png`;
        fs.writeFileSync(path.join(dir, nome), Buffer.from(shot.data, 'base64'));
        arquivos.push(nome);
      }
    }
    // visão geral (reduzida). Seções com 100vh podem sair esticadas aqui; as fatias acima são as fiéis.
    try {
      const escala = Math.min(0.6, 600 / info.largura);
      const shot = await S('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true, clip: { x: 0, y: 0, width: info.largura, height: Math.min(info.altura, 16000), scale: escala } });
      fs.writeFileSync(path.join(saida, `visao-geral-${largura}.png`), Buffer.from(shot.data, 'base64'));
    } catch { /* opcional */ }
    await S('Runtime.evaluate', { expression: 'scrollTo(0, 0)' });
    const of = (await S('Runtime.evaluate', { expression: OVERFLOW_JS, returnByValue: true })).result.value;
    if (of.overflow) problemas.overflow[largura] = of;
    resumo.larguras[largura] = { secoes: info.blocos.map((b) => `${b.nome} (${b.h}px)`), arquivos, alturaTotal: info.altura };
  }
  await cdp.send('Browser.close').catch(() => {});
} catch (e) {
  console.error('Falha ao capturar:', e.message);
  codigo = 2;
} finally {
  setTimeout(() => { try { proc.kill(); } catch { /* ok */ } }, 500);
}

if (codigo !== 2) {
  problemas.js = [...new Set(problemas.js)];
  problemas.recursos = [...new Set(problemas.recursos)];
  resumo.problemas = problemas;
  fs.mkdirSync(saida, { recursive: true });
  fs.writeFileSync(path.join(saida, 'resumo.json'), JSON.stringify(resumo, null, 2));
  console.log(`CAPTURAS — ${relPag}\nPasta: ${saida}\n`);
  for (const [l, r] of Object.entries(resumo.larguras)) {
    console.log(`${l}px — ${r.secoes.length} seções, altura ${r.alturaTotal}px:`);
    for (const a of r.arquivos) console.log(`  ${l}/${a}`);
  }
  console.log('\nErros de JavaScript:', problemas.js.length ? '\n  - ' + problemas.js.join('\n  - ') : 'nenhum');
  console.log('Recursos que não carregaram:', problemas.recursos.length ? '\n  - ' + problemas.recursos.join('\n  - ') : 'nenhum');
  const ofs = Object.entries(problemas.overflow);
  console.log('Overflow horizontal:', ofs.length ? '' : 'nenhum');
  for (const [l, o] of ofs) console.log(`  ${l}px: página tem ${o.scrollWidth}px de largura (tela ${o.largura}px). Culpados:\n    - ${o.els.join('\n    - ') || '(não identificado)'}`);
  if (problemas.js.length || problemas.recursos.length || ofs.length) codigo = 1;
  console.log(codigo ? '\nCorrija os problemas acima e capture de novo.' : '\nSem problemas técnicos. Agora compare cada print com o frame correspondente do Figma.');
}
await new Promise((r) => setTimeout(r, 800));
try { fs.rmSync(userDir, { recursive: true, force: true, maxRetries: 5, retryDelay: 300 }); } catch { /* temp */ }
process.exit(codigo);
