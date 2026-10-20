---
name: criar-paginas-front
description: >-
  Gera o conjunto completo de páginas de front de um produto novo: constrói a
  .com (index.html da raiz) a partir do design do Figma, monta a dtc-b a partir
  do Figma (opcionalmente usando uma dtc-b de um produto do MESMO NICHO como base
  pronta para ganhar assertividade), e ADAPTA, a partir de páginas de um produto
  do MESMO NICHO, as páginas thank, vsl, bonus e as de rodapé na raiz (contact,
  terms, privacy, reference, shipping, refund, disclaimer). Use sempre que o
  usuário pedir para "criar as páginas de um produto novo", "montar a .com/dtc-b a
  partir de um Figma", "fazer as páginas de front/landing", "adaptar a dtc-b com o
  Figma", "usar a dtc-b de outro produto + Figma", "adaptar thank/rodapés para um
  produto", ou citar o fluxo de criação de páginas (kits, Cartpanda, hero,
  favicon, paleta de cores, mesmo nicho). O nome do produto, o hero, os mockups, o
  favicon e a paleta são extraídos de links do Figma (a paleta também pode ser
  enviada por escrito);
  toda imagem é otimizada e nenhuma pode passar de 1MB. Antes de começar, checa
  os pré-requisitos (páginas de referência + links do Figma da .com, da dtc-b, do
  favicon e da paleta) e só prossegue se tudo estiver presente. Segue o padrão de
  código
  mayor-code-style (HTML limpo, SCSS em árvore, responsivo, Swiper nos
  depoimentos).
---

# Criar Páginas de Front

Automatiza a criação das páginas de front de um produto novo. A `.com` e a
`dtc-b` são construídas a partir de design(s) do **Figma**; a `dtc-b` pode, além
do Figma, usar uma **dtc-b de um produto do mesmo nicho** como base pronta (ver
3.1). As demais páginas são **adaptadas** de páginas de um produto do **mesmo
nicho** (cores, mockups, copy, nome do produto e links), preservando a estrutura
delas.

Páginas cobertas: **com** (Figma) · **dtc-b** (Figma) · **thank** (adaptar) ·
**vsl** (adaptar) · **bonus** (adaptar) · **rodapés** (adaptar: contact, terms,
privacy, reference, shipping, refund, disclaimer).

## 1. Checagem de pré-requisitos (BLOQUEANTE — faça primeiro)

Antes de gerar ou adaptar qualquer coisa, verifique o que existe no repositório
e o que foi fornecido. **Não comece a produzir até tudo estar presente.** Se
algo faltar, pare e liste exatamente o que falta, em uma mensagem só.

### 1.1 Entradas que o usuário envia
O usuário fornece um conjunto de links do Figma (a paleta pode vir por escrito):

```
design .com:  [link figma]
design dtc-b: [link figma]
favicon:      [link figma]
paleta:       [link figma]  — ou a paleta por escrito (hex)

dtc-b de referência (OPCIONAL): pasta dtc-b/ de um produto do mesmo nicho,
usada como base pronta junto com o design dtc-b do Figma (ver 3.1).
```

De cada design (`.com` e `dtc-b`) saem também o **nome do produto, o hero, os
mockups e as imagens** — não precisam ser enviados à parte.

A **dtc-b aceita dois modos** de construção (detalhes em 3.1):
- **Só Figma:** o usuário manda apenas o design dtc-b do Figma e a IA constrói do
  zero, fiel ao design.
- **Referência + Figma:** o usuário também disponibiliza a `dtc-b/` de um produto
  do mesmo nicho. A IA usa essa dtc-b como **base pronta** (estrutura, seções,
  saves/kits, scripts) e **ajusta tudo para ficar igual ao design do Figma** do
  produto atual — isso aumenta a assertividade do resultado.

### 1.2 Checagem no repositório
Verifique, a partir da raiz do repositório, que existem as **páginas de
referência de um produto do MESMO NICHO** (só as que serão **adaptadas**
precisam; a `.com` vem sempre do Figma):
- Em pastas próprias, cada uma com seu `index.html` + `assets/` (a estrutura
  interna pode variar por produto — ex.: `img/` ou `images/`, `js/main.js` ou
  `script.js`, `ebooks/`): `thank/` · `vsl/` · `bonus/`.
