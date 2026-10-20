# Estrutura de pastas e arquivos

Como o usuário envia as páginas e onde cada coisa fica. A `.com` e os **rodapés**
ficam **na raiz** (sem pasta de tipo). `dtc-b`, `thank`, `vsl` e `bonus` ficam em
**pastas próprias**.

```
(raiz do projeto)/
├─ index.html              ← a .com  — chega como ESQUELETO vazio → preencher do Figma
├─ contact.html            ← rodapé  (de outro produto → ADAPTAR)
├─ terms.html              ← rodapé  (ADAPTAR)
├─ privacy.html            ← rodapé  (ADAPTAR)
├─ reference.html          ← rodapé  (ADAPTAR)
├─ shipping.html           ← rodapé  (ADAPTAR)
├─ refund.html             ← rodapé  (ADAPTAR)
├─ disclaimer.html         ← rodapé  (ADAPTAR)
├─ assets/                 ← assets da .com + compartilhado pelos rodapés da raiz
│  ├─ img/                 ← imagens baixadas do Figma (hero, mockups) + favicon
│  ├─ css/
│  │  └─ style.scss        (o compilador gera style.css + style.css.map)
│  └─ js/
│     └─ main.js
│
├─ dtc-b/                  ← do Figma (padrão mayor-code-style). Modo A: do zero.
│  ├─ index.html              Modo B: base de uma dtc-b do mesmo nicho AJUSTADA
│  └─ assets/{img/, css/style.scss, js/main.js}   até ficar igual ao Figma.
│
├─ vsl/                    ← de outro produto → ADAPTAR
│  ├─ index.html
│  └─ assets/{img/, css/style.scss, js/main.js}
│
├─ thank/                  ← de outro produto → ADAPTAR (mantém a estrutura dele)
│  ├─ index.html
│  └─ assets/              (ex.: images/, script.js, ebooks/ — varia por produto)
│
└─ bonus/                  ← de outro produto → ADAPTAR (mantém a estrutura dele)
   ├─ index.html
   └─ assets/              (ex.: images/, script.js, ebooks/ — varia por produto)
```

## Convenções observadas (importantes)

- **Não force uma estrutura única nas páginas adaptadas.** As páginas que vêm de
  outro produto (`thank`, `bonus` e os rodapés) chegam com a estrutura daquele
  produto (às vezes `assets/images/`, `assets/script.js`, `assets/ebooks/`, ou
  Tailwind inline). **Adapte o conteúdo** (cores, nome, copy, mockups),
  **preservando a estrutura/paths que a página já usa**. Não reorganize pastas
  sem necessidade — isso quebraria os `src`/`href` existentes.
- **Páginas geradas do Figma (`.com` e `dtc-b`)** seguem o **mayor-code-style**:
  `index.html` + `assets/img/` + `assets/css/style.scss` + `assets/js/main.js`.
  O `style.css`/`style.css.map` são gerados pelo compilador Sass (Live Sass),
  não escritos à mão.
- **Rodapés (raiz)** compartilham o `assets/` da raiz (ex.: imagens em
  `assets/img/...`, favicon em `assets/img/favicon.png`). Veja o padrão
  Cartpanda em [adaptacao-e-rodapes.md](adaptacao-e-rodapes.md).
- **Hero da `.com`:** o background, o pote/mockup e as demais imagens são
  **baixados do Figma** (`download_assets`), otimizados e salvos em
  `assets/img/`. O usuário **não** envia essas imagens à parte. Nome e paleta do
  produto também saem do design.
- **Favicon:** baixado do link do Figma, otimizado e salvo nos assets de cada
  página; referenciado no `<head>` (ex.: raiz `assets/img/favicon.png`;
  `dtc-b/assets/img/favicon.png`). Use o caminho **relativo** correto de cada
  página. Ex. real:
  `<link rel="shortcut icon" href="assets/img/favicon.png" type="image/png" />`.
- **Peso das imagens:** otimize todo asset; **nenhuma imagem do site pode passar
  de 1MB** (comprima, redimensione ao tamanho de exibição, prefira `.webp`).

## Fonte de cada página (resumo)

| Página       | Local                 | Origem                      | Estrutura                         |
|--------------|-----------------------|-----------------------------|-----------------------------------|
| `.com`       | `index.html` (raiz)   | **Figma** (reproduzir fiel) | mayor-code-style (`assets/{img,css,js}`) |
| `dtc-b`      | `dtc-b/index.html`    | **Figma** (fiel). Opcional: dtc-b do mesmo nicho como base, ajustada ao Figma | mayor-code-style |
| `vsl`        | `vsl/index.html`      | Referência → **adaptar**    | preservar a da referência         |
| `thank`      | `thank/index.html`    | Referência → **adaptar**    | preservar a da referência         |
| `bonus`      | `bonus/index.html`    | Referência → **adaptar**    | preservar a da referência         |
| rodapés (7)  | `*.html` (raiz)       | Outro produto → **adaptar** | Cartpanda (Tailwind CDN + style inline) |
