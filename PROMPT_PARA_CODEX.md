# PROMPT PARA O CODEX — SURPRESA INTERATIVA DE 6 MESES COM YASMIN

Você é um engenheiro full-stack sênior e designer de experiências web. **Crie e implemente um projeto real, bonito, funcional e pronto para deploy**, não apenas protótipos visuais. Execute diretamente no repositório e entregue código completo, migrações, testes essenciais, configurações de ambiente, README e instruções de publicação.

## 1. Contexto

Estou comemorando **6 meses de namoro com Yasmin**. Quero enviar a ela um link privado para um site-surpresa, romântico, caprichado, divertido e com três experiências:

1. **Nosso Álbum** — álbum interativo com as sete fotos reais do casal fornecidas.
2. **Yasmin Ditador** — paródia carinhosa do meme 'Kylian Ditador', com a imagem enviada, música por embed oficial e formulário para Yasmin registrar o que quer fazer hoje; eu recebo e posso gerenciar os pedidos.
3. **Pedal do Médio** — minigame com meu personagem de bicicleta, com cabeça exageradamente grande baseada em uma das minhas fotos, coletando bolo de chocolate, coleira para Macchi (o cachorro), bolsas e roupas da Zara.

**Duas experiências distintas de acesso:**
- `https://DOMINIO/s/CONVITE_ALEATORIO` (link individual e difícil de adivinhar para Yasmin, sem exigir cadastro).
- `https://DOMINIO/admin` (área privada exclusivamente minha, com login de verdade, para visualizar os pedidos e resultados/interações importantes).

Não usar dados fictícios para simular persistência: **tudo o que for enviado pela interface deve realmente ser salvo no backend e aparecer em outra sessão/dispositivo**.

## 2. Assets reais já presentes neste kit

- `assets/album/01.webp` até `07.webp`: são **7 fotos reais** do casal, já preparadas para web (sem metadados EXIF). Use todas, na ordem numérica como ordem inicial. `assets/album/manifest.json` tem a lista.
- `assets/yasmin-ditador.webp`: imagem do meme enviada. **Preservar integralmente as frases/textos nela já existentes**, não sobrescrever com outros elementos.
- `assets/avatar-rosto.webp`: recorte de meu rosto a partir de uma das fotos do álbum. Usar no personagem cabeçudo da bicicleta; recorte circular/cartoon em CSS/canvas, com corpo e bicicleta ilustrados em 2D. Não substituir por rosto genérico.

Copie esses assets para `public/assets/` ou caminho equivalente, sem alterar a relação entre os arquivos.

## 3. Direção visual e experiência

Quero algo de presente, não aparência de painel corporativo. Visual sofisticado e fofo, com cores creme, vinho/rosa queimado e detalhes dourados; tipografia elegante para títulos e legível para textos. Animações suaves de corações/confetes, microinterações, efeitos de hover, transições entre telas e pequenos easter eggs. Evitar exagero, poluição visual e performance ruim.

**Mobile-first**: telas de celular são prioridade. Funcionar bem em Android e iPhone, com controles touch, acessibilidade, navegação por teclado quando aplicável, imagens responsivas e textos com bom contraste. Respeitar `prefers-reduced-motion`.

A página inicial deverá ter:
- destaque animado `Feliz 6 meses de namoro, Yasmin! ❤️`;
- subtítulo com mensagem curta e delicada, sem inventar datas ou memórias específicas;
- 3 cards grandes com ícones/ilustrações e CTAs claros: `Nosso Álbum 📸`, `Yasmin Ditador 👑`, `Pedal do Amor 🚲`;
- detalhe de surpresa/revelação ao abrir, opcional, com animação discreta;
- botão para voltar ao menu em todas as seções.

Escrever tudo em **português do Brasil**. Manter nomes e frases em arquivos de configuração para permitir edição fácil.

## 4. Tela 1 — Nosso Álbum

