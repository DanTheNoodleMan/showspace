export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      daily_game_guesses: {
        Row: {
          actual_rating: number
          created_at: string | null
          difference: number
          guess: number
          id: string
          movie_id: number
          result: string
          user_id: string
        }
        Insert: {
          actual_rating: number
          created_at?: string | null
          difference: number
          guess: number
          id?: string
          movie_id: number
          result: string
          user_id: string
        }
        Update: {
          actual_rating?: number
          created_at?: string | null
          difference?: number
          guess?: number
          id?: string
          movie_id?: number
          result?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "daily_game_guesses_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_movie_history: {
        Row: {
          created_at: string | null
          id: string
          movie_id: number
          movie_title: string
          poster_path: string | null
          rating: number
          release_date: string
          shown_date: string
          trailer_key: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          movie_id: number
          movie_title: string
          poster_path?: string | null
          rating: number
          release_date: string
          shown_date: string
          trailer_key: string
        }
        Update: {
          created_at?: string | null
          id?: string
          movie_id?: number
          movie_title?: string
          poster_path?: string | null
          rating?: number
          release_date?: string
          shown_date?: string
          trailer_key?: string
        }
        Relationships: []
      }
      followers: {
        Row: {
          created_at: string
          follower_id: string
          following_id: string
        }
        Insert: {
          created_at?: string
          follower_id: string
          following_id: string
        }
        Update: {
          created_at?: string
          follower_id?: string
          following_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "followers_follower_id_fkey"
            columns: ["follower_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "followers_following_id_fkey"
            columns: ["following_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      list_items: {
        Row: {
          added_at: string
          content_type: string
          list_id: string
          order: number | null
          parent_tmdb_id: number | null
          tmdb_id: number
        }
        Insert: {
          added_at?: string
          content_type: string
          list_id: string
          order?: number | null
          parent_tmdb_id?: number | null
          tmdb_id: number
        }
        Update: {
          added_at?: string
          content_type?: string
          list_id?: string
          order?: number | null
          parent_tmdb_id?: number | null
          tmdb_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "list_items_list_id_fkey"
            columns: ["list_id"]
            isOneToOne: false
            referencedRelation: "lists"
            referencedColumns: ["id"]
          },
        ]
      }
      lists: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_private: boolean | null
          list_type: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_private?: boolean | null
          list_type: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_private?: boolean | null
          list_type?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lists_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          current_streak: number
          display_name: string | null
          id: string
          updated_at: string
          username: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          current_streak?: number
          display_name?: string | null
          id: string
          updated_at?: string
          username: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          current_streak?: number
          display_name?: string | null
          id?: string
          updated_at?: string
          username?: string
        }
        Relationships: []
      }
      review_likes: {
        Row: {
          created_at: string
          review_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          review_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          review_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "review_likes_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "reviews"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "review_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          contains_spoilers: boolean | null
          content: string
          content_type: string
          created_at: string
          episode_number: number | null
          id: string
          likes_count: number
          parent_tmdb_id: number | null
          rating: number | null
          season_number: number | null
          show_name: string | null
          tmdb_id: number
          updated_at: string
          user_id: string
        }
        Insert: {
          contains_spoilers?: boolean | null
          content: string
          content_type: string
          created_at?: string
          episode_number?: number | null
          id?: string
          likes_count?: number
          parent_tmdb_id?: number | null
          rating?: number | null
          season_number?: number | null
          show_name?: string | null
          tmdb_id: number
          updated_at?: string
          user_id: string
        }
        Update: {
          contains_spoilers?: boolean | null
          content?: string
          content_type?: string
          created_at?: string
          episode_number?: number | null
          id?: string
          likes_count?: number
          parent_tmdb_id?: number | null
          rating?: number | null
          season_number?: number | null
          show_name?: string | null
          tmdb_id?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_stats: {
        Row: {
          completed_count: number | null
          dropped_count: number | null
          plan_to_watch_count: number | null
          updated_at: string | null
          user_id: string
          watching_count: number | null
        }
        Insert: {
          completed_count?: number | null
          dropped_count?: number | null
          plan_to_watch_count?: number | null
          updated_at?: string | null
          user_id: string
          watching_count?: number | null
        }
        Update: {
          completed_count?: number | null
          dropped_count?: number | null
          plan_to_watch_count?: number | null
          updated_at?: string | null
          user_id?: string
          watching_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "user_stats_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      watch_history: {
        Row: {
          episode_number: number | null
          id: string
          poster_path: string | null
          season_number: number | null
          season_tmdb_id: number
          show_name: string | null
          show_tmdb_id: number
          tmdb_id: number
          user_id: string
          watched_at: string
        }
        Insert: {
          episode_number?: number | null
          id?: string
          poster_path?: string | null
          season_number?: number | null
          season_tmdb_id: number
          show_name?: string | null
          show_tmdb_id: number
          tmdb_id: number
          user_id: string
          watched_at?: string
        }
        Update: {
          episode_number?: number | null
          id?: string
          poster_path?: string | null
          season_number?: number | null
          season_tmdb_id?: number
          show_name?: string | null
          show_tmdb_id?: number
          tmdb_id?: number
          user_id?: string
          watched_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "watch_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      watch_status: {
        Row: {
          content_type: string
          created_at: string
          id: string
          parent_tmdb_id: number | null
          status: string
          tmdb_id: number
          updated_at: string
          user_id: string
        }
        Insert: {
          content_type: string
          created_at?: string
          id?: string
          parent_tmdb_id?: number | null
          status: string
          tmdb_id: number
          updated_at?: string
          user_id: string
        }
        Update: {
          content_type?: string
          created_at?: string
          id?: string
          parent_tmdb_id?: number | null
          status?: string
          tmdb_id?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "watch_status_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_list_item: {
        Args: {
          p_list_id: string
          p_user_id: string
          p_tmdb_id: number
          p_content_type: string
        }
        Returns: Record<string, unknown>
      }
      remove_list_item: {
        Args: {
          p_list_id: string
          p_user_id: string
          p_tmdb_id: number
        }
        Returns: undefined
      }
      reset_missing_daily_players: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      update_list_items_order: {
        Args: {
          p_list_id: string
          p_user_id: string
          p_updates: Json
        }
        Returns: undefined
      }
      update_watch_history_show_names: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
