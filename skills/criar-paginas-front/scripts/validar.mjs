#!/usr/bin/env node
/**
 * validar.mjs — validador da skill criar-paginas-front
 *
 * Transforma as regras da skill em checagens automáticas. A entrega só está
 * pronta quando este script termina com 0 ERROS.
 *
 * Uso (rode da raiz do projeto ou passe a raiz como argumento):
 *   node validar.mjs [raiz] --pre           pré-checagem das entradas (fase 0)
 *   node validar.mjs [raiz]                 validação completa (todas as páginas)
 *   node validar.mjs [raiz] --so dtc-b      só um grupo: raiz | dtc-b | thank | vsl | bonus | rodapes
 *   node validar.mjs [raiz] --so index.html só uma página (+ a pasta assets/ dela)
 *   node validar.mjs [raiz] --compilar      compila style.scss -> style.css antes de validar
 *   node validar.mjs [raiz] --json          saída em JSON
 *
 * Código de saída 1 = há ERROS. AVISOS não bloqueiam, mas cada um precisa ser
 * resolvido ou explicado no relatório final.
 * Sem dependências: Node 18+. Para SCSS usa `sass` local/global ou `npx sass`.
 */
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import os from 'node:os';

// ---------------------------------------------------------------- argumentos
const argv = process.argv.slice(2);
const opts = { pre: false, compilar: false, json: false, so: null, raiz: '.' };
for (let i = 0; i < argv.length; i++) {
  const a = argv[i];
  if (a === '--pre') opts.pre = true;
  else if (a === '--compilar') opts.compilar = true;
  else if (a === '--json') opts.json = true;
  else if (a === '--so') opts.so = argv[++i];
  else if (a.startsWith('--so=')) opts.so = a.slice(5);
  else if (a === '-h' || a === '--help') {
    console.log(fs.readFileSync(new URL(import.meta.url), 'utf8').split('*/')[0]);
    process.exit(0);
  } else opts.raiz = a;
}
const ROOT = path.resolve(opts.raiz);
const WIN = process.platform === 'win32';

