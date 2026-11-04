#!/usr/bin/env node
/**
 * preparar.mjs — prepara a máquina para a skill criar-paginas-front (rodar UMA vez, num terminal normal).
 *
 * Uso:  node preparar.mjs
 *
 * - confere o Node (precisa ser 22+);
 * - instala `sass` e `sharp` em ~/.cache/pagesfront (os scripts da skill procuram lá), para que a
 *   skill não precise baixar nada durante a sessão — importante no Codex, cujo sandbox costuma
 *   bloquear rede;
 * - confere se há Chrome ou Edge para os prints (capturar.mjs).
 * Código de saída 1 se faltar algo.
 */
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { spawnSync } from 'node:child_process';

const WIN = process.platform === 'win32';
const CACHE = path.join(os.homedir(), '.cache', 'pagesfront');
let ok = true;
const linha = (estado, msg) => console.log(`  [${estado}] ${msg}`);

console.log('PREPARAR — skill criar-paginas-front\n');

const major = Number(process.versions.node.split('.')[0]);
if (major >= 22) linha('ok', `Node ${process.versions.node}`);
else { linha('FALTA', `Node ${process.versions.node} — instale o Node 22 ou mais novo (https://nodejs.org)`); ok = false; }

const temPacote = (nome) => fs.existsSync(path.join(CACHE, 'node_modules', nome, 'package.json'));
const faltando = ['sass', 'sharp'].filter((p) => !temPacote(p));
if (faltando.length) {
  console.log(`  instalando ${faltando.join(' e ')} em ${CACHE} ...`);
  fs.mkdirSync(CACHE, { recursive: true });
  const args = ['install', 'sass@1', 'sharp@0.34', '--prefix', CACHE, '--no-audit', '--no-fund', '--silent'];
  const r = WIN
    ? spawnSync(['npm', ...args].map((a) => (/[\s"]/.test(a) ? `"${a}"` : a)).join(' '), { shell: true, stdio: 'inherit' })
    : spawnSync('npm', args, { stdio: 'inherit' });
  if (r.status !== 0) { linha('FALTA', `não consegui instalar. Rode: npm install sass@1 sharp@0.34 --prefix "${CACHE}"`); ok = false; }
}
for (const p of ['sass', 'sharp']) if (temPacote(p)) linha('ok', `${p} em ${CACHE}`);

const nav = [process.env.CHROME_PATH];
if (WIN) {
  for (const b of [process.env.PROGRAMFILES, process.env['PROGRAMFILES(X86)'], process.env.LOCALAPPDATA]) {
    if (b) nav.push(path.join(b, 'Google/Chrome/Application/chrome.exe'), path.join(b, 'Microsoft/Edge/Application/msedge.exe'));
  }
} else if (process.platform === 'darwin') {
  nav.push('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge', '/Applications/Chromium.app/Contents/MacOS/Chromium');
} else {
  nav.push('/usr/bin/google-chrome', '/usr/bin/google-chrome-stable', '/usr/bin/chromium', '/usr/bin/chromium-browser', '/usr/bin/microsoft-edge', '/snap/bin/chromium');
}
const achado = nav.find((p) => p && fs.existsSync(p));
if (achado) linha('ok', `navegador para os prints: ${achado}`);
else { linha('FALTA', 'Chrome ou Edge não encontrado (instale um deles ou defina CHROME_PATH)'); ok = false; }

console.log(ok ? '\nTudo pronto.' : '\nResolva os itens marcados com FALTA e rode de novo.');
process.exit(ok ? 0 : 1);
