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
      actuaciones: {
        Row: {
          case_id: string
          created_at: string
          created_by: string
          cumplida: boolean
          descripcion: string
          fecha: string
          id: string
          termino_dias: number | null
          tipo: string
          updated_at: string
          vence_at: string | null
        }
        Insert: {
          case_id: string
          created_at?: string
          created_by: string
          cumplida?: boolean
          descripcion: string
          fecha?: string
          id?: string
          termino_dias?: number | null
          tipo: string
          updated_at?: string
          vence_at?: string | null
        }
        Update: {
          case_id?: string
          created_at?: string
          created_by?: string
          cumplida?: boolean
          descripcion?: string
          fecha?: string
          id?: string
          termino_dias?: number | null
          tipo?: string
          updated_at?: string
          vence_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "actuaciones_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
      areas_derecho: {
        Row: {
          created_at: string
          descripcion: string | null
          id: string
          nombre: string
        }
        Insert: {
          created_at?: string
          descripcion?: string | null
          id?: string
          nombre: string
        }
        Update: {
          created_at?: string
          descripcion?: string | null
          id?: string
          nombre?: string
        }
        Relationships: []
      }
      audiencias: {
        Row: {
          case_id: string
          created_at: string
          created_by: string
          enlace_virtual: string | null
          fecha_fin: string | null
          fecha_inicio: string
          id: string
          modalidad: string | null
          notas: string | null
          resultado: string | null
          tipo: string | null
          titulo: string
          ubicacion: string | null
          updated_at: string
        }
        Insert: {
          case_id: string
          created_at?: string
          created_by: string
          enlace_virtual?: string | null
          fecha_fin?: string | null
          fecha_inicio: string
          id?: string
          modalidad?: string | null
          notas?: string | null
          resultado?: string | null
          tipo?: string | null
          titulo: string
          ubicacion?: string | null
          updated_at?: string
        }
        Update: {
          case_id?: string
          created_at?: string
          created_by?: string
          enlace_virtual?: string | null
          fecha_fin?: string | null
          fecha_inicio?: string
          id?: string
          modalidad?: string | null
          notas?: string | null
          resultado?: string | null
          tipo?: string | null
          titulo?: string
          ubicacion?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "audiencias_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
      case_comments: {
        Row: {
          abogado_id: string | null
          author_id: string
          case_id: string | null
          created_at: string
          id: string
          texto: string
        }
        Insert: {
          abogado_id?: string | null
          author_id: string
          case_id?: string | null
          created_at?: string
          id?: string
          texto: string
        }
        Update: {
          abogado_id?: string | null
          author_id?: string
          case_id?: string | null
          created_at?: string
          id?: string
          texto?: string
        }
        Relationships: [
          {
            foreignKeyName: "case_comments_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
      cases: {
        Row: {
          abogado_id: string | null
          area_id: string | null
          cliente_id: string | null
          cliente_nombre: string
          created_at: string
          created_by: string | null
          etapa: Database["public"]["Enums"]["case_status"]
          fecha_vencimiento: string | null
          id: string
          juzgado_id: string | null
          observaciones: string | null
          radicado: string
          tipo: string
          tipo_proceso_id: string | null
          updated_at: string
          urgente: boolean
        }
        Insert: {
          abogado_id?: string | null
          area_id?: string | null
          cliente_id?: string | null
          cliente_nombre: string
          created_at?: string
          created_by?: string | null
          etapa?: Database["public"]["Enums"]["case_status"]
          fecha_vencimiento?: string | null
          id?: string
          juzgado_id?: string | null
          observaciones?: string | null
          radicado: string
          tipo: string
          tipo_proceso_id?: string | null
          updated_at?: string
          urgente?: boolean
        }
        Update: {
          abogado_id?: string | null
          area_id?: string | null
          cliente_id?: string | null
          cliente_nombre?: string
          created_at?: string
          created_by?: string | null
          etapa?: Database["public"]["Enums"]["case_status"]
          fecha_vencimiento?: string | null
          id?: string
          juzgado_id?: string | null
          observaciones?: string | null
          radicado?: string
          tipo?: string
          tipo_proceso_id?: string | null
          updated_at?: string
          urgente?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "cases_area_id_fkey"
            columns: ["area_id"]
            isOneToOne: false
            referencedRelation: "areas_derecho"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cases_juzgado_id_fkey"
            columns: ["juzgado_id"]
            isOneToOne: false
            referencedRelation: "juzgados"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cases_tipo_proceso_id_fkey"
            columns: ["tipo_proceso_id"]
            isOneToOne: false
            referencedRelation: "tipos_proceso"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          case_id: string | null
          created_at: string
          description: string | null
          file_name: string
          file_path: string
          file_size: number | null
          id: string
          mime_type: string | null
          recipient_id: string | null
          shared_with_client: boolean
          uploaded_by: string
        }
        Insert: {
          case_id?: string | null
          created_at?: string
          description?: string | null
          file_name: string
          file_path: string
          file_size?: number | null
          id?: string
          mime_type?: string | null
          recipient_id?: string | null
          shared_with_client?: boolean
          uploaded_by: string
        }
        Update: {
          case_id?: string | null
          created_at?: string
          description?: string | null
          file_name?: string
          file_path?: string
          file_size?: number | null
          id?: string
          mime_type?: string | null
          recipient_id?: string | null
          shared_with_client?: boolean
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "documents_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
      especialidades: {
        Row: {
          area_id: string | null
          created_at: string
          id: string
          nombre: string
        }
        Insert: {
          area_id?: string | null
          created_at?: string
          id?: string
          nombre: string
        }
        Update: {
          area_id?: string | null
          created_at?: string
          id?: string
          nombre?: string
        }
        Relationships: [
          {
            foreignKeyName: "especialidades_area_id_fkey"
            columns: ["area_id"]
            isOneToOne: false
            referencedRelation: "areas_derecho"
            referencedColumns: ["id"]
          },
        ]
      }
      honorarios: {
        Row: {
          case_id: string
          concepto: string
          created_at: string
          created_by: string
          estado: string
          fecha_emision: string
          fecha_pago: string | null
          fecha_vencimiento: string | null
          id: string
          metodo_pago: string | null
          moneda: string
          monto: number
          notas: string | null
          updated_at: string
        }
        Insert: {
          case_id: string
          concepto: string
          created_at?: string
          created_by: string
          estado?: string
          fecha_emision?: string
          fecha_pago?: string | null
          fecha_vencimiento?: string | null
          id?: string
          metodo_pago?: string | null
          moneda?: string
          monto: number
          notas?: string | null
          updated_at?: string
        }
        Update: {
          case_id?: string
          concepto?: string
          created_at?: string
          created_by?: string
          estado?: string
          fecha_emision?: string
          fecha_pago?: string | null
          fecha_vencimiento?: string | null
          id?: string
          metodo_pago?: string | null
          moneda?: string
          monto?: number
          notas?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "honorarios_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
      juzgados: {
        Row: {
          ciudad: string | null
          created_at: string
          id: string
          nombre: string
          tipo: string | null
        }
        Insert: {
          ciudad?: string | null
          created_at?: string
          id?: string
          nombre: string
          tipo?: string | null
        }
        Update: {
          ciudad?: string | null
          created_at?: string
          id?: string
          nombre?: string
          tipo?: string | null
        }
        Relationships: []
      }
      notificaciones: {
        Row: {
          case_id: string | null
          created_at: string
          id: string
          leida: boolean
          mensaje: string
          metadata: Json | null
          tipo: string
          titulo: string
          user_id: string
        }
        Insert: {
          case_id?: string | null
          created_at?: string
          id?: string
          leida?: boolean
          mensaje: string
          metadata?: Json | null
          tipo: string
          titulo: string
          user_id: string
        }
        Update: {
          case_id?: string | null
          created_at?: string
          id?: string
          leida?: boolean
          mensaje?: string
          metadata?: Json | null
          tipo?: string
          titulo?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notificaciones_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
      partes_procesales: {
        Row: {
          case_id: string
          created_at: string
          direccion: string | null
          email: string | null
          id: string
          identificacion: string | null
          nombre: string
          notas: string | null
          rol: string
          telefono: string | null
          tipo_identificacion: string | null
          updated_at: string
        }
        Insert: {
          case_id: string
          created_at?: string
          direccion?: string | null
          email?: string | null
          id?: string
          identificacion?: string | null
          nombre: string
          notas?: string | null
          rol: string
          telefono?: string | null
          tipo_identificacion?: string | null
          updated_at?: string
        }
        Update: {
          case_id?: string
          created_at?: string
          direccion?: string | null
          email?: string | null
          id?: string
          identificacion?: string | null
          nombre?: string
          notas?: string | null
          rol?: string
          telefono?: string | null
          tipo_identificacion?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "partes_procesales_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          area_id: string | null
          cedula: string | null
          created_at: string
          email: string
          especialidad_id: string | null
          full_name: string
          id: string
          last_sign_in_at: string | null
          phone: string | null
          sign_in_count: number
          updated_at: string
        }
        Insert: {
          area_id?: string | null
          cedula?: string | null
          created_at?: string
          email: string
          especialidad_id?: string | null
          full_name?: string
          id: string
          last_sign_in_at?: string | null
          phone?: string | null
          sign_in_count?: number
          updated_at?: string
        }
        Update: {
          area_id?: string | null
          cedula?: string | null
          created_at?: string
          email?: string
          especialidad_id?: string | null
          full_name?: string
          id?: string
          last_sign_in_at?: string | null
          phone?: string | null
          sign_in_count?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_area_id_fkey"
            columns: ["area_id"]
            isOneToOne: false
            referencedRelation: "areas_derecho"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_especialidad_id_fkey"
            columns: ["especialidad_id"]
            isOneToOne: false
            referencedRelation: "especialidades"
            referencedColumns: ["id"]
          },
        ]
      }
      tipos_proceso: {
        Row: {
          area_id: string | null
          created_at: string
          id: string
          nombre: string
        }
        Insert: {
          area_id?: string | null
          created_at?: string
          id?: string
          nombre: string
        }
        Update: {
          area_id?: string | null
          created_at?: string
          id?: string
          nombre?: string
        }
        Relationships: [
          {
            foreignKeyName: "tipos_proceso_area_id_fkey"
            columns: ["area_id"]
            isOneToOne: false
            referencedRelation: "areas_derecho"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_edit_case: { Args: { _case_id: string }; Returns: boolean }
      can_view_case: { Args: { _case_id: string }; Returns: boolean }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      record_sign_in: { Args: never; Returns: undefined }
    }
    Enums: {
      app_role: "jefe" | "abogado" | "cliente"
      case_status:
        | "Creación"
        | "Recaudo Probatorio"
        | "Proyección"
        | "Revisión"
        | "Proyección de Recursos"
        | "Recabar Pruebas"
        | "Audiencia"
        | "Cerrado"
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
      app_role: ["jefe", "abogado", "cliente"],
      case_status: [
        "Creación",
        "Recaudo Probatorio",
        "Proyección",
        "Revisión",
        "Proyección de Recursos",
        "Recabar Pruebas",
        "Audiencia",
        "Cerrado",
      ],
    },
  },
} as const