- Utilizar as **7 fotos reais**, todas carregando corretamente, sem URLs de bancos de imagens e sem placeholders.
- Criar experiência de álbum interativo: carrossel com swipe, setas, indicador `1 de 7`, visualização ampliada/lightbox, navegação por teclado, miniaturas ou timeline visual.
- Cada foto pode ter um espaço de legenda romântica **editável via arquivo JSON/TS**; criar textos genéricos delicados, sem inventar acontecimentos concretos. Ex.: `Cada foto guarda um pedacinho do nosso amor.`
- Botão de coração em cada foto, com efeito e contagem do usuário, salvando curtida apenas quando ela tocar.
- Uma mensagem de encerramento após a última foto, como `Seis meses e eu ainda escolheria você de novo. ❤️` e botão de retorno.
- Registrar no banco **apenas eventos significativos**: foto aberta e curtida explicitamente, com data/hora. Não registrar movimentos do mouse, digitação ou dados ocultos.
- Foco em carregamento rápido: WebP, lazy-loading, preload apenas da próxima foto e orientação correta.

## 5. Tela 2 — Yasmin Ditador 👑

Tom de brincadeira amorosa, divertido, sem conotação política real. Título `Yasmin Ditador 👑`; subtítulo, por exemplo, `Aqui, quem dá as ordens é você. E eu obedeço (quase) sempre! ❤️`.

### Layout
- Exibir a imagem `assets/yasmin-ditador.webp` em destaque, sem cortar as frases já existentes nela. Usar `object-fit: contain` ou adaptação responsável em celulares.
- Criar selo `Palácio dos Decretos da Yasmin` e animação leve de coroa/corações.
- Incluir botão **`▶ Tocar hino da ditadora`** que abre/reproduz a música do meme. A referência atual é `https://www.youtube.com/watch?v=wwHneL4DrCg&list=RDwwHneL4DrCg&start_radio=1`. Se o embed estiver indisponível, apresentar botão `Abrir música no YouTube`; permitir trocar a URL por configuração. **Não baixar nem incluir arquivo da música sem permissão/licença e não tentar burlar autoplay**: a reprodução deve começar por ação da usuária.

### Formulário de decretos
- Pergunta principal: `Minha rainha, o que vamos fazer hoje? 👑`.
- Campo de texto/textarea onde ela escreve livremente o que quer fazer.
- Sugestões clicáveis opcionais: `Comer bolo de chocolate 🍫`, `Passear com Macchi 🐶`, `Sessão de filme 🎬`, `Passear juntinhos 💕`, `Comprinhas 🛍️`. As sugestões apenas preenchem o campo; o envio só ocorre após confirmar.
- Botão grande `Publicar decreto real 👑`.
- Validar mensagem não vazia, limitar a 500 caracteres, mostrar estados enviando/êxito/erro e prevenir duplicações.
- Após confirmar e **receber sucesso do servidor**, mostrar mensagem `Decreto recebido, minha rainha! Seu namorado foi oficialmente notificado. 🫡❤️` (se não houver notificação real, adaptar para `Decreto salvo no palácio!`). Adicionar confete/corações discretos.
- Salvar `id`, `invite_id`, `texto`, `created_at`, `status` (`recebido`, `em_andamento`, `cumprido`) e eventual `resposta_do_namorado`.
- Mostrar para ela a lista dos próprios decretos (com status), vinculada somente ao convite, de modo que possa acompanhar o andamento.
- No painel admin, permitir ver novos decretos em tempo quase real (Realtime ou polling), alterar status e escrever resposta curta carinhosa. Atualizações devem refletir na tela dela.
- Se houver integração Resend configurada, opcionalmente mandar e-mail ao admin a cada novo decreto; **o banco/painel deve funcionar sem Resend**.

## 6. Tela 3 — Pedal do Amor 🚲

Criar **um minigame 2D jogável de verdade**, side-scroller leve e cômico, com personagem pedindo passagem de bicicleta, rosto extremamente cabeçudo usando `assets/avatar-rosto.webp`, corpo pequeno desenhado, rodas girando, movimento de pedalar e cenário divertido. O objetivo é coletar o máximo possível de coisas de que Yasmin gosta.

