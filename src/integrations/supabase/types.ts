export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      canais: {
        Row: {
          created_at: string
          dependencia: string | null
          gate_data: string | null
          hipotese: string | null
          id: string
          meta_vs_baseline: string | null
          metrica_sucesso: string | null
          nome: string
          ordem: number
          prioridade: number
          responsavel: string | null
          slug: string
          teste_minimo: string | null
          tipo: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          dependencia?: string | null
          gate_data?: string | null
          hipotese?: string | null
          id?: string
          meta_vs_baseline?: string | null
          metrica_sucesso?: string | null
          nome: string
          ordem?: number
          prioridade?: number
          responsavel?: string | null
          slug: string
          teste_minimo?: string | null
          tipo?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          dependencia?: string | null
          gate_data?: string | null
          hipotese?: string | null
          id?: string
          meta_vs_baseline?: string | null
          metrica_sucesso?: string | null
          nome?: string
          ordem?: number
          prioridade?: number
          responsavel?: string | null
          slug?: string
          teste_minimo?: string | null
          tipo?: string
          updated_at?: string
        }
        Relationships: []
      }
      comunidade_metricas: {
        Row: {
          ativos: number
          competencia: string
          conversas: number
          created_at: string
          id: string
          membros: number
          observacao: string | null
          participacao_pct: number | null
          updated_at: string
        }
        Insert: {
          ativos?: number
          competencia: string
          conversas?: number
          created_at?: string
          id?: string
          membros?: number
          observacao?: string | null
          participacao_pct?: number | null
          updated_at?: string
        }
        Update: {
          ativos?: number
          competencia?: string
          conversas?: number
          created_at?: string
          id?: string
          membros?: number
          observacao?: string | null
          participacao_pct?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      contas: {
        Row: {
          bairro: string | null
          canal_origem_id: string
          created_at: string
          data_primeiro_contato: string | null
          endereco: string | null
          entrevista_agendada: boolean
          gatekeeper: string | null
          id: string
          instagram: string | null
          nome: string
          obs: string | null
          proxima_acao: string | null
          ref_externa: string | null
          responsavel: string | null
          telefone: string | null
          temperatura: Database["public"]["Enums"]["temperatura"]
          updated_at: string
          visitada: boolean
        }
        Insert: {
          bairro?: string | null
          canal_origem_id: string
          created_at?: string
          data_primeiro_contato?: string | null
          endereco?: string | null
          entrevista_agendada?: boolean
          gatekeeper?: string | null
          id?: string
          instagram?: string | null
          nome: string
          obs?: string | null
          proxima_acao?: string | null
          ref_externa?: string | null
          responsavel?: string | null
          telefone?: string | null
          temperatura?: Database["public"]["Enums"]["temperatura"]
          updated_at?: string
          visitada?: boolean
        }
        Update: {
          bairro?: string | null
          canal_origem_id?: string
          created_at?: string
          data_primeiro_contato?: string | null
          endereco?: string | null
          entrevista_agendada?: boolean
          gatekeeper?: string | null
          id?: string
          instagram?: string | null
          nome?: string
          obs?: string | null
          proxima_acao?: string | null
          ref_externa?: string | null
          responsavel?: string | null
          telefone?: string | null
          temperatura?: Database["public"]["Enums"]["temperatura"]
          updated_at?: string
          visitada?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "contas_canal_origem_id_fkey"
            columns: ["canal_origem_id"]
            isOneToOne: false
            referencedRelation: "canais"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contas_canal_origem_id_fkey"
            columns: ["canal_origem_id"]
            isOneToOne: false
            referencedRelation: "canal_economia"
            referencedColumns: ["canal_id"]
          },
          {
            foreignKeyName: "contas_canal_origem_id_fkey"
            columns: ["canal_origem_id"]
            isOneToOne: false
            referencedRelation: "canal_execucao"
            referencedColumns: ["canal_id"]
          },
          {
            foreignKeyName: "contas_canal_origem_id_fkey"
            columns: ["canal_origem_id"]
            isOneToOne: false
            referencedRelation: "canal_kpis"
            referencedColumns: ["canal_id"]
          },
        ]
      }
      contatos: {
        Row: {
          conta_id: string
          created_at: string
          email: string | null
          id: string
          instagram: string | null
          nome: string
          papel: Database["public"]["Enums"]["papel_contato"]
          telefone: string | null
        }
        Insert: {
          conta_id: string
          created_at?: string
          email?: string | null
          id?: string
          instagram?: string | null
          nome: string
          papel?: Database["public"]["Enums"]["papel_contato"]
          telefone?: string | null
        }
        Update: {
          conta_id?: string
          created_at?: string
          email?: string | null
          id?: string
          instagram?: string | null
          nome?: string
          papel?: Database["public"]["Enums"]["papel_contato"]
          telefone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contatos_conta_id_fkey"
            columns: ["conta_id"]
            isOneToOne: false
            referencedRelation: "contas"
            referencedColumns: ["id"]
          },
        ]
      }
      custos: {
        Row: {
          canal_id: string
          competencia: string | null
          created_at: string
          descricao: string | null
          horas: number | null
          id: string
          tipo_custo: Database["public"]["Enums"]["tipo_custo"]
          updated_at: string
          valor: number
        }
        Insert: {
          canal_id: string
          competencia?: string | null
          created_at?: string
          descricao?: string | null
          horas?: number | null
          id?: string
          tipo_custo: Database["public"]["Enums"]["tipo_custo"]
          updated_at?: string
          valor?: number
        }
        Update: {
          canal_id?: string
          competencia?: string | null
          created_at?: string
          descricao?: string | null
          horas?: number | null
          id?: string
          tipo_custo?: Database["public"]["Enums"]["tipo_custo"]
          updated_at?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "custos_canal_id_fkey"
            columns: ["canal_id"]
            isOneToOne: false
            referencedRelation: "canais"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "custos_canal_id_fkey"
            columns: ["canal_id"]
            isOneToOne: false
            referencedRelation: "canal_economia"
            referencedColumns: ["canal_id"]
          },
          {
            foreignKeyName: "custos_canal_id_fkey"
            columns: ["canal_id"]
            isOneToOne: false
            referencedRelation: "canal_execucao"
            referencedColumns: ["canal_id"]
          },
          {
            foreignKeyName: "custos_canal_id_fkey"
            columns: ["canal_id"]
            isOneToOne: false
            referencedRelation: "canal_kpis"
            referencedColumns: ["canal_id"]
          },
        ]
      }
      eventos: {
        Row: {
          clientes: number
          created_at: string
          data: string | null
          id: string
          investido: number
          leads_gerados: number
          mrr: number
          nome: string
          observacao: string | null
          updated_at: string
        }
        Insert: {
          clientes?: number
          created_at?: string
          data?: string | null
          id?: string
          investido?: number
          leads_gerados?: number
          mrr?: number
          nome: string
          observacao?: string | null
          updated_at?: string
        }
        Update: {
          clientes?: number
          created_at?: string
          data?: string | null
          id?: string
          investido?: number
          leads_gerados?: number
          mrr?: number
          nome?: string
          observacao?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      eventos_agenda: {
        Row: {
          conta_id: string | null
          created_at: string
          criado_por: string | null
          descricao: string | null
          fim: string
          google_calendar_id: string | null
          google_event_id: string | null
          id: string
          inicio: string
          local: string | null
          origem: Database["public"]["Enums"]["origem_evento"]
          status: Database["public"]["Enums"]["status_evento"]
          titulo: string
          updated_at: string
        }
        Insert: {
          conta_id?: string | null
          created_at?: string
          criado_por?: string | null
          descricao?: string | null
          fim: string
          google_calendar_id?: string | null
          google_event_id?: string | null
          id?: string
          inicio: string
          local?: string | null
          origem?: Database["public"]["Enums"]["origem_evento"]
          status?: Database["public"]["Enums"]["status_evento"]
          titulo: string
          updated_at?: string
        }
        Update: {
          conta_id?: string | null
          created_at?: string
          criado_por?: string | null
          descricao?: string | null
          fim?: string
          google_calendar_id?: string | null
          google_event_id?: string | null
          id?: string
          inicio?: string
          local?: string | null
          origem?: Database["public"]["Enums"]["origem_evento"]
          status?: Database["public"]["Enums"]["status_evento"]
          titulo?: string
          updated_at?: string
        }
        Relationships: []
      }
      eventos_participantes: {
        Row: {
          created_at: string
          evento_id: string
          participante_id: string
          status_convite: Database["public"]["Enums"]["status_convite"]
        }
        Insert: {
          created_at?: string
          evento_id: string
          participante_id: string
          status_convite?: Database["public"]["Enums"]["status_convite"]
        }
        Update: {
          created_at?: string
          evento_id?: string
          participante_id?: string
          status_convite?: Database["public"]["Enums"]["status_convite"]
        }
        Relationships: [
          {
            foreignKeyName: "eventos_participantes_evento_id_fkey"
            columns: ["evento_id"]
            isOneToOne: false
            referencedRelation: "eventos_agenda"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "eventos_participantes_participante_id_fkey"
            columns: ["participante_id"]
            isOneToOne: false
            referencedRelation: "participantes"
            referencedColumns: ["id"]
          },
        ]
      }
      gates: {
        Row: {
          created_at: string
          criterio: string | null
          data: string
          decisao_possivel: string | null
          id: string
          nome: string
          ordem: number
          status: Database["public"]["Enums"]["status_gate"]
        }
        Insert: {
          created_at?: string
          criterio?: string | null
          data: string
          decisao_possivel?: string | null
          id?: string
          nome: string
          ordem?: number
          status?: Database["public"]["Enums"]["status_gate"]
        }
        Update: {
          created_at?: string
          criterio?: string | null
          data?: string
          decisao_possivel?: string | null
          id?: string
          nome?: string
          ordem?: number
          status?: Database["public"]["Enums"]["status_gate"]
        }
        Relationships: []
      }
      interacoes: {
        Row: {
          autor: string | null
          canal_id: string | null
          conta_id: string
          created_at: string
          data: string
          id: string
          resumo: string | null
          tipo: Database["public"]["Enums"]["tipo_interacao"]
        }
        Insert: {
          autor?: string | null
          canal_id?: string | null
          conta_id: string
          created_at?: string
          data?: string
          id?: string
          resumo?: string | null
          tipo?: Database["public"]["Enums"]["tipo_interacao"]
        }
        Update: {
          autor?: string | null
          canal_id?: string | null
          conta_id?: string
          created_at?: string
          data?: string
          id?: string
          resumo?: string | null
          tipo?: Database["public"]["Enums"]["tipo_interacao"]
        }
        Relationships: [
          {
            foreignKeyName: "interacoes_canal_id_fkey"
            columns: ["canal_id"]
            isOneToOne: false
            referencedRelation: "canais"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "interacoes_canal_id_fkey"
            columns: ["canal_id"]
            isOneToOne: false
            referencedRelation: "canal_economia"
            referencedColumns: ["canal_id"]
          },
          {
            foreignKeyName: "interacoes_canal_id_fkey"
            columns: ["canal_id"]
            isOneToOne: false
            referencedRelation: "canal_execucao"
            referencedColumns: ["canal_id"]
          },
          {
            foreignKeyName: "interacoes_canal_id_fkey"
            columns: ["canal_id"]
            isOneToOne: false
            referencedRelation: "canal_kpis"
            referencedColumns: ["canal_id"]
          },
          {
            foreignKeyName: "interacoes_conta_id_fkey"
            columns: ["conta_id"]
            isOneToOne: false
            referencedRelation: "contas"
            referencedColumns: ["id"]
          },
        ]
      }
      investimentos: {
        Row: {
          canal_id: string
          created_at: string
          descricao: string | null
          executado: number
          id: string
          periodo: string | null
          planejado: number
          updated_at: string
        }
        Insert: {
          canal_id: string
          created_at?: string
          descricao?: string | null
          executado?: number
          id?: string
          periodo?: string | null
          planejado?: number
          updated_at?: string
        }
        Update: {
          canal_id?: string
          created_at?: string
          descricao?: string | null
          executado?: number
          id?: string
          periodo?: string | null
          planejado?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "investimentos_canal_id_fkey"
            columns: ["canal_id"]
            isOneToOne: false
            referencedRelation: "canais"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "investimentos_canal_id_fkey"
            columns: ["canal_id"]
            isOneToOne: false
            referencedRelation: "canal_economia"
            referencedColumns: ["canal_id"]
          },
          {
            foreignKeyName: "investimentos_canal_id_fkey"
            columns: ["canal_id"]
            isOneToOne: false
            referencedRelation: "canal_execucao"
            referencedColumns: ["canal_id"]
          },
          {
            foreignKeyName: "investimentos_canal_id_fkey"
            columns: ["canal_id"]
            isOneToOne: false
            referencedRelation: "canal_kpis"
            referencedColumns: ["canal_id"]
          },
        ]
      }
      mensagens_log: {
        Row: {
          autor: string | null
          canal_id: string | null
          conta_id: string | null
          created_at: string
          enviado_em: string | null
          id: string
          modelo_id: string | null
          observacao: string | null
          status_manual: Database["public"]["Enums"]["status_mensagem"]
          variante: string | null
        }
        Insert: {
          autor?: string | null
          canal_id?: string | null
          conta_id?: string | null
          created_at?: string
          enviado_em?: string | null
          id?: string
          modelo_id?: string | null
          observacao?: string | null
          status_manual?: Database["public"]["Enums"]["status_mensagem"]
          variante?: string | null
        }
        Update: {
          autor?: string | null
          canal_id?: string | null
          conta_id?: string | null
          created_at?: string
          enviado_em?: string | null
          id?: string
          modelo_id?: string | null
          observacao?: string | null
          status_manual?: Database["public"]["Enums"]["status_mensagem"]
          variante?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mensagens_log_canal_id_fkey"
            columns: ["canal_id"]
            isOneToOne: false
            referencedRelation: "canais"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mensagens_log_canal_id_fkey"
            columns: ["canal_id"]
            isOneToOne: false
            referencedRelation: "canal_economia"
            referencedColumns: ["canal_id"]
          },
          {
            foreignKeyName: "mensagens_log_canal_id_fkey"
            columns: ["canal_id"]
            isOneToOne: false
            referencedRelation: "canal_execucao"
            referencedColumns: ["canal_id"]
          },
          {
            foreignKeyName: "mensagens_log_canal_id_fkey"
            columns: ["canal_id"]
            isOneToOne: false
            referencedRelation: "canal_kpis"
            referencedColumns: ["canal_id"]
          },
          {
            foreignKeyName: "mensagens_log_conta_id_fkey"
            columns: ["conta_id"]
            isOneToOne: false
            referencedRelation: "contas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mensagens_log_modelo_id_fkey"
            columns: ["modelo_id"]
            isOneToOne: false
            referencedRelation: "modelos_mensagem"
            referencedColumns: ["id"]
          },
        ]
      }
      metas: {
        Row: {
          clientes_meta: number
          competencia: string
          created_at: string
          id: string
          mrr_meta: number
          observacao: string | null
          updated_at: string
        }
        Insert: {
          clientes_meta?: number
          competencia: string
          created_at?: string
          id?: string
          mrr_meta?: number
          observacao?: string | null
          updated_at?: string
        }
        Update: {
          clientes_meta?: number
          competencia?: string
          created_at?: string
          id?: string
          mrr_meta?: number
          observacao?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      modelos_mensagem: {
        Row: {
          ativo: boolean
          canal_id: string | null
          corpo: string
          created_at: string
          estagio: Database["public"]["Enums"]["estagio_oport"] | null
          id: string
          titulo: string
          updated_at: string
          variante: string | null
        }
        Insert: {
          ativo?: boolean
          canal_id?: string | null
          corpo: string
          created_at?: string
          estagio?: Database["public"]["Enums"]["estagio_oport"] | null
          id?: string
          titulo: string
          updated_at?: string
          variante?: string | null
        }
        Update: {
          ativo?: boolean
          canal_id?: string | null
          corpo?: string
          created_at?: string
          estagio?: Database["public"]["Enums"]["estagio_oport"] | null
          id?: string
          titulo?: string
          updated_at?: string
          variante?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "modelos_mensagem_canal_id_fkey"
            columns: ["canal_id"]
            isOneToOne: false
            referencedRelation: "canais"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "modelos_mensagem_canal_id_fkey"
            columns: ["canal_id"]
            isOneToOne: false
            referencedRelation: "canal_economia"
            referencedColumns: ["canal_id"]
          },
          {
            foreignKeyName: "modelos_mensagem_canal_id_fkey"
            columns: ["canal_id"]
            isOneToOne: false
            referencedRelation: "canal_execucao"
            referencedColumns: ["canal_id"]
          },
          {
            foreignKeyName: "modelos_mensagem_canal_id_fkey"
            columns: ["canal_id"]
            isOneToOne: false
            referencedRelation: "canal_kpis"
            referencedColumns: ["canal_id"]
          },
        ]
      }
      oportunidades: {
        Row: {
          canal_id: string
          conta_id: string
          created_at: string
          data_entrada_estagio: string
          estagio: Database["public"]["Enums"]["estagio_oport"]
          evento_id: string | null
          id: string
          motivo_perda: string | null
          parceiro_id: string | null
          previsao_fechamento: string | null
          probabilidade: number | null
          responsavel: string | null
          updated_at: string
          valor_mrr: number
        }
        Insert: {
          canal_id: string
          conta_id: string
          created_at?: string
          data_entrada_estagio?: string
          estagio?: Database["public"]["Enums"]["estagio_oport"]
          evento_id?: string | null
          id?: string
          motivo_perda?: string | null
          parceiro_id?: string | null
          previsao_fechamento?: string | null
          probabilidade?: number | null
          responsavel?: string | null
          updated_at?: string
          valor_mrr?: number
        }
        Update: {
          canal_id?: string
          conta_id?: string
          created_at?: string
          data_entrada_estagio?: string
          estagio?: Database["public"]["Enums"]["estagio_oport"]
          evento_id?: string | null
          id?: string
          motivo_perda?: string | null
          parceiro_id?: string | null
          previsao_fechamento?: string | null
          probabilidade?: number | null
          responsavel?: string | null
          updated_at?: string
          valor_mrr?: number
        }
        Relationships: [
          {
            foreignKeyName: "oportunidades_canal_id_fkey"
            columns: ["canal_id"]
            isOneToOne: false
            referencedRelation: "canais"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "oportunidades_canal_id_fkey"
            columns: ["canal_id"]
            isOneToOne: false
            referencedRelation: "canal_economia"
            referencedColumns: ["canal_id"]
          },
          {
            foreignKeyName: "oportunidades_canal_id_fkey"
            columns: ["canal_id"]
            isOneToOne: false
            referencedRelation: "canal_execucao"
            referencedColumns: ["canal_id"]
          },
          {
            foreignKeyName: "oportunidades_canal_id_fkey"
            columns: ["canal_id"]
            isOneToOne: false
            referencedRelation: "canal_kpis"
            referencedColumns: ["canal_id"]
          },
          {
            foreignKeyName: "oportunidades_conta_id_fkey"
            columns: ["conta_id"]
            isOneToOne: false
            referencedRelation: "contas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "oportunidades_evento_id_fkey"
            columns: ["evento_id"]
            isOneToOne: false
            referencedRelation: "evento_kpis"
            referencedColumns: ["evento_id"]
          },
          {
            foreignKeyName: "oportunidades_evento_id_fkey"
            columns: ["evento_id"]
            isOneToOne: false
            referencedRelation: "eventos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "oportunidades_parceiro_id_fkey"
            columns: ["parceiro_id"]
            isOneToOne: false
            referencedRelation: "parceiro_kpis"
            referencedColumns: ["parceiro_id"]
          },
          {
            foreignKeyName: "oportunidades_parceiro_id_fkey"
            columns: ["parceiro_id"]
            isOneToOne: false
            referencedRelation: "parceiros"
            referencedColumns: ["id"]
          },
        ]
      }
      parceiros: {
        Row: {
          ativo: boolean
          contato: string | null
          created_at: string
          descricao: string | null
          id: string
          nome: string
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          contato?: string | null
          created_at?: string
          descricao?: string | null
          id?: string
          nome: string
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          contato?: string | null
          created_at?: string
          descricao?: string | null
          id?: string
          nome?: string
          updated_at?: string
        }
        Relationships: []
      }
      participantes: {
        Row: {
          ativo: boolean
          created_at: string
          email: string | null
          id: string
          nome: string
          telefone: string | null
          tipo: Database["public"]["Enums"]["tipo_participante"]
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          email?: string | null
          id?: string
          nome: string
          telefone?: string | null
          tipo?: Database["public"]["Enums"]["tipo_participante"]
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          created_at?: string
          email?: string | null
          id?: string
          nome?: string
          telefone?: string | null
          tipo?: Database["public"]["Enums"]["tipo_participante"]
          updated_at?: string
        }
        Relationships: []
      }
      projetos: {
        Row: {
          created_at: string
          data_inicio: string | null
          id: string
          nome: string
          ordem: number
          prazo: string | null
          status: Database["public"]["Enums"]["status_projeto"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          data_inicio?: string | null
          id?: string
          nome: string
          ordem?: number
          prazo?: string | null
          status?: Database["public"]["Enums"]["status_projeto"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          data_inicio?: string | null
          id?: string
          nome?: string
          ordem?: number
          prazo?: string | null
          status?: Database["public"]["Enums"]["status_projeto"]
          updated_at?: string
        }
        Relationships: []
      }
      snapshots_semanais: {
        Row: {
          canal_id: string | null
          created_at: string
          ganhos: number
          id: string
          investido: number
          mrr: number
          oportunidades: number
          ref_date: string
          reunioes: number
        }
        Insert: {
          canal_id?: string | null
          created_at?: string
          ganhos?: number
          id?: string
          investido?: number
          mrr?: number
          oportunidades?: number
          ref_date: string
          reunioes?: number
        }
        Update: {
          canal_id?: string | null
          created_at?: string
          ganhos?: number
          id?: string
          investido?: number
          mrr?: number
          oportunidades?: number
          ref_date?: string
          reunioes?: number
        }
        Relationships: [
          {
            foreignKeyName: "snapshots_semanais_canal_id_fkey"
            columns: ["canal_id"]
            isOneToOne: false
            referencedRelation: "canais"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "snapshots_semanais_canal_id_fkey"
            columns: ["canal_id"]
            isOneToOne: false
            referencedRelation: "canal_economia"
            referencedColumns: ["canal_id"]
          },
          {
            foreignKeyName: "snapshots_semanais_canal_id_fkey"
            columns: ["canal_id"]
            isOneToOne: false
            referencedRelation: "canal_execucao"
            referencedColumns: ["canal_id"]
          },
          {
            foreignKeyName: "snapshots_semanais_canal_id_fkey"
            columns: ["canal_id"]
            isOneToOne: false
            referencedRelation: "canal_kpis"
            referencedColumns: ["canal_id"]
          },
        ]
      }
      tarefas: {
        Row: {
          canal_id: string | null
          codigo: string
          created_at: string
          data_inicio: string | null
          depende_de: string | null
          frente: string
          id: string
          ordem: number
          prazo: string | null
          responsavel: string | null
          status: Database["public"]["Enums"]["status_tarefa"]
          titulo: string
          updated_at: string
        }
        Insert: {
          canal_id?: string | null
          codigo: string
          created_at?: string
          data_inicio?: string | null
          depende_de?: string | null
          frente: string
          id?: string
          ordem?: number
          prazo?: string | null
          responsavel?: string | null
          status?: Database["public"]["Enums"]["status_tarefa"]
          titulo: string
          updated_at?: string
        }
        Update: {
          canal_id?: string | null
          codigo?: string
          created_at?: string
          data_inicio?: string | null
          depende_de?: string | null
          frente?: string
          id?: string
          ordem?: number
          prazo?: string | null
          responsavel?: string | null
          status?: Database["public"]["Enums"]["status_tarefa"]
          titulo?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tarefas_canal_id_fkey"
            columns: ["canal_id"]
            isOneToOne: false
            referencedRelation: "canais"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tarefas_canal_id_fkey"
            columns: ["canal_id"]
            isOneToOne: false
            referencedRelation: "canal_economia"
            referencedColumns: ["canal_id"]
          },
          {
            foreignKeyName: "tarefas_canal_id_fkey"
            columns: ["canal_id"]
            isOneToOne: false
            referencedRelation: "canal_execucao"
            referencedColumns: ["canal_id"]
          },
          {
            foreignKeyName: "tarefas_canal_id_fkey"
            columns: ["canal_id"]
            isOneToOne: false
            referencedRelation: "canal_kpis"
            referencedColumns: ["canal_id"]
          },
          {
            foreignKeyName: "tarefas_depende_de_fkey"
            columns: ["depende_de"]
            isOneToOne: false
            referencedRelation: "tarefas"
            referencedColumns: ["id"]
          },
        ]
      }
      voz_do_cliente: {
        Row: {
          autor_cliente: string | null
          autorizado: boolean
          conta_id: string | null
          conteudo: string
          created_at: string
          fixado_como_prova: boolean
          id: string
          imagem_url: string | null
          resultado_mensuravel: string | null
          tags: string[]
          tipo: Database["public"]["Enums"]["tipo_voz"]
          titulo: string | null
          updated_at: string
        }
        Insert: {
          autor_cliente?: string | null
          autorizado?: boolean
          conta_id?: string | null
          conteudo: string
          created_at?: string
          fixado_como_prova?: boolean
          id?: string
          imagem_url?: string | null
          resultado_mensuravel?: string | null
          tags?: string[]
          tipo?: Database["public"]["Enums"]["tipo_voz"]
          titulo?: string | null
          updated_at?: string
        }
        Update: {
          autor_cliente?: string | null
          autorizado?: boolean
          conta_id?: string | null
          conteudo?: string
          created_at?: string
          fixado_como_prova?: boolean
          id?: string
          imagem_url?: string | null
          resultado_mensuravel?: string | null
          tags?: string[]
          tipo?: Database["public"]["Enums"]["tipo_voz"]
          titulo?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "voz_do_cliente_conta_id_fkey"
            columns: ["conta_id"]
            isOneToOne: false
            referencedRelation: "contas"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_mensagens: {
        Row: {
          body: string
          created_at: string
          erro: string | null
          evento_id: string | null
          from_number: string
          id: string
          processado: boolean
        }
        Insert: {
          body: string
          created_at?: string
          erro?: string | null
          evento_id?: string | null
          from_number: string
          id?: string
          processado?: boolean
        }
        Update: {
          body?: string
          created_at?: string
          erro?: string | null
          evento_id?: string | null
          from_number?: string
          id?: string
          processado?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_mensagens_evento_id_fkey"
            columns: ["evento_id"]
            isOneToOne: false
            referencedRelation: "eventos_agenda"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      canal_economia: {
        Row: {
          cac: number | null
          canal_id: string | null
          clientes: number | null
          custo_total: number | null
          horas_total: number | null
          mrr_ganho: number | null
          nome: string | null
          payback_meses: number | null
          roi: number | null
          slug: string | null
          tipo: string | null
        }
        Relationships: []
      }
      canal_execucao: {
        Row: {
          canal_id: string | null
          contatados: number | null
          estado: string | null
          ganhos: number | null
          investimento_executado: number | null
          investimento_planejado: number | null
          nome: string | null
          ordem: number | null
          pct_execucao: number | null
          reunioes_ou_mais: number | null
          slug: string | null
          tarefas_feitas: number | null
          total_oport: number | null
          total_tarefas: number | null
          variancia: number | null
          variancia_pct: number | null
        }
        Relationships: []
      }
      canal_kpis: {
        Row: {
          cac: number | null
          canal_id: string | null
          contatados: number | null
          ganhos: number | null
          mrr_ganho: number | null
          multiplo_vs_baseline: number | null
          nome: string | null
          oportunidades: number | null
          perdidos: number | null
          reunioes: number | null
          roi: number | null
          slug: string | null
          taxa_conversao: number | null
        }
        Relationships: []
      }
      evento_kpis: {
        Row: {
          clientes: number | null
          custo: number | null
          data: string | null
          evento_id: string | null
          leads: number | null
          mrr: number | null
          nome: string | null
          participantes: number | null
          reunioes: number | null
        }
        Relationships: []
      }
      parceiro_kpis: {
        Row: {
          ativo: boolean | null
          clientes: number | null
          leads: number | null
          mrr: number | null
          nome: string | null
          parceiro_id: string | null
          reunioes: number | null
        }
        Relationships: []
      }
      pipeline_semana: {
        Row: {
          ganhos: number | null
          mrr_ganho: number | null
          oportunidades: number | null
          reunioes: number | null
          semana: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      estagio_oport:
        | "cadastrado"
        | "contatado"
        | "qualificado"
        | "reuniao"
        | "proposta"
        | "negociacao"
        | "fechado_ganho"
        | "fechado_perdido"
      origem_evento: "manual" | "whatsapp"
      papel_contato: "decisor" | "gatekeeper" | "influenciador" | "outro"
      status_convite: "pendente" | "aceito" | "recusado"
      status_evento: "agendado" | "cancelado" | "realizado"
      status_gate: "pendente" | "concluido"
      status_mensagem: "rascunho" | "enviado" | "respondido" | "sem_resposta"
      status_projeto: "a_fazer" | "fazendo" | "feito"
      status_tarefa: "a_fazer" | "fazendo" | "feito"
      temperatura: "sem_contato" | "frio" | "morno" | "quente"
      tipo_custo: "horas" | "ferramentas" | "midia" | "comissao" | "operacional"
      tipo_interacao:
        | "whatsapp"
        | "ligacao"
        | "visita"
        | "reuniao"
        | "email"
        | "outro"
      tipo_participante: "interno" | "cliente" | "parceiro" | "outro"
      tipo_voz: "depoimento" | "mensagem" | "narrativa" | "relatorio"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      estagio_oport: [
        "cadastrado",
        "contatado",
        "qualificado",
        "reuniao",
        "proposta",
        "negociacao",
        "fechado_ganho",
        "fechado_perdido",
      ],
      origem_evento: ["manual", "whatsapp"],
      papel_contato: ["decisor", "gatekeeper", "influenciador", "outro"],
      status_convite: ["pendente", "aceito", "recusado"],
      status_evento: ["agendado", "cancelado", "realizado"],
      status_gate: ["pendente", "concluido"],
      status_mensagem: ["rascunho", "enviado", "respondido", "sem_resposta"],
      status_projeto: ["a_fazer", "fazendo", "feito"],
      status_tarefa: ["a_fazer", "fazendo", "feito"],
      temperatura: ["sem_contato", "frio", "morno", "quente"],
      tipo_custo: ["horas", "ferramentas", "midia", "comissao", "operacional"],
      tipo_interacao: [
        "whatsapp",
        "ligacao",
        "visita",
        "reuniao",
        "email",
        "outro",
      ],
      tipo_participante: ["interno", "cliente", "parceiro", "outro"],
      tipo_voz: ["depoimento", "mensagem", "narrativa", "relatorio"],
    },
  },
} as const
