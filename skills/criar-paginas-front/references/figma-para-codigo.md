# Do Figma para o código (.com e dtc-b)

Como ler o Figma sem perder detalhe e transformar o design em código **no padrão do time**
([padrao-codigo.md](padrao-codigo.md)). O objetivo é a página ficar **igual ao design**, e a fase de QA
visual só termina quando a comparação print × Figma não mostra diferença.

## 1. Preparar

- Do link, extraia `fileKey` e `nodeId` (`figma.com/design/<fileKey>/...?node-id=1-2` → nodeId `1:2`).
- Siga o que o MCP do Figma exigir antes das chamadas (ex.: abrir sessão do arquivo; carregar a skill
  `figma-design-to-code` antes do `get_design_context`, se ela existir no ambiente). O MCP oficial do
  Figma tem as mesmas ferramentas no Claude Code e no Codex (`get_metadata`, `get_design_context`,
  `get_screenshot`, `get_variable_defs`…); o prefixo do nome pode variar conforme o ambiente.
- Sem MCP do Figma conectado → **pare** e peça ao usuário para conectar. Não reconstrua "de olho".

## 2. Mapear as seções antes de escrever código

1. `get_metadata` no frame da página → lista dos frames filhos (as **seções**), com nome, posição e altura.
2. Monte a lista de seções **na ordem vertical** e o nome de classe de cada uma (padrão: `.hero`,
   `.beneficios`, `.testimonials`, `.area-kits`, `.guarantee`, `.faq`…).
3. Veja se existe frame **mobile** do mesmo design. Se existir, pareie cada seção desktop com a mobile.
4. Registre essa lista em `.pagesfront/progresso.md`; ela vira o roteiro da página.

**Nunca peça o `get_design_context` da página inteira de uma vez**: em landing pages longas a resposta
vem truncada ou genérica e a IA preenche o resto inventando. Peça **por seção**.

## 3. Para cada seção

1. `get_screenshot` da seção → é a referência visual (guarde mentalmente o que ver: alinhamentos,
   quebras de linha, proporções).
2. `get_design_context` da seção → medidas, textos, cores, fontes e assets.
3. Extraia e use **literalmente**:
   - **Textos**: copie exatamente como estão no Figma (mesmo idioma, maiúsculas, pontuação, quebras de
     linha intencionais com `<br>`). Não reescreva copy.
   - **Tipografia**: família, tamanho, peso, altura de linha, espaçamento entre letras.
   - **Cores**: mapeie para as variáveis da paleta (`$primary`, `$darck`…). Cor que não está na paleta
     → crie variável nova no topo do SCSS; não espalhe hex.
   - **Espaçamentos**: paddings, gaps, margens, raios de borda, sombras, bordas.
   - **Imagens**: baixe cada asset (ver 4).
4. Escreva o HTML da seção no padrão e o bloco SCSS correspondente **na posição certa** do arquivo
   (seções na ordem do HTML).
5. O retorno do `get_design_context` costuma vir em **React + Tailwind** com posicionamento absoluto.
   É **referência**, não código:
   - nada de `className`, classes utilitárias (`flex`, `px-4`, `text-[#...]`), nem `style={{}}`;
   - troque posicionamento absoluto por flex/grid; use `position: absolute` só para sobreposição
     decorativa (selos, badges, formas atrás do mockup).

## 4. Assets

- O MCP devolve URLs temporárias (`http://localhost:3845/assets/...` ou URLs de asset do Figma).
  **Baixe** cada uma (`download_assets`, ou `curl -o` na URL) para `assets/img/` com nome descritivo
  (`hero-bg.png`, `pote-6.png`, `selo-garantia.png`). O validador acusa (H4) qualquer URL dessas que
  sobrar no código, porque elas expiram.
- Ícones e formas vetoriais: prefira **SVG**.
- Depois de baixar tudo: `node $SKILL/scripts/otimizar-imagens.mjs <pasta>/assets/img --webp`
  (converte para webp, limita a 1920px, garante < 1MB e atualiza os caminhos no HTML/SCSS).

## 5. Larguras e responsivo

- O frame desktop costuma ter 1440px. A largura útil do conteúdo no Figma vira o `max-width` do
  `.container`.
- **Com frame mobile**: os valores dele vão nos `@media (max-width: 900px)` dentro de cada bloco.
- **Sem frame mobile**: empilhe colunas (grid → 1 coluna), headings em ~70% do tamanho, paddings de
  seção em ~70%, imagens com `max-width: 100%`, e confira no print de 390px.
- Nada pode vazar para o lado no mobile: o `capturar.mjs` acusa overflow horizontal.

## 6. Kits

- A seção de kits da **dtc-b** é a base da `.com`: mesmos kits, mesmos preços, mesma ordem e o mesmo
  link de checkout por kit.
- **Checkout:** menor quantidade de potes → `href="linkoffer1"`, média → `href="linkoffer3"`, maior →
  `href="linkoffer2"` (ex.: 2 bottles → `linkoffer1`, 3 → `linkoffer3`, 6 → `linkoffer2`). Não é
  pendência.
- **Mobile:** em coluna, do maior para o menor (6 → 3 → 2), mesmo que o Figma mobile mostre outra
  ordem. Use `order` (exemplo em [padrao-codigo.md](padrao-codigo.md)).
- Use a estrutura `.area-kits > ul > li.kit-option` (`.best-option` no destaque).

## 6.1 FAQ

- Copy completa no Figma (perguntas e respostas) → use a do Figma.
- Sem a copy completa no Figma → use o FAQ da referência do mesmo nicho **como está** (dtc-b de
  referência no modo B; senão, o da `vsl/` ou de outra página de referência), trocando só o nome do
  produto antigo. Não invente perguntas e não marque como `PENDENTE`.

## 7. QA visual (obrigatória, por seção)

1. `node $SKILL/scripts/validar.mjs --so <pagina> --compilar` → 0 erros.
2. `node $SKILL/scripts/capturar.mjs <pagina>/index.html` → prints em
   `.pagesfront/capturas/<pagina>/<largura>/NN-<secao>.png`. Ele também acusa erro de JS, arquivo que
   não carregou e overflow horizontal: resolva antes de comparar.
3. Para cada seção, abra o print (desktop) e o `get_screenshot` da mesma seção e compare, item a item.
   Para ver o PNG, use a ferramenta de imagem do seu ambiente (Claude Code: `Read` no arquivo;
   Codex: `view_image`). Não compare "de memória": abra os dois. Itens:
   - elementos presentes e na mesma ordem;
   - textos idênticos e com as mesmas quebras de linha nas headlines;
   - tamanho e peso das fontes;
   - cores de fundo, texto e botões;
   - espaçamentos (topo/base da seção, gaps entre elementos);
   - alinhamento (centro/esquerda), largura do conteúdo;
   - tamanho, proporção e recorte das imagens;
   - botões: cor, raio, sombra, tamanho.
4. Escreva a lista de diferenças encontradas, corrija e capture de novo. No máximo **3 rodadas por
   seção**; o que restar vai para o relatório final com o motivo.
5. Repita no mobile (390px) comparando com o frame mobile, se existir, ou checando se o empilhamento
   ficou limpo, se não existir.