### Itens coletáveis obrigatórios
1. **Bolo de chocolate 🍫🎂** — ícone/sprite visual reconhecível;
2. **Coleira para Macchi 🐶** — coleira de cachorro, não coleira de pescoço de pessoa;
3. **Bolsas 👜**;
4. **Roupas da Zara 👗** — mostrar o nome `Zara` na identificação do item, mas não usar imagens ou logotipos copiados sem necessidade.

### Jogabilidade
- Escolher Phaser 3 ou Canvas 2D bem organizado (preferência Phaser 3 se integra facilmente a Next.js), com renderização responsiva.
- Cenário com parallax suave, coleta por colisão, animações de partículas, sons próprios/royalty-free opcionais, HUD com pontos, corações/vidas, tempo e quantidade de cada tipo de item.
- PC: `Espaço`/`↑` para pular e evitar obstáculos. Celular: toque em qualquer área apropriada do jogo ou botão `Pular`. O jogo deve ser realmente utilizável no celular, sem exigir teclado.
- Bicicleta pedala automaticamente; jogador controla pulos. Obstáculos simples e engraçados (poças, cones, etc.), sem dificuldade excessiva.
- Partida com duração-alvo ~60–90 segundos, 3 vidas, contagem de pontos clara. Definir pontuações equilibradas e informar no início.
- Meta especial: coletar ao menos um item de cada categoria. Mostrar conquistas e final romântico com `Parabéns, Yasmin! Você conquistou meu coração de novo! ❤️` e botão `Jogar novamente`.
- Incluir tela de início com instruções e estado pausado/reiniciar; pausar quando aba perde foco para evitar penalidade injusta.
- Evitar coletáveis gerados impossíveis de alcançar, e testar colisões, ritmo e scaling.
- Salvar **somente resultados significativos** por partida: data/hora, score, tempo, itens por categoria, venceu/perdeu e quantidade de tentativas. O painel do namorado deve ver ranking das melhores partidas e histórico.
- Se o backend ficar indisponível, não mentir que salvou: mostrar estado claro e opção de reenviar ao reconectar.

## 7. Área privada para mim — /admin

Criar uma dashboard bonita, protegida por login real (**Supabase Auth**, e-mail/senha) e autorização server-side, não apenas rota escondida, query string, senha em JavaScript ou segredo no cliente.

Funcionalidades:
- card `Novos decretos` + lista com texto integral, horário local, status e botões de atendimento;
- alterar para `Recebido`, `Em andamento`, `Cumprido`, adicionar resposta para Yasmin;
- histórico de partidas do jogo, pontuação máxima, itens coletados e últimas partidas;
- interações do álbum: fotos abertas e corações dados;
- visão resumida de visitas e atividades importantes, sem rastreamento invasivo;
- atualizar dados automaticamente após novas submissões, com data/hora e feedback real;
- botão para copiar o convite único da Yasmin, gerado com token de alta entropia;
- permitir que eu visualize facilmente **o que ela enviou e conquistou mesmo em outro aparelho**, com Supabase persistindo no banco.

Sem dados fictícios em produção. Caso inicialmente não haja eventos, exibir estados vazios amigáveis.

## 8. Arquitetura proposta

