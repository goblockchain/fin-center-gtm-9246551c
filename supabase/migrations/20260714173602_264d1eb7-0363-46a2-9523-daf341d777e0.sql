
-- Enums
DO $$ BEGIN CREATE TYPE tipo_participante AS ENUM ('interno','cliente','parceiro','outro'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE origem_evento AS ENUM ('manual','whatsapp'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE status_evento AS ENUM ('agendado','cancelado','realizado'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE status_convite AS ENUM ('pendente','aceito','recusado'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- updated_at helper (idempotent)
CREATE OR REPLACE FUNCTION public.set_updated_at_agenda() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql SET search_path = public;

-- participantes
CREATE TABLE IF NOT EXISTS public.participantes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  email text,
  telefone text,
  tipo tipo_participante NOT NULL DEFAULT 'interno',
  ativo boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.participantes TO authenticated;
GRANT ALL ON public.participantes TO service_role;
ALTER TABLE public.participantes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "auth_all_participantes" ON public.participantes;
CREATE POLICY "auth_all_participantes" ON public.participantes FOR ALL TO authenticated USING (true) WITH CHECK (true);
DROP TRIGGER IF EXISTS participantes_updated ON public.participantes;
CREATE TRIGGER participantes_updated BEFORE UPDATE ON public.participantes FOR EACH ROW EXECUTE FUNCTION public.set_updated_at_agenda();

-- eventos_agenda (FK a contas condicional para não quebrar se a tabela não existir)
CREATE TABLE IF NOT EXISTS public.eventos_agenda (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo text NOT NULL,
  descricao text,
  inicio timestamptz NOT NULL,
  fim timestamptz NOT NULL,
  local text,
  conta_id uuid,
  criado_por text,
  google_event_id text,
  google_calendar_id text,
  origem origem_evento NOT NULL DEFAULT 'manual',
  status status_evento NOT NULL DEFAULT 'agendado',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='contas')
     AND NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name='eventos_agenda_conta_id_fkey')
  THEN
    ALTER TABLE public.eventos_agenda ADD CONSTRAINT eventos_agenda_conta_id_fkey FOREIGN KEY (conta_id) REFERENCES public.contas(id) ON DELETE SET NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS eventos_agenda_inicio_idx ON public.eventos_agenda (inicio);
CREATE INDEX IF NOT EXISTS eventos_agenda_conta_idx ON public.eventos_agenda (conta_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.eventos_agenda TO authenticated;
GRANT ALL ON public.eventos_agenda TO service_role;
ALTER TABLE public.eventos_agenda ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "auth_all_eventos_agenda" ON public.eventos_agenda;
CREATE POLICY "auth_all_eventos_agenda" ON public.eventos_agenda FOR ALL TO authenticated USING (true) WITH CHECK (true);
DROP TRIGGER IF EXISTS eventos_agenda_updated ON public.eventos_agenda;
CREATE TRIGGER eventos_agenda_updated BEFORE UPDATE ON public.eventos_agenda FOR EACH ROW EXECUTE FUNCTION public.set_updated_at_agenda();

-- eventos_participantes
CREATE TABLE IF NOT EXISTS public.eventos_participantes (
  evento_id uuid NOT NULL REFERENCES public.eventos_agenda(id) ON DELETE CASCADE,
  participante_id uuid NOT NULL REFERENCES public.participantes(id) ON DELETE CASCADE,
  status_convite status_convite NOT NULL DEFAULT 'pendente',
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (evento_id, participante_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.eventos_participantes TO authenticated;
GRANT ALL ON public.eventos_participantes TO service_role;
ALTER TABLE public.eventos_participantes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "auth_all_eventos_participantes" ON public.eventos_participantes;
CREATE POLICY "auth_all_eventos_participantes" ON public.eventos_participantes FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- whatsapp_mensagens
CREATE TABLE IF NOT EXISTS public.whatsapp_mensagens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  from_number text NOT NULL,
  body text NOT NULL,
  processado boolean NOT NULL DEFAULT false,
  evento_id uuid REFERENCES public.eventos_agenda(id) ON DELETE SET NULL,
  erro text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS whatsapp_mensagens_created_idx ON public.whatsapp_mensagens (created_at DESC);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.whatsapp_mensagens TO authenticated;
GRANT ALL ON public.whatsapp_mensagens TO service_role;
ALTER TABLE public.whatsapp_mensagens ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "auth_all_whatsapp_mensagens" ON public.whatsapp_mensagens;
CREATE POLICY "auth_all_whatsapp_mensagens" ON public.whatsapp_mensagens FOR ALL TO authenticated USING (true) WITH CHECK (true);
