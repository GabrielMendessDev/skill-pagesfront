#!/usr/bin/env node
/**
 * otimizar-imagens.mjs — comprime/redimensiona imagens e garante que nenhuma passe de 1MB.
 *
 * Uso:
 *   node otimizar-imagens.mjs <pasta> [--webp] [--max-largura 1920] [--qualidade 80] [--refs <pasta>]
 *
 *   <pasta>          pasta com as imagens (varre subpastas). Ex.: assets/img  ou  dtc-b/assets/img
 *   --webp           converte PNG/JPG para .webp E atualiza as referências (HTML/CSS/SCSS/JS) que
 *                    apontam para o arquivo convertido. Use nas páginas do Figma (.com e dtc-b).
 *                    Sem --webp o nome/formato é mantido (use nas páginas adaptadas).
 *   --max-largura    largura máxima em px (padrão 1920). Favicon é sempre limitado a 64px.
 *   --qualidade      qualidade inicial 1–100 (padrão 80). Cai sozinha se precisar para ficar < 1MB.
 *   --refs           onde procurar referências para atualizar (padrão: a pasta da página, i.e.
 *                    a primeira pasta acima de <pasta> que tem index.html).
 *
 * Usa a biblioteca sharp. Se ela não estiver instalada, instala uma vez em ~/.cache/pagesfront.
 * Código de saída 1 se alguma imagem continuar acima de 1MB.
 */
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';

const argv = process.argv.slice(2);
const o = { pasta: null, webp: false, maxW: 1920, q: 80, refs: null };
for (let i = 0; i < argv.length; i++) {
  const a = argv[i];
  if (a === '--webp') o.webp = true;
  else if (a === '--max-largura') o.maxW = Number(argv[++i]);
  else if (a === '--qualidade') o.q = Number(argv[++i]);
  else if (a === '--refs') o.refs = argv[++i];
  else if (a === '-h' || a === '--help') { console.log(fs.readFileSync(new URL(import.meta.url), 'utf8').split('*/')[0]); process.exit(0); }
  else o.pasta = a;
}
if (!o.pasta || !fs.existsSync(o.pasta)) { console.error('Uso: node otimizar-imagens.mjs <pasta> [--webp] [--max-largura 1920] [--qualidade 80]'); process.exit(2); }
const PASTA = path.resolve(o.pasta);
const LIMITE = 1_000_000;
const WIN = process.platform === 'win32';
const IGNORE = new Set(['.git', 'node_modules', '.pagesfront', '.claude']);