- **`dtc-b/` (OPCIONAL):** se o usuário optou pelo modo **Referência + Figma**,
  deve existir uma `dtc-b/` de um produto do mesmo nicho para servir de base. Se
  não existir, siga no modo **Só Figma** (construir do zero pelo design).
- **Na raiz** (arquivos soltos, sem pasta de tipo): os rodapés
  `contact.html` · `terms.html` · `privacy.html` · `reference.html` ·
  `shipping.html` · `refund.html` · `disclaimer.html`.

> O `index.html` da raiz (a `.com`) costuma chegar como esqueleto vazio, para
> ser preenchido do Figma. Veja a árvore completa em
> [references/estrutura-pastas.md](references/estrutura-pastas.md).

### 1.3 Regras obrigatórias das entradas
- **Favicon:** baixe do link do Figma, **otimize** e aplique em TODAS as páginas.
- **Paleta:** extraia do link do Figma (ex.: `get_variable_defs`) ou use os hex
  enviados por escrito. Sem link nem paleta escrita, pare e peça.
- **Peso das imagens:** **nenhuma imagem do site pode passar de 1MB.** Otimize
  todo asset baixado do Figma (comprima, redimensione ao tamanho de exibição,
  prefira `.webp` quando fizer sentido), sem perda grande de qualidade.
- **O que o Figma NÃO traz** (peça só se necessário): links de checkout/upsell e
  dados de contato/suporte dos rodapés, quando não der para reaproveitar da
  referência.

⚠️ **Aviso sobre o mesmo nicho:** quem roda esta skill precisa ter colocado como
referência páginas de um produto do **mesmo nicho** do produto atual. Isso é o
que torna a adaptação fiel (estrutura de seções, tipo de prova, garantia,
depoimentos etc. já batem com o nicho). Se as referências forem de outro nicho,
avise o usuário antes de continuar.

Só depois de tudo confirmado, siga para a produção.

## 2. Padrão de código (mayor-code-style)

As páginas **geradas do Figma** (`.com` e `dtc-b`) seguem a skill
**mayor-code-style**:
`https://github.com/moisesmengo/mayor-code-style/blob/main/skills/mayor-code-style/SKILL.md`.
Se ela estiver disponível como skill/arquivo no ambiente, carregue-a. As páginas
**adaptadas** (`thank`, `vsl`, `bonus`, rodapés) **preservam a estrutura/estilo
que já têm** (podem usar Tailwind inline, `script.js` etc.) — não as reescreva
para SCSS; aplique o padrão abaixo ao código novo que você criar. Resumo do que
não pode faltar nas páginas do Figma:

- **Stack:** apenas HTML, SCSS e JavaScript. Sem React, Next ou qualquer
  framework. Sem bundler/partials — um único `style.scss` por página.
- **Estrutura de arquivos por página:** `index.html` + `assets/` com três pastas:
  `img/` (imagens), `css/` (`style.scss`) e `js/` (`main.js`).
- **HTML limpo:** poucas classes, só para identificar seção, componente
  reutilizável ou item repetido. **Nada de BEM** (`__`, `--`). Nomes simples
  escopados pelo pai (ex.: `.hero .content`).
- **SCSS em árvore:** aninhar seguindo a hierarquia do HTML, não nomes longos.
  Cada media query dentro do bloco que ela modifica (breakpoint principal:
  `900px`), nunca num bloco gigante no fim.
- **`<main>` só no hero.** Demais seções direto no `<body>`, antes do `<footer>`.
- **Ordem do `style.scss`:** `@font-face` → variáveis → mixins → reset/base →
  componentes/utilitários globais → seções (na ordem do HTML) → regras globais
  raras (ex.: `prefers-reduced-motion`).
- **Se mexer em classe do HTML, atualize os seletores do `main.js`.**
- **Responsivo** e **imagens otimizadas** sem perda grande de qualidade.
- **Depoimentos:** usar a biblioteca **Swiper** (via CDN).

## 3. Fluxo de produção

Produza nesta ordem (há dependência entre as etapas).

Fontes de cada página:
- **Do Figma** (reproduzir fielmente): `.com` e `dtc-b` (esta podendo partir de
  uma dtc-b de referência — ver 3.1).
