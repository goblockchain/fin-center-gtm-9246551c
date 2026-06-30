# Plano — Agenda integrada com Google Calendar e bot WhatsApp

## Resumo

Adicionar uma nova aba **/agenda** ao UseFin com calendário visual (mês/semana/dia). Eventos criados aqui sincronizam para o Google Calendar e disparam convites por e-mail para os participantes (que caem automaticamente nas agendas Google/Outlook/Apple deles). Em paralelo, um número WhatsApp recebe mensagens em linguagem natural ("Reunião com Café Paris amanhã 15h"), uma edge function interpreta com IA e cria o evento.

## Como funciona a integração com agendas dos usuários (importante)

O conector Google Calendar do Lovable autentica **uma conta** (a da Natalia/Henrique). Ele **não** pede OAuth de cada participante. A boa notícia: ao criar o evento nessa conta e adicionar `attendees: [{email}, …]`, o Google envia automaticamente o convite por e-mail para cada participante e o evento aparece na agenda deles assim que aceitam — sem precisar conectar conta nenhuma do lado do convidado.

Resultado prático: você cria o evento no UseFin → vai pra agenda da Fin no Google → cada convidado recebe convite e tem o evento na própria agenda. Funciona com Google, Outlook e Apple Calendar do lado do convidado.

## Escopo

### 1. Base de dados (migration 0014)
- `participantes` (catálogo de pessoas convidáveis): `id`, `nome`, `email`, `telefone`, `tipo` (interno/cliente/parceiro), `ativo`.
- `eventos_agenda`: `id`, `titulo`, `descricao`, `inicio` (timestamptz), `fim`, `local`, `conta_id` (opcional, vincula lead), `criado_por`, `google_event_id`, `google_calendar_id`, `origem` (manual/whatsapp), `status` (agendado/cancelado/realizado), `created_at`.
- `eventos_participantes`: `evento_id`, `participante_id`, `status_convite` (pendente/aceito/recusado).
- `whatsapp_mensagens` (log do bot): `id`, `from_number`, `body`, `processado`, `evento_id` (se virou evento), `erro`, `created_at`.
- GRANTs + RLS (authenticated lê/escreve tudo, anon negado — padrão do projeto).

### 2. Página `/agenda`
- Item novo na top bar (9º item).
- Componente de calendário visual: vou usar `react-big-calendar` (mês/semana/dia), com locale pt-BR e tokens da Fin (forest/mint).
- Botão "Novo evento" → diálogo com título, data/hora início/fim, local, lead vinculado (opcional, ContaPicker existente), participantes (multi-select do catálogo + criação rápida), descrição.
- Click num evento abre detalhes com editar/cancelar/marcar como realizado.

### 3. Edge function `google-calendar-sync`
- Disparada via `supabase.functions.invoke` ao criar/editar/cancelar evento.
- Usa o conector Google Calendar (gateway) para POST/PATCH/DELETE em `/calendars/primary/events`.
- Inclui `attendees` com os e-mails → Google envia convites automaticamente (`sendUpdates=all`).
- Salva `google_event_id` no registro.

### 4. Edge function `whatsapp-webhook` (público, sem JWT)
- Recebe POSTs do Twilio (form-urlencoded: `From`, `Body`).
- Log da mensagem em `whatsapp_mensagens`.
- Chama Lovable AI (`google/gemini-3-flash-preview`) com structured output (Zod) para extrair: `titulo`, `inicio_iso`, `fim_iso`, `participantes_nomes[]`, `local`.
- Faz match dos participantes pelo nome no catálogo `participantes`.
- Cria registro em `eventos_agenda` + chama a sync do Google Calendar.
- Responde TwiML com confirmação ("✅ Evento criado: Reunião com Café Paris — 02/jul 15h").
- Se a IA não conseguir extrair, responde pedindo formato com exemplo.

### 5. Configuração de conectores (você precisa fazer)
- **Google Calendar**: conectar via OAuth da conta Google da Fin que vai centralizar a agenda.
- **Twilio**: conectar com credenciais Twilio. Pra começar barato, use o **WhatsApp Sandbox do Twilio** (grátis, número compartilhado, ativa em 2 min com um código no WhatsApp). Configurar o webhook da inbox apontando para a URL pública da edge function `whatsapp-webhook`. Quando validar, migrar para número Twilio próprio aprovado pela Meta.

## Detalhes técnicos

- Top bar passa de 8 → 9 itens; em mobile vira menu compacto se necessário.
- `react-big-calendar` + `date-fns` localizer pt-BR.
- Edge functions com CORS padrão e validação Zod do payload.
- Webhook do WhatsApp não pode exigir JWT (Twilio não envia) — configurar em `supabase/config.toml` com `verify_jwt = false`.
- IA usa `Output.object` com schema Zod pra retornar JSON estruturado garantido.
- TanStack Query invalida `["eventos_agenda"]` após cada mutação; Realtime opcional numa segunda iteração.

## Fora do escopo desta entrega (proponho deixar pra depois)

- OAuth per-user pra cada convidado conectar a própria agenda (complexidade alta; o fluxo de attendees + convite por e-mail já resolve 95% do caso de uso).
- Recorrência de eventos.
- Notificação WhatsApp de lembrete pré-evento (dá pra adicionar depois com cron).
- Migração do sandbox Twilio pra número Meta aprovado (faz quando o fluxo provar valor).

## Ordem de execução

1. Migration 0014 (tabelas + RLS + GRANTs).
2. Conector Google Calendar + edge function `google-calendar-sync`.
3. Página `/agenda` + diálogo de evento + integração com a sync.
4. Conector Twilio + edge function `whatsapp-webhook` com IA.
5. Smoke test: criar evento manual → ver no Google da Fin + convidado recebe e-mail. Mandar WhatsApp pro sandbox → ver evento criado.

Posso seguir?