export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          role: "admin" | "club" | "creator" | "player" | "fan";
          created_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          role?: "admin" | "club" | "creator" | "player" | "fan";
          created_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string | null;
          role?: "admin" | "club" | "creator" | "player" | "fan";
          created_at?: string;
        };
        Relationships: [];
      };
      site_settings: {
        Row: {
          id: string;
          club_name: string;
          short_name: string | null;
          primary_color: string | null;
          accent_color: string | null;
          stadium_name: string | null;
          contact_email: string | null;
          contact_phone: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          club_name: string;
          short_name?: string | null;
          primary_color?: string | null;
          accent_color?: string | null;
          stadium_name?: string | null;
          contact_email?: string | null;
          contact_phone?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          club_name?: string;
          short_name?: string | null;
          primary_color?: string | null;
          accent_color?: string | null;
          stadium_name?: string | null;
          contact_email?: string | null;
          contact_phone?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      fixtures: {
        Row: {
          id: string;
          opponent: string;
          fixture_date: string;
          fixture_time: string;
          venue: string;
          status: "upcoming" | "completed";
          mariners_score: number | null;
          opponent_score: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          opponent: string;
          fixture_date: string;
          fixture_time: string;
          venue: string;
          status?: "upcoming" | "completed";
          mariners_score?: number | null;
          opponent_score?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          opponent?: string;
          fixture_date?: string;
          fixture_time?: string;
          venue?: string;
          status?: "upcoming" | "completed";
          mariners_score?: number | null;
          opponent_score?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      goals: {
        Row: {
          id: string;
          fixture_id: string;
          player_name: string;
          minute: number;
          team: "Mariners" | "Opponent";
          created_at: string;
        };
        Insert: {
          id?: string;
          fixture_id: string;
          player_name: string;
          minute: number;
          team: "Mariners" | "Opponent";
          created_at?: string;
        };
        Update: {
          id?: string;
          fixture_id?: string;
          player_name?: string;
          minute?: number;
          team?: "Mariners" | "Opponent";
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "goals_fixture_id_fkey";
            columns: ["fixture_id"];
            isOneToOne: false;
            referencedRelation: "fixtures";
            referencedColumns: ["id"];
          },
        ];
      };
      players: {
        Row: {
          id: string;
          name: string;
          pos: string;
          second_pos: string | null;
          height: string | null;
          image_url: string | null;
          squad_number: number | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          pos: string;
          second_pos?: string | null;
          height?: string | null;
          image_url?: string | null;
          squad_number?: number | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          pos?: string;
          second_pos?: string | null;
          height?: string | null;
          image_url?: string | null;
          squad_number?: number | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      staff: {
        Row: {
          id: string;
          name: string;
          role: string;
          bio: string | null;
          image_url: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          role: string;
          bio?: string | null;
          image_url?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          role?: string;
          bio?: string | null;
          image_url?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      partnerships: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          logo_url: string | null;
          website_url: string | null;
          tier: "platinum" | "gold" | "silver" | "bronze" | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          logo_url?: string | null;
          website_url?: string | null;
          tier?: "platinum" | "gold" | "silver" | "bronze" | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          logo_url?: string | null;
          website_url?: string | null;
          tier?: "platinum" | "gold" | "silver" | "bronze" | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      fixture_media: {
        Row: {
          id: string;
          fixture_id: string;
          video_url: string;
          title: string | null;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          fixture_id: string;
          video_url: string;
          title?: string | null;
          created_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          fixture_id?: string;
          video_url?: string;
          title?: string | null;
          created_by?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "fixture_media_fixture_id_fkey";
            columns: ["fixture_id"];
            isOneToOne: false;
            referencedRelation: "fixtures";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "fixture_media_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "auth.users";
            referencedColumns: ["id"];
          },
        ];
      };
      fan_purchases: {
        Row: {
          id: string;
          user_id: string;
          stripe_session_id: string;
          purchase_type: "ticket" | "merch";
          description: string | null;
          amount_cents: number;
          currency: string;
          status: "pending" | "completed" | "refunded";
          metadata: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          stripe_session_id: string;
          purchase_type: "ticket" | "merch";
          description?: string | null;
          amount_cents: number;
          currency?: string;
          status?: "pending" | "completed" | "refunded";
          metadata?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          stripe_session_id?: string;
          purchase_type?: "ticket" | "merch";
          description?: string | null;
          amount_cents?: number;
          currency?: string;
          status?: "pending" | "completed" | "refunded";
          metadata?: Json | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "fan_purchases_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "auth.users";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      has_editor_access: {
        Args: Record<string, never>;
        Returns: boolean;
      };
      has_role: {
        Args: { check_role: string };
        Returns: boolean;
      };
      is_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
      handle_new_user: {
        Args: Record<string, never>;
        Returns: void;
      };
      submit_match_result: {
        Args: {
          p_fixture_id: string;
          p_mariners_score: number;
          p_opponent_score: number;
          p_goals: Json;
        };
        Returns: undefined;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};
