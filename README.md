# skill-pagesfront

Skill de Claude Code que gera o **conjunto completo de páginas de front** de um
produto novo a partir de designs do **Figma** + páginas de referência de um
produto do **mesmo nicho**.

- **Gera do Figma (fiéis ao design):** `.com` (o `index.html` da raiz) e `dtc-b`.
- **Adapta da referência (cor, copy, mockup, nome, links):** `thank`, `vsl`,
  `bonus` e os rodapés (`contact`, `terms`, `privacy`, `reference`, `shipping`,
  `refund`, `disclaimer`).

O **nome do produto, o hero e os mockups** são extraídos do próprio Figma. O
**favicon** e a **paleta** vêm por link do Figma (a paleta também pode ser
enviada por escrito). Toda imagem é otimizada e **nenhuma pode passar de 1MB**.

A skill fica em [`skills/criar-paginas-front/`](skills/criar-paginas-front/) — as
instruções que a IA segue estão no
[SKILL.md](skills/criar-paginas-front/SKILL.md).

## Duas formas de usar

- **Por link (mais simples):** envie o prompt com o link da `SKILL.md` (veja
  [Como chamar a skill](#como-chamar-a-skill)). A IA abre o arquivo e segue as
  instruções — não precisa instalar nada.
- **Instalada no projeto (opcional):** para o Claude Code reconhecer a skill
  automaticamente, coloque-a em `.claude/skills/` do projeto onde vai gerar as
  páginas:

  ```bash
  git clone https://github.com/GabrielMendessDev/skill-pagesfront.git
  mkdir -p SEU-PROJETO/.claude/skills
  cp -r skill-pagesfront/skills/criar-paginas-front SEU-PROJETO/.claude/skills/
  ```

---

## Antes de rodar: prepare o repositório

A skill só começa depois de checar os pré-requisitos. Se faltar algo, ela para e
lista o que falta. Deixe pronto:

1. **Páginas de referência de um produto do MESMO NICHO** (é o ponto mais
   importante — veja o aviso abaixo):
   - em pastas próprias: `thank/`, `vsl/`, `bonus/` (cada uma com seu
     `index.html` + `assets/`);
   - na raiz, os 7 rodapés: `contact.html`, `terms.html`, `privacy.html`,
     `reference.html`, `shipping.html`, `refund.html`, `disclaimer.html`.
2. **Os links do Figma** (a paleta pode vir por escrito):

   ```
   design .com:  [link figma]
   design dtc-b: [link figma]
   favicon:      [link figma]
   paleta:       [link figma]  — ou a paleta por escrito (hex)
   ```

3. *(Só se necessário)* links de checkout/upsell e dados de contato dos rodapés
   que não dê para reaproveitar da referência.

> ⚠️ **Mesmo nicho é obrigatório.** As páginas de referência precisam ser de um
> produto do mesmo nicho do produto atual. É isso que faz a adaptação sair fiel
> (estrutura de seções, prova, garantia, depoimentos já batem). Referência de
> outro nicho = resultado ruim.

---

## Como chamar a skill

1. Deixe as **páginas de referência** (mesmo nicho) no repositório — veja a
   seção acima.
2. Abra o projeto no Claude Code e envie o **prompt abaixo**, preenchendo os
   links. A skill checa os pré-requisitos e, se estiver tudo certo, executa o
   fluxo; se faltar algo, ela avisa o que falta.

### Prompt para copiar

```text
Siga a skill https://github.com/GabrielMendessDev/skill-pagesfront/blob/main/skills/criar-paginas-front/SKILL.md
para gerar todas as páginas de front do produto novo.

design .com:  <link figma>
design dtc-b: <link figma>
favicon:      <link figma>
paleta:       <link figma>   (ou colar os hex aqui)
```

### Exemplo preenchido

```text
Siga a skill https://github.com/GabrielMendessDev/skill-pagesfront/blob/main/skills/criar-paginas-front/SKILL.md
para gerar todas as páginas de front do produto novo.

design .com:  https://www.figma.com/design/ABC123/com?node-id=1-2
design dtc-b: https://www.figma.com/design/ABC123/dtcb?node-id=3-4
favicon:      https://www.figma.com/design/ABC123/assets?node-id=5-6
paleta:       #B80012, #586571, #0E0D11, #FFFFFF
```

> O link aponta para a `SKILL.md` — a IA abre esse arquivo e segue as instruções.
> A paleta pode vir por link do Figma **ou** como hex (como no exemplo). As
> páginas `thank`, `vsl`, `bonus` e os rodapés precisam já estar no repositório
> (de um produto do mesmo nicho) para serem adaptadas.

---

## O que a skill faz (fluxo)

1. **`dtc-b` do Figma** — feita primeiro, porque a **seção de kits** dela é
   reaproveitada na `.com`.
2. **`.com` do Figma** (`index.html` da raiz) — hero, mockups e imagens baixados
   do Figma; seção de kits vinda da `dtc-b`; depoimentos com **Swiper**.
3. **Adapta `thank`, `vsl`, `bonus`** — aplica paleta, nome, mockups e copy do
   produto novo, **preservando a estrutura original** de cada página.
4. **Adapta os rodapés** (padrão **Cartpanda**) — comenta o HTML e troca paleta +
   nome do produto, sem reescrever o layout.
   - Ao adaptar (passos 3 e 4), **limpa o lixo do produto anterior**: imagens e
     arquivos órfãos (não usados) e scripts de plataforma/tracking (pixels,
     GA/GTM, funil/checkout, chats, IDs antigos).
5. **Favicon** baixado do Figma, otimizado e aplicado no `<head>` de todas as
   páginas.

> Todas as imagens são otimizadas ao longo do processo e **nenhuma passa de 1MB**.

---

## Padrão de código

As páginas **geradas do Figma** (`.com`, `dtc-b`) seguem a skill
**[mayor-code-style](https://github.com/moisesmengo/mayor-code-style/blob/main/skills/mayor-code-style/SKILL.md)**:
HTML limpo (sem BEM), SCSS em árvore com media queries aninhadas (breakpoint
`900px`), `<main>` só no hero, `assets/{img, css/style.scss, js/main.js}`,
responsivo e imagens otimizadas.

As páginas **adaptadas** mantêm a estrutura/estilo que já têm (podem usar
Tailwind inline, `script.js`, `assets/images/`, `assets/ebooks/` etc.) — a skill
**não** as reescreve para SCSS.

---

## Estrutura final esperada

```
(raiz)/
├─ index.html           ← .com (Figma)
├─ contact.html ... disclaimer.html   ← 7 rodapés (adaptados)
├─ assets/{img, css/style.scss, js/main.js}
├─ dtc-b/   ← Figma
├─ thank/   ← adaptada
├─ vsl/     ← adaptada
└─ bonus/   ← adaptada
```

---

## Arquivos da skill

| Arquivo | Para quê |
|---|---|
| [`skills/criar-paginas-front/SKILL.md`](skills/criar-paginas-front/SKILL.md) | Instruções que a IA segue (pré-requisitos, fluxo, checklist). |
| [`skills/criar-paginas-front/references/estrutura-pastas.md`](skills/criar-paginas-front/references/estrutura-pastas.md) | Árvore de pastas e convenções de cada página. |
| [`skills/criar-paginas-front/references/adaptacao-e-rodapes.md`](skills/criar-paginas-front/references/adaptacao-e-rodapes.md) | Checklist de adaptação, limpeza e padrão Cartpanda dos rodapés. |

---

## Observações / pontos de atenção

- **Paleta:** envie o link do Figma da paleta **ou** os hex por escrito. Sem um
  dos dois, a skill para e pede.
- **Favicon:** vem por link do Figma; a skill baixa e otimiza.
- **Imagens:** nenhuma pode passar de **1MB** — a skill comprime/redimensiona.
- **Rodapés:** são de outro produto e **sempre** devem ser adaptados (nome,
  cores, dados de contato) — confira se não sobrou nada do produto anterior.
- **Limpeza:** as páginas adaptadas são higienizadas — some todo asset órfão e
  todo script de plataforma/tracking do produto anterior.
- **Hero da `.com`:** vem do Figma; não é preciso deixar imagens de hero na raiz.
