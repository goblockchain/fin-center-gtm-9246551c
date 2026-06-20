import type { Database } from "./database";

type DB = Database["public"];

export type Tables<T extends keyof DB["Tables"]> = DB["Tables"][T]["Row"];
export type Insert<T extends keyof DB["Tables"]> = DB["Tables"][T]["Insert"];
export type Update<T extends keyof DB["Tables"]> = DB["Tables"][T]["Update"];
export type Views<T extends keyof DB["Views"]> = DB["Views"][T]["Row"];
export type Enums<T extends keyof DB["Enums"]> = DB["Enums"][T];

// Linhas das tabelas
export type Canal = Tables<"canais">;
export type Conta = Tables<"contas">;
export type Contato = Tables<"contatos">;
export type Interacao = Tables<"interacoes">;
export type Oportunidade = Tables<"oportunidades">;
export type Tarefa = Tables<"tarefas">;
export type Gate = Tables<"gates">;
export type ModeloMensagem = Tables<"modelos_mensagem">;
export type VozDoCliente = Tables<"voz_do_cliente">;
export type Investimento = Tables<"investimentos">;
export type Custo = Tables<"custos">;
export type Meta = Tables<"metas">;
export type ComunidadeMetrica = Tables<"comunidade_metricas">;
export type Parceiro = Tables<"parceiros">;
export type Evento = Tables<"eventos">;
export type PipelineEvento = Tables<"pipeline_eventos">;
export type Projeto = Tables<"projetos">;

// Views calculadas
export type CanalExecucao = Views<"canal_execucao">;
export type CanalKpis = Views<"canal_kpis">;
export type CanalEconomia = Views<"canal_economia">;
export type PipelineSemana = Views<"pipeline_semana">;

// Enums
export type Temperatura = Enums<"temperatura">;
export type EstagioOport = Enums<"estagio_oport">;
export type StatusTarefa = Enums<"status_tarefa">;
export type TipoInteracao = Enums<"tipo_interacao">;
export type PapelContato = Enums<"papel_contato">;
export type TipoVoz = Enums<"tipo_voz">;
export type StatusMensagem = Enums<"status_mensagem">;
export type StatusGate = Enums<"status_gate">;
export type TipoCusto = Enums<"tipo_custo">;