- **Adaptadas** da referência de outro produto do mesmo nicho (paleta, mockups,
  copy, nome, links): `thank`, `vsl`, `bonus` e os **rodapés**.

### 3.1 Construir a `dtc-b` (Figma, com ou sem dtc-b de referência)
A `dtc-b` vem do Figma e serve de referência estrutural para a `.com`
(principalmente a **seção de kits**), por isso é feita primeiro. O **design do
Figma é sempre a fonte de verdade**: o resultado final tem de ficar **igual ao
design**. Há dois modos de chegar lá:

**Comum aos dois modos:**
1. **Carregue a skill `figma-design-to-code` ANTES** de chamar
   `get_design_context` (pré-requisito obrigatório do MCP do Figma). Extraia
   `fileKey` e `nodeId` do link/frame da `dtc-b`.
2. Trate o retorno do Figma como **referência visual** a reproduzir fielmente com
   o padrão de código do time (HTML limpo + SCSS em árvore), não como código
   final a colar.

**Modo A — Só Figma (sem dtc-b de referência).** Construa a página do zero:
3a. Baixe os assets do Figma (`download_assets`) e otimize.
4a. Gere em `dtc-b/index.html` + `dtc-b/assets/{img,css,js}` (`style.scss`,
    `main.js`). Depoimentos com **Swiper**; responsivo (breakpoint `900px`).

**Modo B — dtc-b de referência + Figma (quando existe `dtc-b/` do mesmo nicho).**
Use a dtc-b de referência como **base pronta** e ajuste-a até ficar **igual ao
design do Figma** do produto atual:
3b. Parta da `dtc-b/` de referência: ela já traz a **estrutura, as seções, os
    saves/kits e os scripts** prontos do nicho — aproveite esse esqueleto em vez
    de começar do zero.
4b. **Ajuste tudo ao design do Figma:** layout, ordem/quantidade de seções,
    paleta, tipografia, copy, nome do produto, mockups e a seção de kits/saves.
    Onde o design do Figma divergir da referência, **o Figma manda** — adicione,
    remova ou reordene o que for preciso. Baixe do Figma (`download_assets`) os
    assets que a referência não tiver e otimize.
5b. **Limpe os resíduos do produto de referência** (imagens órfãs, scripts de
    plataforma/tracking, nomes/cores antigos) — mesma regra de limpeza de 3.3.
    Preserve a estrutura de `dtc-b/assets/{img,css,js}` do padrão do time;
    depoimentos com **Swiper**; responsivo (breakpoint `900px`).

Em qualquer modo, a `dtc-b` final deve ficar **100% fiel ao design do Figma**.

### 3.2 Construir a `.com` (`index.html` da raiz) a partir do Figma
1. Mesmo procedimento do passo 3.1 (skill `figma-design-to-code` antes de
   `get_design_context`), para o frame/link da `.com`.
2. **Hero e demais imagens:** baixe do Figma (`download_assets`) o background, o
   pote/mockup e os outros assets; **otimize (nenhuma imagem > 1MB)** e salve em
   `assets/img/`. O nome vem do design; a paleta, do link/texto informado.
3. **Seção de kits:** pegue a seção de kits da `dtc-b/` (passo 3.1), ajustando
   cores, imagens e copys para a `.com`.
4. **Depoimentos:** monte com **Swiper**.
5. Gere o `index.html` na raiz com `assets/{img,css,js}` (`style.scss`,
   `main.js`); responsivo (breakpoint `900px`).

As páginas de Figma devem ficar **100% fiéis** ao design dentro do padrão de
código.

### 3.3 Adaptar as demais páginas de front
Adapte, a partir das referências, para o produto novo (paleta, mockups, copy,
nome, links), **preservando a estrutura e os paths** que cada página já usa (não
reorganize pastas nem reescreva o layout):
- **thank** — página de obrigado; aplique a paleta e adapte a copy ao produto.
- **vsl** — página de VSL; adapte copy, cores e mockups.
- **bonus** — página de bônus; adapte copy, cores e os e-books/itens de bônus.

**Limpeza obrigatória (vale para 3.3 e 3.4).** As páginas vêm de outro produto e
carregam lixo que **não pode ir para a entrega**. Em cada página adaptada,
remova:
- **Imagens/arquivos órfãos** — qualquer asset em `assets/` que não é mais
  referenciado no HTML/CSS/JS (mockups, logos, e-books, ícones do produto
  antigo). Deixe só o que a página usa de fato.
