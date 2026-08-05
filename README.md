# Pousada Velho Chico

Site institucional + painel administrativo da Pousada Velho Chico (Icaraizinho de Amontada, Ceará).
Conteúdo clonado de [velhochicoicaraizinho.com.br](https://velhochicoicaraizinho.com.br/) para a base
de código **site-loft** (mesma usada pelo projeto Praia Bela).

**Stack:** Vite + React + TypeScript · Tailwind CSS v4 · Cloudflare Workers (Hono) · Cloudflare D1 (SQLite) · R2.
Tudo roda na Cloudflare — frontend (assets estáticos) e API (Worker) no mesmo deploy.

---

## Estrutura

```
migrations/        Schema (0001_init.sql) e conteúdo inicial (seed.sql)
worker/            API em Hono: /api/content (público) + /api/admin/* (protegido) + auth HMAC
src/site/          Site público (Hero, Sobre, Acomodações, Galeria, Depoimentos, etc.)
src/admin/         Painel administrativo (login por senha + editores)
src/lib/           Cliente de API e tipos compartilhados
public/uploads/    Imagens baixadas do site original (logo, quartos, galeria, experiências)
wrangler.jsonc     Configuração do Worker + binding D1 + R2 (assets/SPA)
.dev.vars          Variáveis de desenvolvimento (senha admin / segredo) — não committar
```

## Desenvolvimento local

```bash
npm install

# 1) Cria as tabelas e o conteúdo inicial no D1 local (.wrangler/state)
npm run db:migrate:local      # aplica migrations/ (0001_init.sql + seed.sql)

# 2) Sobe o site + API com hot reload
npm run dev                   # http://localhost:5170 (porta pode variar)
```

- Site: <http://localhost:5170/>
- Admin: <http://localhost:5170/admin> — senha definida em `ADMIN_PASSWORD` no `.dev.vars` (não committado).

> A senha e o segredo de assinatura ficam em `.dev.vars` (`ADMIN_PASSWORD`, `AUTH_SECRET`).
> Troque-os antes de ir para produção.

## Deploy na Cloudflare Pages

O projeto roda no **Cloudflare Pages**: o SPA (Vite) é servido como estático em `dist/`
e a API Hono roda como **Pages Function** (`functions/[[path]].ts`, via adaptador
`hono/cloudflare-pages`). O deploy acontece automaticamente a cada `git push` na `main`
(depois de conectar o repositório ao projeto no painel do Pages).

### Configuração do projeto no painel do Pages (uma vez)

Em **Workers & Pages → velhochico → Settings → Build**:

- **Root directory:** *(vazio / raiz do repo)*
- **Build command:** `npm run build`
- **Build output directory:** `dist`

Em **Settings → Functions** (ou via `wrangler.jsonc`, já incluso):

- **Compatibility flags:** `nodejs_compat`
- **Bindings → D1:** `DB` → `velhochico-db`
- **Bindings → R2:** `BUCKET` → `velhochico-media`
- **Variables & Secrets (Production):** `ADMIN_PASSWORD` e `AUTH_SECRET` (valores longos/aleatórios — **não** use os de `.dev.vars`).

### Preparar os recursos (uma vez, via CLI)

```bash
npx wrangler login
npx wrangler d1 create velhochico-db          # copie o database_id gerado para wrangler.jsonc
npx wrangler r2 bucket create velhochico-media # bucket de uploads do admin
npm run db:migrate:remote                      # aplica schema + seed no D1 remoto
```

Depois é só `git push` (deploy automático) ou `npm run deploy` (`wrangler pages deploy`).

### Desenvolvimento full-stack local

`npm run dev` sobe só o frontend (Vite). Para rodar **frontend + API + D1**
localmente, use:

```bash
npm run pages:dev   # build + wrangler pages dev (http://localhost:8788)
```

> **Origem do conteúdo:** a maior parte do texto e das imagens vieram de
> [velhochicoicaraizinho.com.br](https://velhochicoicaraizinho.com.br/) (WordPress/Elementor).
> As imagens foram baixadas para `public/uploads/`; novos uploads feitos pelo admin vão
> para o R2 `velhochico-media`. O site original não tem pacotes, promoções nem blog —
> essas tabelas existem no esquema (herdado do site-loft) mas ficam vazias até serem
> preenchidas pelo admin. O botão "RESERVAR" leva direto para o motor de reservas
> Artaxnet (`https://pousada-velho-chico.artaxnet.com/`), igual ao site original.
>
> Fotos do [Wikimedia Commons](https://commons.wikimedia.org/), licenciadas em **CC BY-SA**
> — mantenha a atribuição se trocar de lugar ou reutilizar em outro material:
>
> | Arquivo | Origem | Autor |
> |---|---|---|
> | `public/uploads/promo.jpg` | [Praia de Icaraí de Amontada](https://commons.wikimedia.org/wiki/File:Praia_icarai_de_amontada_-_ceara.jpg) | Fabiobarros |
> | `public/uploads/experience-kitesurf.jpg` | [Kite Cauípe](https://commons.wikimedia.org/wiki/File:Kite_Cauipe.jpg) (Lagoa do Cauípe, CE — foto ilustrativa) | Elissonm |
> | `public/uploads/experience-por-do-sol.jpg` | [Duna do Pôr do Sol - Jericoacoara](https://commons.wikimedia.org/wiki/File:Duna_do_P%C3%B4r_do_Sol_-_Jericoacoara.JPG) (foto ilustrativa) | Sibelicarvalho |
> | `public/uploads/experience-jangada.jpg` | [Jangadas, Ceará](https://commons.wikimedia.org/wiki/File:Jangadas,_Cear%C3%A1.jpg) | LBM1948 |

## Painel administrativo

Acessível em `/admin`. Permite editar:

| Aba | O que edita |
|-----|-------------|
| Geral | Nome, logo, localização, Instagram e títulos das seções |
| Hero | **Imagem ou vídeo** de fundo, textos e barra de reserva |
| Sobre | Eyebrow, título, parágrafos, imagens e CTA |
| Acomodações | CRUD de quartos/suítes (foto, descrição, comodidades, ordem) |
| Experiências | CRUD de experiências/passeios (foto, título, descrição) |
| Pacotes | CRUD de pacotes (preço, inclusões, destaque, foto) — vazio por padrão |
| Promoções | CRUD de promoções (desconto %, validade, foto) — vazio por padrão |
| Blog | CRUD de postagens (slug, categoria, capa, resumo, conteúdo) — vazio por padrão |
| Destaques & Comodidades | Tiles de destaque e ícones de comodidades |
| Localização | Textos e imagem da seção |
| Galeria | Fotos estilo Instagram |
| Faixa Promo | Faixa "Reserve ou programe sua estadia" |
| Depoimentos | Avaliações de hóspedes (nota, autor, texto) |
| Contato | Endereço, e-mail, telefone, redes sociais |
| Aparência | Paleta de cores (tema terracota extraído da logo original) |

O blog tem páginas próprias: `/blog` (lista) e `/blog/:slug` (postagem), mas ficam
sem conteúdo até que posts sejam criados no admin (o teaser some da home automaticamente
quando não há posts). O mesmo vale para Pacotes e Promoções.

### Hero: imagem ↔ vídeo
Na aba **Hero**, mude o campo *Modo de fundo* para **Vídeo** e informe a URL de um `.mp4`.
A *URL da imagem* continua sendo usada como _poster_ (frame inicial enquanto o vídeo carrega).

## Imagens (upload + compressão via R2)

Os campos de imagem do admin permitem **enviar arquivos** (clique ou arraste).
A imagem é **comprimida no navegador** (redimensionada para no máx. 800px de largura e
convertida para WebP, ~0,72 de qualidade) antes do upload — economiza banda e armazenamento.

- Upload: `POST /api/admin/upload` grava o arquivo no bucket **R2** (`BUCKET`).
- Entrega: o Worker serve as imagens em `/files/<key>` com cache imutável de 1 ano.
- O campo de URL continua disponível como alternativa (ex.: colar um link externo).
- No **dev local** o R2 é emulado pelo Miniflare (em `.wrangler/state`) — não precisa
  criar bucket para testar. Em produção, crie o bucket com
  `npx wrangler r2 bucket create velhochico-media`.

## Segurança do admin

- Login por **senha única**. A senha não é armazenada no banco; é comparada (via hash SHA-256,
  em tempo constante) com a variável `ADMIN_PASSWORD`.
- Em caso de sucesso, o Worker emite um **token assinado (HMAC-SHA256)** com validade de 12h,
  guardado no `localStorage` e enviado no header `Authorization: Bearer`.
- Todas as rotas `/api/admin/*` (exceto o login) exigem token válido.
