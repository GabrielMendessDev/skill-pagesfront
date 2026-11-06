---
name: criar-paginas-front
description: >-
  Cria as páginas de front de um produto novo já no padrão de código do time
  (mayor-code-style embutido nesta skill): .com e dtc-b fiéis ao Figma, e thank,
  vsl, bonus e rodapés Cartpanda (contact, terms, privacy, reference, shipping,
  refund, disclaimer) adaptados de um produto do mesmo nicho. Traz validador
  automático, prints por seção para comparar com o Figma e otimizador de imagens
  (nenhuma acima de 1MB). Use quando pedirem para criar ou montar as páginas de
  um produto novo, montar a .com ou a dtc-b a partir do Figma, adaptar
  thank/vsl/bonus/rodapés para um produto, ou citarem kits, Cartpanda, hero,
  favicon, paleta ou "mesmo nicho".
---

# Criar Páginas de Front

Gera o conjunto de páginas de front de um produto novo:

| Página | Origem | Estrutura |
|---|---|---|
| `.com` (`index.html` da raiz) | **Figma** (fiel ao design) | padrão de código do time |
| `dtc-b/` | **Figma** (opcional: dtc-b do mesmo nicho como base) | padrão de código do time |
| `thank/` `vsl/` `bonus/` | **adaptar** da referência do mesmo nicho | preserva a da referência |
| 7 rodapés na raiz | **adaptar** (padrão Cartpanda) | preserva a da referência |

**Pasta desta skill (`$SKILL` nos comandos abaixo):** `${CLAUDE_SKILL_DIR}`

- No **Claude Code** o caminho acima já vem preenchido.
- No **Codex** (ou se o texto `${CLAUDE_SKILL_DIR}` aparecer literal), `$SKILL` é a pasta onde está
  este SKILL.md (ex.: `~/.agents/skills/criar-paginas-front`). Descubra o caminho absoluto e use-o em
  todos os comandos.

Tudo de que a skill precisa está nessa pasta (padrão de código, templates, scripts): **não busque nada
em links externos.** Os scripts são Node puro e funcionam igual no Claude Code e no Codex, em Windows,
macOS e Linux.

## Regras de ouro

1. **O validador decide quando acabou.** Nenhuma fase termina sem
   `node $SKILL/scripts/validar.mjs` com **0 erros** no escopo dela. "Acho que está certo" não conta.
2. **O Figma é a verdade** da `.com` e da `dtc-b`. Cada seção é comparada print × Figma antes de seguir.
3. **O padrão de código é obrigatório** nas páginas do Figma (resumo no fim deste arquivo, detalhes em
   [references/padrao-codigo.md](references/padrao-codigo.md)). O código que o Figma devolve
   (React/Tailwind) é só referência visual.
