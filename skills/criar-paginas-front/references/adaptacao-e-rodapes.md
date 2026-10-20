# Checklist de adaptação e rodapés

As páginas `thank`, `vsl`, `bonus` e os **rodapés** chegam de **outro produto**
(mesmo nicho). A IA adapta o conteúdo para o produto atual, **preservando a
estrutura e os paths** que a página já usa.

## Princípio geral da adaptação

A **identidade do produto novo** (nome, paleta/cores, hero, mockups) é a mesma
que foi extraída do **Figma** ao montar a `.com`/`dtc-b`. Reaproveite-a aqui: as
imagens de produto já baixadas em `assets/img/`, os hex da paleta e o nome do
produto. Não peça esses dados ao usuário.

Adaptar = trocar identidade do produto, **não** reescrever o layout. Para cada
página de referência:

1. **Paleta de cores** → aplicar a paleta do produto novo em todas as variáveis
   de cor / valores de cor usados.
2. **Nome do produto e marca** → no `<title>`, headings, textos, selos,
   assinaturas e e-mails de suporte.
3. **Mockups/imagens do produto** → trocar pelos assets do produto novo,
   mantendo os nomes de arquivo quando possível (ou atualizando os `src`).
4. **Copys/claims** → ajustar ao produto (ingredientes, benefícios, garantia,
   depoimentos) sem mudar a estrutura de seções do nicho.
5. **Links** → checkout/upsell/âncoras e links entre páginas apontando para o
   produto certo.
6. **Favicon** → referenciar o favicon correto no `<head>`.
7. **Limpar o lixo do produto antigo** → ver a seção "Limpeza" abaixo.
8. **Varredura final** → nenhum nome, cor, imagem, e-mail ou link do produto
   **antigo** pode sobrar (busque no texto, `alt`, `title`, `meta`, `href`,
   `src` e comentários).

## Limpeza (obrigatória em toda página adaptada)

As páginas chegam de outro produto e trazem lixo que **não pode ir para a
entrega**. Em cada página adaptada (`thank`, `vsl`, `bonus` e os rodapés),
remova:

- **Imagens e arquivos órfãos** — tudo em `assets/` que não é mais referenciado
  pelo HTML/CSS/JS depois da adaptação: mockups, logos, e-books/PDFs, ícones,
  fontes, `.DS_Store` e afins do produto anterior. Regra prática: liste o que o
  HTML/CSS/JS usa e apague o resto da pasta de assets.
- **Scripts de plataforma e de terceiros do produto/konta anterior:**
  - pixels e tags: Facebook/Meta Pixel, TikTok Pixel, Google Analytics/GTM,
    Pinterest, etc.;
  - funil/checkout: Cartpanda e similares, upsell/one-click, trackers de pedido;
  - chat/suporte, mapas de calor, A/B testing, remarketing;
  - qualquer `id`, token, `data-*` ou URL de conta amarrada ao produto anterior.

  Remova o que for do produto antigo. Só mantenha (re-apontando para o produto
  novo) o que a página realmente precisa para funcionar — e confirme o ID/credencial
  novo com o usuário quando necessário.
- **Resíduos de código** — `<script>`/`<link>` mortos, blocos comentados,
  arquivos duplicados ou de exemplo, CSS/JS não usados.

Ao final, garanta que **todo `src`/`href` resolve** e que nenhuma imagem passa de
**1MB**.

## Por página

- **thank** (obrigado): aplicar paleta e nome; adaptar copy de pós-compra, área
  de membros/bônus e botões. Preservar a estrutura de assets da referência
  (pode ser `assets/images/`, `assets/script.js`, `assets/ebooks/`).
- **vsl**: adaptar copy, cores, mockups e o player/thumb da VSL; manter âncoras e
  o bloco de kits/checkout.
- **bonus**: adaptar copy, cores, mockups e os e-books/itens de bônus (trocar
  capas e títulos pelos bônus do produto novo).

## Rodapés — padrão Cartpanda

As 7 páginas de rodapé (`contact`, `terms`, `privacy`, `reference`, `shipping`,
`refund`, `disclaimer`) estão **na raiz** e seguem um padrão Cartpanda:

- **Tailwind via CDN** (`<script src="https://cdn.tailwindcss.com"></script>`) +
  um bloco **`<style>` inline** no `<head>` com a **paleta em variáveis `:root`**
  e alguns componentes (`.btn-support`, `.step-title`, etc.). Fonte Google
  (ex.: Roboto). **Não** usam `style.scss` — são autocontidas.
- Imagens em `assets/img/...` (compartilham o `assets/` da raiz) e favicon em
  `assets/img/favicon.png`.
- Media query principal em `max-width: 900px`.

### Regras ao adaptar cada rodapé

1. **Comente o HTML** explicando os blocos do padrão Cartpanda (header/banner,
   seções de passos, caixa de aviso, bloco de suporte) — facilita a manutenção.
2. **Troque a paleta** nas variáveis `:root` (o bloco costuma vir rotulado, ex.:
   `/* Cardio Honey palette */` → renomear para o produto novo e trocar os hex).
3. **Troque o nome do produto/marca** no `<title>` (ex.:
   `"<Produto> — Contact Us"`), headings, textos e na assinatura do time de
   suporte.
4. **Dados de contato/jurídicos**: ajustar e-mail/telefone/endereço quando a
   referência os tiver, ao que valer para o produto novo (mantendo o
   provedor/estrutura, ex.: `support@cartpanda.com`, se for o caso).
5. **Favicon**: `<link rel="shortcut icon" href="assets/img/favicon.png" ...>`.
6. **Não** reescrever para SCSS nem remover o Tailwind — manter o padrão
   autocontido da Cartpanda.

### Exemplo de bloco de paleta a adaptar

```html
<style>
  :root {
    /* <Produto> palette */
    --clr-text: #586571;
    --clr-primary: #b80012;   /* trocar pelos hex do produto novo */
    --clr-light: #fff;
    --clr-darck: #b80012;
    --clr-mid: #b80012;
    --clr-black: #0e0d11;
    --clr-border: rgba(99, 135, 149, 0.25);
  }
</style>
```
