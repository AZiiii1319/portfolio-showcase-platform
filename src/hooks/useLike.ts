import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabaseService } from '../lib/supabaseService'

interface LikeState {
  isLiked: boolean
  likeCount: number
  isLoading: boolean
}

interface UseLikeOptions {
  portfolioId: string
  initialLikeCount?: number
  initialIsLiked?: boolean
  enableCache?: boolean
}

const LIKE_CACHE_PREFIX = 'portfolio_like_'
const CACHE_EXPIRY_MS = 5 * 60 * 1000 // 5 minutes

interface CachedLikeData {
  isLiked: boolean
  likeCount: number
  timestamp: number
}

export function useLike({
  portfolioId,
  initialLikeCount = 0,
  initialIsLiked = false,
  enableCache = true
}: UseLikeOptions) {
  const { user } = useAuth()
  
  const [state, setState] = useState<LikeState>({
    isLiked: initialIsLiked,
    likeCount: initialLikeCount,
    isLoading: false
  })

  const cacheKey = `${LIKE_CACHE_PREFIX}${portfolioId}`

  // Load cached data
  const loadFromCache = useCallback((): CachedLikeData | null => {
    if (!enableCache || !user) return null
    
    try {
      const cached = localStorage.getItem(cacheKey)
      if (!cached) return null
      
      const data: CachedLikeData = JSON.parse(cached)
      const isExpired = Date.now() - data.timestamp > CACHE_EXPIRY_MS
      
      if (isExpired) {
        localStorage.removeItem(cacheKey)
        return null
      }
      
      return data
    } catch (error) {
      console.error('Error loading like cache:', error)
      localStorage.removeItem(cacheKey)
      return null
    }
  }, [cacheKey, enableCache, user])

  // Save to cache
  const saveToCache = useCallback((isLiked: boolean, likeCount: number) => {
    if (!enableCache || !user) return
    
    try {
      const data: CachedLikeData = {
        isLiked,
        likeCount,
        timestamp: Date.now()
      }
      localStorage.setItem(cacheKey, JSON.stringify(data))
    } catch (error) {
      console.error('Error saving like cache:', error)
    }
  }, [cacheKey, enableCache, user])

  // Load like data from server or cache
  const loadLikeData = useCallback(async () => {
    if (!user) {
      setState(prev => ({ ...prev, isLiked: false }))
      return
    }

    // Try to load from cache first
    const cached = loadFromCache()
    if (cached) {
      setState(prev => ({
        ...prev,
        isLiked: cached.isLiked,
        likeCount: cached.likeCount
      }))
      return
    }

    // Load from server
    try {
      const [likeStatus, count] = await Promise.all([
        supabaseService.getUserLikeStatus(portfolioId, user.id),
        supabaseService.getLikeCount(portfolioId)
      ])
      
      setState(prev => ({
        ...prev,
        isLiked: likeStatus,
        likeCount: count
      }))
      
      // Cache the result
      saveToCache(likeStatus, count)
      
    } catch (error) {
      console.error('Error loading like data:', error)
    }
  }, [user, portfolioId, loadFromCache, saveToCache])

  // Toggle like
  const toggleLike = useCallback(async (): Promise<{ success: boolean; isLiked: boolean; likeCount: number }> => {
    if (!user) {
      return { success: false, isLiked: false, likeCount: state.likeCount }
    }

    if (state.isLoading) {
      return { success: false, isLiked: state.isLiked, likeCount: state.likeCount }
    }

    setState(prev => ({ ...prev, isLoading: true }))

    try {
      const newIsLiked = await supabaseService.toggleLike(portfolioId, user.id)
      const newCount = newIsLiked ? state.likeCount + 1 : state.likeCount - 1
      
      setState(prev => ({
        ...prev,
        isLiked: newIsLiked,
        likeCount: newCount,
        isLoading: false
      }))
      
      // Update cache
      saveToCache(newIsLiked, newCount)
      
      return { success: true, isLiked: newIsLiked, likeCount: newCount }
      
    } catch (error) {
      console.error('Error toggling like:', error)
      setState(prev => ({ ...prev, isLoading: false }))
      return { success: false, isLiked: state.isLiked, likeCount: state.likeCount }
    }
  }, [user, portfolioId, state.isLoading, state.isLiked, state.likeCount, saveToCache])

  // Clear cache for this portfolio
  const clearCache = useCallback(() => {
    if (enableCache) {
      localStorage.removeItem(cacheKey)
    }
  }, [cacheKey, enableCache])

  // Load data when component mounts or user changes
  useEffect(() => {
    loadLikeData()
  }, [loadLikeData])

  // Clear cache when user logs out
  useEffect(() => {
    if (!user) {
      clearCache()
    }
  }, [user, clearCache])

  return {
    isLiked: state.isLiked,
    likeCount: state.likeCount,
    isLoading: state.isLoading,
    toggleLike,
    refreshLikeData: loadLikeData,
    clearCache
  }
}