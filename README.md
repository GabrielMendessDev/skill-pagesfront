# skill-pagesfront

Skill que gera o **conjunto completo de páginas de front** de um produto novo a partir dos designs do
**Figma** e de páginas de referência de um produto do **mesmo nicho**, já no **padrão de código do
time** (mayor-code-style, embutido na skill). Funciona no **Claude Code** e no **Codex (ChatGPT)**: é a
mesma pasta de skill para os dois.

| Página | Origem | Estrutura |
|---|---|---|
| `.com` (`index.html` da raiz) | Figma, fiel ao design | padrão de código do time |
| `dtc-b/` | Figma (opcional: dtc-b do mesmo nicho como base) | padrão de código do time |
| `thank/`, `vsl/`, `bonus/` | adaptadas da referência | mantém a da referência |
| 7 rodapés (`contact`, `terms`, `privacy`, `reference`, `shipping`, `refund`, `disclaimer`) | adaptados (padrão Cartpanda) | mantém a da referência |

## Uso rápido

Instalou uma vez ([Claude Code](#2-instalação-no-claude-code) ou [Codex](#3-instalação-no-codex-chatgpt))?
Então, para cada produto novo, são só 3 passos:

1. **Abra no VS Code a pasta do produto**, com as páginas de referência dentro (`thank/`, `vsl/`,
   `bonus/` e os 7 rodapés de um produto do mesmo nicho).
2. **Cole no agente** (Codex no modo Agent, ou Claude Code):

   ```text
   $criar-paginas-front
   .com: <link do frame no Figma>
   dtc-b: <link do frame no Figma>
   favicon: <link do frame no Figma>
   paleta: <link do Figma ou os hex>
   ```

   No Claude Code, troque a primeira linha por `/pagesfront:criar-paginas-front` (plugin) ou
   `/criar-paginas-front` (skill pessoal).
3. **Aprove os comandos que ele pedir** e espere o relatório final.

Se faltar alguma coisa, a própria skill para e diz o quê. O resto deste README é consulta.

---

A skill não depende só de a IA "lembrar as regras". Ela traz scripts que **conferem o resultado**, e a
IA só pode entregar quando eles passam:

- **`validar.mjs`**: confere padrão de código, links e imagens quebrados, imagens acima de 1MB,
  arquivos órfãos, pixels e scripts do produto antigo, nome e cores antigos, checkout fora do padrão
  `linkoffer` e sobras do Figma. Entrega só com **0 erros**.
- **`capturar.mjs`**: tira prints por seção (1440px e 390px) para comparar com o Figma e acusa erro de
  JavaScript, arquivo que não carrega, página vazando para o lado e kits fora da ordem no mobile.
- **`otimizar-imagens.mjs`**: comprime, redimensiona e converte para webp, mantendo os caminhos do
  código certos. Nenhuma imagem passa de 1MB.
- **`preparar.mjs`**: deixa a máquina pronta (Node, `sass`, `sharp`, Chrome/Edge).

**Sumário:**
[1. Requisitos](#1-requisitos) ·
[2. Instalação no Claude Code](#2-instalação-no-claude-code) ·
[3. Instalação no Codex](#3-instalação-no-codex-chatgpt) ·
[4. Preparar o projeto](#4-preparar-o-projeto-antes-de-rodar) ·
[5. Prompt para chamar a skill](#5-prompt-para-chamar-a-skill) ·
[6. Passo a passo do primeiro teste](#6-passo-a-passo-do-primeiro-teste) ·
[7. Regras](#7-regras-que-a-skill-segue) ·
[8. Fases](#8-o-que-a-skill-faz-fases) ·
[9. Scripts na mão](#9-rodando-os-scripts-na-mão) ·
[10. Manutenção](#10-mantendo-a-skill) ·
[11. Arquivos](#11-arquivos)

---

## 1. Requisitos

Valem para os dois agentes:

- **Node.js 22 ou mais novo**: confira com `node --version`.
- **Google Chrome ou Microsoft Edge** instalado, para os prints.
- **MCP oficial do Figma** conectado ao agente (passo a passo abaixo, em cada cenário).
- **Git**, para clonar o repositório.

---

## 2. Instalação no Claude Code

### 2.1 Instalar a skill

**Opção A: plugin (recomendado para o time).** Dentro do Claude Code:

```text
/plugin marketplace add GabrielMendessDev/skill-pagesfront
/plugin install pagesfront@skill-pagesfront
```

Para **atualizar**: `/plugin marketplace update skill-pagesfront` (ou ative o auto-update em
`/plugin` → Marketplaces). Depois rode `/reload-plugins` ou abra uma sessão nova.

**Opção B: skill pessoal (sem plugin).** Instala uma vez e vale para o PC inteiro. Clone em qualquer
pasta, **fora** das pastas de produto (ex.: Área de Trabalho), e rode no terminal:

```bash
git clone https://github.com/GabrielMendessDev/skill-pagesfront.git
cd skill-pagesfront
node instalar.mjs claude
```

Isso copia a skill para `~/.claude/skills/criar-paginas-front` e prepara a máquina. Para **atualizar**:
`git pull` e `node instalar.mjs claude` de novo.

> Use **uma** das opções, não as duas: com as duas, a skill aparece duplicada.

### 2.2 Conectar o Figma no Claude Code

Escolha uma forma:

```bash
claude plugin install figma@claude-plugins-official
```

ou

```bash
claude mcp add --scope user --transport http figma https://mcp.figma.com/mcp
```

Depois, numa sessão nova: `/mcp` → **figma** → **Authenticate** → **Allow access** no navegador. Rode
`/mcp` de novo para confirmar que aparece conectado. (Quem usa o conector do Figma pelo claude.ai já tem
o Figma disponível.)

### 2.3 Preparar a máquina

Na opção B o `instalar.mjs` já faz isso. Na opção A, a skill roda o `preparar.mjs` sozinha na primeira
vez. Se preferir adiantar, de dentro do repositório clonado:

```bash
node skills/criar-paginas-front/scripts/preparar.mjs
```

---

## 3. Instalação no Codex (ChatGPT)

### 3.1 Instalar a skill

> **Instala uma vez e vale para o PC inteiro.** Faça o `git clone` em qualquer pasta (ex.: Área de
> Trabalho), **fora** das pastas de produto. O `instalar.mjs` copia a skill para a pasta de skills do
> seu usuário, e a partir daí ela funciona em **qualquer** pasta que você abrir no Codex. A pasta
> clonada serve só para instalar e atualizar.
>
> ```
> Desktop\
> ├─ skill-pagesfront\   ← o git clone fica aqui (só para instalar/atualizar)
> ├─ produto-novo-1\     ← pasta do produto: referências + Codex + $criar-paginas-front
> └─ produto-novo-2\
> ```

```bash
git clone https://github.com/GabrielMendessDev/skill-pagesfront.git
cd skill-pagesfront
node instalar.mjs codex
```

Isso copia a skill para `~/.agents/skills/criar-paginas-front` (pasta de skills do usuário no Codex) e
roda o `preparar.mjs`, que instala `sass` e `sharp` em `~/.cache/pagesfront` e confere Node e
Chrome/Edge. **Reinicie o Codex** depois de instalar e confira se a skill aparece em `/skills`.

- **Só num projeto:** `node instalar.mjs codex --projeto <pasta-do-projeto>` (instala em
  `<projeto>/.agents/skills/`).
- **Manual:** copie a pasta `skills/criar-paginas-front` para `~/.agents/skills/` e rode
  `node ~/.agents/skills/criar-paginas-front/scripts/preparar.mjs`.
- **Atualizar:** `git pull` e `node instalar.mjs codex` de novo.
- **Claude e Codex na mesma máquina:** `node instalar.mjs ambos`.

### 3.2 Conectar o Figma no Codex

```bash
codex mcp add figma --url https://mcp.figma.com/mcp
```

Faça login no Figma quando ele pedir e permita o acesso. Confira com `codex mcp list` ou `/mcp` dentro
do Codex. No app do Codex dá também para instalar pelo menu **Plugins → Figma**.

### 3.3 Sandbox do Codex (importante)

O Codex roda os comandos num sandbox que costuma **bloquear a internet**. Por isso:

1. **Rode o `preparar.mjs` antes**, num terminal normal (o `instalar.mjs` já faz isso). Assim o `sass`
   e o `sharp` já estão instalados e a skill não precisa baixar nada durante a sessão.
2. Os **prints** (`capturar.mjs`) abrem o Chrome/Edge e carregam fontes e o Swiper da internet. Se o
   Codex pedir aprovação para esse comando, **aprove**. Se os prints acusarem "recursos que não
   carregaram" de `fonts.googleapis.com` ou `cdn.jsdelivr.net`, é o sandbox bloqueando a rede: abra a
   sessão com a rede liberada:

   ```bash
   codex -c sandbox_workspace_write.network_access=true
   ```

---

## 4. Preparar o projeto antes de rodar

A skill só começa depois de checar os pré-requisitos. Se faltar algo, ela para e lista o que falta.

Na pasta do projeto do produto novo:

1. **Páginas de referência de um produto do MESMO NICHO:**
   - em pastas próprias: `thank/`, `vsl/`, `bonus/` (cada uma com `index.html` + `assets/`);
   - na raiz, os 7 rodapés: `contact.html`, `terms.html`, `privacy.html`, `reference.html`,
     `shipping.html`, `refund.html`, `disclaimer.html`;
   - *(opcional)* `dtc-b/` de um produto do mesmo nicho, para a dtc-b partir de uma base pronta
     (modo B). Sem ela, a dtc-b é montada só do Figma (modo A).
   - `index.html` na raiz pode vir vazio: ele vira a `.com`.
2. **Os 4 links obrigatórios:** design da `.com`, design da `dtc-b`, favicon e paleta (link do Figma ou
   os hex). Use o link do **frame** (com `node-id`), não só o do arquivo.
3. **Dados opcionais (evitam pendências):** upsell e e-mail de suporte. **O que não for enviado vira
   `PENDENTE-...`** no código e aparece no relatório final. A skill não inventa link, preço, claim nem
   ID.
4. **Não precisa mandar:** checkout dos kits (sempre `linkoffer1/3/2`, ver [7.2](#72-padrão-de-código-com-e-dtc-b)),
   vídeo da VSL, bônus, FAQ e copy dos rodapés. Esses ficam como vieram da referência (ver
   [7.7](#77-o-que-fica-como-veio-da-referência-mesmo-nicho)).

> ⚠️ **Mesmo nicho é obrigatório.** Referência de outro nicho = resultado ruim.

---

## 5. Prompt para chamar a skill

Abra o agente **na pasta do projeto** e envie o prompt abaixo. Só a primeira linha muda entre os
agentes:

| Agente | Primeira linha do prompt |
|---|---|
| Claude Code, instalado como plugin | `/pagesfront:criar-paginas-front` |
| Claude Code, skill pessoal | `/criar-paginas-front` |
| Codex | `$criar-paginas-front` |

### Modelo para copiar

```text
/pagesfront:criar-paginas-front

Gere todas as páginas de front do produto novo.

design .com:  <link figma do frame da .com>
design dtc-b: <link figma do frame da dtc-b>
favicon:      <link figma do favicon>
paleta:       <link figma da paleta>   (ou os hex: #......, #......, #......)

Opcionais (o que não vier vira PENDENTE):
upsell:   <link>
suporte:  <e-mail>
```

Não precisa mandar checkout dos kits: a skill usa sempre `linkoffer1` (menor quantidade de potes),
`linkoffer3` (média) e `linkoffer2` (maior).

### Exemplo preenchido (Codex)

```text
$criar-paginas-front

Gere todas as páginas de front do produto novo.

design .com:  https://www.figma.com/design/ABC123/Produto?node-id=1-2
design dtc-b: https://www.figma.com/design/ABC123/Produto?node-id=3-4
favicon:      https://www.figma.com/design/ABC123/Produto?node-id=5-6
paleta:       #1A7F5A, #F2B705, #3F4A45, #0B3D2E, #FFFFFF

suporte:  support@cartpanda.com
```

### O que esperar

- Se faltar algo obrigatório, a skill **para na fase 0** e lista tudo o que falta numa mensagem só.
- Se estiver tudo certo, ela segue **sem fazer perguntas** até o fim, fase por fase.
- No fim vem um **relatório** com o resultado do validador, as diferenças visuais que sobraram em
  relação ao Figma, as **pendências** (o que você ainda precisa mandar) e o que foi removido do produto
  antigo.
- A pasta `.pagesfront/` (briefing, progresso, prints) é material de trabalho. Ela entra no
  `.gitignore` e **não deve subir para a hospedagem**.

---

## 6. Passo a passo do primeiro teste

Roteiro completo para testar de verdade, do zero. Vale para Codex e Claude Code. Os comandos estão em
PowerShell (Windows); no macOS/Linux troque `$HOME\Desktop\...` por `~/Desktop/...`.

### 6.1 Instalar a skill e conectar o Figma (uma vez)

Siga a [seção 2](#2-instalação-no-claude-code) (Claude Code) ou a [seção 3](#3-instalação-no-codex-chatgpt)
(Codex). Para conferir se a skill foi instalada:

- **Codex:** feche e abra o Codex e digite `$` na caixa de mensagem. A skill `criar-paginas-front` tem
  que aparecer na lista.
- **Claude Code:** abra uma sessão nova e digite `/`. A skill `pagesfront:criar-paginas-front` (plugin)
  ou `criar-paginas-front` (skill pessoal) tem que aparecer.

### 6.2 Montar uma pasta de teste com as referências

Crie uma pasta, ex.: `Desktop\teste-skill\`, e coloque nela as **páginas de um produto antigo do mesmo
nicho**:

```
teste-skill\
├─ index.html          ← pode ser um arquivo vazio
├─ contact.html  terms.html  privacy.html  reference.html
├─ shipping.html  refund.html  disclaimer.html
├─ assets\             ← o assets dos rodapés, se eles usarem
├─ thank\   vsl\   bonus\
└─ dtc-b\              ← opcional: dtc-b de um produto do mesmo nicho
```

Antes de rodar, salve uma "foto" da pasta. Assim dá para ver tudo o que a IA mudou e voltar atrás quando
quiser:

```powershell
cd $HOME\Desktop\teste-skill
git init; git add -A; git commit -m "referencias"
```

### 6.3 Copiar os 4 links do Figma

Do produto **novo**, copie o link de cada frame: botão direito no frame → **Copy/Paste as → Copy link to
selection**. O link tem que ter `node-id=` no final.

- frame da `.com`
- frame da `dtc-b`
- frame do favicon
- frame da paleta (ou anote os hex)

### 6.4 Abrir o agente na pasta de teste e mandar o prompt

- **Codex (app ou VS Code):** abra a pasta `teste-skill` como projeto.
- **Codex (terminal):** `cd $HOME\Desktop\teste-skill` e depois
  `codex -c sandbox_workspace_write.network_access=true`. O parâmetro libera a internet para os prints
  carregarem fontes e o Swiper.
- **Claude Code:** `cd $HOME\Desktop\teste-skill` e depois `claude` (ou abra a pasta no VS Code).

Cole o prompt da [seção 5](#5-prompt-para-chamar-a-skill). Se não tiver o link do upsell, deixe sem: é
um bom teste para ver se a skill marca `PENDENTE` em vez de inventar.

**Durante a execução:**

- Se o agente pedir para aprovar um comando (`node ...`, abrir o navegador), **aprove**.
- A skill para sozinha na fase 0 se faltar alguma coisa. Fora isso, vai até o fim sem perguntar.
- Pode demorar bastante: são várias páginas, com comparação contra o Figma seção por seção.

### 6.5 Conferir o resultado

1. Abra `index.html` e `dtc-b\index.html` no navegador e coloque ao lado do Figma.
2. Veja os prints que a skill tirou em `.pagesfront\capturas\`.
3. Rode o validador você mesmo:
   ```powershell
   # Codex
   node $HOME\.agents\skills\criar-paginas-front\scripts\validar.mjs --compilar
   # Claude Code (skill pessoal)
   node $HOME\.claude\skills\criar-paginas-front\scripts\validar.mjs --compilar
   # Plugin do Claude Code: use a cópia do repositório clonado
   node $HOME\Desktop\skill-pagesfront\skills\criar-paginas-front\scripts\validar.mjs --compilar
   ```
4. Para ver tudo o que mudou: `git status` e `git diff`.
5. Para desfazer e testar de novo do zero: `git reset --hard; git clean -fd`.

### 6.6 O que reportar quando algo sair errado

- o **relatório final** que o agente escreveu;
- a saída do validador do passo 6.5;
- **onde ficou diferente do Figma**: um print da página e o frame correspondente, ou só a descrição;
- se travou ou pediu algo estranho, a mensagem em que isso aconteceu.

Cada erro reportado vira uma regra nova no validador ou uma linha em "Erros conhecidos" (ver
[seção 10](#10-mantendo-a-skill)).

---

## 7. Regras que a skill segue

Estas regras estão no [SKILL.md](skills/criar-paginas-front/SKILL.md) e nas
[referências](skills/criar-paginas-front/references/). As marcadas com **[V]** são conferidas
automaticamente pelo `validar.mjs` ou pelo `capturar.mjs`: a entrega não passa se forem violadas.

### 7.1 Regras de ouro

1. **O validador decide quando acabou.** Nenhuma fase termina sem `validar.mjs` com 0 erros.
2. **O Figma é a verdade** da `.com` e da `dtc-b`. Cada seção é comparada print × Figma (no máximo 3
   rodadas de correção por seção; o que sobrar vai para o relatório).
3. **O padrão de código é obrigatório** nas páginas do Figma. O código que o Figma devolve
   (React/Tailwind) é só referência visual.
4. **Nunca inventar** preço, link, ID de pixel ou vídeo, e-mail, ingrediente, claim, depoimento ou
   bônus. Faltou → `PENDENTE-<o-que-falta>` + relatório. O que fica como veio da referência
   ([7.7](#77-o-que-fica-como-veio-da-referência-mesmo-nicho)) não é pendência. **[V]** (checkout
   antigo ou fora do padrão)
5. **Uma página por vez**, na ordem das fases, com o progresso anotado em `.pagesfront/progresso.md`.
6. **Depois da fase 0, não parar para perguntar**, a não ser que falte uma entrada obrigatória.
7. **Briefing como fonte única de verdade** (`.pagesfront/produto.json`): nome, paleta, kits, links,
   nome e cores do produto antigo. **Todo link externo que ficar nas páginas precisa estar nele.** **[V]**

### 7.2 Padrão de código: `.com` e `dtc-b`

Texto completo: [references/padrao-codigo.md](skills/criar-paginas-front/references/padrao-codigo.md).

- **[V]** Só HTML, SCSS e JS puro. Sem React, Next, Tailwind, bundler ou partials.
- **[V]** Arquivos: `index.html` + `assets/img/` + `assets/css/style.scss` (compilado para `style.css`,
  que é o que o HTML carrega) + `assets/js/main.js`.
- **[V]** Nada de BEM: nenhum `__` ou `--` em classe nem em seletor.
- HTML mínimo: classe só para seção, componente reutilizável ou item repetido. Nomes simples escopados
  pelo pai (`.hero .content`, `.faq .item .header`).
- Nomes de seção: `.hero`, `.faixa`, `.sobre`, `.beneficios`, `.ingredientes`, `.testimonials`,
  `.shipping`, `.area-kits`, `.guarantee`, `.faq`.
- **[V]** `<main>` envolve **só** o hero. As outras seções ficam direto no `<body>`.
- **[V]** SCSS em árvore, na ordem: `@font-face` → variáveis → mixins → reset → componentes globais →
  seções **na mesma ordem do HTML** → regras globais raras.
- **[V]** Media queries **dentro** do bloco que modificam (breakpoint principal `900px`).
- **[V]** Depoimentos com **Swiper** (CDN). FAQ alternando `.active` no `.item`.
- **[V]** Seletores do `main.js` batem com o HTML.
- **[V]** SCSS compila e o `style.css` está atualizado.
- **[V]** Nenhuma URL temporária do Figma (`localhost:3845`) e nenhuma classe utilitária de Tailwind.
- **[V]** Responsivo: nada vaza para o lado em 390px.
- O Figma é lido **seção por seção** (nunca a página inteira de uma vez), com os textos copiados
  literalmente.
- A seção de **kits** da `.com` reaproveita a da `dtc-b` (mesmos kits e links).
- **[V]** **Checkout dos kits** (vale também para a vsl): menor quantidade de potes →
  `href="linkoffer1"`, média → `href="linkoffer3"`, maior → `href="linkoffer2"`. Ex.: 2 bottles →
  `linkoffer1`, 3 bottles → `linkoffer3`, 6 bottles → `linkoffer2`.
- **[V]** **Kits no mobile:** em coluna, do maior para o menor (6 → 3 → 2 bottles), seja qual for a
  ordem do desktop (conferido pelo `capturar.mjs`).
- **FAQ:** copy do Figma se estiver completa; senão, o FAQ da referência como está.

### 7.3 Adaptação: thank, vsl, bonus

Texto completo:
[references/adaptacao-e-rodapes.md](skills/criar-paginas-front/references/adaptacao-e-rodapes.md).

- **Preservar estrutura e caminhos.** Não reescrever em SCSS, não reorganizar pastas.
- **[V]** Paleta nova aplicada em **todos** os lugares: variáveis, Tailwind config, classes como
  `bg-[#hex]`, `style=""`, SVGs.
- **[V]** Nome do produto novo no `<title>`, textos, `alt`, assinaturas e **nomes de arquivo**.
- Mockups do produto novo (os mesmos baixados do Figma).
- Copy só com fatos do Figma ou do briefing. Claim específico do produto antigo sem equivalente → sai
  ou fica genérico. Exceções em [7.7](#77-o-que-fica-como-veio-da-referência-mesmo-nicho).
- **VSL:** o player (vturb), o `data-delay` e o script de delay do pitch **ficam intactos**. Os kits
  passam para `linkoffer1/3/2`.
- **Bônus:** títulos, mockups, imagens e links dos bônus **ficam** como vieram.

### 7.4 Rodapés (padrão Cartpanda)

- Comentar o HTML por blocos (banner, passos, aviso, suporte).
- Trocar a paleta no `:root` e o rótulo `/* <Produto> palette */`.
- Trocar o nome no `<title>` (`"<Produto> — Contact Us"`), textos e assinatura do suporte.
- Contato do briefing. O que é do provedor (ex.: `support@cartpanda.com`) pode ficar.
- **Copy geral fica** (mesmo nicho). Nada vira `PENDENTE` por causa da copy.
- **Imagens do `contact.html` ficam quebradas**, com o mesmo `src` e nome. Você coloca as imagens em
  `assets/` depois, e o relatório final lista quais são. **[V]** (aviso P2, não erro)
- Manter o Tailwind e o `<style>` inline. Não reescrever em SCSS.

### 7.5 Limpeza do produto antigo

- **[V]** Pixels e tags removidos: Meta, Google Analytics/GTM, TikTok, Pinterest, Kwai, Snapchat,
  Bing, Taboola/Outbrain, Clarity, Hotjar, Utmify.
- **[V]** Checkouts, upsells e links da conta antiga removidos ou trocados pelos do briefing.
- **[V]** Nenhum resíduo do nome antigo (texto, `alt`, meta, comentários, nomes de arquivo).
- **[V]** Cores antigas trocadas (aviso, para conferir caso a caso).
- **[V]** Arquivos órfãos e lixo de sistema (`.DS_Store`) apagados.
- Blocos comentados e scripts mortos removidos.

### 7.6 Imagens e favicon

- **[V]** Nenhuma imagem acima de **1MB**. Imagens do Figma convertidas para webp e limitadas a 1920px.
- **[V]** Favicon (baixado do Figma, até 64px) no `<head>` de **todas** as páginas, com caminho relativo
  correto.
- **[V]** Todo `src`/`href` resolve; nenhuma imagem ou arquivo quebrado (exceto as imagens do
  `contact.html`, que ficam pendentes de propósito).
- **[V]** Sem erro de JavaScript nas páginas (avisos do player vturb da VSL são listados à parte e não
  contam).

### 7.7 O que fica como veio da referência (mesmo nicho)

Não é reescrito, não é removido e não vira `PENDENTE`:

| Onde | Fica como está |
|---|---|
| `vsl/` | Player da VSL (scripts vturb, `<vturb-smartplayer>`, IDs), elementos com `data-delay` e o script de delay do pitch |
| `bonus/` | Os bônus: títulos, mockups/capas, imagens, links e PDFs |
| FAQ | Perguntas e respostas da referência, quando o Figma não tem a copy completa (só o nome do produto muda) |
| Rodapés | A copy geral (termos, privacidade, frete, reembolso, disclaimer, referências, contato) |
| `contact.html` | As imagens, mesmo quebradas. O relatório final lista quais você precisa colocar em `assets/` |

---

## 8. O que a skill faz (fases)

0. **Pré-checagem:** links obrigatórios, ferramentas (`preparar.mjs`), referências no projeto
   (`validar.mjs --pre`), mesmo nicho.
1. **Briefing:** `.pagesfront/produto.json`, favicon, progresso e `.gitignore`.
2. **dtc-b** a partir do Figma (modo A: template; modo B: dtc-b de referência), seção por seção →
   otimiza imagens → valida → prints × Figma.
3. **.com** a partir do Figma (kits vindos da dtc-b) → otimiza → valida → prints × Figma.
4. **thank, vsl, bonus** adaptadas → otimiza → valida → prints.
5. **Rodapés** adaptados e comentados → valida.
6. **Validação final** do projeto inteiro: 0 erros, prints sem problemas.
7. **Relatório:** avisos explicados, diferenças visuais restantes, **pendências** e o que foi removido.

---

## 9. Rodando os scripts na mão

Da raiz do projeto (troque `SKILL` pela pasta da skill instalada, ex.:
`~/.agents/skills/criar-paginas-front` ou `~/.claude/skills/criar-paginas-front`):

```bash
node SKILL/scripts/preparar.mjs                   # prepara a máquina (uma vez)
node SKILL/scripts/validar.mjs --pre              # confere as referências antes de começar
node SKILL/scripts/validar.mjs --compilar         # valida tudo (compila os .scss antes)
node SKILL/scripts/validar.mjs --so dtc-b         # só uma parte: raiz | dtc-b | thank | vsl | bonus | rodapes
node SKILL/scripts/validar.mjs --so index.html    # só uma página
node SKILL/scripts/capturar.mjs dtc-b/index.html  # prints por seção em .pagesfront/capturas/
node SKILL/scripts/otimizar-imagens.mjs dtc-b/assets/img --webp
```

Todos aceitam `--help`.

---

## 10. Mantendo a skill

A skill fica numa pasta só (`skills/criar-paginas-front/`). Qualquer mudança vale para o Claude Code
e para o Codex. Depois de mudar, faça commit e push, e o time atualiza (plugin:
`/plugin marketplace update skill-pagesfront`; script: `git pull` + `node instalar.mjs ...`).

Cada vez que um teste sair com defeito:

1. **Dá para checar automaticamente?** Acrescente a regra no `validar.mjs` (ou no `capturar.mjs`).
   Regra no validador é garantida; regra só no texto depende da IA lembrar.
2. **Não dá?** Acrescente uma linha na tabela **"Erros conhecidos"** no fim do `SKILL.md`.
3. Se a IA errou o *jeito* de escrever o código, a melhor correção é um **exemplo**: coloque uma
   página real aprovada (HTML + SCSS + JS) em `templates/` e aponte para ela no `SKILL.md`. A IA copia
   exemplo muito melhor do que segue regra.

---

## 11. Arquivos

| Arquivo | Para quê |
|---|---|
| [`skills/criar-paginas-front/SKILL.md`](skills/criar-paginas-front/SKILL.md) | Instruções que a IA segue (fases, regras, padrão, erros conhecidos). Lido pelo Claude Code e pelo Codex. |
| [`references/padrao-codigo.md`](skills/criar-paginas-front/references/padrao-codigo.md) | Padrão de código completo, com exemplos (crédito e licença MIT do mayor-code-style original). |
| [`references/figma-para-codigo.md`](skills/criar-paginas-front/references/figma-para-codigo.md) | Como ler o Figma seção por seção e fazer a QA visual. |
| [`references/adaptacao-e-rodapes.md`](skills/criar-paginas-front/references/adaptacao-e-rodapes.md) | Adaptação de thank/vsl/bonus, limpeza e padrão Cartpanda dos rodapés. |
| [`references/estrutura-pastas.md`](skills/criar-paginas-front/references/estrutura-pastas.md) | Árvore de pastas e convenções. |
| [`templates/pagina-figma/`](skills/criar-paginas-front/templates/pagina-figma/) | Esqueleto de página do Figma já no padrão (HTML, SCSS, JS). |
| [`templates/produto.json`](skills/criar-paginas-front/templates/produto.json) | Modelo do briefing. |
| [`scripts/`](skills/criar-paginas-front/scripts/) | `preparar.mjs`, `validar.mjs`, `capturar.mjs`, `otimizar-imagens.mjs`. |
| [`agents/openai.yaml`](skills/criar-paginas-front/agents/openai.yaml) | Metadados para o Codex (nome de exibição, prompt padrão, dependência do MCP do Figma). |
| [`instalar.mjs`](instalar.mjs) | Instala/atualiza a skill no Codex (`~/.agents/skills`) e/ou no Claude Code (`~/.claude/skills`). |
| [`.claude-plugin/`](.claude-plugin/) | Manifestos para instalar no Claude Code como plugin. |
