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
      admin_audit_log: {
        Row: {
          action: string
          admin_user_id: string
          created_at: string | null
          id: string
          ip_address: string | null
          new_values: Json | null
          old_values: Json | null
          record_id: string | null
          table_name: string
        }
        Insert: {
          action: string
          admin_user_id: string
          created_at?: string | null
          id?: string
          ip_address?: string | null
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name: string
        }
        Update: {
          action?: string
          admin_user_id?: string
          created_at?: string | null
          id?: string
          ip_address?: string | null
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name?: string
        }
        Relationships: []
      }
      analytics_events: {
        Row: {
          created_at: string
          event_name: string
          id: string
          ip_hash: string | null
          properties: Json | null
          session_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          event_name: string
          id?: string
          ip_hash?: string | null
          properties?: Json | null
          session_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          event_name?: string
          id?: string
          ip_hash?: string | null
          properties?: Json | null
          session_id?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      api_hits: {
        Row: {
          created_at: string
          endpoint: string
          id: number
          ip_hash: string
          metadata: Json | null
        }
        Insert: {
          created_at?: string
          endpoint: string
          id?: never
          ip_hash: string
          metadata?: Json | null
        }
        Update: {
          created_at?: string
          endpoint?: string
          id?: never
          ip_hash?: string
          metadata?: Json | null
        }
        Relationships: []
      }
      brainstorms: {
        Row: {
          comments_count: number | null
          content: string | null
          created_at: string | null
          id: string
          likes_count: number | null
          parent_id: string | null
          parent_type: string | null
          title: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          comments_count?: number | null
          content?: string | null
          created_at?: string | null
          id?: string
          likes_count?: number | null
          parent_id?: string | null
          parent_type?: string | null
          title?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          comments_count?: number | null
          content?: string | null
          created_at?: string | null
          id?: string
          likes_count?: number | null
          parent_id?: string | null
          parent_type?: string | null
          title?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      business_insights: {
        Row: {
          comments_count: number | null
          content: string | null
          created_at: string | null
          id: string
          likes_count: number | null
          org_id: string | null
          parent_id: string | null
          parent_type: string | null
          title: string | null
          updated_at: string | null
          user_id: string | null
          visibility: string | null
        }
        Insert: {
          comments_count?: number | null
          content?: string | null
          created_at?: string | null
          id?: string
          likes_count?: number | null
          org_id?: string | null
          parent_id?: string | null
          parent_type?: string | null
          title?: string | null
          updated_at?: string | null
          user_id?: string | null
          visibility?: string | null
        }
        Update: {
          comments_count?: number | null
          content?: string | null
          created_at?: string | null
          id?: string
          likes_count?: number | null
          org_id?: string | null
          parent_id?: string | null
          parent_type?: string | null
          title?: string | null
          updated_at?: string | null
          user_id?: string | null
          visibility?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "business_insights_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "orgs"
            referencedColumns: ["id"]
          },
        ]
      }
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
      contact_requests: {
        Row: {
          company: string | null
          created_at: string
          email: string
          id: string
          ip_hash: string
          message: string
          name: string
          phone: string | null
          status: string
          subject: string
          updated_at: string
        }
        Insert: {
          company?: string | null
          created_at?: string
          email: string
          id?: string
          ip_hash: string
          message: string
          name: string
          phone?: string | null
          status?: string
          subject: string
          updated_at?: string
        }
        Update: {
          company?: string | null
          created_at?: string
          email?: string
          id?: string
          ip_hash?: string
          message?: string
          name?: string
          phone?: string | null
          status?: string
          subject?: string
          updated_at?: string
        }
        Relationships: []
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
      email_subscriptions: {
        Row: {
          created_at: string
          email: string
          id: string
          subscribed_to_news: boolean | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          subscribed_to_news?: boolean | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          subscribed_to_news?: boolean | null
          updated_at?: string
        }
        Relationships: []
      }
      idea_brainstorms_archive: {
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
            referencedRelation: "open_ideas_legacy"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "idea_brainstorms_idea_id_fkey"
            columns: ["idea_id"]
            isOneToOne: false
            referencedRelation: "open_ideas_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "idea_brainstorms_idea_id_fkey"
            columns: ["idea_id"]
            isOneToOne: false
            referencedRelation: "open_ideas_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "idea_brainstorms_idea_id_fkey"
            columns: ["idea_id"]
            isOneToOne: false
            referencedRelation: "open_ideas_teaser"
            referencedColumns: ["id"]
          },
        ]
      }
      idea_interactions: {
        Row: {
          created_at: string
          id: string
          idea_id: string
          metadata: Json | null
          type: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          idea_id: string
          metadata?: Json | null
          type: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          idea_id?: string
          metadata?: Json | null
          type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "idea_interactions_idea_id_fkey"
            columns: ["idea_id"]
            isOneToOne: false
            referencedRelation: "open_ideas_legacy"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "idea_interactions_idea_id_fkey"
            columns: ["idea_id"]
            isOneToOne: false
            referencedRelation: "open_ideas_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "idea_interactions_idea_id_fkey"
            columns: ["idea_id"]
            isOneToOne: false
            referencedRelation: "open_ideas_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "idea_interactions_idea_id_fkey"
            columns: ["idea_id"]
            isOneToOne: false
            referencedRelation: "open_ideas_teaser"
            referencedColumns: ["id"]
          },
        ]
      }
      idea_links: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          source_id: string
          source_type: string | null
          target_id: string
          target_type: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          source_id: string
          source_type?: string | null
          target_id: string
          target_type?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          source_id?: string
          source_type?: string | null
          target_id?: string
          target_type?: string | null
        }
        Relationships: []
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
      open_ideas_intake: {
        Row: {
          created_at: string | null
          id: string
          ip_hash: string | null
          status: Database["public"]["Enums"]["open_idea_status"]
          text: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          ip_hash?: string | null
          status?: Database["public"]["Enums"]["open_idea_status"]
          text: string
        }
        Update: {
          created_at?: string | null
          id?: string
          ip_hash?: string | null
          status?: Database["public"]["Enums"]["open_idea_status"]
          text?: string
        }
        Relationships: []
      }
      open_ideas_legacy: {
        Row: {
          content: string
          created_at: string
          email: string | null
          id: string
          ip_hash: string | null
          is_curated: boolean
          linked_brainstorms_count: number
          notify_on_interaction: boolean | null
          represented_org_id: string | null
          status: string | null
          subscribe_newsletter: boolean | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          content: string
          created_at?: string
          email?: string | null
          id?: string
          ip_hash?: string | null
          is_curated?: boolean
          linked_brainstorms_count?: number
          notify_on_interaction?: boolean | null
          represented_org_id?: string | null
          status?: string | null
          subscribe_newsletter?: boolean | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string
          email?: string | null
          id?: string
          ip_hash?: string | null
          is_curated?: boolean
          linked_brainstorms_count?: number
          notify_on_interaction?: boolean | null
          represented_org_id?: string | null
          status?: string | null
          subscribe_newsletter?: boolean | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      open_ideas_user: {
        Row: {
          created_at: string | null
          id: string
          status: Database["public"]["Enums"]["open_idea_status"]
          text: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          status?: Database["public"]["Enums"]["open_idea_status"]
          text: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          status?: Database["public"]["Enums"]["open_idea_status"]
          text?: string
          user_id?: string | null
        }
        Relationships: []
      }
      org_members: {
        Row: {
          created_at: string
          id: string
          org_id: string
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          org_id: string
          role: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          org_id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "org_members_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "orgs"
            referencedColumns: ["id"]
          },
        ]
      }
      org_themes: {
        Row: {
          org_id: string
          tokens: Json
          updated_at: string
          version: number
        }
        Insert: {
          org_id: string
          tokens?: Json
          updated_at?: string
          version?: number
        }
        Update: {
          org_id?: string
          tokens?: Json
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "org_themes_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: true
            referencedRelation: "orgs"
            referencedColumns: ["id"]
          },
        ]
      }
      orgs: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          logo_url: string | null
          name: string
          slug: string
          theme_version: number
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          logo_url?: string | null
          name: string
          slug: string
          theme_version?: number
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          slug?: string
          theme_version?: number
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
            referencedRelation: "business_posts_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_relations_child_post_id_fkey"
            columns: ["child_post_id"]
            isOneToOne: false
            referencedRelation: "my_posts_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_relations_child_post_id_fkey"
            columns: ["child_post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_relations_child_post_id_fkey"
            columns: ["child_post_id"]
            isOneToOne: false
            referencedRelation: "public_posts_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_relations_parent_post_id_fkey"
            columns: ["parent_post_id"]
            isOneToOne: false
            referencedRelation: "business_posts_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_relations_parent_post_id_fkey"
            columns: ["parent_post_id"]
            isOneToOne: false
            referencedRelation: "my_posts_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_relations_parent_post_id_fkey"
            columns: ["parent_post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_relations_parent_post_id_fkey"
            columns: ["parent_post_id"]
            isOneToOne: false
            referencedRelation: "public_posts_view"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          body: string
          comments_count: number | null
          content: string
          created_at: string
          department_id: string | null
          id: string
          industry_id: string | null
          kind: Database["public"]["Enums"]["post_kind"]
          likes_count: number | null
          metadata: Json | null
          mode: string
          org_id: string | null
          published_at: string | null
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
          body: string
          comments_count?: number | null
          content: string
          created_at?: string
          department_id?: string | null
          id?: string
          industry_id?: string | null
          kind?: Database["public"]["Enums"]["post_kind"]
          likes_count?: number | null
          metadata?: Json | null
          mode: string
          org_id?: string | null
          published_at?: string | null
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
          body?: string
          comments_count?: number | null
          content?: string
          created_at?: string
          department_id?: string | null
          id?: string
          industry_id?: string | null
          kind?: Database["public"]["Enums"]["post_kind"]
          likes_count?: number | null
          metadata?: Json | null
          mode?: string
          org_id?: string | null
          published_at?: string | null
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
        Relationships: [
          {
            foreignKeyName: "posts_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "orgs"
            referencedColumns: ["id"]
          },
        ]
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
          theme_settings: Json | null
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
          theme_settings?: Json | null
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
          theme_settings?: Json | null
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      user_consent: {
        Row: {
          consent_type: string
          created_at: string
          granted: boolean
          id: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          consent_type: string
          created_at?: string
          granted?: boolean
          id?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          consent_type?: string
          created_at?: string
          granted?: boolean
          id?: string
          updated_at?: string
          user_id?: string | null
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
      brainstorm_stats: {
        Row: {
          brainstorm_id: string | null
          comments_count: number | null
          likes_count: number | null
        }
        Relationships: []
      }
      business_posts_view: {
        Row: {
          body: string | null
          comments_count: number | null
          content: string | null
          created_at: string | null
          department_id: string | null
          id: string | null
          industry_id: string | null
          kind: Database["public"]["Enums"]["post_kind"] | null
          likes_count: number | null
          metadata: Json | null
          mode: string | null
          org_id: string | null
          published_at: string | null
          status: string | null
          t_score: number | null
          title: string | null
          type: string | null
          u_score: number | null
          updated_at: string | null
          user_id: string | null
          views_count: number | null
          visibility: string | null
        }
        Insert: {
          body?: string | null
          comments_count?: number | null
          content?: string | null
          created_at?: string | null
          department_id?: string | null
          id?: string | null
          industry_id?: string | null
          kind?: Database["public"]["Enums"]["post_kind"] | null
          likes_count?: number | null
          metadata?: Json | null
          mode?: string | null
          org_id?: string | null
          published_at?: string | null
          status?: string | null
          t_score?: number | null
          title?: string | null
          type?: string | null
          u_score?: number | null
          updated_at?: string | null
          user_id?: string | null
          views_count?: number | null
          visibility?: string | null
        }
        Update: {
          body?: string | null
          comments_count?: number | null
          content?: string | null
          created_at?: string | null
          department_id?: string | null
          id?: string | null
          industry_id?: string | null
          kind?: Database["public"]["Enums"]["post_kind"] | null
          likes_count?: number | null
          metadata?: Json | null
          mode?: string | null
          org_id?: string | null
          published_at?: string | null
          status?: string | null
          t_score?: number | null
          title?: string | null
          type?: string | null
          u_score?: number | null
          updated_at?: string | null
          user_id?: string | null
          views_count?: number | null
          visibility?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "posts_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "orgs"
            referencedColumns: ["id"]
          },
        ]
      }
      business_profiles_public: {
        Row: {
          company_name: string | null
          created_at: string | null
          department_id: string | null
          id: string | null
          industry_id: string | null
          linkedin_url: string | null
          status: string | null
          website: string | null
        }
        Insert: {
          company_name?: string | null
          created_at?: string | null
          department_id?: string | null
          id?: string | null
          industry_id?: string | null
          linkedin_url?: string | null
          status?: string | null
          website?: string | null
        }
        Update: {
          company_name?: string | null
          created_at?: string | null
          department_id?: string | null
          id?: string | null
          industry_id?: string | null
          linkedin_url?: string | null
          status?: string | null
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
      idea_lineage_view: {
        Row: {
          created_at: string | null
          created_by: string | null
          creator_name: string | null
          id: string | null
          source_id: string | null
          source_type: string | null
          target_id: string | null
          target_type: string | null
        }
        Relationships: []
      }
      my_open_ideas_view: {
        Row: {
          content: string | null
          created_at: string | null
          id: string | null
          status: string | null
          user_id: string | null
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          id?: string | null
          status?: never
          user_id?: string | null
        }
        Update: {
          content?: string | null
          created_at?: string | null
          id?: string | null
          status?: never
          user_id?: string | null
        }
        Relationships: []
      }
      my_posts_view: {
        Row: {
          body: string | null
          comments_count: number | null
          content: string | null
          created_at: string | null
          department_id: string | null
          id: string | null
          industry_id: string | null
          kind: Database["public"]["Enums"]["post_kind"] | null
          likes_count: number | null
          metadata: Json | null
          mode: string | null
          org_id: string | null
          published_at: string | null
          status: string | null
          t_score: number | null
          title: string | null
          type: string | null
          u_score: number | null
          updated_at: string | null
          user_id: string | null
          views_count: number | null
          visibility: string | null
        }
        Insert: {
          body?: string | null
          comments_count?: number | null
          content?: string | null
          created_at?: string | null
          department_id?: string | null
          id?: string | null
          industry_id?: string | null
          kind?: Database["public"]["Enums"]["post_kind"] | null
          likes_count?: number | null
          metadata?: Json | null
          mode?: string | null
          org_id?: string | null
          published_at?: string | null
          status?: string | null
          t_score?: number | null
          title?: string | null
          type?: string | null
          u_score?: number | null
          updated_at?: string | null
          user_id?: string | null
          views_count?: number | null
          visibility?: string | null
        }
        Update: {
          body?: string | null
          comments_count?: number | null
          content?: string | null
          created_at?: string | null
          department_id?: string | null
          id?: string | null
          industry_id?: string | null
          kind?: Database["public"]["Enums"]["post_kind"] | null
          likes_count?: number | null
          metadata?: Json | null
          mode?: string | null
          org_id?: string | null
          published_at?: string | null
          status?: string | null
          t_score?: number | null
          title?: string | null
          type?: string | null
          u_score?: number | null
          updated_at?: string | null
          user_id?: string | null
          views_count?: number | null
          visibility?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "posts_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "orgs"
            referencedColumns: ["id"]
          },
        ]
      }
      open_ideas_members: {
        Row: {
          content: string | null
          created_at: string | null
          id: string | null
          is_curated: boolean | null
          linked_brainstorms_count: number | null
          status: string | null
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          id?: string | null
          is_curated?: boolean | null
          linked_brainstorms_count?: number | null
          status?: string | null
        }
        Update: {
          content?: string | null
          created_at?: string | null
          id?: string | null
          is_curated?: boolean | null
          linked_brainstorms_count?: number | null
          status?: string | null
        }
        Relationships: []
      }
      open_ideas_public: {
        Row: {
          content: string | null
          created_at: string | null
          id: string | null
          is_curated: boolean | null
          linked_brainstorms_count: number | null
          status: string | null
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          id?: string | null
          is_curated?: boolean | null
          linked_brainstorms_count?: number | null
          status?: string | null
        }
        Update: {
          content?: string | null
          created_at?: string | null
          id?: string | null
          is_curated?: boolean | null
          linked_brainstorms_count?: number | null
          status?: string | null
        }
        Relationships: []
      }
      open_ideas_public_view: {
        Row: {
          content: string | null
          created_at: string | null
          id: string | null
          source: string | null
        }
        Relationships: []
      }
      open_ideas_teaser: {
        Row: {
          created_at: string | null
          id: string | null
          is_curated: boolean | null
          preview: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string | null
          is_curated?: boolean | null
          preview?: never
        }
        Update: {
          created_at?: string | null
          id?: string | null
          is_curated?: boolean | null
          preview?: never
        }
        Relationships: []
      }
      profile_cards: {
        Row: {
          bio: string | null
          company: string | null
          display_name: string | null
          id: string | null
          linkedin_url: string | null
          location: string | null
          website: string | null
        }
        Insert: {
          bio?: string | null
          company?: string | null
          display_name?: string | null
          id?: string | null
          linkedin_url?: string | null
          location?: string | null
          website?: string | null
        }
        Update: {
          bio?: string | null
          company?: string | null
          display_name?: string | null
          id?: string | null
          linkedin_url?: string | null
          location?: string | null
          website?: string | null
        }
        Relationships: []
      }
      public_posts_view: {
        Row: {
          body: string | null
          comments_count: number | null
          content: string | null
          created_at: string | null
          department_id: string | null
          id: string | null
          industry_id: string | null
          kind: Database["public"]["Enums"]["post_kind"] | null
          likes_count: number | null
          metadata: Json | null
          mode: string | null
          org_id: string | null
          published_at: string | null
          status: string | null
          t_score: number | null
          title: string | null
          type: string | null
          u_score: number | null
          updated_at: string | null
          user_id: string | null
          views_count: number | null
          visibility: string | null
        }
        Insert: {
          body?: string | null
          comments_count?: number | null
          content?: string | null
          created_at?: string | null
          department_id?: string | null
          id?: string | null
          industry_id?: string | null
          kind?: Database["public"]["Enums"]["post_kind"] | null
          likes_count?: number | null
          metadata?: Json | null
          mode?: string | null
          org_id?: string | null
          published_at?: string | null
          status?: string | null
          t_score?: number | null
          title?: string | null
          type?: string | null
          u_score?: number | null
          updated_at?: string | null
          user_id?: string | null
          views_count?: number | null
          visibility?: string | null
        }
        Update: {
          body?: string | null
          comments_count?: number | null
          content?: string | null
          created_at?: string | null
          department_id?: string | null
          id?: string | null
          industry_id?: string | null
          kind?: Database["public"]["Enums"]["post_kind"] | null
          likes_count?: number | null
          metadata?: Json | null
          mode?: string | null
          org_id?: string | null
          published_at?: string | null
          status?: string | null
          t_score?: number | null
          title?: string | null
          type?: string | null
          u_score?: number | null
          updated_at?: string | null
          user_id?: string | null
          views_count?: number | null
          visibility?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "posts_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "orgs"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      accept_business_invitation: {
        Args: { invitation_id: string }
        Returns: boolean
      }
      api_brainstorm_recent: {
        Args: { p_limit?: number }
        Returns: {
          content: string
          created_at: string
          id: string
          title: string
          user_id: string
        }[]
      }
      api_list_brainstorm_edges_for_nodes: {
        Args: { p_node_ids: string[] }
        Returns: {
          child_post_id: string
          created_at: string
          id: string
          parent_post_id: string
          relation_type: string
        }[]
      }
      api_list_brainstorm_nodes: {
        Args: { p_cursor?: string; p_limit?: number }
        Returns: {
          content: string
          created_at: string
          display_name: string
          id: string
          metadata: Json
          title: string
          user_id: string
        }[]
      }
      api_space_chain_hard: {
        Args: {
          p_direction?: string
          p_limit?: number
          p_max_depth?: number
          p_start: string
        }
        Returns: {
          content: string
          created_at: string
          id: string
          title: string
          user_id: string
        }[]
      }
      api_track_event: {
        Args: {
          p_event: string
          p_kind: string
          p_props?: Json
          p_target: string
        }
        Returns: undefined
      }
      can_create_business_posts: {
        Args: { user_uuid: string }
        Returns: boolean
      }
      consume_invite: { Args: { p_token: string }; Returns: undefined }
      count_links_for_entity: {
        Args: { entity_id: string; entity_type: string }
        Returns: number
      }
      create_business_invite: {
        Args: { p_invitee_email: string; p_role?: string; p_ttl_days?: number }
        Returns: {
          expires_at: string
          token: string
        }[]
      }
      create_org_and_owner: {
        Args: { p_description?: string; p_name: string }
        Returns: string
      }
      create_post: {
        Args: {
          p_body: string
          p_kind: string
          p_org_id?: string
          p_title: string
        }
        Returns: string
      }
      current_user_email: { Args: never; Returns: string }
      get_client_ip: { Args: never; Returns: string }
      get_lineage_chain: {
        Args: { start_id: string; start_type: string }
        Returns: {
          depth: number
          id: string
          source_id: string
          source_type: string
          target_id: string
          target_type: string
        }[]
      }
      get_my_roles: {
        Args: never
        Returns: Database["public"]["Enums"]["app_role"][]
      }
      get_user_org_id: { Args: never; Returns: string }
      get_user_role: { Args: never; Returns: string }
      grant_role: {
        Args: { p_role: string; p_user: string }
        Returns: undefined
      }
      has_any_role: {
        Args: {
          _roles: Database["public"]["Enums"]["app_role"][]
          _user_id: string
        }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      hash_ip: { Args: { ip_address: string }; Returns: string }
      increment_post_comments: { Args: { post_id: string }; Returns: undefined }
      increment_post_likes: { Args: { post_id: string }; Returns: undefined }
      increment_post_views: { Args: { post_id: string }; Returns: undefined }
      is_admin: { Args: never; Returns: boolean }
      is_business_member: { Args: never; Returns: boolean }
      is_org_member: { Args: { p_org_id: string }; Returns: boolean }
      obfuscate_email: { Args: { email: string }; Returns: string }
    }
    Enums: {
      app_role: "admin" | "business_user" | "public_user" | "business_member"
      open_idea_status: "pending" | "approved" | "spam" | "flagged"
      post_kind: "Spark" | "BusinessInsight" | "Insight"
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
      open_idea_status: ["pending", "approved", "spam", "flagged"],
      post_kind: ["Spark", "BusinessInsight", "Insight"],
    },
  },
} as const
