// Database types for Supabase integration
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string
          full_name: string | null
          avatar_url: string | null
          bio: string | null
          website: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username: string
          full_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          website?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string
          full_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          website?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      portfolios: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          category: string
          image_url: string
          tags: string[] | null
          is_featured: boolean
          view_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          category: string
          image_url: string
          tags?: string[] | null
          is_featured?: boolean
          view_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          category?: string
          image_url?: string
          tags?: string[] | null
          is_featured?: boolean
          view_count?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "portfolios_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      interactions: {
        Row: {
          id: string
          portfolio_id: string
          user_id: string
          type: 'like' | 'comment'
          content: string | null
          created_at: string
        }
        Insert: {
          id?: string
          portfolio_id: string
          user_id: string
          type: 'like' | 'comment'
          content?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          portfolio_id?: string
          user_id?: string
          type?: 'like' | 'comment'
          content?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "interactions_portfolio_id_fkey"
            columns: ["portfolio_id"]
            isOneToOne: false
            referencedRelation: "portfolios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "interactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      increment_portfolio_views: {
        Args: {
          portfolio_uuid: string
        }
        Returns: undefined
      }
      get_portfolio_with_stats: {
        Args: {
          portfolio_uuid: string
        }
        Returns: {
          id: string
          user_id: string
          title: string
          description: string | null
          category: string
          image_url: string
          tags: string[] | null
          is_featured: boolean
          view_count: number
          created_at: string
          updated_at: string
          like_count: number
          comment_count: number
          user_has_liked: boolean
        }[]
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

// Convenience types
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Portfolio = Database['public']['Tables']['portfolios']['Row'];
export type Interaction = Database['public']['Tables']['interactions']['Row'];

export type PortfolioWithStats = Database['public']['Functions']['get_portfolio_with_stats']['Returns'][0];

export type InsertProfile = Database['public']['Tables']['profiles']['Insert'];
export type InsertPortfolio = Database['public']['Tables']['portfolios']['Insert'];
export type InsertInteraction = Database['public']['Tables']['interactions']['Insert'];

export type UpdateProfile = Database['public']['Tables']['profiles']['Update'];
export type UpdatePortfolio = Database['public']['Tables']['portfolios']['Update'];
export type UpdateInteraction = Database['public']['Tables']['interactions']['Update'];

// Extended types for joined data
export type PortfolioWithProfile = Portfolio & {
  profiles?: Partial<Profile>;
};

// Additional types for the application
export interface PortfolioFilters {
  category?: string;
  searchTerm?: string;
  userId?: string;
  featured?: boolean;
}

export interface Comment extends Interaction {
  type: 'comment';
  content: string;
  profile?: Profile;
}

export interface Like extends Interaction {
  type: 'like';
  content: null;
}

export type InteractionType = 'like' | 'comment';

export interface PortfolioCategory {
  value: string;
  label: string;
}

export const PORTFOLIO_CATEGORIES: PortfolioCategory[] = [
  { value: 'digital-art', label: 'Digital Art' },
  { value: 'photography', label: 'Photography' },
  { value: 'ui-ux-design', label: 'UI/UX Design' },
  { value: 'illustration', label: 'Illustration' },
  { value: 'graphic-design', label: 'Graphic Design' },
  { value: 'web-design', label: 'Web Design' },
  { value: '3d-modeling', label: '3D Modeling' },
  { value: 'animation', label: 'Animation' },
  { value: 'other', label: 'Other' },
];