// ------------------------------------------------------------- sharp
function carregarSharp() {
  const cache = path.join(os.homedir(), '.cache', 'pagesfront');
  const bases = [process.cwd(), path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')), cache];
  for (const b of bases) {
    try { return createRequire(path.join(b, 'noop.js'))('sharp'); } catch { /* tenta o próximo */ }
  }
  console.log(`sharp não encontrado — instalando uma vez em ${cache} ...`);
  fs.mkdirSync(cache, { recursive: true });
  const args = ['install', 'sharp@0.34', '--prefix', cache, '--no-audit', '--no-fund', '--silent'];
  const r = WIN
    ? spawnSync(['npm', ...args].map((a) => (/[\s"]/.test(a) ? `"${a}"` : a)).join(' '), { shell: true, stdio: 'inherit' })
    : spawnSync('npm', args, { stdio: 'inherit' });
  if (r.status !== 0) { console.error('Não consegui instalar o sharp. Rode manualmente: npm install sharp --prefix ' + cache); process.exit(2); }
  return createRequire(path.join(cache, 'noop.js'))('sharp');
}
const sharp = carregarSharp();

// ------------------------------------------------------------- utilidades
function* walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) { if (!IGNORE.has(e.name)) yield* walk(p); } else if (e.isFile()) yield p;
  }
}
const kb = (n) => (n >= 1e6 ? `${(n / 1e6).toFixed(2)}MB` : `${Math.round(n / 1e3)}KB`);
const norm = (p) => (WIN ? path.resolve(p).toLowerCase() : path.resolve(p));
function paginaDe(dir) {
  for (let d = dir; ; d = path.dirname(d)) {
    if (fs.existsSync(path.join(d, 'index.html')) || fs.readdirSync(d).some((f) => f.endsWith('.html'))) return d;
    if (path.dirname(d) === d) return dir;
  }
}

async function codificar(arquivo, formato, largura, q, ehFavicon) {
  let img = sharp(arquivo, { animated: false }).rotate();
  if (largura) img = img.resize({ width: largura, withoutEnlargement: true });
  if (formato === 'webp') return img.webp({ quality: q, effort: 5, alphaQuality: Math.min(100, q + 10) }).toBuffer();
  if (formato === 'jpeg') return img.jpeg({ quality: q, mozjpeg: true }).toBuffer();
  // png: sem perda primeiro; com paleta (perda leve) só se precisar
  if (ehFavicon || q >= 80) {
    const sem = await img.png({ compressionLevel: 9, adaptiveFiltering: true, effort: 10 }).toBuffer();
    if (sem.length <= LIMITE || ehFavicon) return sem;
  }
  return sharp(arquivo).rotate().resize(largura ? { width: largura, withoutEnlargement: true } : undefined)
    .png({ compressionLevel: 9, palette: true, quality: q, effort: 10, dither: 1 }).toBuffer();
}

// ------------------------------------------------------------- otimização
const EXT = { '.png': 'png', '.jpg': 'jpeg', '.jpeg': 'jpeg', '.webp': 'webp' };
const linhas = [];
const renomeados = new Map(); // abs antigo -> abs novo
let acimaDoLimite = 0;

for (const arq of walk(PASTA)) {
  const ext = path.extname(arq).toLowerCase();
  const antes = fs.statSync(arq).size;
  if (!EXT[ext]) {
    if (['.gif', '.svg', '.ico', '.avif', '.bmp'].includes(ext) && antes > LIMITE) { linhas.push([arq, antes, antes, '-', 'ACIMA DE 1MB (formato não otimizado automaticamente — troque o arquivo)']); acimaDoLimite++; }
    continue;
  }
  const ehFavicon = /^favicon/i.test(path.basename(arq));
  let meta;
  try { meta = await sharp(arq).metadata(); } catch (e) { linhas.push([arq, antes, antes, '-', `ignorado (${e.message})`]); continue; }
  const formatoOrig = EXT[ext];
  const formato = o.webp && !ehFavicon && formatoOrig !== 'webp' ? 'webp' : formatoOrig;
  let largura = ehFavicon ? Math.min(meta.width, 64) : meta.width > o.maxW ? o.maxW : null;
  let q = o.q;
  let buf = await codificar(arq, formato, largura, q, ehFavicon);
  while (buf.length > LIMITE && q > 50) { q -= 10; buf = await codificar(arq, formato, largura, q, ehFavicon); }
  while (buf.length > LIMITE && (largura || meta.width) > 400) { largura = Math.round((largura || meta.width) * 0.85); buf = await codificar(arq, formato, largura, q, ehFavicon); }

  const destino = formato === formatoOrig ? arq : arq.slice(0, -ext.length) + '.webp';
  const mudouFormato = destino !== arq;
  if (!mudouFormato && !largura && buf.length >= antes) { linhas.push([arq, antes, antes, `${meta.width}x${meta.height}`, 'já otimizada']); if (antes > LIMITE) acimaDoLimite++; continue; }
  if (mudouFormato && fs.existsSync(destino)) { linhas.push([arq, antes, antes, '-', `não convertida: ${path.basename(destino)} já existe`]); continue; }
  fs.writeFileSync(destino, buf);
  if (mudouFormato) { fs.unlinkSync(arq); renomeados.set(norm(arq), destino); }
  const dim = await sharp(destino).metadata();
  linhas.push([destino, antes, buf.length, `${dim.width}x${dim.height}`, `${mudouFormato ? `convertida de ${ext}` : 'comprimida'}${largura ? `, redimensionada` : ''}${q !== o.q ? `, qualidade ${q}` : ''}`]);
  if (buf.length > LIMITE) acimaDoLimite++;
}

// ------------------------------------------------------------- atualizar referências (só com --webp)
const atualizadas = [];
if (renomeados.size) {
  const refsDir = path.resolve(o.refs || paginaDe(PASTA));
  const TEXTO = new Set(['.html', '.htm', '.css', '.scss', '.js']);
  const nomes = new Set([...renomeados.keys()].map((p) => path.basename(p)));
  for (const f of walk(refsDir)) {
    const ext = path.extname(f).toLowerCase();
    if (!TEXTO.has(ext) || f.includes('.min.')) continue;
    let t = fs.readFileSync(f, 'utf8');
    // base de resolução: arquivo para HTML/CSS/SCSS; para JS, a página (pasta acima de /assets/)
    let base = path.dirname(f);
    if (ext === '.js') { const i = f.replace(/\\/g, '/').lastIndexOf('/assets/'); if (i >= 0) base = f.slice(0, i); }
    let n = 0;
    t = t.replace(/(["'(\s=,])([^"'()\s=,]*?)([^"'()\s=,\/\\]+\.(?:png|jpe?g))(?=[?#"')\s,])/gi, (m, pre, dir, nome) => {
      if (![...nomes].some((x) => x.toLowerCase() === nome.toLowerCase())) return m;
      const caminho = dir + nome;
      if (/^(?:[a-z]+:|\/\/)/i.test(caminho)) return m;
      let abs;
      try { abs = caminho.startsWith('/') ? path.join(refsDir, decodeURIComponent(caminho)) : path.resolve(base, decodeURIComponent(caminho)); } catch { return m; }
      if (!renomeados.has(norm(abs))) return m;
      n++;
      return pre + dir + nome.replace(/\.(png|jpe?g)$/i, '.webp');
    });
    if (n) { fs.writeFileSync(f, t); atualizadas.push(`${path.relative(process.cwd(), f)} (${n})`); }
  }
}

// ------------------------------------------------------------- relatório
console.log(`OTIMIZAÇÃO — ${PASTA}\n`);
for (const [arq, a, d, dim, acao] of linhas) {
  const r = path.relative(process.cwd(), arq);
  console.log(`  ${d > LIMITE ? '[>1MB]' : '[ok]  '} ${r}  ${kb(a)} → ${kb(d)}  ${dim}  ${acao}`);
}
const total = linhas.reduce((s, l) => [s[0] + l[1], s[1] + l[2]], [0, 0]);
console.log(`\nTotal: ${kb(total[0])} → ${kb(total[1])}`);
if (renomeados.size) console.log(`Referências atualizadas: ${atualizadas.length ? atualizadas.join(', ') : 'nenhuma encontrada — confira se algo aponta para os nomes antigos'}`);
if (acimaDoLimite) { console.log(`\n${acimaDoLimite} imagem(ns) ainda acima de 1MB — reduza manualmente (corte, troque de formato) e rode de novo.`); process.exit(1); }
console.log('\nNenhuma imagem acima de 1MB.');