4. **Nunca invente** preço, link, ID de pixel ou vídeo, e-mail, ingrediente, claim, depoimento ou
   bônus. Se não veio nas entradas, nem está no Figma, nem é algo que
   [fica como veio da referência](#o-que-fica-como-veio-da-referência-mesmo-nicho), use
   `PENDENTE-<o-que-falta>` (ex.: `href="#PENDENTE-upsell"`) e liste no relatório final.
5. **Uma página por vez**, na ordem das fases. Atualize `.pagesfront/progresso.md` ao fim de cada fase
   para poder retomar se o contexto acabar.
6. **Depois da fase 0, não pare para perguntar**, a não ser que falte uma entrada obrigatória. Em
   dúvida menor, decida pelo Figma ou pela referência e registre a decisão no relatório.

## Padrões fixos do time

### Checkout dos kits (.com, dtc-b, vsl e qualquer página com kits)

O `href` de cada kit é sempre um destes três valores, conforme a quantidade de potes:

| Kit | `href` | Exemplo |
|---|---|---|
| menor quantidade de potes | `linkoffer1` | 2 bottles |
| quantidade média | `linkoffer3` | 3 bottles |
| maior quantidade | `linkoffer2` | 6 bottles |

Escreva literalmente `href="linkoffer1"` (sem `#`, sem URL). Todos os botões e links de um mesmo kit
usam o mesmo valor. Isso substitui qualquer checkout do produto antigo e **não é pendência**. O
validador confere a correspondência com a quantidade de potes do card (K1). Se a página tiver um
número de kits diferente de 3, aplique menor → `linkoffer1` e maior → `linkoffer2` e explique o resto
no relatório.

### Kits no mobile: do maior para o menor

No mobile (`max-width: 900px`), os kits ficam **em coluna, do maior para o menor** (6 → 3 → 2
bottles), seja qual for a ordem no desktop ou no Figma. Nas páginas do Figma, use `order` dentro do
bloco do kit (exemplo em [references/padrao-codigo.md](references/padrao-codigo.md)). Na vsl, use o
recurso que a página já usa (CSS dela ou classes `order-*` do Tailwind). O `capturar.mjs` confere no
print de 390px.

### O que fica como veio da referência (mesmo nicho)

A referência é do mesmo nicho, então estes itens **ficam como estão**: não reescreva, não remova e
não marque como `PENDENTE`.

- **VSL:** o player (scripts vturb/ConverteAI, `<vturb-smartplayer>`, IDs do vídeo), os elementos com
  `data-delay` e o script de delay do pitch ficam **exatamente como estão**. Não remova, não troque e
  não "conserte" (nem se o `capturar.mjs` mostrar aviso do player).
- **Bônus:** títulos, mockups/capas, imagens e links dos bônus ficam como estão. Só troque o nome do
  produto antigo se ele aparecer no texto.
- **FAQ:** se o Figma não tiver a copy completa do FAQ (perguntas e respostas), use o FAQ da
  referência como está (dtc-b de referência no modo B; senão, o da `vsl/` ou de outra página de
  referência), trocando só o nome do produto antigo pelo novo.
- **Rodapés:** a copy geral (termos, privacidade, frete, reembolso, disclaimer, referências, contato)
  fica. Troque só nome do produto, paleta, `<title>` e dados de contato do produto antigo.
- **Imagens do `contact.html`:** ficam **quebradas**, com o mesmo `src` e o mesmo nome de arquivo. Não
  remova as tags, não renomeie, não invente imagem nem seção para substituir. O usuário cria essas
  imagens à parte e coloca em `assets/` depois. O validador lista cada uma (aviso P2): elas entram no
  relatório final como pendência.

## Fase 0: Pré-checagem (BLOQUEANTE)

Entradas **obrigatórias** na mensagem do usuário:

```
design .com:  <link figma>
design dtc-b: <link figma>
favicon:      <link figma>
paleta:       <link figma>  ou os hex por escrito
```

Entradas **opcionais** (se faltarem, viram `PENDENTE` e não bloqueiam): upsell, e-mail de suporte,
scripts que devem continuar.

**Não peça** checkout dos kits (padrão `linkoffer`), vídeo da VSL, bônus, FAQ nem copy dos rodapés:
vêm do padrão ou da referência (ver [Padrões fixos do time](#padrões-fixos-do-time)).

Checagens:

1. Ferramentas: `node $SKILL/scripts/preparar.mjs` (confere Node 22+, `sass`/`sharp` em
   `~/.cache/pagesfront` e Chrome/Edge) e confirme que as ferramentas do **MCP do Figma** estão
   disponíveis. Se faltar algo, pare e diga o quê e como resolver (o README da skill explica a
   instalação no Claude Code e no Codex). Se o ambiente bloquear rede ou a abertura do navegador
   (sandbox do Codex), peça ao usuário para aprovar o comando ou liberar a rede, em vez de pular a
   etapa.
2. Na raiz do projeto: `node $SKILL/scripts/validar.mjs --pre`. O comando lista as referências
   (thank, vsl, bonus, 7 rodapés), diz o **modo da dtc-b** (A: não há `dtc-b/` de referência, B: há) e
   mostra pistas do **produto antigo** (títulos, rótulo da paleta, cores mais usadas, scripts de
   rastreio).
3. Se faltar link obrigatório ou o `--pre` acusar `FALTA`: **pare** e liste tudo o que falta numa
   mensagem só.
4. Se as referências parecerem de **outro nicho** (títulos e copy de outro tipo de produto), avise o
   usuário antes de continuar. Referência do mesmo nicho é o que faz a adaptação sair fiel.

## Fase 1: Briefing (fonte única de verdade)

1. Copie `$SKILL/templates/produto.json` para `.pagesfront/produto.json` e preencha:
   - `produto`: nome do produto novo (vem do Figma).
   - `produto_antigo`: nome(s) **completos** da marca da referência (pistas do `--pre`). Só nomes de
     marca, nunca palavras genéricas do nicho.
   - `paleta`: hex do produto novo por papel (`primaria`, `secundaria`, `texto`, `escuro`, `claro`), via
     `get_variable_defs` no link da paleta ou pelos hex enviados.
   - `paleta_antiga`: cores da marca antiga (pistas do `--pre`), sem branco e preto.
   - `fontes`; `kits` (nome, quantidade, preço e selo, tirados do Figma da dtc-b; `checkout` pelo
     padrão: menor → `linkoffer1`, média → `linkoffer3`, maior → `linkoffer2`); `links` (upsell e
     suporte que o usuário mandou, o resto `PENDENTE`); `scripts_permitidos` (vazio, salvo pedido do
     usuário); `pendencias`.
2. Baixe o **favicon** do Figma para `.pagesfront/favicon.png` (cada fase copia de lá para a pasta de
   imagens da página).
3. Crie `.pagesfront/progresso.md` com o checklist das fases 2 a 7.
4. Acrescente `.pagesfront/` ao `.gitignore` do projeto (crie o arquivo se não existir), para o
   material de trabalho não subir junto.

O validador usa o briefing para caçar resíduos do produto antigo, links não declarados e paleta não
aplicada. **Todo link externo que ficar nas páginas precisa estar declarado no briefing.**

## Fase 2: dtc-b (Figma)

Leia antes: [references/padrao-codigo.md](references/padrao-codigo.md) e
[references/figma-para-codigo.md](references/figma-para-codigo.md).

1. **Base**
   - Modo A: copie `$SKILL/templates/pagina-figma/` para `dtc-b/`; troque `{{PRODUTO}}` pelo nome e
     `{{RAIZ}}` por `../`.
   - Modo B: parta da `dtc-b/` de referência (estrutura, seções, kits, scripts). Se ela não estiver no
     padrão de código, refatore para o padrão enquanto ajusta ao Figma.
2. **Seção por seção** (nunca a página inteira de uma vez): `get_metadata` para listar as seções;
   depois, para cada uma, `get_screenshot` + `get_design_context`. Escreva HTML e SCSS no padrão e
   baixe os assets para `dtc-b/assets/img/`. O design manda na ordem e na quantidade de seções:
   remova do template ou da referência o que o design não tem e acrescente o que falta.
   - **Kits:** `href` no padrão `linkoffer` e, no mobile, em coluna do maior para o menor.
   - **FAQ:** copy do Figma se estiver completa; senão, o FAQ da referência como está.
3. Copie o favicon para `dtc-b/assets/img/favicon.png`.
4. `node $SKILL/scripts/otimizar-imagens.mjs dtc-b/assets/img --webp`
5. `node $SKILL/scripts/validar.mjs --so dtc-b --compilar`, até **0 erros**.
6. **QA visual:** `node $SKILL/scripts/capturar.mjs dtc-b/index.html`. Resolva o que ele acusar (erro
   de JS, arquivo que não carrega, overflow, ordem dos kits no mobile) e compare cada print com o
   `get_screenshot` da seção (checklist em figma-para-codigo.md §7). Liste as diferenças, corrija e capture de novo, no máximo
   3 rodadas por seção.
7. Atualize o progresso.

## Fase 3: .com (`index.html` da raiz)

Mesmo procedimento da fase 2, com o design da `.com`, em `index.html` + `assets/` da raiz (template com
`{{RAIZ}}` vazio).

- **Kits:** reaproveite a seção de kits da dtc-b (mesmos kits e links), ajustando ao visual da `.com`.
- `otimizar-imagens.mjs assets/img --webp` → `validar.mjs --so index.html --compilar` (0 erros) →
  `capturar.mjs index.html` + comparação com o Figma.

## Fase 4: thank, vsl, bonus (adaptar)

Leia antes: [references/adaptacao-e-rodapes.md](references/adaptacao-e-rodapes.md).

Para cada página: troque a identidade (nome, paleta, mockups, copy, links), limpe o que é do produto
antigo e **preserve a estrutura e os caminhos** (não reescreva em SCSS, não reorganize pastas).

- **vsl:** o player, o `data-delay` e o script de delay do pitch **ficam intactos**. Os kits passam
  para o padrão `linkoffer` e, no mobile, ficam do maior para o menor. O FAQ fica.
- **bonus:** os bônus (títulos, mockups, imagens, links) **ficam**. Troque só a identidade do produto
  em volta (nome, paleta, mockup do produto).

Depois:

1. `node $SKILL/scripts/otimizar-imagens.mjs <pasta de imagens da página>` (**sem** `--webp`, para não
   mudar nomes).
2. `node $SKILL/scripts/validar.mjs --so <thank|vsl|bonus> --compilar`, até 0 erros.
3. `node $SKILL/scripts/capturar.mjs <página>/index.html`: sem erro de JS, sem arquivo quebrado, sem
   overflow, kits na ordem no mobile. Olhe os prints para conferir se a paleta nova entrou em tudo.
   Na vsl, o que o delay esconde não aparece nos prints (é o esperado). Os avisos do player (vturb)
   aparecem à parte e **não** são motivo para mexer no player nem no delay.

Se o ambiente tiver subagentes, as três páginas podem ser delegadas em paralelo. Passe a cada um o
caminho da página, do briefing e de `references/adaptacao-e-rodapes.md`. Rode o validador você mesmo
depois.

## Fase 5: rodapés (adaptar, padrão Cartpanda)

Para os 7 rodapés da raiz: comente o HTML por blocos, troque a paleta no `:root`, o nome do produto,
o `<title>` e os dados de contato do produto antigo (detalhes em adaptacao-e-rodapes.md). A copy
geral **fica** (mesmo nicho, não é pendência). Mantenha Tailwind e o `<style>` inline. As **imagens do
`contact.html` ficam quebradas** como estão (aviso P2, não erro). Depois:
`node $SKILL/scripts/validar.mjs --so rodapes`, até 0 erros.

## Fase 6: Validação final

1. `node $SKILL/scripts/validar.mjs --compilar` (projeto inteiro, sem `--so`): **0 erros**.
2. `capturar.mjs` em todas as páginas: nenhum erro de JS, recurso quebrado ou overflow.
3. Cada **aviso** restante do validador precisa ser resolvido ou explicado no relatório.

## Fase 7: Relatório final ao usuário

- Páginas geradas e modo da dtc-b (A ou B).
- Resultado do validador (erros, avisos e a explicação de cada aviso).
- Diferenças visuais que sobraram em relação ao Figma (seção e motivo), se houver.
- **Pendências** (`PENDENTE-*`): o que o usuário precisa mandar e onde entra.
- **Imagens do `contact.html`** (avisos P2): a lista dos caminhos que estão sem arquivo, com o recado
  de que essas imagens precisam ser colocadas em `assets/` pelo usuário.
- O que ficou da referência de propósito: player e delay da VSL, bônus, FAQ (se veio da referência).
- O que foi removido do produto antigo (scripts de rastreio, links, arquivos).
- `.pagesfront/` é material de trabalho (briefing, prints): não suba para a hospedagem.

## Padrão de código: resumo obrigatório

Vale para a `.com` e a `dtc-b`. Texto completo e exemplos:
[references/padrao-codigo.md](references/padrao-codigo.md).

- Só HTML, SCSS e JS puro. Sem React, Next, Tailwind, bundler ou partials. Um `style.scss` por página,
  compilado para `style.css` (é o `style.css` que o HTML carrega).
- Arquivos: `index.html` + `assets/img/` + `assets/css/style.scss` + `assets/js/main.js`.
- HTML mínimo: classe só para seção, componente reutilizável ou item repetido. **Nada de BEM** (`__`,
  `--`). Nomes simples escopados pelo pai: `.hero .content`, `.faq .item .header`.
- Seções: `.hero`, `.faixa`, `.sobre`, `.beneficios`, `.ingredientes`, `.testimonials`, `.shipping`,
  `.area-kits`, `.guarantee`, `.faq`. Nomes locais: `.container`, `.content`, `.media`, `.header`,
  `.body`, `.footer`, `.card`, `.item`, `.main`, `.price`, `.btn`, `.title`, `.sub`, `.pd`, `.center`.
- `<main>` envolve **só** o hero. As outras seções ficam direto no `<body>`, antes do `<footer>`.
- SCSS em árvore seguindo o HTML. Ordem: `@font-face` → variáveis → mixins → reset/base → componentes
  globais → seções na ordem do HTML → regras globais raras.
- Media queries **dentro** do bloco que modificam. Breakpoint principal `900px`; `1100px`/`620px` só se
  precisar.
- Depoimentos com **Swiper** (CDN). FAQ: alternar `.active` no `.item`.
- Kits: `href="linkoffer1|3|2"` (menor | média | maior) e, no mobile, `order` para ficar 6 → 3 → 2.
- Mudou classe no HTML → atualize o `main.js`.

## Erros conhecidos (não repita)

| Erro | O que fazer | Validador |
|---|---|---|
| Colar o React/Tailwind do `get_design_context` | Reescrever no padrão (HTML limpo + SCSS em árvore) | F9 |
| Deixar URL `localhost:3845` ou asset do MCP no código | Baixar para `assets/img/` | H4 |
| Pedir o `get_design_context` da página inteira | Ler seção por seção | — |
| Editar `style.scss` sem compilar | Rodar o validador com `--compilar` | S1 |
| Cor antiga escondida em Tailwind config, `bg-[#hex]` ou `style=""` nas adaptadas | Buscar e trocar em todos os lugares | N2 / N3 |
| Reaproveitar o checkout do produto antigo, inventar um ou usar `PENDENTE` | `linkoffer1` (menor) · `linkoffer3` (média) · `linkoffer2` (maior) | T2 / K1 |
| Kits no mobile na ordem do desktop | Coluna do maior para o menor (6 → 3 → 2) com `order` | capturar |
| Remover ou trocar o player vturb, o `data-delay` ou o script de delay da VSL | Deixar exatamente como veio | — |
| Trocar bônus por `PENDENTE-bonus` ou apagar os PDFs/capas dos bônus | Manter os bônus da referência | N4 |
| Marcar FAQ ou copy dos rodapés como pendente | Manter a da referência (mesmo nicho) | — |
| Remover, renomear ou "consertar" as imagens quebradas do contact.html | Deixar como estão e listar no relatório | P2 |
| Pixel ou tag do produto antigo esquecido | Remover | T1 |
| Hero exportado em 2x com 3 a 10MB | `otimizar-imagens.mjs` | I1 |
| Imagem do produto antigo sobrando na pasta | Apagar | A1 |
| Dar por pronto sem comparar com o Figma | QA visual por seção | — |