- **Scripts de plataforma/terceiros do produto anterior** — pixels e tags
  (Facebook/Meta, TikTok, Google Analytics/GTM), scripts de funil/checkout
  (Cartpanda e afins), chats, A/B, remarketing e IDs/tokens do produto antigo.
  Remova o que for do produto/konta anterior; só mantenha (re-apontando para o
  produto novo) o que for realmente necessário para a página funcionar.
- **Resíduos de código** — comentários, blocos e `<link>`/`<script>` mortos,
  arquivos duplicados ou de exemplo.

Ao terminar, confira que todo `src`/`href` resolve e que não sobrou nada do
produto/plataforma antigos.

### 3.4 Adaptar os rodapés (Cartpanda) — regra do fluxo
As páginas de rodapé estão **na raiz** e são de **outro produto** (padrão
**Cartpanda**). A IA **deve adaptá-las** para o produto atual — essa é uma regra
do fluxo. Para cada uma (contact, terms, privacy, reference, shipping, refund,
disclaimer):
- **Comente o HTML** explicando os blocos (padrão Cartpanda), para facilitar a
  manutenção futura.
- **Adapte** a paleta de cores e o **nome do produto/marca** (e dados de
  contato/endereço quando existirem na referência). Não deixe sobrar nenhum
  nome, cor ou dado do produto antigo.

Detalhes e checklist por página: [references/adaptacao-e-rodapes.md](references/adaptacao-e-rodapes.md).

### 3.5 Aplicar o favicon em todas as páginas
Baixe o favicon do link do Figma, **otimize** (bem leve, muito abaixo de 1MB) e
salve nos assets de cada página. Inclua no `<head>` de **todas** as páginas
(`.com`, `dtc-b`, `thank`, `vsl`, `bonus` e rodapés) a referência ao favicon.
Padrão real usado nas páginas:
`<link rel="shortcut icon" href="assets/img/favicon.png" type="image/png" />`.
Ajuste o caminho **relativo** para funcionar tanto nas páginas da raiz quanto nas
que estão em subpastas (`dtc-b/`, `thank/`, `vsl/`, `bonus/`).

## 4. Checklist final (antes de entregar)

- [ ] Pré-requisitos checados; referências (thank, vsl, bonus, rodapés e, se
      modo B, a dtc-b) eram do mesmo nicho; links do Figma (.com, dtc-b, favicon)
      e a paleta (link ou escrita) presentes.
- [ ] `dtc-b/index.html` **100% fiel ao design do Figma** (modo A: construída do
      zero; modo B: base da dtc-b de referência ajustada ao Figma e sem sobras do
      produto antigo).
- [ ] `index.html` (`.com`) fiel ao Figma; hero, mockups e nome do design, paleta
      do link/texto; kits vindos da `dtc-b`.
- [ ] Todas as imagens otimizadas; **nenhuma imagem passa de 1MB**.
- [ ] `thank`, `vsl`, `bonus` adaptadas (paleta, mockups, copy, nome, links) —
      sem sobras do produto de referência (nome/cores antigos).
- [ ] Rodapés (na raiz) comentados e adaptados (paleta + nome do produto).
- [ ] Favicon aplicado no `<head>` de TODAS as páginas (caminho relativo correto
      na raiz e nas subpastas).
- [ ] Páginas do Figma (`.com`, `dtc-b`) no padrão mayor-code-style: HTML limpo
      sem BEM, SCSS em árvore com media queries aninhadas (`900px`), `<main>` só
      no hero, ordem do `style.scss` correta, seletores do `main.js` batendo com
      o HTML, `assets/{img,css/style.scss,js/main.js}`, depoimentos com Swiper.
- [ ] Páginas adaptadas preservaram a estrutura/paths originais (não viraram
      SCSS nem tiveram pastas reorganizadas); imagens otimizadas.
- [ ] **Limpeza feita:** removidas imagens/arquivos órfãos e scripts de
      plataforma/tracking (pixels, GA/GTM, funil/checkout, chats) do produto
      anterior; nenhum `src`/`href` quebrado.
- [ ] Nenhuma referência órfã ao produto/marca antigos em texto, alt, title,
      links ou meta tags.
