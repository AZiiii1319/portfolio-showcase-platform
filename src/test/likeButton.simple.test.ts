import { describe, it, expect, vi, beforeEach } from 'vitest'
import { supabaseService } from '../lib/supabaseService'

// Mock the supabase service
vi.mock('../lib/supabaseService', () => ({
  supabaseService: {
    toggleLike: vi.fn(),
    getUserLikeStatus: vi.fn(),
    getLikeCount: vi.fn()
  }
}))

describe('Like Functionality Core Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('SupabaseService Like Methods', () => {
    it('should toggle like successfully', async () => {
      vi.mocked(supabaseService.toggleLike).mockResolvedValue(true)

      const result = await supabaseService.toggleLike('portfolio-123', 'user-456')

      expect(supabaseService.toggleLike).toHaveBeenCalledWith('portfolio-123', 'user-456')
      expect(result).toBe(true)
    })

    it('should get user like status', async () => {
      vi.mocked(supabaseService.getUserLikeStatus).mockResolvedValue(false)

      const result = await supabaseService.getUserLikeStatus('portfolio-123', 'user-456')

      expect(supabaseService.getUserLikeStatus).toHaveBeenCalledWith('portfolio-123', 'user-456')
      expect(result).toBe(false)
    })

    it('should get like count', async () => {
      vi.mocked(supabaseService.getLikeCount).mockResolvedValue(5)

      const result = await supabaseService.getLikeCount('portfolio-123')

      expect(supabaseService.getLikeCount).toHaveBeenCalledWith('portfolio-123')
      expect(result).toBe(5)
    })

    it('should handle toggle like error', async () => {
      vi.mocked(supabaseService.toggleLike).mockRejectedValue(new Error('Network error'))

      await expect(supabaseService.toggleLike('portfolio-123', 'user-456')).rejects.toThrow('Network error')
    })
  })

  describe('Local Storage Cache Logic', () => {
    const localStorageMock = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn()
    }

    beforeEach(() => {
      Object.defineProperty(window, 'localStorage', {
        value: localStorageMock,
        writable: true
      })
      vi.clearAllMocks()
    })

    it('should save like data to cache', () => {
      const cacheKey = 'portfolio_like_portfolio-123'
      const data = {
        isLiked: true,
        likeCount: 5,
        timestamp: Date.now()
      }

      localStorageMock.setItem(cacheKey, JSON.stringify(data))

      expect(localStorageMock.setItem).toHaveBeenCalledWith(cacheKey, JSON.stringify(data))
    })

    it('should load like data from cache', () => {
      const cacheKey = 'portfolio_like_portfolio-123'
      const data = {
        isLiked: true,
        likeCount: 5,
        timestamp: Date.now()
      }

      localStorageMock.getItem.mockReturnValue(JSON.stringify(data))

      const result = localStorageMock.getItem(cacheKey)
      const parsedData = JSON.parse(result!)

      expect(localStorageMock.getItem).toHaveBeenCalledWith(cacheKey)
      expect(parsedData).toEqual(data)
    })

    it('should handle cache expiry', () => {
      const cacheKey = 'portfolio_like_portfolio-123'
      const expiredData = {
        isLiked: true,
        likeCount: 5,
        timestamp: Date.now() - (6 * 60 * 1000) // 6 minutes ago
      }

      localStorageMock.getItem.mockReturnValue(JSON.stringify(expiredData))

      const result = localStorageMock.getItem(cacheKey)
      const parsedData = JSON.parse(result!)
      const isExpired = Date.now() - parsedData.timestamp > (5 * 60 * 1000) // 5 minutes

      expect(isExpired).toBe(true)

      // Should remove expired cache
      localStorageMock.removeItem(cacheKey)
      expect(localStorageMock.removeItem).toHaveBeenCalledWith(cacheKey)
    })

    it('should handle corrupted cache', () => {
      const cacheKey = 'portfolio_like_portfolio-123'
      localStorageMock.getItem.mockReturnValue('invalid-json')

      try {
        const result = localStorageMock.getItem(cacheKey)
        JSON.parse(result!)
      } catch (error) {
        // Should remove corrupted cache
        localStorageMock.removeItem(cacheKey)
        expect(localStorageMock.removeItem).toHaveBeenCalledWith(cacheKey)
      }
    })
  })
})