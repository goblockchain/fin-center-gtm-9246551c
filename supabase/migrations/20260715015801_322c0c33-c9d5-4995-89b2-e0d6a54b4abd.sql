CREATE TYPE public.tipo_negocio AS ENUM ('franqueador','franqueado','independente');
ALTER TABLE public.contas ADD COLUMN tipo_negocio public.tipo_negocio;