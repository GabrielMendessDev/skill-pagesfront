# Adaptação (thank, vsl, bonus) e rodapés

As páginas `thank`, `vsl`, `bonus` e os **rodapés** chegam de **outro produto do mesmo nicho**. A IA
troca a identidade para o produto atual, **preservando a estrutura e os caminhos** que a página já usa.

Fonte da identidade nova: `.pagesfront/produto.json` (nome, paleta, kits, links) e as imagens do
produto já baixadas do Figma nas fases da `.com` e da `dtc-b`. Não peça esses dados ao usuário de novo.

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
   Figma/briefing, **remova a frase ou deixe genérica**. Nunca invente.
5. **Links:** checkout, upsell e âncoras vêm do briefing; sem link → `#PENDENTE-<o-que-é>`. Links entre
   páginas (rodapés, `../index.html`) precisam resolver. O validador acusa (T2) checkout não declarado.
6. **Favicon:** copie `.pagesfront/favicon.png` para a pasta de imagens da página e referencie no
   `<head>` com o caminho relativo correto.
7. **Limpeza** (seção abaixo).
8. **Validação:** `node $SKILL/scripts/validar.mjs --so <pagina> --compilar`, até 0 erros, e depois
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
- **Player da VSL:** o embed (vturb, ConverteAI, Panda, Wistia, YouTube…) é do produto antigo. Se o
  briefing tiver o vídeo novo, troque; se não, deixe o contêiner do player com
  `<!-- PENDENTE-video-vsl -->` e um `data-pendente="video-vsl"`, sem o script antigo.
- **Resíduos de código:** `<script>`/`<link>` mortos, blocos comentados, arquivos duplicados ou de
  exemplo, CSS/JS que nada usa.

## Por página

- **thank:** paleta e nome; copy de pós-compra, acesso à área de membros/bônus e botões. Links de
  acesso vêm do briefing ou ficam `PENDENTE`.
- **vsl:** copy, cores, mockups, thumb e player da VSL (ver acima); mantenha as âncoras e o bloco de
  kits/checkout com os kits e links do briefing.
- **bonus:** copy, cores, mockups e itens de bônus. Capas e títulos de bônus **só** se vierem no
  briefing ou no Figma. Se não vierem, mantenha a estrutura com `PENDENTE-bonus-<n>` nos títulos e
  capas e remova os PDFs antigos.

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
4. **Contato/jurídico:** e-mail, telefone e endereço do briefing. O que for do provedor e valer para
   qualquer produto (ex.: `support@cartpanda.com`) pode ficar. O que for do produto antigo sai ou vira
   `PENDENTE`.
5. **Favicon:** `<link rel="shortcut icon" href="assets/img/favicon.png" type="image/png" />`.
6. **Não** reescreva em SCSS nem tire o Tailwind.
7. `node $SKILL/scripts/validar.mjs --so rodapes`, até 0 erros.

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
