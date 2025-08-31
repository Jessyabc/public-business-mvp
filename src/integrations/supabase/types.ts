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
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      business_invitations: {
        Row: {
          consumed_at: string | null
          created_at: string
          expires_at: string
          id: string
          invitee_email: string
          inviter_id: string
          role: string
          token: string
        }
        Insert: {
          consumed_at?: string | null
          created_at?: string
          expires_at?: string
          id?: string
          invitee_email: string
          inviter_id: string
          role?: string
          token: string
        }
        Update: {
          consumed_at?: string | null
          created_at?: string
          expires_at?: string
          id?: string
          invitee_email?: string
          inviter_id?: string
          role?: string
          token?: string
        }
        Relationships: []
      }
      business_profiles: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          bio: string | null
          company_name: string
          company_size: string | null
          created_at: string
          department_id: string | null
          id: string
          industry_id: string | null
          invited_at: string | null
          invited_by: string | null
          linkedin_url: string | null
          phone: string | null
          status: string
          updated_at: string
          user_id: string
          website: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          bio?: string | null
          company_name: string
          company_size?: string | null
          created_at?: string
          department_id?: string | null
          id?: string
          industry_id?: string | null
          invited_at?: string | null
          invited_by?: string | null
          linkedin_url?: string | null
          phone?: string | null
          status?: string
          updated_at?: string
          user_id: string
          website?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          bio?: string | null
          company_name?: string
          company_size?: string | null
          created_at?: string
          department_id?: string | null
          id?: string
          industry_id?: string | null
          invited_at?: string | null
          invited_by?: string | null
          linkedin_url?: string | null
          phone?: string | null
          status?: string
          updated_at?: string
          user_id?: string
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "business_profiles_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "business_profiles_industry_id_fkey"
            columns: ["industry_id"]
            isOneToOne: false
            referencedRelation: "industries"
            referencedColumns: ["id"]
          },
        ]
      }
      departments: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      idea_brainstorms: {
        Row: {
          author_display_name: string
          author_user_id: string | null
          content: string
          created_at: string
          id: string
          idea_id: string | null
          is_public: boolean
          title: string
        }
        Insert: {
          author_display_name?: string
          author_user_id?: string | null
          content: string
          created_at?: string
          id?: string
          idea_id?: string | null
          is_public?: boolean
          title: string
        }
        Update: {
          author_display_name?: string
          author_user_id?: string | null
          content?: string
          created_at?: string
          id?: string
          idea_id?: string | null
          is_public?: boolean
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "idea_brainstorms_idea_id_fkey"
            columns: ["idea_id"]
            isOneToOne: false
            referencedRelation: "open_ideas"
            referencedColumns: ["id"]
          },
        ]
      }
      industries: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      leads: {
        Row: {
          created_at: string
          email: string
          id: string
          source: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          source?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          source?: string
        }
        Relationships: []
      }
      open_ideas: {
        Row: {
          content: string
          created_at: string
          email: string | null
          id: string
          is_curated: boolean
          linked_brainstorms_count: number
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          email?: string | null
          id?: string
          is_curated?: boolean
          linked_brainstorms_count?: number
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          email?: string | null
          id?: string
          is_curated?: boolean
          linked_brainstorms_count?: number
          updated_at?: string
        }
        Relationships: []
      }
      post_relations: {
        Row: {
          child_post_id: string
          created_at: string
          id: string
          parent_post_id: string
          relation_type: string
        }
        Insert: {
          child_post_id: string
          created_at?: string
          id?: string
          parent_post_id: string
          relation_type: string
        }
        Update: {
          child_post_id?: string
          created_at?: string
          id?: string
          parent_post_id?: string
          relation_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_relations_child_post_id_fkey"
            columns: ["child_post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_relations_parent_post_id_fkey"
            columns: ["parent_post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          comments_count: number | null
          content: string
          created_at: string
          department_id: string | null
          id: string
          industry_id: string | null
          likes_count: number | null
          metadata: Json | null
          mode: string
          status: string
          t_score: number | null
          title: string | null
          type: string
          u_score: number | null
          updated_at: string
          user_id: string
          views_count: number | null
          visibility: string
        }
        Insert: {
          comments_count?: number | null
          content: string
          created_at?: string
          department_id?: string | null
          id?: string
          industry_id?: string | null
          likes_count?: number | null
          metadata?: Json | null
          mode: string
          status?: string
          t_score?: number | null
          title?: string | null
          type: string
          u_score?: number | null
          updated_at?: string
          user_id: string
          views_count?: number | null
          visibility?: string
        }
        Update: {
          comments_count?: number | null
          content?: string
          created_at?: string
          department_id?: string | null
          id?: string
          industry_id?: string | null
          likes_count?: number | null
          metadata?: Json | null
          mode?: string
          status?: string
          t_score?: number | null
          title?: string | null
          type?: string
          u_score?: number | null
          updated_at?: string
          user_id?: string
          views_count?: number | null
          visibility?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          company: string | null
          created_at: string
          display_name: string | null
          id: string
          is_completed: boolean | null
          linkedin_url: string | null
          location: string | null
          role: Database["public"]["Enums"]["app_role"] | null
          updated_at: string
          website: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          company?: string | null
          created_at?: string
          display_name?: string | null
          id: string
          is_completed?: boolean | null
          linkedin_url?: string | null
          location?: string | null
          role?: Database["public"]["Enums"]["app_role"] | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          company?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          is_completed?: boolean | null
          linkedin_url?: string | null
          location?: string | null
          role?: Database["public"]["Enums"]["app_role"] | null
          updated_at?: string
          website?: string | null
        }
        Relationships: []
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
          role?: Database["public"]["Enums"]["app_role"]
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
      accept_business_invitation: {
        Args: { invitation_id: string }
        Returns: boolean
      }
      can_create_business_posts: {
        Args: { user_uuid: string }
        Returns: boolean
      }
      consume_invite: {
        Args: { p_token: string }
        Returns: undefined
      }
      create_business_invite: {
        Args: { p_invitee_email: string; p_role?: string; p_ttl_days?: number }
        Returns: {
          expires_at: string
          token: string
        }[]
      }
      current_user_email: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_my_roles: {
        Args: Record<PropertyKey, never>
        Returns: Database["public"]["Enums"]["app_role"][]
      }
      get_user_role: {
        Args: { user_uuid: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      get_user_roles: {
        Args: { user_uuid: string }
        Returns: Database["public"]["Enums"]["app_role"][]
      }
      grant_role: {
        Args: { p_role: string; p_user: string }
        Returns: undefined
      }
      is_admin: {
        Args: { uid: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "business_user" | "public_user" | "business_member"
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
      app_role: ["admin", "business_user", "public_user", "business_member"],
    },
  },
} as const
