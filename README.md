# skill-pagesfront

Skill de Claude Code que gera o **conjunto completo de páginas de front** de um
produto novo a partir de designs do **Figma** + páginas de referência de um
produto do **mesmo nicho**.

- **Geradas do Figma (fiéis ao design):** `.com` (o `index.html` da raiz) e
  `dtc-b`.
- **Adaptadas da referência (cor, copy, mockup, nome, links):** `thank`, `vsl`,
  `bonus` e os rodapés (`contact`, `terms`, `privacy`, `reference`, `shipping`,
  `refund`, `disclaimer`).

O nome do produto, o hero e os mockups saem dos designs; o **favicon** e a
**paleta** vêm por link do Figma (a paleta também aceita hex por escrito). Toda
imagem é otimizada (**nenhuma passa de 1MB**) e o lixo do produto de referência
(assets órfãos, scripts de plataforma/tracking) é removido.

## Entradas

```
design .com:  [link figma]
design dtc-b: [link figma]
favicon:      [link figma]
paleta:       [link figma]  — ou a paleta por escrito (hex)
```

Além disso, deixe no repositório as **páginas de referência de um produto do
mesmo nicho** (`thank/`, `vsl/`, `bonus/` e os 7 rodapés `*.html` na raiz).

## Onde está a skill

```
skills/criar-paginas-front/
├─ SKILL.md                         ← instruções que a IA segue
├─ README.md                        ← guia de uso detalhado
└─ references/
   ├─ estrutura-pastas.md           ← árvore de pastas e convenções
   └─ adaptacao-e-rodapes.md        ← checklist de adaptação, limpeza e rodapés
```

👉 **Guia de uso completo:**
[skills/criar-paginas-front/README.md](skills/criar-paginas-front/README.md)

## Padrão de código

As páginas geradas do Figma seguem a skill
[mayor-code-style](https://github.com/moisesmengo/mayor-code-style/blob/main/skills/mayor-code-style/SKILL.md)
(HTML limpo sem BEM, SCSS em árvore, breakpoint `900px`, `<main>` só no hero,
Swiper nos depoimentos). As páginas adaptadas preservam a estrutura/estilo que já
têm.
