# Adaptação (thank, vsl, bonus) e rodapés

As páginas `thank`, `vsl`, `bonus` e os **rodapés** chegam de **outro produto do mesmo nicho**. A IA
troca a identidade para o produto atual, **preservando a estrutura e os caminhos** que a página já usa.

Fonte da identidade nova: `.pagesfront/produto.json` (nome, paleta, kits, links) e as imagens do
produto já baixadas do Figma nas fases da `.com` e da `dtc-b`. Não peça esses dados ao usuário de novo.

## O que fica como veio (mesmo nicho)

A referência é do mesmo nicho, então estes itens **não** são trocados, removidos nem marcados como
`PENDENTE`:

| Onde | Fica como está |
|---|---|
| `vsl/` | Player da VSL (scripts vturb/ConverteAI, `<vturb-smartplayer>`, IDs), elementos com `data-delay` e o script de delay do pitch |
| `bonus/` | Os bônus: títulos, mockups/capas, imagens, links e arquivos (PDFs) |
| FAQ (qualquer página) | Perguntas e respostas da referência, se o Figma não tiver a copy completa. Troque só o nome do produto |
| Rodapés | A copy geral (termos, privacidade, frete, reembolso, disclaimer, referências, contato) |
| `contact.html` | As imagens: tags, `src` e nomes de arquivo ficam iguais, **mesmo quebrados** |

## Princípio

Adaptar = trocar a identidade do produto, **não** reescrever o layout.

1. **Paleta:** troque as cores antigas pelas novas **em todos os lugares onde elas aparecem**:
   - variáveis `:root` / `$variaveis` do SCSS / CSS compilado (recompile se houver `style.scss`);
   - `tailwind.config` inline, classes arbitrárias (`bg-[#b80012]`, `text-[#586571]`);
   - `style=""` inline, SVGs inline (`fill`, `stroke`), gradientes e sombras com `rgba()` da cor antiga.

   Use as cores antigas listadas pelo `validar.mjs --pre` para fazer a busca.
2. **Nome do produto/marca:** `<title>`, headings, textos, `alt`, selos, assinaturas, meta tags,
   comentários e **nomes de arquivo** (`cardio-honey-pote.png` → renomeie e atualize o `src`).
3. **Mockups/imagens do produto:** use as imagens do produto novo já baixadas do Figma. Copie para a
   pasta de imagens **que a página já usa** (`assets/images/`, `assets/img/`…), mantendo o padrão de
   nomes da página quando der, e atualize os `src`.
4. **Copy:** ajuste ao produto novo **só com fatos que existem** no Figma ou no briefing (nome,
   benefícios e garantia que aparecem no design). Se a referência cita algo específico do produto
   antigo (ingrediente, número, estudo, depoimento) e o produto novo não tem equivalente no
   Figma/briefing, **remova a frase ou deixe genérica**. Nunca invente. Exceções: FAQ, bônus e copy
   geral dos rodapés ficam (tabela acima).
5. **Links:** o checkout dos kits segue o padrão do time: menor quantidade de potes →
   `href="linkoffer1"`, média → `href="linkoffer3"`, maior → `href="linkoffer2"` (ex.: 2 bottles →
   `linkoffer1`, 3 → `linkoffer3`, 6 → `linkoffer2`). Troque por eles **todo** link de checkout do
   produto antigo nos kits. Upsell e âncoras vêm do briefing; sem link → `#PENDENTE-<o-que-é>`. Links
   entre páginas (rodapés, `../index.html`) precisam resolver. O validador acusa checkout antigo (T2) e
   `linkoffer` fora do padrão (K1).
6. **Kits no mobile:** em coluna, do maior para o menor (6 → 3 → 2), seja qual for a ordem no desktop.
   Use o que a página já usa: CSS com `order` dentro do `@media` ou classes `order-*` do Tailwind. O
   `capturar.mjs` confere no print de 390px.
7. **Favicon:** copie `.pagesfront/favicon.png` para a pasta de imagens da página e referencie no
   `<head>` com o caminho relativo correto.
8. **Limpeza** (seção abaixo).
9. **Validação:** `node $SKILL/scripts/validar.mjs --so <pagina> --compilar`, até 0 erros, e depois
   `capturar.mjs` para ver se nada quebrou.

## Limpeza (obrigatória em toda página adaptada)

- **Arquivos órfãos:** tudo nas pastas de assets que nada mais referencia (mockups, logos,
  e-books/PDFs, ícones e fontes do produto anterior, `.DS_Store`). O validador lista cada um (A1/A2).
