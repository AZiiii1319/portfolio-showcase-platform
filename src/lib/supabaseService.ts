import { supabase } from './supabase'
import type { 
  Profile, 
  Portfolio, 
  PortfolioWithStats,
  PortfolioWithProfile,
  InsertProfile, 
  InsertPortfolio, 
  UpdateProfile,
  UpdatePortfolio,
  PortfolioFilters,
  Comment
} from '../types/database'
import type { User, AuthResponse } from '@supabase/supabase-js'

export class SupabaseService {
  // ============================================================================
  // Authentication Methods
  // ============================================================================

  async signUp(email: string, password: string, metadata?: { username?: string; full_name?: string }): Promise<AuthResponse> {
    return await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata
      }
    })
  }

  async signIn(email: string, password: string): Promise<AuthResponse> {
    return await supabase.auth.signInWithPassword({
      email,
      password
    })
  }

  async signOut(): Promise<void> {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  async getCurrentUser(): Promise<User | null> {
    const { data: { user } } = await supabase.auth.getUser()
    return user
  }

  // ============================================================================
  // Profile Methods
  // ============================================================================

  async getProfile(userId: string): Promise<Profile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null // No rows returned
      throw error
    }
    return data
  }

  async createProfile(userId: string, profileData: Omit<InsertProfile, 'id'>): Promise<Profile> {
    const { data, error } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        ...profileData
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  async updateProfile(userId: string, updates: UpdateProfile): Promise<Profile> {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async uploadAvatar(userId: string, file: File): Promise<string> {
    const fileExt = file.name.split('.').pop()
    const fileName = `${userId}/avatar.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, file, { upsert: true })

    if (uploadError) throw uploadError

    const { data } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName)

    return data.publicUrl
  }

  // ============================================================================
  // Portfolio Methods
  // ============================================================================

  async getPortfolios(filters?: PortfolioFilters): Promise<Portfolio[]> {
    let query = supabase
      .from('portfolios')
      .select(`
        *,
        profiles!portfolios_user_id_fkey (
          username,
          full_name,
          avatar_url
        )
      `)
      .order('created_at', { ascending: false })

    if (filters?.category) {
      query = query.eq('category', filters.category)
    }

    if (filters?.userId) {
      query = query.eq('user_id', filters.userId)
    }

    if (filters?.featured !== undefined) {
      query = query.eq('is_featured', filters.featured)
    }

    if (filters?.searchTerm) {
      query = query.or(`title.ilike.%${filters.searchTerm}%,description.ilike.%${filters.searchTerm}%`)
    }

    const { data, error } = await query

    if (error) throw error
    return data || []
  }

  async getPortfolio(id: string): Promise<PortfolioWithProfile | null> {
    const { data, error } = await supabase
      .from('portfolios')
      .select(`
        *,
        profiles!portfolios_user_id_fkey (
          username,
          full_name,
          avatar_url,
          bio,
          website
        )
      `)
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null
      throw error
    }
    return data
  }

  async getPortfolioWithStats(id: string): Promise<PortfolioWithStats | null> {
    const { data, error } = await supabase
      .rpc('get_portfolio_with_stats', { portfolio_uuid: id })

    if (error) throw error
    return data?.[0] || null
  }

  async createPortfolio(portfolio: InsertPortfolio): Promise<Portfolio> {
    const { data, error } = await supabase
      .from('portfolios')
      .insert(portfolio)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async updatePortfolio(id: string, updates: UpdatePortfolio): Promise<Portfolio> {
    const { data, error } = await supabase
      .from('portfolios')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async deletePortfolio(id: string): Promise<void> {
    const { error } = await supabase
      .from('portfolios')
      .delete()
      .eq('id', id)

    if (error) throw error
  }

  async uploadPortfolioImage(file: File, userId: string): Promise<string> {
    const fileExt = file.name.split('.').pop()
    const fileName = `${userId}/${Date.now()}.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from('portfolios')
      .upload(fileName, file)

    if (uploadError) throw uploadError

    const { data } = supabase.storage
      .from('portfolios')
      .getPublicUrl(fileName)

    return data.publicUrl
  }

  async incrementPortfolioViews(portfolioId: string): Promise<void> {
    const { error } = await supabase
      .rpc('increment_portfolio_views', { portfolio_uuid: portfolioId })

    if (error) throw error
  }

  // ============================================================================
  // Interaction Methods (Likes and Comments)
  // ============================================================================

  async toggleLike(portfolioId: string, userId: string): Promise<boolean> {
    // Check if like exists
    const { data: existingLike } = await supabase
      .from('interactions')
      .select('id')
      .eq('portfolio_id', portfolioId)
      .eq('user_id', userId)
      .eq('type', 'like')
      .single()

    if (existingLike) {
      // Remove like
      const { error } = await supabase
        .from('interactions')
        .delete()
        .eq('id', existingLike.id)

      if (error) throw error
      return false
    } else {
      // Add like
      const { error } = await supabase
        .from('interactions')
        .insert({
          portfolio_id: portfolioId,
          user_id: userId,
          type: 'like'
        })

      if (error) throw error
      return true
    }
  }

  async addComment(portfolioId: string, userId: string, content: string): Promise<Comment> {
    const { data, error } = await supabase
      .from('interactions')
      .insert({
        portfolio_id: portfolioId,
        user_id: userId,
        type: 'comment',
        content
      })
      .select(`
        *,
        profiles!interactions_user_id_fkey (
          username,
          full_name,
          avatar_url
        )
      `)
      .single()

    if (error) throw error
    return data as Comment
  }

  async getComments(portfolioId: string): Promise<Comment[]> {
    const { data, error } = await supabase
      .from('interactions')
      .select(`
        *,
        profiles!interactions_user_id_fkey (
          username,
          full_name,
          avatar_url
        )
      `)
      .eq('portfolio_id', portfolioId)
      .eq('type', 'comment')
      .order('created_at', { ascending: true })

    if (error) throw error
    return (data || []) as Comment[]
  }

  async deleteComment(commentId: string): Promise<void> {
    const { error } = await supabase
      .from('interactions')
      .delete()
      .eq('id', commentId)

    if (error) throw error
  }

  async getLikeCount(portfolioId: string): Promise<number> {
    const { count, error } = await supabase
      .from('interactions')
      .select('*', { count: 'exact', head: true })
      .eq('portfolio_id', portfolioId)
      .eq('type', 'like')

    if (error) throw error
    return count || 0
  }

  async getUserLikeStatus(portfolioId: string, userId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('interactions')
      .select('id')
      .eq('portfolio_id', portfolioId)
      .eq('user_id', userId)
      .eq('type', 'like')
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return !!data
  }

  // ============================================================================
  // Real-time Subscriptions
  // ============================================================================

  subscribeToPortfolioComments(portfolioId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`portfolio-${portfolioId}-comments`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'interactions',
          filter: `portfolio_id=eq.${portfolioId} and type=eq.comment`
        },
        callback
      )
      .subscribe()
  }

  subscribeToPortfolioLikes(portfolioId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`portfolio-${portfolioId}-likes`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'interactions',
          filter: `portfolio_id=eq.${portfolioId} and type=eq.like`
        },
        callback
      )
      .subscribe()
  }

  // ============================================================================
  // Utility Methods
  // ============================================================================

  async checkUsernameAvailability(username: string, excludeUserId?: string): Promise<boolean> {
    let query = supabase
      .from('profiles')
      .select('id')
      .eq('username', username)

    if (excludeUserId) {
      query = query.neq('id', excludeUserId)
    }

    const { data, error } = await query.single()

    if (error && error.code !== 'PGRST116') throw error
    return !data
  }

  async searchPortfolios(searchTerm: string, limit: number = 20): Promise<Portfolio[]> {
    const { data, error } = await supabase
      .from('portfolios')
      .select(`
        *,
        profiles!portfolios_user_id_fkey (
          username,
          full_name,
          avatar_url
        )
      `)
      .or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,tags.cs.{${searchTerm}}`)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw error
    return data || []
  }

  async getFeaturedPortfolios(limit: number = 10): Promise<Portfolio[]> {
    const { data, error } = await supabase
      .from('portfolios')
      .select(`
        *,
        profiles!portfolios_user_id_fkey (
          username,
          full_name,
          avatar_url
        )
      `)
      .eq('is_featured', true)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw error
    return data || []
  }

  async getPopularPortfolios(limit: number = 10): Promise<Portfolio[]> {
    const { data, error } = await supabase
      .from('portfolios')
      .select(`
        *,
        profiles!portfolios_user_id_fkey (
          username,
          full_name,
          avatar_url
        )
      `)
      .order('view_count', { ascending: false })
      .limit(limit)

    if (error) throw error
    return data || []
  }
}

// Export a singleton instance
export const supabaseService = new SupabaseService()