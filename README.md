# 6 meses com Yasmin ❤️

Aplicação real, mobile-first, criada para a surpresa de seis meses de namoro. O link de Yasmin reúne um álbum interativo, o Palácio dos Decretos e o minigame **🚗 HB20 do Médio**. A área `/admin` usa Supabase Auth e mostra os dados persistidos em outros aparelhos.

## O que está pronto

- convite individual em `/s/TOKEN_ALEATORIO`, validado no servidor;
- álbum com as sete fotos reais, swipe, teclado, miniaturas, lightbox e corações persistidos;
- imagem Yasmin Ditador preservada inteira, reprodução do vídeo oficial por ação da usuária e fallback para YouTube;
- decretos persistidos, idempotentes, com status e resposta do namorado;
- jogo Canvas 2D responsivo com o rosto real dirigindo um HB20 marrom cartoon, controles touch/teclado, 3 vidas, pausa, quatro coletáveis e resultados persistidos;
- painel protegido por Supabase Auth, atualização automática, convite copiável, decretos, ranking, álbum e atividades essenciais;
- RLS fechada para clientes, service role apenas no servidor, validação Zod, checagem de origem e rate limit no banco;
- testes unitários, lint, TypeScript estrito e build Vercel.

## Requisitos

- Node.js 20.9 ou superior (recomendado: Node 24);
- uma conta [Supabase](https://supabase.com/);
- uma conta [Vercel](https://vercel.com/) para publicar.

## 1. Instalação local

```powershell
npm install
Copy-Item .env.example .env.local
```

Preencha `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://SEU-PROJETO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
YOUTUBE_ANTHEM_URL=https://www.youtube.com/watch?v=wwHneL4DrCg&list=RDwwHneL4DrCg&start_radio=1
```

`SUPABASE_SERVICE_ROLE_KEY` é um segredo: nunca prefixe com `NEXT_PUBLIC_`, nunca cole no navegador e nunca faça commit de `.env.local`.

## 2. Banco de dados Supabase

1. Crie um projeto no Supabase.
2. Abra **SQL Editor > New query**.
3. Cole e execute [`supabase/migrations/202611170001_initial_schema.sql`](supabase/migrations/202611170001_initial_schema.sql).
4. Em **Project Settings > API**, copie a URL, a chave anon/publishable e a service role para `.env.local`.

A migração cria `invites`, `admin_users`, `decrees`, `game_runs`, `album_events`, `activity_events` e `rate_limit_events`, com índices, constraints e RLS. Não há policy pública: todas as tabelas privadas ficam inacessíveis ao `anon` e ao usuário autenticado; somente as rotas server-side usam a service role.

## 3. Criar o administrador

Use uma senha forte temporariamente no `.env.local`:

```env
ADMIN_EMAIL=seu-email@exemplo.com
ADMIN_PASSWORD=uma-senha-forte-com-10-ou-mais-caracteres
```

Depois execute:

```powershell
npm run admin:provision
```

O script cria/confirma o usuário em Supabase Auth e inclui o UUID em `admin_users`. Depois, remova `ADMIN_EMAIL` e `ADMIN_PASSWORD` do arquivo; essas duas variáveis não são necessárias na Vercel.

Também é possível criar o usuário em **Authentication > Users** e então executar no SQL Editor, substituindo o UUID:

```sql
insert into public.admin_users (user_id) values ('UUID_DO_AUTH') on conflict do nothing;
```

## 4. Criar o convite da Yasmin

Com as variáveis do Supabase configuradas:

```powershell
npm run invite:create
```

O script usa 32 bytes criptograficamente aleatórios, salva o hash para validação e mantém o token em uma tabela privada para o botão **Copiar convite** do admin. Ele imprime:

- `http://localhost:3000/s/TOKEN` para Yasmin;
- o ID do convite.

Inicie a aplicação:

```powershell
npm run dev
```

Abra o link do convite em um celular e `http://localhost:3000/admin` em outro navegador. Uma sessão não autenticada que tente abrir `/admin` é redirecionada para o login.

## 5. Verificações

```powershell
npm test
npm run typecheck
npm run lint
npm run build
```

Checklist manual recomendado em dois dispositivos:

1. abra as sete fotos, use swipe e amplie uma foto;
2. toque em um coração e confira o evento no painel;
3. publique `Quero bolo de chocolate hoje` e confirme no admin;
4. altere para **Em andamento**, escreva uma resposta e aguarde até 8 segundos na tela de Yasmin;
5. toque para abrir o hino e teste o link alternativo do YouTube;
6. jogue por toque, troque de aba para confirmar a pausa e finalize uma partida;
7. confira score, itens e tentativa no painel.

## 6. Publicar na Vercel

1. Suba esta pasta para um repositório Git privado.
2. Na Vercel, escolha **Add New > Project** e importe o repositório.
3. O framework será detectado como Next.js; não altere Build Command (`next build`).
4. Cadastre em **Settings > Environment Variables**:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_SITE_URL` (primeiro pode usar a URL `https://seu-projeto.vercel.app`)
   - `YOUTUBE_ANTHEM_URL`
   - opcionais: `RESEND_API_KEY`, `NOTIFICATION_FROM_EMAIL`, `NOTIFICATION_TO_EMAIL`
5. Faça o deploy.
6. Atualize `NEXT_PUBLIC_SITE_URL` com o domínio final, se necessário, e redeploy.
7. No Supabase, abra **Authentication > URL Configuration** e defina **Site URL** como o domínio final da Vercel. Adicione a mesma URL em Redirect URLs.
8. Localmente, altere temporariamente `NEXT_PUBLIC_SITE_URL` para a URL final e execute `npm run invite:create`, ou copie pelo `/admin` um convite já criado.

Links finais:

- Yasmin: `https://SEU-DOMINIO/s/TOKEN_ALEATORIO`
- Administrador: `https://SEU-DOMINIO/admin`

O projeto inclui `vercel.json` com a região `gru1` (São Paulo). Timestamps são gravados em UTC pelo Postgres e exibidos como `America/Maceio` no painel.

## E-mail opcional com Resend

Sem Resend, o banco e o painel continuam funcionando integralmente. Para avisos por e-mail, verifique um domínio no Resend e configure:

```env
RESEND_API_KEY=re_...
NOTIFICATION_FROM_EMAIL=Surpresa <avisos@seu-dominio.com>
NOTIFICATION_TO_EMAIL=seu-email@exemplo.com
```

Falhas no e-mail não desfazem nem ocultam um decreto salvo.

## Editar conteúdo

- textos, legendas, sugestões e valores do jogo: [`src/config/site.ts`](src/config/site.ts);
- fotos: `public/assets/album/01.webp` a `07.webp` (a ordem está no mesmo arquivo de configuração);
- montagem: `public/assets/yasmin-ditador.webp`;
- rosto do motorista: `public/assets/avatar-rosto.webp`;
- hino: `YOUTUBE_ANTHEM_URL`.

Os assets originais continuam em `assets/` e foram copiados sem alterar a relação de nomes. A montagem usa `object-fit: contain` e nenhum texto é sobreposto nela.

## Privacidade e segurança

- o site inteiro envia `noindex`, `noarchive` e `Referrer-Policy: strict-origin-when-cross-origin`; assim o YouTube recebe apenas a origem necessária, sem receber o token presente no caminho do convite;
- a CSP permite frames somente do próprio site e dos domínios oficiais `youtube.com`/`youtube-nocookie.com`;
- não há analytics de terceiros, localização, microfone, rascunhos ou rastreamento de mouse;
- só são registrados: visita da surpresa, foto aberta, coração explícito, decreto confirmado e resultado final de partida;
- `localStorage` guarda apenas uma partida final que falhou ao sincronizar, para permitir reenvio; nunca é o banco principal;
- o score é recalculado no servidor a partir dos itens, e as rotas mutáveis validam origem, payload, token e limites;
- o token no endereço funciona como segredo. Compartilhe apenas com Yasmin e revogue o convite com `update public.invites set active = false where id = '...'` se ele vazar.

## Estrutura resumida

```text
src/
  app/
    s/[token]/                experiência da Yasmin
    admin/                    login e dashboard protegida
    api/invites/[token]/      gravações e snapshot da convidada
    api/admin/                leitura e atualização autenticadas
  components/
    surprise/                 álbum, ditadora e jogo Canvas
    admin/                    login e painel
  config/site.ts              textos editáveis
  lib/                        Supabase, validações, segurança e regras
supabase/migrations/          esquema e RLS
scripts/                      criação de convite e admin
public/assets/                imagens reais
```