// ---------------------------------------------------------------- constantes
const FOOTERS = ['contact', 'terms', 'privacy', 'reference', 'shipping', 'refund', 'disclaimer'].map((n) => `${n}.html`);
const FIGMA_PAGES = ['index.html', 'dtc-b/index.html'];
const ADAPTED_PAGES = ['thank/index.html', 'vsl/index.html', 'bonus/index.html'];
const IGNORE_DIRS = new Set(['.git', 'node_modules', '.pagesfront', '.claude', '.vscode', '.idea']);
const IMG_EXT = new Set(['.png', '.jpg', '.jpeg', '.webp', '.gif', '.svg', '.avif', '.ico', '.bmp']);
const ASSET_EXT = new Set([...IMG_EXT, '.woff', '.woff2', '.ttf', '.otf', '.eot', '.pdf', '.mp4', '.webm', '.mov', '.mp3', '.css', '.js', '.zip']);
const JUNK_FILES = new Set(['.ds_store', 'thumbs.db', 'desktop.ini']);
const TEXT_EXT = new Set(['.html', '.htm', '.css', '.scss', '.sass', '.js', '.mjs', '.json', '.svg', '.txt', '.xml']);
const MAX_IMG = 1_000_000; // 1MB
const MAX_FAVICON = 100_000;
const NEUTRAL = new Set(['#ffffff', '#000000']);
const UTIL_CLASSES = new Set(['pd', 'center', 'container']);
const SECTION_TAGS = new Set(['header', 'footer', 'nav', 'main', 'aside']);
const SKIP_TAGS = new Set(['script', 'noscript', 'link', 'style', 'template', 'meta']);
const CDN_HOSTS = [
  'fonts.googleapis.com', 'fonts.gstatic.com', 'cdn.jsdelivr.net', 'unpkg.com', 'cdnjs.cloudflare.com',
  'cdn.tailwindcss.com', 'code.jquery.com', 'use.fontawesome.com', 'kit.fontawesome.com', 'www.w3.org',
];
const CHECKOUT_RE = /cartpanda|clickbank|clkbank|hotmart|kiwify|buygoods|digistore|checkout|stripe|paypal|samcart|thrivecart|upsell|order\./i;
const TRACKING = [
  ['Meta/Facebook Pixel', /connect\.facebook\.net|fbq\s*\(|facebook\.com\/tr\b/gi],
  ['Google Tag Manager/Analytics', /googletagmanager\.com|google-analytics\.com|gtag\s*\(|\bGTM-[A-Z0-9]{4,}|\bdataLayer\b/g],
  ['TikTok Pixel', /analytics\.tiktok\.com|\bttq\.(?:load|page|track)/gi],
  ['Pinterest Tag', /pintrk\s*\(|s\.pinimg\.com\/ct/gi],
  ['Microsoft Clarity', /clarity\.ms/gi],
  ['Hotjar', /hotjar\.com/gi],
  ['Snapchat Pixel', /sc-static\.net|snaptr\s*\(/gi],
  ['Taboola/Outbrain', /taboola|outbrain/gi],
  ['Kwai Pixel', /kwai/gi],
  ['Utmify', /utmify/gi],
  ['Bing UET', /bat\.bing\.com/gi],
  ['Twitter/X Pixel', /static\.ads-twitter\.com|twq\s*\(/gi],
];
const LEFTOVERS = [
  ['URL temporária do MCP do Figma (expira) — baixe o asset para assets/img/', /localhost:3845|127\.0\.0\.1:3845|figma\.com\/api\/mcp|\/api\/mcp\/asset/gi],
  ['sobra de React/JSX (className / style={{)', /\bclassName\s*=|style=\{\{/g],
  ['token de template não preenchido', /\{\{\s*[A-Z_]+\s*\}\}/g],
  ['texto de exemplo (lorem ipsum)', /lorem ipsum/gi],
];

// ---------------------------------------------------------------- utilidades
const findings = [];
const rel = (p) => path.relative(ROOT, p).split(path.sep).join('/') || '.';
const normPath = (p) => (WIN ? path.resolve(p).toLowerCase() : path.resolve(p));
function add(nivel, arquivo, codigo, msg, linha) {
  findings.push({ nivel, arquivo: arquivo ? rel(arquivo) : '(projeto)', codigo, msg, linha: linha || null });
}
const erro = (...a) => add('erro', ...a);
const aviso = (...a) => add('aviso', ...a);

const readCache = new Map();
function read(p) {
  if (!readCache.has(p)) {
    try { readCache.set(p, fs.readFileSync(p, 'utf8')); } catch { readCache.set(p, ''); }
  }
  return readCache.get(p);
}
const lineCache = new Map();
function lineOf(file, idx) {
  let starts = lineCache.get(file);
  if (!starts) {
    const t = read(file);
    starts = [0];
    for (let i = 0; i < t.length; i++) if (t.charCodeAt(i) === 10) starts.push(i + 1);
    lineCache.set(file, starts);
  }
  let lo = 0, hi = starts.length - 1;
  while (lo < hi) { const mid = (lo + hi + 1) >> 1; if (starts[mid] <= idx) lo = mid; else hi = mid - 1; }
  return lo + 1;
}
function* walk(dir) {
  let ents;
  try { ents = fs.readdirSync(dir, { withFileTypes: true }); } catch { return; }
  for (const e of ents) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) { if (!IGNORE_DIRS.has(e.name)) yield* walk(p); } else if (e.isFile()) yield p;
  }
}
const exists = (p) => { try { return fs.statSync(p); } catch { return null; } };
function groupOf(abs) {
  const seg = rel(abs).split('/');
  if (seg.length > 1 && exists(path.join(ROOT, seg[0], 'index.html'))) return seg[0];
  return 'raiz';
}
// --so <grupo>  (raiz | dtc-b | thank | vsl | bonus | rodapes)  ou  --so <arquivo.html> (a página + a pasta assets/ dela)
const soArquivo = opts.so && /\.html?$/i.test(opts.so) ? path.resolve(ROOT, opts.so) : null;
const soAssets = soArquivo ? normPath(path.join(path.dirname(soArquivo), 'assets')) + path.sep : null;
function inScope(abs) {
  if (!opts.so) return true;
  if (soArquivo) { const a = normPath(abs); return a === normPath(soArquivo) || a.startsWith(soAssets); }
  if (opts.so === 'rodapes') return FOOTERS.includes(rel(abs));
  return groupOf(abs) === opts.so;
}
const ext = (p) => path.extname(p).toLowerCase();
function normHex(h) {
  h = h.toLowerCase();
  if (/^#[0-9a-f]{3,4}$/.test(h)) h = '#' + [...h.slice(1, 4)].map((c) => c + c).join('');
  if (h.length === 9) h = h.slice(0, 7);
  return h;
}
function deepStrings(o, out = []) {
  if (typeof o === 'string') out.push(o);
  else if (Array.isArray(o)) o.forEach((v) => deepStrings(v, out));
  else if (o && typeof o === 'object') Object.values(o).forEach((v) => deepStrings(v, out));
  return out;
}
const escRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const isExternal = (u) => /^(?:https?:)?\/\//i.test(u);
const isLocalRef = (u) => u && u.trim() && !/^(?:[a-z][a-z0-9+.-]*:|\/\/|#)/i.test(u.trim()) && !/[{}$]/.test(u);
function hostOf(u) { try { return new URL(u.startsWith('//') ? 'https:' + u : u).host.toLowerCase(); } catch { return ''; } }
function resolveRef(u, baseDir) {
  let p = u.trim().split('#')[0].split('?')[0];
  try { p = decodeURIComponent(p); } catch { /* mantém */ }
  if (!p) return null;
  return p.startsWith('/') ? path.join(ROOT, p) : path.resolve(baseDir, p);
}
function refExists(abs) {
  const st = exists(abs);
  if (!st) return false;
  return st.isFile() || !!exists(path.join(abs, 'index.html'));
}

// ---------------------------------------------------------------- parser HTML mínimo
const VOID = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr']);
const RAW = new Set(['script', 'style', 'textarea']);
function parseAttrs(s) {
  const attrs = {};
  const re = /([^\s"'>\/=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;
  let m;
  while ((m = re.exec(s))) attrs[m[1].toLowerCase()] = m[2] ?? m[3] ?? m[4] ?? '';
  return attrs;
}
function parseHTML(src) {
  const root = { tag: '#root', attrs: {}, children: [], start: 0 };
  const stack = [root];
  const re = /<!--[\s\S]*?-->|<!doctype[^>]*>|<(\/?)([a-zA-Z][\w:-]*)((?:\s+[^\s"'>\/=]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s"'=<>`]+))?)*)\s*(\/?)>/gi;
  let m;
  while ((m = re.exec(src))) {
    if (!m[2]) continue;
    const tag = m[2].toLowerCase();
    if (m[1] === '/') {
      for (let i = stack.length - 1; i > 0; i--) {
        if (stack[i].tag === tag) { stack[i].end = m.index + m[0].length; stack.length = i; break; }
      }
      continue;
    }
    const parent = stack[stack.length - 1];
    const el = { tag, attrs: parseAttrs(m[3] || ''), children: [], start: m.index, parent };
    parent.children.push(el);
    if (VOID.has(tag) || m[4] === '/') continue;
    if (RAW.has(tag)) {
      const endRe = new RegExp(`</${tag}\\s*>`, 'ig');
      endRe.lastIndex = re.lastIndex;
      const em = endRe.exec(src);
      el.text = src.slice(re.lastIndex, em ? em.index : src.length);
      el.textStart = re.lastIndex;
      re.lastIndex = em ? em.index + em[0].length : src.length;
      continue;
    }
    stack.push(el);
  }
  return root;
}
function walkEls(node, fn) { for (const c of node.children) { fn(c); walkEls(c, fn); } }
function findFirst(node, tag) { let r = null; walkEls(node, (e) => { if (!r && e.tag === tag) r = e; }); return r; }
const classesOf = (el) => (el.attrs.class || '').trim().split(/\s+/).filter(Boolean);
function elKey(el) {
  if (SECTION_TAGS.has(el.tag)) return el.tag;
  return classesOf(el).find((c) => !UTIL_CLASSES.has(c)) || el.tag;
}
const showKey = (k) => (SECTION_TAGS.has(k) ? `<${k}>` : `.${k}`);

// ---------------------------------------------------------------- SCSS
const blank = (s) => s.replace(/[^\n]/g, ' ');
function stripScss(src) {
  let out = '';
  let i = 0;
  const n = src.length;
  while (i < n) {
    const c = src[i], d = src[i + 1];
    if ((c === 'u' || c === 'U') && /^url\(/i.test(src.slice(i, i + 4))) {
      const j = src.indexOf(')', i);
      const e = j < 0 ? n : j + 1;
      out += 'url(' + blank(src.slice(i + 4, e - 1)) + ')';
      i = e; continue;
    }
    if (c === '/' && d === '*') { const j = src.indexOf('*/', i + 2); const e = j < 0 ? n : j + 2; out += blank(src.slice(i, e)); i = e; continue; }
    if (c === '/' && d === '/') { const j = src.indexOf('\n', i); const e = j < 0 ? n : j; out += blank(src.slice(i, e)); i = e; continue; }
    if (c === '"' || c === "'") {
      let j = i + 1;
      while (j < n && src[j] !== c && src[j] !== '\n') { if (src[j] === '\\') j++; j++; }
      const e = Math.min(n, j + 1);
      out += blank(src.slice(i, e)); i = e; continue;
    }
    out += c; i++;
  }
  return out;
}
function topLevelBlocks(s) {
  const blocks = [];
  let depth = 0, segStart = 0;
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (ch === '#' && s[i + 1] === '{') { const j = s.indexOf('}', i); if (j > 0) { i = j; continue; } }
    if (ch === '{') {
      if (depth === 0) {
        const raw = s.slice(segStart, i);
        const lead = raw.length - raw.trimStart().length;
        blocks.push({ selector: raw.trim().replace(/\s+/g, ' '), index: segStart + lead });
      }
      depth++;
    } else if (ch === '}') { depth = Math.max(0, depth - 1); if (depth === 0) segStart = i + 1; }
    else if (ch === ';' && depth === 0) segStart = i + 1;
  }
  return blocks;
}
function selectorKeys(sel) {
  return sel.split(',').map((s) => s.trim()).filter(Boolean).map((s) => {
    const first = s.split(/[\s>+~]/)[0];
    const m = first.match(/^\.([A-Za-z_-][\w-]*)/);
    if (m) return m[1];
    const t = first.match(/^([a-zA-Z][\w-]*)/);
    return t ? t[1].toLowerCase() : first;
  });
}

let sassCmd;
function findSass() {
  if (sassCmd !== undefined) return sassCmd;
  const cands = [];
  // projeto > cache do preparar.mjs (~/.cache/pagesfront) > sass global > npx (precisa de rede).
  // O sass.js é chamado direto com este Node (não depende de `node` no PATH nem de shims .cmd).
  for (const base of [ROOT, path.join(os.homedir(), '.cache', 'pagesfront')]) {
    const p = path.join(base, 'node_modules', 'sass', 'sass.js');
    if (exists(p)) cands.push([process.execPath, [p]]);
  }
  cands.push(['sass', []], ['npx', ['--yes', 'sass@1']]);
  for (const [cmd, pre] of cands) {
    const r = run(cmd, [...pre, '--version']);
    if (r.status === 0) return (sassCmd = [cmd, pre]);
  }
  return (sassCmd = null);
}
function run(cmd, args) {
  const o = { encoding: 'utf8', timeout: 180000 };
  return WIN
    ? spawnSync([cmd, ...args].map((a) => (/[\s"]/.test(a) ? `"${a}"` : a)).join(' '), { ...o, shell: true })
    : spawnSync(cmd, args, o);
}
function compileSass(input, output, withMap) {
  const s = findSass();
  if (!s) return { ok: null, out: 'sass indisponível' };
  const [cmd, pre] = s;
  const r = run(cmd, [...pre, ...(withMap ? [] : ['--no-source-map']), input, output]);
  const out = `${r.stderr || ''}${r.stdout || ''}`.trim();
  if (r.status === 0) return { ok: true, out };
  if (r.status === 65 || /^Error: /m.test(out)) return { ok: false, out };
  return { ok: null, out };
}

// ---------------------------------------------------------------- briefing
const briefPath = path.join(ROOT, '.pagesfront', 'produto.json');
let brief = null;
if (exists(briefPath)) {
  try { brief = JSON.parse(read(briefPath)); } catch (e) { erro(briefPath, 'B0', `produto.json inválido: ${e.message}`); }
}
const toArr = (v) => (Array.isArray(v) ? v : v ? [v] : []);
const novoNome = brief && typeof brief.produto === 'string' ? brief.produto.trim() : '';
const nomesAntigos = toArr(brief?.produto_antigo).filter((s) => typeof s === 'string' && s.trim().length >= 3);
const paletaNova = deepStrings(brief?.paleta || {}).filter((s) => /^#[0-9a-f]{3,8}$/i.test(s)).map(normHex);
const paletaAntiga = toArr(brief?.paleta_antiga).filter((s) => /^#[0-9a-f]{3,8}$/i.test(s)).map(normHex)
  .filter((h) => !NEUTRAL.has(h) && !paletaNova.includes(h));
const permitidos = toArr(brief?.scripts_permitidos).map((s) => String(s).toLowerCase());
const declarados = deepStrings(brief || {}).filter((s) => /^https?:\/\//i.test(s)).map((s) => s.toLowerCase().replace(/\/+$/, ''));
const isDeclared = (u) => {
  const n = u.toLowerCase().replace(/\/+$/, '');
  return declarados.some((d) => n === d || n.startsWith(d) || n.split('?')[0] === d.split('?')[0]);
};

// ---------------------------------------------------------------- arquivos
const ALL = [...walk(ROOT)];
const htmlFiles = ALL.filter((f) => ['.html', '.htm'].includes(ext(f)));
function kindOf(abs) {
  const r = rel(abs);
  if (FIGMA_PAGES.includes(r)) return 'figma';
  if (ADAPTED_PAGES.includes(r)) return 'adaptada';
  if (FOOTERS.includes(r)) return 'rodape';
  return 'outra';
}

// ================================================================ PRÉ-CHECAGEM
if (opts.pre) {
  const linhas = [];
  let faltando = 0;
  const check = (r, obrig, nota = '') => {
    const ok = !!exists(path.join(ROOT, r));
    if (!ok && obrig) faltando++;
    linhas.push(`  ${ok ? '[ok]   ' : obrig ? '[FALTA]' : '[--]   '} ${r}${nota ? '  — ' + nota : ''}`);
  };
  console.log(`PRÉ-CHECAGEM — ${ROOT}\n\nReferências obrigatórias (mesmo nicho):`);
  ADAPTED_PAGES.forEach((r) => check(r, true));
  FOOTERS.forEach((r) => check(r, true));
  console.log(linhas.splice(0).join('\n'));
  console.log('\nOpcionais:');
  const temDtcb = !!exists(path.join(ROOT, 'dtc-b/index.html'));
  check('dtc-b/index.html', false, temDtcb ? 'existe → modo B (referência + Figma)' : 'não existe → modo A (só Figma)');
  const idx = path.join(ROOT, 'index.html');
  const idxSt = exists(idx);
  check('index.html', false, idxSt ? (idxSt.size < 1500 ? 'esqueleto vazio (ok, será preenchido do Figma)' : `ATENÇÃO: já tem conteúdo (${idxSt.size} bytes) e será substituído`) : 'será criado do Figma');
  console.log(linhas.join('\n'));

  // pistas do produto antigo para preencher o briefing
  const refFiles = ALL.filter((f) => {
    const r = rel(f);
    return FOOTERS.includes(r) || ['thank/', 'vsl/', 'bonus/', 'dtc-b/'].some((p) => r.startsWith(p));
  });
  const titulos = new Set(), paletas = new Set(), cores = new Map(), rastreios = new Map();
  for (const f of refFiles) {
    if (!['.html', '.css', '.scss', '.js'].includes(ext(f)) || f.includes('.min.')) continue;
    const t = read(f);
    if (ext(f) === '.html') {
      const m = t.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
      if (m && m[1].trim()) titulos.add(m[1].trim().replace(/\s+/g, ' '));
    }
    for (const m of t.matchAll(/\/\*\s*([^*\n]{2,40}?)\s+palette\s*\*\//gi)) paletas.add(m[1].trim());
    for (const m of t.matchAll(/#[0-9a-fA-F]{6}\b|#[0-9a-fA-F]{3}\b/g)) {
      const h = normHex(m[0]);
      if (!NEUTRAL.has(h)) cores.set(h, (cores.get(h) || 0) + 1);
    }
    for (const [nome, re] of TRACKING) { re.lastIndex = 0; if (re.test(t)) { if (!rastreios.has(nome)) rastreios.set(nome, new Set()); rastreios.get(nome).add(rel(f)); } }
  }
  console.log('\nPistas do produto ANTIGO (use para preencher produto_antigo e paleta_antiga no briefing):');
  console.log(`  <title> encontrados: ${[...titulos].slice(0, 12).map((s) => `"${s}"`).join(', ') || '(nenhum)'}`);
  console.log(`  rótulos de paleta:   ${[...paletas].join(', ') || '(nenhum)'}`);
  console.log(`  cores mais usadas:   ${[...cores].sort((a, b) => b[1] - a[1]).slice(0, 14).map(([h, n]) => `${h} (${n}x)`).join(', ') || '(nenhuma)'}`);
  if (rastreios.size) {
    console.log('\nScripts de rastreio/plataforma nas referências (remover na adaptação):');
    for (const [nome, fs_] of rastreios) console.log(`  - ${nome}: ${[...fs_].join(', ')}`);
  }
  console.log(`\nResultado: ${faltando ? `FALTAM ${faltando} arquivo(s) obrigatório(s) — PARE e peça ao usuário.` : 'referências completas.'}`);
  process.exit(faltando ? 1 : 0);
}

// ================================================================ VALIDAÇÃO
if (!brief) erro(null, 'B1', 'briefing ausente: crie .pagesfront/produto.json (fase 1) antes de validar');
else {
  if (!novoNome) erro(briefPath, 'B2', 'briefing sem "produto" (nome do produto novo)');
  if (!nomesAntigos.length) aviso(briefPath, 'B3', 'briefing sem "produto_antigo": a busca por resíduos do produto antigo fica desligada');
  if (!paletaNova.length) erro(briefPath, 'B4', 'briefing sem "paleta" em hex');
}

// páginas obrigatórias (só na validação completa)
if (!opts.so) {
  for (const r of [...FIGMA_PAGES, ...ADAPTED_PAGES, ...FOOTERS]) {
    if (!exists(path.join(ROOT, r))) erro(path.join(ROOT, r), 'P0', 'página obrigatória não existe');
  }
}

// compilação de SCSS (antes de tudo, para os checks de style.css enxergarem o arquivo novo)
const scssFiles = ALL.filter((f) => ext(f) === '.scss' && !path.basename(f).startsWith('_') && inScope(f));
for (const scss of scssFiles) {
  const css = scss.replace(/\.scss$/i, '.css');
  const stS = exists(scss), stC = exists(css);
  const desatualizado = !stC || stS.mtimeMs > stC.mtimeMs;
  if (opts.compilar && desatualizado) {
    const r = compileSass(scss, css, true);
    if (r.ok === false) erro(scss, 'S0', `SCSS não compila:\n      ${r.out.split('\n').slice(0, 6).join('\n      ')}`);
    else if (r.ok === null) erro(css, 'S1', `style.css desatualizado e não foi possível rodar o sass (${r.out.split('\n')[0]}) — rode o preparar.mjs ou compile manualmente`);
    else readCache.delete(css);
  } else {
    const tmp = path.join(os.tmpdir(), `pagesfront-${process.pid}-${path.basename(scss)}.css`);
    const r = compileSass(scss, tmp, false);
    if (r.ok === false) erro(scss, 'S0', `SCSS não compila:\n      ${r.out.split('\n').slice(0, 6).join('\n      ')}`);
    else if (r.ok === null) aviso(scss, 'S0', `não foi possível rodar o sass para checar a compilação (${r.out.split('\n')[0]})`);
    try { fs.unlinkSync(tmp); } catch { /* ok */ }
    if (desatualizado) erro(css, 'S1', `${stC ? 'style.css desatualizado em relação ao style.scss' : 'style.css não existe'} — rode o validador com --compilar`);
  }
}

// ---------------------------------------------------------------- coleta de referências
const referenced = new Set();
const referencedBase = new Set();
const jsIncludedBy = new Map(); // js abs -> [html dir]
function markRef(abs) { referenced.add(normPath(abs)); referencedBase.add(path.basename(abs).toLowerCase()); }
const URL_RE = /url\(\s*(['"]?)([^'")]+?)\1\s*\)/g;

const pages = htmlFiles.filter(inScope);
const parsed = new Map();
for (const f of htmlFiles) parsed.set(f, parseHTML(read(f)));

// referências a partir de TODO HTML (mesmo fora do escopo) para o check de órfãos
for (const f of htmlFiles) {
  const dir = path.dirname(f);
  const tree = parsed.get(f);
  const text = read(f);
  walkEls(tree, (el) => {
    const urls = [];
    for (const a of ['src', 'href', 'poster', 'data-src', 'data-bg', 'data-background', 'xlink:href']) if (el.attrs[a]) urls.push([el.attrs[a], a]);
    for (const a of ['srcset', 'data-srcset']) if (el.attrs[a]) for (const part of el.attrs[a].split(',')) { const u = part.trim().split(/\s+/)[0]; if (u) urls.push([u, a]); }
    if (el.attrs.style) for (const m of el.attrs.style.matchAll(URL_RE)) urls.push([m[2], 'style']);
    if (el.tag === 'style' && el.text) for (const m of el.text.matchAll(URL_RE)) urls.push([m[2], 'style']);
    for (const [u, attr] of urls) {
      if (!isLocalRef(u)) continue;
      const abs = resolveRef(u, dir);
      if (!abs) continue;
      markRef(abs);
      if (el.tag === 'script' && attr === 'src') {
        const k = normPath(abs);
        if (!jsIncludedBy.has(k)) jsIncludedBy.set(k, []);
        jsIncludedBy.get(k).push(dir);
      }
      if (inScope(f) && !refExists(abs)) erro(f, 'R1', `referência quebrada: ${attr}="${u}"`, lineOf(f, el.start));
    }
  });
  void text;
}
// CSS/SCSS
for (const f of ALL.filter((x) => ['.css', '.scss'].includes(ext(x)))) {
  const isCompiledTwin = ext(f) === '.css' && exists(f.replace(/\.css$/i, '.scss'));
  const t = read(f);
  for (const m of t.matchAll(URL_RE)) {
    const u = m[2];
    if (!isLocalRef(u) || u.includes('#{')) continue;
    const abs = resolveRef(u, path.dirname(f));
    if (!abs) continue;
    markRef(abs);
    if (!isCompiledTwin && inScope(f) && !refExists(abs)) erro(f, 'R1', `referência quebrada: url(${u})`, lineOf(f, m.index));
  }
  for (const m of t.matchAll(/@(?:import|use|forward)\s+['"]([^'"]+)['"]/g)) markRef(resolveRef(m[1], path.dirname(f)));
}
// pares style.css <-> style.scss <-> .map
for (const f of ALL) {
  if (ext(f) === '.css' && referenced.has(normPath(f))) { markRef(f.replace(/\.css$/i, '.scss')); markRef(f + '.map'); }
}
// strings de asset dentro de JS
const ASSET_STR = /['"`]([^'"`\s]+\.(?:png|jpe?g|webp|gif|svg|avif|mp4|webm|pdf|ico))['"`]/gi;
for (const f of ALL.filter((x) => ext(x) === '.js' && !x.includes('.min.'))) {
  const t = read(f);
  const dirs = jsIncludedBy.get(normPath(f)) || [path.dirname(f)];
  for (const m of t.matchAll(ASSET_STR)) {
    if (!isLocalRef(m[1])) continue;
    const cands = dirs.map((d) => resolveRef(m[1], d)).filter(Boolean);
    cands.forEach(markRef);
    if (inScope(f) && !cands.some(refExists)) aviso(f, 'R2', `caminho de asset no JS não encontrado: "${m[1]}"`, lineOf(f, m.index));
  }
}

// ---------------------------------------------------------------- checks por página HTML
function scanPatterns(f, list, nivel, codigo, prefix = '', max = 3) {
  const t = read(f);
  for (const [nome, re] of list) {
    re.lastIndex = 0;
    let n = 0, m;
    while ((m = re.exec(t)) && n < max) {
      if (permitidos.some((p) => nome.toLowerCase().includes(p) || m[0].toLowerCase().includes(p))) break;
      add(nivel, f, codigo, `${prefix}${nome}: "${m[0]}"`, lineOf(f, m.index));
      n++;
    }
  }
}

for (const f of pages) {
  const kind = kindOf(f);
  const t = read(f);
  const tree = parsed.get(f);
  const all = [];
  walkEls(tree, (e) => all.push(e));
  const L = (el) => lineOf(f, el.start);
  const isFigma = kind === 'figma';

  // viewport, favicon, title
  if (!all.some((e) => e.tag === 'meta' && (e.attrs.name || '').toLowerCase() === 'viewport'))
    add(isFigma ? 'erro' : 'aviso', f, 'H1', 'falta <meta name="viewport"> (responsivo)');
  if (!all.some((e) => e.tag === 'link' && /(^|\s)icon(\s|$)/i.test(e.attrs.rel || '') && e.attrs.href))
    erro(f, 'H2', 'falta favicon no <head> (<link rel="shortcut icon" href="…/favicon.png">)');
  const title = all.find((e) => e.tag === 'title');
  const titleText = title ? t.slice(title.start, title.end || title.start).replace(/<[^>]+>/g, '').trim() : '';
  if (novoNome && !titleText.toLowerCase().includes(novoNome.toLowerCase()))
    aviso(f, 'H3', `<title> não contém o nome do produto ("${titleText || 'vazio'}")`, title ? L(title) : null);

  // sobras de Figma/React/template/lorem
  scanPatterns(f, LEFTOVERS, 'erro', 'H4');
  // rastreio
  scanPatterns(f, TRACKING, 'erro', 'T1', 'script de rastreio do produto antigo — remova (ou declare em scripts_permitidos): ');

  // scripts/iframes/links externos
  for (const el of all) {
    const u = el.tag === 'a' ? el.attrs.href : (el.tag === 'script' || el.tag === 'iframe') ? el.attrs.src : null;
    if (!u || !isExternal(u)) continue;
    const host = hostOf(u);
    if (CDN_HOSTS.includes(host) || isDeclared(u)) continue;
    if (el.tag === 'a') {
      if (CHECKOUT_RE.test(u)) erro(f, 'T2', `link de checkout não declarado no briefing (provável do produto antigo): ${u}`, L(el));
      else aviso(f, 'T3', `link externo não declarado no briefing: ${u}`, L(el));
    } else aviso(f, 'T3', `${el.tag} de terceiro (${host}) não declarado no briefing — confirme que é do produto novo ou remova`, L(el));
  }

  // âncoras internas
  const ids = new Set(all.map((e) => e.attrs.id).filter(Boolean));
  for (const el of all) {
    if (el.tag !== 'a') continue;
    const h = el.attrs.href || '';
    if (/^#[A-Za-z][\w-]*$/.test(h) && !/PENDENTE/i.test(h) && !ids.has(h.slice(1)))
      add(isFigma ? 'erro' : 'aviso', f, 'H5', `âncora "${h}" não tem destino (id) na página`, L(el));
  }

  // pendências
  for (const m of t.matchAll(/PENDENTE[\w:-]*/g)) aviso(f, 'P1', `pendência a reportar: ${m[0]}`, lineOf(f, m.index));

  if (!isFigma) continue;

  // ------------------------------------------------------------ páginas do Figma (padrão de código)
  const dir = path.dirname(f);
  const scss = path.join(dir, 'assets/css/style.scss');
  const mainJs = path.join(dir, 'assets/js/main.js');
  if (!exists(path.join(dir, 'assets/img'))) erro(f, 'F1', 'falta a pasta assets/img/');
  if (!exists(scss)) erro(f, 'F1', 'falta assets/css/style.scss');
  if (!exists(mainJs)) erro(f, 'F1', 'falta assets/js/main.js');
  const links = all.filter((e) => e.tag === 'link').map((e) => e.attrs.href || '');
  const scripts = all.filter((e) => e.tag === 'script').map((e) => e.attrs.src || '');
  if (links.some((h) => /\.scss(\?|$)/i.test(h))) erro(f, 'F1', 'o HTML aponta para .scss — o navegador precisa do style.css compilado');
  if (!links.some((h) => /assets\/css\/style\.css/i.test(h))) erro(f, 'F1', 'o HTML não carrega assets/css/style.css');
  if (!scripts.some((s) => /assets\/js\/main\.js/i.test(s))) erro(f, 'F1', 'o HTML não carrega assets/js/main.js');
  if (/cdn\.tailwindcss\.com/i.test(t)) erro(f, 'F9', 'página do Figma não pode usar Tailwind — reescreva em SCSS');

  // classes: BEM e Tailwind
  const allClasses = new Set();
  const tw = [];
  const TW_RE = /^(?:-?[mp][trblxy]?-\S+|[wh]-\S+|min-[wh]-\S+|max-[wh]-\S+|gap-\S+|space-[xy]-\S+|text-(?:xs|sm|base|lg|[2-9]?xl|left|center|right|[a-z]+-\d{2,3})|bg-\S+|rounded(?:-\S+)?|font-(?:thin|light|normal|medium|semibold|bold|extrabold|black)|leading-\S+|tracking-\S+|items-\S+|justify-\S+|self-\S+|flex-\S+|grid-cols-\S+|col-span-\S+|inline-flex|inset-\S+|z-\d+|shadow-\S+|border-\S+|overflow-\S+|object-\S+|opacity-\d+|shrink-\S+|basis-\S+|size-\S+)$/;
  for (const el of all) {
    for (const c of classesOf(el)) {
      allClasses.add(c);
      if (c.includes('__') || /[a-z0-9]--[a-z0-9]/i.test(c)) erro(f, 'F2', `classe no padrão BEM: "${c}" — use nomes simples escopados pelo pai`, L(el));
      else if (/[:[\]]/.test(c)) erro(f, 'F9', `classe utilitária (Tailwind) "${c}" — estilize no SCSS`, L(el));
      else if (TW_RE.test(c)) tw.push([c, el]);
    }
  }
  if (tw.length >= 5) erro(f, 'F9', `${tw.length} classes com cara de Tailwind (ex.: ${tw.slice(0, 6).map((x) => x[0]).join(', ')}) — o retorno do Figma é referência, não código final`, L(tw[0][1]));
  else for (const [c, el] of tw) aviso(f, 'F9', `classe com cara de Tailwind: "${c}"`, L(el));
  const inline = all.filter((e) => e.attrs.style !== undefined && e.attrs.style.trim());
  if (inline.length) aviso(f, 'F10', `${inline.length} elemento(s) com style="" inline — mova para o style.scss`, L(inline[0]));
  for (const el of all) if (el.tag === 'img' && el.attrs.alt === undefined) aviso(f, 'F11', `<img> sem alt (${el.attrs.src || ''})`, L(el));

  // <main> só no hero + ordem das seções
  const body = findFirst(tree, 'body') || tree;
  const mains = all.filter((e) => e.tag === 'main');
  if (mains.length !== 1) erro(f, 'F4', mains.length ? `há ${mains.length} <main> — deve haver só um, envolvendo apenas o hero` : 'falta <main> envolvendo o hero');
  else {
    const kids = mains[0].children.filter((c) => !SKIP_TAGS.has(c.tag));
    const naoHero = kids.filter((c) => !classesOf(c).includes('hero'));
    if (!kids.some((c) => classesOf(c).includes('hero'))) erro(f, 'F4', '<main> não contém a seção .hero', L(mains[0]));
    for (const c of naoHero) erro(f, 'F4', `<main> deve envolver só o hero, mas contém ${showKey(elKey(c))}`, L(c));
    if (mains[0].parent !== body) erro(f, 'F4', '<main> deve ser filho direto do <body>', L(mains[0]));
  }
  const htmlKeys = [];
  for (const ch of body.children) {
    if (SKIP_TAGS.has(ch.tag)) continue;
    if (ch.tag === 'main') { htmlKeys.push('main'); for (const c of ch.children) if (!SKIP_TAGS.has(c.tag)) htmlKeys.push(elKey(c)); }
    else htmlKeys.push(elKey(ch));
  }
  if (htmlKeys.filter((k) => !['main', 'div'].includes(k)).length < 3)
    erro(f, 'F0', `a página tem só ${htmlKeys.length} bloco(s) no <body> — parece esqueleto/vazia ou com as seções dentro de um wrapper`);
  const pos = new Map();
  htmlKeys.forEach((k, i) => { if (!pos.has(k) && !['div', 'section'].includes(k)) pos.set(k, i); });

  // SCSS
  if (exists(scss)) {
    const raw = read(scss);
    const s = stripScss(raw);
    for (const m of s.matchAll(/\.[A-Za-z_-][\w-]*(?:__|--)[\w-]*|&(?:__|--)[\w-]+/g))
      erro(scss, 'F3', `seletor no padrão BEM: "${m[0]}"`, lineOf(scss, m.index));
    const blocks = topLevelBlocks(s);
    let maxPos = -1, maxKey = null, secaoVista = false, naoFonte = false;
    const vistos = new Set();
    for (const b of blocks) {
      const sel = b.selector;
      const line = lineOf(scss, b.index);
      if (sel.startsWith('@')) {
        if (/^@media\b/i.test(sel) && !/prefers-reduced-motion|print|prefers-color-scheme/i.test(sel))
          erro(scss, 'F5', `media query solta no nível raiz ("${sel}") — aninhe dentro do bloco que ela modifica`, line);
        if (/^@font-face/i.test(sel) && naoFonte) aviso(scss, 'F6', '@font-face deve vir no topo do arquivo', line);
        if (!/^@font-face/i.test(sel)) naoFonte = true;
        continue;
      }
      naoFonte = true;
      const keys = selectorKeys(sel);
      const sec = keys.filter((k) => pos.has(k));
      if (!sec.length) {
        if (secaoVista) aviso(scss, 'F6', `"${sel}" é global/componente mas está depois das seções — mova para antes de header/hero (ou aninhe na seção)`, line);
        continue;
      }
      secaoVista = true;
      for (const k of sec) {
        const p = pos.get(k);
        if (vistos.has(k)) aviso(scss, 'F6', `${showKey(k)} estilizada em mais de um bloco de nível raiz — junte num bloco só`, line);
        vistos.add(k);
        if (p < maxPos) erro(scss, 'F6', `ordem do SCSS ≠ ordem do HTML: ${showKey(k)} vem antes de ${showKey(maxKey)} no HTML, mas depois no SCSS`, line);
        else { maxPos = p; maxKey = k; }
      }
    }
  }

  // Swiper nos depoimentos
  const depo = all.filter((e) => classesOf(e).some((c) => /testimon|depoiment|review/i.test(c)));
  const js = exists(mainJs) ? read(mainJs) : '';
  if (depo.length) {
    const falta = [];
    if (!all.some((e) => classesOf(e).includes('swiper'))) falta.push('elemento .swiper');
    if (!all.some((e) => classesOf(e).includes('swiper-slide'))) falta.push('.swiper-slide');
    if (!links.some((h) => /swiper/i.test(h))) falta.push('CSS do Swiper (CDN)');
    if (!scripts.some((h) => /swiper/i.test(h))) falta.push('JS do Swiper (CDN)');
    if (!/new\s+Swiper\s*\(/.test(js)) falta.push('new Swiper(...) no main.js');
    if (falta.length) erro(f, 'F7', `depoimentos devem usar Swiper — falta: ${falta.join(', ')}`, L(depo[0]));
  }

  // seletores do main.js existem no HTML
  if (js) {
    const jsNoStr = js;
    const dyn = new Set();
    for (const m of jsNoStr.matchAll(/classList\.(?:add|remove|toggle|replace|contains)\(([^)]*)\)/g))
      for (const s of m[1].matchAll(/['"`]([\w-]+)['"`]/g)) dyn.add(s[1]);
    for (const m of jsNoStr.matchAll(/className\s*=\s*['"`]([^'"`]+)['"`]/g)) m[1].split(/\s+/).forEach((c) => dyn.add(c));
    const sels = [];
    const RES = [
      /(?:querySelector(?:All)?|closest|matches)\(\s*(['"`])((?:(?!\1).)+)\1/g,
      /new\s+Swiper\(\s*(['"`])((?:(?!\1).)+)\1/g,
      /\b(?:el|nextEl|prevEl)\s*:\s*(['"`])((?:(?!\1).)+)\1/g,
    ];
    for (const re of RES) for (const m of jsNoStr.matchAll(re)) if (!m[2].includes('${')) sels.push([m[2], m.index]);
    for (const m of jsNoStr.matchAll(/getElementById\(\s*['"`]([^'"`]+)['"`]/g)) sels.push(['#' + m[1], m.index]);
    for (const m of jsNoStr.matchAll(/getElementsByClassName\(\s*['"`]([^'"`]+)['"`]/g)) sels.push([m[1].split(/\s+/).map((c) => '.' + c).join(''), m.index]);
    for (const [sel, idx] of sels) {
      const clean = sel.replace(/\[[^\]]*\]/g, '').replace(/:[\w-]+(\([^)]*\))?/g, '');
      for (const m of clean.matchAll(/\.([A-Za-z_-][\w-]*)/g)) {
        const c = m[1];
        if (!allClasses.has(c) && !dyn.has(c) && !c.startsWith('swiper-'))
          erro(mainJs, 'F8', `main.js usa ".${c}" mas essa classe não existe no HTML`, lineOf(mainJs, idx));
      }
      for (const m of clean.matchAll(/#([A-Za-z_-][\w-]*)/g))
        if (!ids.has(m[1])) erro(mainJs, 'F8', `main.js usa "#${m[1]}" mas esse id não existe no HTML`, lineOf(mainJs, idx));
    }
    scanPatterns(mainJs, TRACKING, 'erro', 'T1', 'script de rastreio: ');
  }
}

// JS soltos (não-min) em escopo: rastreio e sobras
for (const f of ALL.filter((x) => ext(x) === '.js' && !x.includes('.min.') && inScope(x))) {
  if (FIGMA_PAGES.some((p) => normPath(path.join(ROOT, path.dirname(p), 'assets/js/main.js')) === normPath(f))) continue;
  scanPatterns(f, TRACKING, 'erro', 'T1', 'script de rastreio do produto antigo: ');
  scanPatterns(f, LEFTOVERS.slice(0, 1), 'erro', 'H4');
}
for (const f of ALL.filter((x) => ['.css', '.scss'].includes(ext(x)) && inScope(x))) scanPatterns(f, LEFTOVERS.slice(0, 1), 'erro', 'H4');

// ---------------------------------------------------------------- imagens
for (const f of ALL.filter(inScope)) {
  const e = ext(f);
  const base = path.basename(f).toLowerCase();
  if (JUNK_FILES.has(base)) { erro(f, 'A2', 'arquivo de sistema/lixo — apague'); continue; }
  if (!IMG_EXT.has(e)) continue;
  const size = exists(f).size;
  if (size > MAX_IMG) erro(f, 'I1', `imagem com ${(size / 1e6).toFixed(2)}MB (limite 1MB) — rode otimizar-imagens.mjs`);
  else if (base.startsWith('favicon') && size > MAX_FAVICON) aviso(f, 'I2', `favicon com ${(size / 1e3).toFixed(0)}KB — deveria ser bem leve (≤ 100KB, idealmente 32–64px)`);
}

// ---------------------------------------------------------------- órfãos
const groupText = new Map();
function textOfGroup(g) {
  if (!groupText.has(g)) {
    groupText.set(g, ALL.filter((f) => groupOf(f) === g && TEXT_EXT.has(ext(f)) && !f.includes('.min.'))
      .map((f) => read(f).toLowerCase()).join('\n'));
  }
  return groupText.get(g);
}
for (const f of ALL.filter(inScope)) {
  const e = ext(f);
  if (!ASSET_EXT.has(e) || e === '.html') continue;
  const r = rel(f);
  if (!r.includes('/')) { if (!IMG_EXT.has(e) && !['.css', '.js'].includes(e)) continue; } // raiz: só assets de verdade
  if (referenced.has(normPath(f))) continue;
  const base = path.basename(f).toLowerCase();
  if (textOfGroup(groupOf(f)).includes(base) || textOfGroup(groupOf(f)).includes(encodeURI(base))) continue;
  erro(f, 'A1', 'arquivo órfão (nada no HTML/CSS/JS usa) — apague');
}

// ---------------------------------------------------------------- resíduos do produto antigo
if (nomesAntigos.length) {
  const res = nomesAntigos.map((n) => [n, new RegExp(n.trim().split(/\s+/).map(escRe).join('[\\s_-]?'), 'gi')]);
  for (const f of ALL.filter(inScope)) {
    for (const [n, re] of res) {
      re.lastIndex = 0;
      if (re.test(path.basename(f))) erro(f, 'N1', `nome de arquivo contém o produto antigo "${n}" — renomeie (e atualize as referências)`);
    }
    if (!TEXT_EXT.has(ext(f)) || f.includes('.min.') || f.endsWith('.map')) continue;
    if (ext(f) === '.css' && exists(f.replace(/\.css$/i, '.scss'))) continue;
    const t = read(f);
    for (const [n, re] of res) {
      re.lastIndex = 0;
      let k = 0, m;
      while ((m = re.exec(t)) && k < 5) { erro(f, 'N1', `resíduo do produto antigo "${n}": "${m[0]}"`, lineOf(f, m.index)); k++; }
    }
  }
}
if (paletaAntiga.length) {
  for (const f of ALL.filter((x) => inScope(x) && ['.html', '.css', '.scss', '.js', '.svg'].includes(ext(x)) && !x.includes('.min.'))) {
    if (ext(f) === '.css' && exists(f.replace(/\.css$/i, '.scss'))) continue;
    const t = read(f);
    const vistos = new Set();
    for (const m of t.matchAll(/#[0-9a-fA-F]{6}\b|#[0-9a-fA-F]{3}\b/g)) {
      const h = normHex(m[0]);
      if (paletaAntiga.includes(h) && !vistos.has(h)) { vistos.add(h); aviso(f, 'N2', `cor da paleta ANTIGA ainda presente: ${m[0]}`, lineOf(f, m.index)); }
    }
  }
}
// paleta nova aplicada?
if (paletaNova.length) {
  const corNaoNeutra = paletaNova.filter((h) => !NEUTRAL.has(h));
  for (const f of pages) {
    const kind = kindOf(f);
    let t = read(f);
    if (kind !== 'rodape') {
      const g = groupOf(f);
      t += ALL.filter((x) => groupOf(x) === g && ['.css', '.scss', '.js'].includes(ext(x)) && !x.includes('.min.')).map(read).join('\n');
    }
    const hexes = new Set([...t.matchAll(/#[0-9a-fA-F]{6}\b|#[0-9a-fA-F]{3}\b/g)].map((m) => normHex(m[0])));
    if (corNaoNeutra.length && !corNaoNeutra.some((h) => hexes.has(h)))
      aviso(f, 'N3', 'nenhuma cor da paleta NOVA aparece nesta página — a paleta foi aplicada?');
  }
}

// ================================================================ relatório
const ordem = { erro: 0, aviso: 1 };
findings.sort((a, b) => a.arquivo.localeCompare(b.arquivo) || ordem[a.nivel] - ordem[b.nivel] || (a.linha || 0) - (b.linha || 0));
const nErros = findings.filter((x) => x.nivel === 'erro').length;
const nAvisos = findings.length - nErros;
if (opts.json) {
  console.log(JSON.stringify({ raiz: ROOT, escopo: opts.so || 'tudo', erros: nErros, avisos: nAvisos, findings }, null, 2));
} else {
  console.log(`VALIDAÇÃO — ${ROOT}${opts.so ? `  (escopo: ${opts.so})` : ''}\n`);
  let atual = null;
  for (const x of findings) {
    if (x.arquivo !== atual) { atual = x.arquivo; console.log(`\n${atual}`); }
    console.log(`  [${x.nivel === 'erro' ? 'ERRO ' : 'AVISO'}] ${x.codigo}${x.linha ? ` (linha ${x.linha})` : ''}: ${x.msg}`);
  }
  console.log(`\n${'-'.repeat(60)}\nResultado: ${nErros} erro(s), ${nAvisos} aviso(s).`);
  console.log(nErros ? 'NÃO ENTREGUE: corrija os erros e rode de novo.' : nAvisos ? 'Sem erros. Resolva ou explique cada aviso no relatório final.' : 'Tudo certo.');
}
process.exit(nErros ? 1 : 0);
