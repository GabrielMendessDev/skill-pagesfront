# Estrutura de pastas e arquivos

A `.com` e os **rodapés** ficam **na raiz**. `dtc-b`, `thank`, `vsl` e `bonus` ficam em **pastas
próprias**. A pasta `.pagesfront/` guarda o material de trabalho da skill e não vai para a hospedagem.

```
(raiz do projeto)/
├─ index.html              ← .com: chega como ESQUELETO vazio → construir do Figma
├─ contact.html            ← rodapé (de outro produto → ADAPTAR)
├─ terms.html              ← rodapé (ADAPTAR)
├─ privacy.html            ← rodapé (ADAPTAR)
├─ reference.html          ← rodapé (ADAPTAR)
├─ shipping.html           ← rodapé (ADAPTAR)
├─ refund.html             ← rodapé (ADAPTAR)
├─ disclaimer.html         ← rodapé (ADAPTAR)
├─ assets/                 ← assets da .com, compartilhados com os rodapés da raiz
│  ├─ img/                 ← imagens do Figma (hero, mockups) + favicon.png
│  ├─ css/
│  │  ├─ style.scss        ← fonte (escrita pela IA)
│  │  └─ style.css (+.map) ← gerado pelo sass (validar.mjs --compilar ou Live Sass)
│  └─ js/
│     └─ main.js
│
├─ dtc-b/                  ← Figma, no padrão de código. Modo A: do template.
│  ├─ index.html              Modo B: dtc-b de referência AJUSTADA ao Figma.
│  └─ assets/{img/, css/style.scss, js/main.js}
│
├─ vsl/                    ← de outro produto → ADAPTAR (mantém a estrutura dele)
│  ├─ index.html
│  └─ assets/              (pode ter css/style.scss, img/, js/…)
│
├─ thank/                  ← de outro produto → ADAPTAR (mantém a estrutura dele)
│  ├─ index.html
│  └─ assets/              (ex.: images/, script.js, ebooks/ — varia por produto)
│
├─ bonus/                  ← de outro produto → ADAPTAR (mantém a estrutura dele)
│  ├─ index.html
│  └─ assets/              (ex.: images/, script.js, ebooks/ — varia por produto)
│
└─ .pagesfront/            ← material de trabalho (não subir)
   ├─ produto.json         ← briefing: fonte única de verdade (o validador lê daqui)
   ├─ progresso.md         ← checklist das fases, para retomar
   ├─ favicon.png          ← favicon baixado do Figma (cada página copia daqui)
   └─ capturas/            ← prints por seção gerados pelo capturar.mjs
```

## Convenções

- **Não force uma estrutura única nas páginas adaptadas.** `thank`, `vsl`, `bonus` e os rodapés chegam
  com a estrutura do produto de referência (`assets/images/`, `assets/script.js`, `assets/ebooks/`,
  Tailwind inline…). Adapte o conteúdo e **preserve estrutura e caminhos**. Reorganizar pastas quebra
  os `src`/`href`.
- **Páginas do Figma (`.com` e `dtc-b`)** seguem o padrão de código
  ([padrao-codigo.md](padrao-codigo.md)): `index.html` + `assets/img/` + `assets/css/style.scss` +
  `assets/js/main.js`. O HTML carrega o `style.css` **compilado**. Depois de mexer no `.scss`, rode
  `validar.mjs --compilar` (ou deixe o Live Sass compilar). Sem isso a página fica com o estilo velho.
- **Rodapés** usam o `assets/` da raiz (imagens em `assets/img/...`, favicon em
  `assets/img/favicon.png`).
- **Hero e imagens da `.com`/`dtc-b`:** baixados do Figma, otimizados com
  `otimizar-imagens.mjs --webp` e salvos em `assets/img/`. O usuário não manda essas imagens à parte.
- **Favicon:** em todas as páginas, com caminho relativo correto (raiz: `assets/img/favicon.png`;
  `dtc-b/`: `assets/img/favicon.png` dentro de `dtc-b/`; adaptadas: na pasta de imagens que já usam).
- **Peso:** nenhuma imagem passa de **1MB** (o validador acusa I1).
