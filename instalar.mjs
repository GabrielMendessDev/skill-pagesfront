#!/usr/bin/env node
/**
 * instalar.mjs — instala (ou atualiza) a skill criar-paginas-front no Claude Code e/ou no Codex.
 *
 * Uso (dentro da pasta clonada do repositório):
 *   node instalar.mjs codex                  →  ~/.agents/skills/criar-paginas-front
 *   node instalar.mjs claude                 →  ~/.claude/skills/criar-paginas-front
 *   node instalar.mjs ambos
 *   node instalar.mjs codex --projeto <pasta>   instala só naquele projeto
 *                                               (<pasta>/.agents/skills ou <pasta>/.claude/skills)
 *
 * Para atualizar: `git pull` e rode o mesmo comando de novo (a pasta instalada é substituída).
 * No fim roda o preparar.mjs (instala sass/sharp em ~/.cache/pagesfront e confere Node e Chrome/Edge).
 */
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const argv = process.argv.slice(2);
const alvo = argv.find((a) => !a.startsWith('--') && argv[argv.indexOf(a) - 1] !== '--projeto');
const iProj = argv.indexOf('--projeto');
const projeto = iProj >= 0 ? path.resolve(argv[iProj + 1] || '.') : null;
if (!['codex', 'claude', 'ambos'].includes(alvo)) {
  console.log('Uso: node instalar.mjs <codex|claude|ambos> [--projeto <pasta>]');
  process.exit(2);
}

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const ORIGEM = path.join(AQUI, 'skills', 'criar-paginas-front');
if (!fs.existsSync(path.join(ORIGEM, 'SKILL.md'))) { console.error(`Não achei ${ORIGEM}/SKILL.md`); process.exit(2); }

const base = projeto || os.homedir();
const destinos = [];
if (alvo !== 'claude') destinos.push(['Codex', path.join(base, '.agents', 'skills', 'criar-paginas-front')]);
if (alvo !== 'codex') destinos.push(['Claude Code', path.join(base, '.claude', 'skills', 'criar-paginas-front')]);

for (const [nome, dest] of destinos) {
  fs.rmSync(dest, { recursive: true, force: true });
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.cpSync(ORIGEM, dest, { recursive: true });
  console.log(`[ok] ${nome}: ${dest}`);
}

console.log('\nComo chamar:');
if (alvo !== 'claude') console.log('  Codex:       $criar-paginas-front  (reinicie o Codex se a skill não aparecer em /skills)');
if (alvo !== 'codex') console.log('  Claude Code: /criar-paginas-front  (abra uma sessão nova)');
console.log('');

const r = spawnSync(process.execPath, [path.join(ORIGEM, 'scripts', 'preparar.mjs')], { stdio: 'inherit' });
process.exit(r.status ?? 1);
