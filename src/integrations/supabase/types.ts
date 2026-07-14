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
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      origem_evento: "manual" | "whatsapp"
      status_convite: "pendente" | "aceito" | "recusado"
      status_evento: "agendado" | "cancelado" | "realizado"
      tipo_participante: "interno" | "cliente" | "parceiro" | "outro"
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
      origem_evento: ["manual", "whatsapp"],
      status_convite: ["pendente", "aceito", "recusado"],
      status_evento: ["agendado", "cancelado", "realizado"],
      tipo_participante: ["interno", "cliente", "parceiro", "outro"],
    },
  },
} as const