- **Scripts de plataforma e de terceiros do produto ou da conta anterior** (T1):
  - pixels e tags: Meta/Facebook, TikTok, Google Analytics/GTM, Pinterest, Kwai, Snapchat, Bing,
    Taboola/Outbrain, Clarity, Hotjar, Utmify;
  - funil e checkout: scripts da Cartpanda e similares, upsell/one-click, rastreio de pedido;
  - chat, mapas de calor, A/B, remarketing;
  - qualquer `id`, token, `data-*` ou URL de conta amarrada ao produto anterior.

  Remova. Se o usuário pedir explicitamente para manter algum (com o ID novo), declare em
  `scripts_permitidos` no briefing.
- **Exceção: o player da VSL não é limpeza.** Scripts vturb/ConverteAI, `<vturb-smartplayer>`, IDs do
  vídeo, elementos com `data-delay` e o script de delay do pitch **ficam exatamente como estão**. Não
  remova, não troque e não mova. Pixels que estejam junto (Utmify, Meta…) continuam saindo.
- **Resíduos de código:** `<script>`/`<link>` mortos, blocos comentados, arquivos duplicados ou de
  exemplo, CSS/JS que nada usa.

## Por página

- **thank:** paleta e nome; copy de pós-compra, acesso à área de membros/bônus e botões. Links de
  acesso vêm do briefing ou ficam `PENDENTE`.
- **vsl:** nome, cores e mockups do produto. **Player, `data-delay` e script de delay do pitch ficam
  intactos.** Mantenha as âncoras e o bloco de kits, com os kits do briefing, os `href` no padrão
  `linkoffer` e a ordem do maior para o menor no mobile. O FAQ fica. As partes que o delay esconde não
  aparecem nos prints do `capturar.mjs` (é o esperado), e os avisos do player aparecem à parte: não são
  motivo para mexer em nada do player.
- **bonus:** nome, cores e mockup do produto. **Os bônus ficam como vieram**: títulos, capas/mockups,
  imagens, links e PDFs. Se um título de bônus citar o nome do produto antigo, troque só o nome. O
  validador avisa (N4, não bloqueia) quando um link ou imagem da página de bônus tem o nome antigo: se
  for de um bônus, mantenha; se for o mockup do produto, troque.

## Rodapés: padrão Cartpanda

As 7 páginas (`contact`, `terms`, `privacy`, `reference`, `shipping`, `refund`, `disclaimer`) ficam
**na raiz** e são autocontidas:

- **Tailwind via CDN** + um `<style>` inline no `<head>` com a **paleta em variáveis `:root`** e alguns
  componentes (`.btn-support`, `.step-title`…). Fonte do Google (ex.: Roboto). Não usam `style.scss`.
- Imagens em `assets/img/...` (compartilham o `assets/` da raiz); favicon em `assets/img/favicon.png`.
- Media query principal em `max-width: 900px`.

### Regras ao adaptar cada rodapé

1. **Comente o HTML** por blocos do padrão Cartpanda (header/banner, seções de passos, caixa de aviso,
   bloco de suporte), para facilitar a manutenção.
2. **Paleta:** troque as variáveis do `:root` e renomeie o rótulo (`/* Cardio Honey palette */` →
   `/* <Produto> palette */`). Procure também cores soltas no `<style>` e em classes Tailwind.
3. **Nome do produto/marca** no `<title>` (`"<Produto> — Contact Us"`), headings, textos e assinatura
   do time de suporte.
4. **Copy geral fica.** Termos, privacidade, frete, reembolso, disclaimer, referências e contato são do
   mesmo nicho: troque só o nome do produto e **não** marque nada como `PENDENTE` por causa da copy.
5. **Contato:** e-mail, telefone e endereço do briefing. O que for do provedor e valer para qualquer
   produto (ex.: `support@cartpanda.com`) fica. Só um dado amarrado ao produto antigo (ex.: e-mail com
   o nome da marca antiga) sai ou vira `PENDENTE`.
6. **Imagens do `contact.html`: não mexa.** Elas são feitas à parte e o usuário coloca em `assets/`
   depois. Deixe as tags `<img>`, os `src` e os nomes de arquivo **exatamente como estão, mesmo
   quebrados**. Não remova, não renomeie, não troque por outra imagem e não invente seção para
   substituir. O validador lista cada uma como aviso P2 (não erro): copie essa lista para o relatório
   final como pendência ("colocar estas imagens em `assets/`").
7. **Favicon:** `<link rel="shortcut icon" href="assets/img/favicon.png" type="image/png" />`.
8. **Não** reescreva em SCSS nem tire o Tailwind.
9. `node $SKILL/scripts/validar.mjs --so rodapes`, até 0 erros.

### Exemplo de bloco de paleta

```html
<style>
  :root {
    /* <Produto> palette */
    --clr-text: #586571;
    --clr-primary: #b80012; /* trocar pelos hex do produto novo */
    --clr-light: #fff;
    --clr-darck: #b80012;
    --clr-mid: #b80012;
    --clr-black: #0e0d11;
    --clr-border: rgba(99, 135, 149, 0.25);
  }
</style>
```
