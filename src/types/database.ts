export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string
          username: string
          role: 'user' | 'admin'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username: string
          role?: 'user' | 'admin'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string
          role?: 'user' | 'admin'
          created_at?: string
          updated_at?: string
        }
      }
      seasons: {
        Row: {
          id: string
          title: string
          code: string
          start_date: string | null
          end_date: string | null
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          code: string
          start_date?: string | null
          end_date?: string | null
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          code?: string
          start_date?: string | null
          end_date?: string | null
          is_active?: boolean
          created_at?: string
        }
      }
      participants: {
        Row: {
          id: string
          name: string
          gender: 'M' | 'F'
          image_url: string | null
          season_id: string
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          gender: 'M' | 'F'
          image_url?: string | null
          season_id: string
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          gender?: 'M' | 'F'
          image_url?: string | null
          season_id?: string
          is_active?: boolean
          created_at?: string
        }
      }
      episodes: {
        Row: {
          id: string
          season_id: string
          number: number
          title: string | null
          open_at: string | null
          close_at: string | null
          status: 'scheduled' | 'open' | 'closed'
          created_at: string
        }
        Insert: {
          id?: string
          season_id: string
          number: number
          title?: string | null
          open_at?: string | null
          close_at?: string | null
          status?: 'scheduled' | 'open' | 'closed'
          created_at?: string
        }
        Update: {
          id?: string
          season_id?: string
          number?: number
          title?: string | null
          open_at?: string | null
          close_at?: string | null
          status?: 'scheduled' | 'open' | 'closed'
          created_at?: string
        }
      }
      couple_pairs: {
        Row: {
          id: string
          episode_id: string
          male_id: string
          female_id: string
          is_official_result: boolean
          decided_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          episode_id: string
          male_id: string
          female_id: string
          is_official_result?: boolean
          decided_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          episode_id?: string
          male_id?: string
          female_id?: string
          is_official_result?: boolean
          decided_at?: string | null
          created_at?: string
        }
      }
      user_predictions: {
        Row: {
          id: string
          user_id: string
          episode_id: string
          pairs: any // JSONB
          submitted_at: string
          version: number
        }
        Insert: {
          id?: string
          user_id: string
          episode_id: string
          pairs: any // JSONB
          submitted_at?: string
          version?: number
        }
        Update: {
          id?: string
          user_id?: string
          episode_id?: string
          pairs?: any // JSONB
          submitted_at?: string
          version?: number
        }
      }
      user_scores: {
        Row: {
          id: string
          user_id: string
          episode_id: string
          score: number
          rank_cache: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          episode_id: string
          score?: number
          rank_cache?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          episode_id?: string
          score?: number
          rank_cache?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      agg_episodes: {
        Row: {
          id: string
          episode_id: string
          total_predictions: number
          pair_pick_counts: any | null // JSONB
          accuracy_rate: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          episode_id: string
          total_predictions?: number
          pair_pick_counts?: any | null // JSONB
          accuracy_rate?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          episode_id?: string
          total_predictions?: number
          pair_pick_counts?: any | null // JSONB
          accuracy_rate?: number
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}

// 편의를 위한 타입 정의
export type UserProfile = Database['public']['Tables']['user_profiles']['Row']
export type Season = Database['public']['Tables']['seasons']['Row']
export type Participant = Database['public']['Tables']['participants']['Row']
export type Episode = Database['public']['Tables']['episodes']['Row']
export type CouplePair = Database['public']['Tables']['couple_pairs']['Row']
export type UserPrediction = Database['public']['Tables']['user_predictions']['Row']
export type UserScore = Database['public']['Tables']['user_scores']['Row']
export type AggEpisode = Database['public']['Tables']['agg_episodes']['Row']

// 예측 쌍 타입
export interface PredictionPair {
  maleId: string
  femaleId: string
}

// 확장된 타입들
export interface EpisodeWithParticipants extends Episode {
  participants: Participant[]
  couple_pairs: CouplePair[]
}

export interface EpisodeWithStats extends Episode {
  total_predictions: number
  accuracy_rate: number
  pair_pick_counts: Record<string, number>
}
