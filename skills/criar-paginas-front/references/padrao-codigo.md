# Padrão de código (mayor-code-style, embutido)

> Baseado no **Mayor Code Style**, de Moises
> ([github.com/moisesmengo/mayor-code-style](https://github.com/moisesmengo/mayor-code-style), licença MIT),
> incorporado a esta skill em 2026-11-04 (licença original em
> [LICENSE-mayor-code-style.txt](LICENSE-mayor-code-style.txt)). **Esta cópia é a fonte de verdade da skill**: não é preciso
> (nem se deve) buscar o repositório original. Se o padrão mudar lá, atualize este arquivo.

Vale para as páginas **geradas do Figma** (`.com` e `dtc-b`). As páginas adaptadas (thank, vsl,
bonus, rodapés) mantêm a estrutura que já têm.

O `validar.mjs` checa automaticamente as regras marcadas com **[V]**.

## Regras centrais

- **[V]** Stack: só HTML, SCSS e JavaScript puro. Sem React, Next, Tailwind, Gulp, bundler ou partials.
  Um único `style.scss` por página (compilado para `style.css`, que é o que o HTML carrega).
- **[V]** Arquivos por página: `index.html` + `assets/img/` + `assets/css/style.scss` + `assets/js/main.js`.
- HTML mínimo: só ponha classe quando ela identifica uma **seção**, um **componente reutilizável** ou
  um **item repetido**. Se um seletor de elemento dentro da seção resolve (`.hero h1`), não crie classe.
- **[V]** Nada de BEM: nada de `.card__body`, `.section__grid`, `.button--primary`, nem qualquer `__`/`--`
  em classe, nem `&__`/`&--` no SCSS.
- Nomes simples escopados pelo pai: `.hero .content`, `.testimonials .card .body`, `.faq .item .header`.
- SCSS em árvore: aninhe seguindo a hierarquia do HTML, em vez de criar nomes longos.
- **[V]** Media queries **dentro** do bloco que elas modificam. Nunca um bloco responsivo gigante no fim.
- **[V]** `<main>` envolve **só** o hero. As demais seções ficam direto no `<body>`, depois de `</main>` e
  antes do `<footer>`.
- **[V]** Mudou classe no HTML → atualize os seletores do `main.js`.
- **[V]** Depoimentos com **Swiper** (CDN).

## Esqueleto do HTML

Ordem preferida das seções (use a ordem **do Figma**; estes são os nomes a usar quando a seção
corresponder):

```html
<header></header>

<main>
  <section class="hero" id="home"></section>
</main>

<div class="faixa"></div>
<section class="sobre pd"></section>
<section class="beneficios pd"></section>
<section class="ingredientes pd"></section>
<section class="testimonials pd"></section>
<section class="shipping"></section>
<section class="area-kits pd"></section>
<section class="guarantee pd"></section>
<section class="faq pd"></section>

<footer></footer>
```

Para seções que não estão na lista, crie um nome curto e descritivo, em português ou inglês,
seguindo o mesmo estilo (`.como-funciona`, `.comparativo`, `.autoridade`).

Nomes locais recorrentes dentro das seções:
`.container` · `.content` · `.media` · `.header` · `.body` · `.footer` · `.card` · `.item` · `.main` ·
`.price` · `.btn` · `.title` · `.sub` · `.pd` (padding vertical de seção) · `.center`

## Organização do `style.scss`

**[V]** Ordem exata do arquivo:

1. `@font-face` (só se a fonte não vier do Google Fonts)
2. variáveis
3. mixins
4. reset/base
5. componentes/utilitários globais (`.container`, `.pd`, `.btn`, `.title`…)
6. seções, **na mesma ordem do HTML**, uma vez cada
7. regras globais raras (`prefers-reduced-motion`)

```scss
$text: #4b4b4b;
$darck: #0d2538;
$darck-2: #d95f1c;
$primary: #f07b2c;
$light: #fff;
$light-2: #fff5f0;

@mixin font2() {
  font-family: "Inter", sans-serif;
}

* {
  margin: 0;
  padding: 0;
  list-style: none;
  box-sizing: border-box;
  text-decoration: none;
  color: $text;
  font-family: "Sora", sans-serif;
}

.container {
  width: 90%;
  max-width: 1280px;
  margin: 0 auto;

  @media (max-width: 900px) {
    max-width: 680px;
  }
}

header {
}

.hero {
}

.faixa {
}
```

Os nomes de variável seguem o time: `$text`, `$darck`, `$darck-2`, `$primary`, `$light`, `$light-2`
(sim, `darck`, que é a convenção usada nas páginas). Toda cor da paleta do briefing vira variável;
não espalhe hex soltos pelas seções.

## Responsivo

Breakpoint principal: `@media (max-width: 900px)`. Use `1100px`, `620px` ou menores só quando o layout
precisar.

Certo:

```scss
.area-kits {
  ul {
    display: grid;
    grid-template-columns: repeat(3, 1fr);

    @media (max-width: 900px) {
      grid-template-columns: 1fr;
    }
  }
}
```

Errado:

```scss
@media (max-width: 900px) {
  .area-kits ul {
    grid-template-columns: 1fr;
  }

  .faq .accordion {
    grid-template-columns: 1fr;
  }
}
```

## Padrões de seção

### Kits

```html
<section class="area-kits pd" id="kits">
  <div class="container center">
    <h2 class="title">Order Your <b>Product</b></h2>
    <p class="sub">Select the package that fits your goals and save more:</p>

    <ul>
      <li class="kit-option best-option">
        <a href="#">
          <div class="header">Best Value</div>
          <div class="main"></div>
          <div class="footer"></div>
        </a>
      </li>
    </ul>
  </div>
</section>
```

### FAQ

```html
<section class="faq pd" id="faq">
  <div class="container center">
    <h2 class="title">Frequently Asked Questions</h2>

    <div class="accordion-wrapper">
      <div class="accordion">
        <div class="item">
          <div class="header">
            <p>Question?</p>
          </div>
          <div class="body">
            <p>Answer.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>
```

No JS, alterne `.active` no `.item`.

### Depoimentos (Swiper)

```html
<section class="testimonials pd">
  <div class="container">
    <div class="header"></div>

    <div class="swiper">
      <div class="swiper-wrapper">
        <article class="swiper-slide card">
          <div class="media"></div>
          <div class="body">
            <div class="stars"></div>
            <blockquote></blockquote>
            <div class="footer"></div>
          </div>
        </article>
      </div>
    </div>
  </div>
</section>
```

No `<head>`: `https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css`. Antes do `main.js`:
`https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js`. Inicialize no `main.js` com
`new Swiper('.testimonials .swiper', {...})`.

## Exemplos: evite × prefira

### BEM

Evite:

```html
<section class="testimonials-section">
  <div class="testimonials-section__grid">
    <article class="testimonial-card">
      <div class="testimonial-card__media"></div>
      <div class="testimonial-card__body"></div>
    </article>
  </div>
</section>
```

Prefira:

```html
<section class="testimonials pd">
  <div class="container">
    <div class="header"></div>

    <article class="card">
      <div class="media"></div>
      <div class="body"></div>
    </article>
  </div>
</section>
```

```scss
.testimonials {
  .container {
    display: flex;
    flex-direction: column;
    gap: 40px;
  }

  .card {
    display: grid;
    grid-template-columns: 316px 1fr;

    .media {
      img {
        width: 316px;
        height: 423px;
        object-fit: cover;
      }
    }

    .body {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
  }
}
```

### `<main>` só no hero

Evite:

```html
<main>
  <section class="hero"></section>
  <section class="sobre"></section>
  <section class="faq"></section>
</main>
```

Prefira:

```html
<main>
  <section class="hero"></section>
</main>

<section class="sobre"></section>
<section class="faq"></section>
```

### Media query perto do elemento

Evite:

```scss
.hero {
  .container {
    display: grid;
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 900px) {
  .hero .container {
    grid-template-columns: 1fr;
  }
}
```

Prefira:

```scss
.hero {
  .container {
    display: grid;
    grid-template-columns: 1fr 1fr;

    @media (max-width: 900px) {
      grid-template-columns: 1fr;
    }
  }
}
```

## Ao refatorar uma dtc-b de referência (modo B)

- Preserve conteúdo, assets, links e comportamento que continuam valendo para o produto novo.
- Simplifique nomes de classe e remova BEM.
- Reordene o SCSS na ordem do HTML e leve as media queries para dentro dos blocos.
- Atualize os seletores do JS depois de mudar classes.
- Compile e rode o validador.

## Checklist (o validador confere os itens [V])

- [V] Nenhum `__`/`--` em classe no HTML nem em seletor no SCSS.
- [V] Componentes/utilitários antes das seções; seções no SCSS na ordem do HTML.
- [V] Media queries aninhadas nos próprios blocos.
- [V] `<main>` envolve só o `.hero`.
- [V] Seletores do JS batem com o HTML.
- [V] Sass compila; `style.css` atualizado.
- [V] Todo asset referenciado existe.
- Classes só onde precisa (seção, componente, item repetido); o resto por seletor de elemento.