- **Frontend e backend**: Next.js (App Router) + TypeScript + Tailwind CSS; componentes de interface reutilizáveis; animar com Framer Motion/Motion quando necessário, sem peso excessivo.
- **Minigame**: Phaser 3 com import dinâmico e `ssr: false` (ou alternativa Canvas 2D caso mantenha melhor compatibilidade).
- **Dados e Auth**: Supabase Postgres + Supabase Auth para admin. Criar migrações SQL idempotentes/reprodutíveis, tipagens e seed/CLI seguro para criar convite inicial.
- Tabelas sugeridas: `invites`, `decrees`, `game_runs`, `album_events`, `activity_events`; ajustar estrutura como necessário. Criar índices por `created_at` e `invite_id`. Definir constraints e enum/check de status.
- **Segurança**: políticas RLS, autenticação e autorização server-side nos acessos de admin. Para a convidada, validar token longo e aleatório no servidor a cada gravação e consulta; as tabelas privadas nunca devem ficar abertas para SELECT público direto. Operações com service role somente em código server-side e nunca enviando chaves ao browser.
- Não utilizar `localStorage` como armazenamento principal. Pode ser usado só para preferências locais ou recuperação temporária de envio.
- API/Server Actions validando payloads (Zod), limites de texto, rate limiting nas rotas de submissão, CSRF/Origin adequado, respostas com códigos corretos e sem exposição de segredos.
- Configurar `Referrer-Policy: no-referrer` na área do convite e evitar analytics de terceiros para não vazar o token do link. Cookies seguros se usados. Sem indexação pública (`noindex` e robots apropriado).
- Adotar horário `America/Maceio` para exibir os eventos no painel, mantendo timestamps UTC no banco.
- Adicionar aviso discreto, transparente, antes das interações: `Seus decretos e pontuações serão enviados para seu namorado ❤️`. Não coletar localização, microfone, IP para analytics, rascunhos enquanto digita nem outras informações desnecessárias.
- Variáveis `.env.example`: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` (somente servidor), `NEXT_PUBLIC_SITE_URL`, `YOUTUBE_ANTHEM_URL`, e opcionais `RESEND_API_KEY` e e-mail de notificação, conforme implementação.
- **Deploy**: preparar para Vercel + Supabase, sem exigir servidor próprio. Incluir passos claros para configurar Supabase, executar migrações, provisionar admin com Auth, gerar convite e publicar Vercel.

## 9. Experiência de qualidade e entrega

- Criar estrutura de pastas clara, tipagem estrita e componentes por tela.
- Executar `npm install`, checagem TypeScript, lint, build de produção e testes básicos do fluxo de decreto e pontuação. Corrigir erros, não deixar TODOs críticos no caminho principal.
- README em português com: instalação local, `.env`, Supabase, migrações, criação do usuário admin, geração do convite, como editar frases e legendas, onde estão as imagens, trilha sonora, deploy e como usar os dois links em celulares diferentes.
- A música depende de serviço externo: garantir botão e fallback se iframe não funcionar.
- Sem inventar uma data de início do namoro, sem afirmar que eventos foram recebidos antes de confirmações reais, sem conteúdo de placeholder no produto final.
- Criar um pequeno arquivo de configuração para editar facilmente título, nome da Yasmin, frases e itens do jogo, sem procurar em dezenas de componentes.
- Testar responsividade da tela inicial, carrossel, formulário, jogo mobile e admin. Se for possível, incluir capturas de tela nos testes ou instruções para validar.

## 10. Critérios de aceite obrigatórios

1. Consigo iniciar o projeto com os assets do kit e as variáveis documentadas.
2. A home abre no celular e navega corretamente entre **as 3 opções**.
3. O álbum mostra **as 7 fotos reais**; os corações e visualizações são registrados.
4. A tela Yasmin Ditador mostra a **imagem fornecida** e permite tocar/abrir a música por um clique.
5. Yasmin escreve `Quero bolo de chocolate hoje` e clica em publicar: a mensagem aparece no banco e no meu `/admin` **em outro dispositivo**.
6. No `/admin`, eu altero o status do decreto; Yasmin vê a atualização na área dela.
7. O minigame de bicicleta funciona no celular, usa meu rosto grande e tem os 4 tipos de itens mencionados.
8. Ao terminar uma partida, pontuação/itens ficam persistidos e visíveis na dashboard.
9. Convidada não consegue acessar `/admin`; usuário não autenticado não consegue ler dados privados via API.
10. O projeto tem README, migrações e instruções de deploy. Sem mock usado como backend final.

**Implemente agora.** Tome decisões de implementação sensatas sem ficar parado pedindo detalhes estéticos. Caso faltem chaves de serviço para testar a persistência, implemente integralmente, documente exatamente quais credenciais preciso adicionar e teste tudo o que for possível localmente. Ao final, apresente árvore do projeto, o que foi construído, comandos executados, testes que passaram, pendências reais e o passo a passo para obter o link público e o link admin.
