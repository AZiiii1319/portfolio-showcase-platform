import { describe, it, expect, vi, beforeEach } from 'vitest'
import { SupabaseService } from '../lib/supabaseService'
import { supabase } from '../lib/supabase'
import { 
  createMockProfile, 
  createMockPortfolio, 
  createMockComment,
  mockSupabaseResponse,
  mockSupabaseError,
  TEST_USER_ID,
  TEST_PORTFOLIO_ID
} from './testUtils'

describe('SupabaseService Integration Tests', () => {
  let service: SupabaseService
  
  beforeEach(() => {
    service = new SupabaseService()
    vi.clearAllMocks()
  })

  describe('Profile Management Flow', () => {
    it('should handle complete profile management workflow', async () => {
      const mockProfile = createMockProfile({ 
        id: TEST_USER_ID,
        username: 'newuser',
        full_name: 'New User'
      })

      // Mock getting profile (initially not found)
      const mockGetQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue(mockSupabaseError('Not found', 'PGRST116'))
      }

      // Mock updating profile
      const mockUpdateQuery = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue(mockSupabaseResponse(mockProfile))
      }

      vi.mocked(supabase.from)
        .mockReturnValueOnce(mockGetQuery as any)
        .mockReturnValueOnce(mockUpdateQuery as any)

      // First, try to get profile (should return null)
      const initialProfile = await service.getProfile(TEST_USER_ID)
      expect(initialProfile).toBeNull()

      // Then update profile
      const updatedProfile = await service.updateProfile(TEST_USER_ID, {
        full_name: 'New User',
        bio: 'Updated bio'
      })

      expect(updatedProfile).toEqual(mockProfile)
      expect(mockUpdateQuery.update).toHaveBeenCalledWith({
        full_name: 'New User',
        bio: 'Updated bio'
      })
    })

    it('should handle avatar upload', async () => {
      const mockFile = new File(['test'], 'avatar.jpg', { type: 'image/jpeg' })
      const mockPublicUrl = 'https://example.com/avatars/123/avatar.jpg'

      const mockStorage = {
        upload: vi.fn().mockResolvedValue({ error: null }),
        getPublicUrl: vi.fn().mockReturnValue({ data: { publicUrl: mockPublicUrl } })
      }

      vi.mocked(supabase.storage.from).mockReturnValue(mockStorage as any)

      const result = await service.uploadAvatar(TEST_USER_ID, mockFile)

      expect(supabase.storage.from).toHaveBeenCalledWith('avatars')
      expect(mockStorage.upload).toHaveBeenCalledWith(
        `${TEST_USER_ID}/avatar.jpg`,
        mockFile,
        { upsert: true }
      )
      expect(result).toBe(mockPublicUrl)
    })
  })

  describe('Portfolio Management Flow', () => {
    it('should handle complete portfolio CRUD workflow', async () => {
      const newPortfolioData = {
        user_id: TEST_USER_ID,
        title: 'New Portfolio',
        description: 'A new portfolio',
        category: 'digital-art',
        image_url: 'https://example.com/image.jpg',
        tags: ['new', 'portfolio']
      }

      const mockCreatedPortfolio = createMockPortfolio({
        ...newPortfolioData,
        id: TEST_PORTFOLIO_ID
      })

      // Mock create portfolio
      const mockCreateQuery = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue(mockSupabaseResponse(mockCreatedPortfolio))
      }

      // Mock get portfolio
      const mockGetQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue(mockSupabaseResponse(mockCreatedPortfolio))
      }

      // Mock update portfolio
      const updatedPortfolio = { ...mockCreatedPortfolio, title: 'Updated Portfolio' }
      const mockUpdateQuery = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue(mockSupabaseResponse(updatedPortfolio))
      }

      // Mock delete portfolio
      const mockDeleteQuery = {
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue(mockSupabaseResponse(null))
      }

      vi.mocked(supabase.from)
        .mockReturnValueOnce(mockCreateQuery as any)
        .mockReturnValueOnce(mockGetQuery as any)
        .mockReturnValueOnce(mockUpdateQuery as any)
        .mockReturnValueOnce(mockDeleteQuery as any)

      // Create portfolio
      const created = await service.createPortfolio(newPortfolioData)
      expect(created).toEqual(mockCreatedPortfolio)
      expect(mockCreateQuery.insert).toHaveBeenCalledWith(newPortfolioData)

      // Get portfolio
      const retrieved = await service.getPortfolio(TEST_PORTFOLIO_ID)
      expect(retrieved).toEqual(mockCreatedPortfolio)

      // Update portfolio
      const updated = await service.updatePortfolio(TEST_PORTFOLIO_ID, { 
        title: 'Updated Portfolio' 
      })
      expect(updated).toEqual(updatedPortfolio)

      // Delete portfolio
      await service.deletePortfolio(TEST_PORTFOLIO_ID)
      expect(mockDeleteQuery.delete).toHaveBeenCalled()
      expect(mockDeleteQuery.eq).toHaveBeenCalledWith('id', TEST_PORTFOLIO_ID)
    })

    it('should handle portfolio image upload', async () => {
      const mockFile = new File(['test'], 'portfolio.jpg', { type: 'image/jpeg' })
      const mockPublicUrl = 'https://example.com/portfolios/123/1234567890.jpg'

      const mockStorage = {
        upload: vi.fn().mockResolvedValue({ error: null }),
        getPublicUrl: vi.fn().mockReturnValue({ data: { publicUrl: mockPublicUrl } })
      }

      vi.mocked(supabase.storage.from).mockReturnValue(mockStorage as any)

      const result = await service.uploadPortfolioImage(mockFile, TEST_USER_ID)

      expect(supabase.storage.from).toHaveBeenCalledWith('portfolios')
      expect(mockStorage.upload).toHaveBeenCalledWith(
        expect.stringMatching(new RegExp(`${TEST_USER_ID}/\\d+\\.jpg`)),
        mockFile
      )
      expect(result).toBe(mockPublicUrl)
    })
  })

  describe('Interaction Management Flow', () => {
    it('should handle like toggle workflow', async () => {
      // Mock no existing like (first toggle - add like)
      const mockSelectQuery1 = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue(mockSupabaseError('Not found', 'PGRST116'))
      }

      const mockInsertQuery = {
        insert: vi.fn().mockResolvedValue(mockSupabaseResponse(null))
      }

      // Mock existing like (second toggle - remove like)
      const mockSelectQuery2 = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue(mockSupabaseResponse({ id: 'like-123' }))
      }

      const mockDeleteQuery = {
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue(mockSupabaseResponse(null))
      }

      vi.mocked(supabase.from)
        .mockReturnValueOnce(mockSelectQuery1 as any)
        .mockReturnValueOnce(mockInsertQuery as any)
        .mockReturnValueOnce(mockSelectQuery2 as any)
        .mockReturnValueOnce(mockDeleteQuery as any)

      // First toggle - should add like
      const firstResult = await service.toggleLike(TEST_PORTFOLIO_ID, TEST_USER_ID)
      expect(firstResult).toBe(true)
      expect(mockInsertQuery.insert).toHaveBeenCalledWith({
        portfolio_id: TEST_PORTFOLIO_ID,
        user_id: TEST_USER_ID,
        type: 'like'
      })

      // Second toggle - should remove like
      const secondResult = await service.toggleLike(TEST_PORTFOLIO_ID, TEST_USER_ID)
      expect(secondResult).toBe(false)
      expect(mockDeleteQuery.delete).toHaveBeenCalled()
    })

    it('should handle comment management workflow', async () => {
      const mockComment = createMockComment({
        portfolio_id: TEST_PORTFOLIO_ID,
        user_id: TEST_USER_ID,
        content: 'Great work!'
      })

      // Mock add comment
      const mockAddQuery = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue(mockSupabaseResponse(mockComment))
      }

      // Mock get comments
      const mockGetQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue(mockSupabaseResponse([mockComment]))
      }

      // Mock delete comment
      const mockDeleteQuery = {
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue(mockSupabaseResponse(null))
      }

      vi.mocked(supabase.from)
        .mockReturnValueOnce(mockAddQuery as any)
        .mockReturnValueOnce(mockGetQuery as any)
        .mockReturnValueOnce(mockDeleteQuery as any)

      // Add comment
      const addedComment = await service.addComment(
        TEST_PORTFOLIO_ID, 
        TEST_USER_ID, 
        'Great work!'
      )
      expect(addedComment).toEqual(mockComment)

      // Get comments
      const comments = await service.getComments(TEST_PORTFOLIO_ID)
      expect(comments).toEqual([mockComment])

      // Delete comment
      await service.deleteComment(mockComment.id)
      expect(mockDeleteQuery.delete).toHaveBeenCalled()
    })
  })

  describe('Search and Filter Functionality', () => {
    it('should handle portfolio search with various filters', async () => {
      const mockPortfolios = [
        createMockPortfolio({ category: 'digital-art', title: 'Digital Art Portfolio' }),
        createMockPortfolio({ category: 'photography', title: 'Photo Portfolio' })
      ]

      // Create a more complete mock chain that returns data at the end
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        or: vi.fn().mockReturnValue(Promise.resolve(mockSupabaseResponse(mockPortfolios)))
      }

      vi.mocked(supabase.from).mockReturnValue(mockQuery as any)

      // Test search with filters
      const result = await service.getPortfolios({
        category: 'digital-art',
        searchTerm: 'portfolio',
        userId: TEST_USER_ID,
        featured: true
      })

      expect(mockQuery.eq).toHaveBeenCalledWith('category', 'digital-art')
      expect(mockQuery.eq).toHaveBeenCalledWith('user_id', TEST_USER_ID)
      expect(mockQuery.eq).toHaveBeenCalledWith('is_featured', true)
      expect(mockQuery.or).toHaveBeenCalledWith('title.ilike.%portfolio%,description.ilike.%portfolio%')
      expect(result).toEqual(mockPortfolios)
    })

    it('should handle username availability check', async () => {
      // Mock username not found (available)
      const mockQuery1 = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue(mockSupabaseError('Not found', 'PGRST116'))
      }

      // Mock username found (not available)
      const mockQuery2 = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue(mockSupabaseResponse({ id: 'user-123' }))
      }

      vi.mocked(supabase.from)
        .mockReturnValueOnce(mockQuery1 as any)
        .mockReturnValueOnce(mockQuery2 as any)

      // Test available username
      const available = await service.checkUsernameAvailability('newuser')
      expect(available).toBe(true)

      // Test unavailable username
      const unavailable = await service.checkUsernameAvailability('existinguser')
      expect(unavailable).toBe(false)
    })
  })
})