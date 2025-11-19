import { describe, it, expect, vi, beforeEach } from 'vitest'
import { SupabaseService } from '../lib/supabaseService'
import { supabase } from '../lib/supabase'

describe('SupabaseService', () => {
  let service: SupabaseService
  
  beforeEach(() => {
    service = new SupabaseService()
    vi.clearAllMocks()
  })

  describe('Authentication Methods', () => {
    it('should sign up a user with email and password', async () => {
      const mockResponse = { 
        data: { 
          user: { 
            id: '123',
            email: 'test@example.com',
            aud: 'authenticated',
            created_at: '2023-01-01T00:00:00Z',
            app_metadata: {},
            user_metadata: {}
          } as any, 
          session: null 
        }, 
        error: null 
      }
      vi.mocked(supabase.auth.signUp).mockResolvedValue(mockResponse as any)

      const result = await service.signUp('test@example.com', 'password123', {
        username: 'testuser',
        full_name: 'Test User'
      })

      expect(supabase.auth.signUp).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
        options: {
          data: {
            username: 'testuser',
            full_name: 'Test User'
          }
        }
      })
      expect(result).toEqual(mockResponse)
    })

    it('should sign in a user with email and password', async () => {
      const mockResponse = { 
        data: { 
          user: { 
            id: '123',
            email: 'test@example.com',
            aud: 'authenticated',
            created_at: '2023-01-01T00:00:00Z',
            app_metadata: {},
            user_metadata: {}
          } as any, 
          session: null 
        }, 
        error: null 
      }
      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue(mockResponse as any)

      const result = await service.signIn('test@example.com', 'password123')

      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123'
      })
      expect(result).toEqual(mockResponse)
    })

    it('should sign out a user', async () => {
      vi.mocked(supabase.auth.signOut).mockResolvedValue({ error: null })

      await service.signOut()

      expect(supabase.auth.signOut).toHaveBeenCalled()
    })

    it('should get current user', async () => {
      const mockUser = { 
        id: '123', 
        email: 'test@example.com',
        aud: 'authenticated',
        created_at: '2023-01-01T00:00:00Z',
        app_metadata: {},
        user_metadata: {}
      } as any
      vi.mocked(supabase.auth.getUser).mockResolvedValue({ 
        data: { user: mockUser }, 
        error: null 
      })

      const result = await service.getCurrentUser()

      expect(supabase.auth.getUser).toHaveBeenCalled()
      expect(result).toEqual(mockUser)
    })
  })

  describe('Profile Methods', () => {
    it('should get a profile by user ID', async () => {
      const mockProfile = {
        id: '123',
        username: 'testuser',
        full_name: 'Test User',
        avatar_url: null,
        bio: null,
        website: null,
        created_at: '2023-01-01',
        updated_at: '2023-01-01'
      }

      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockProfile, error: null })
      }
      vi.mocked(supabase.from).mockReturnValue(mockQuery as any)

      const result = await service.getProfile('123')

      expect(supabase.from).toHaveBeenCalledWith('profiles')
      expect(mockQuery.select).toHaveBeenCalledWith('*')
      expect(mockQuery.eq).toHaveBeenCalledWith('id', '123')
      expect(result).toEqual(mockProfile)
    })

    it('should return null when profile not found', async () => {
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ 
          data: null, 
          error: { code: 'PGRST116' } 
        })
      }
      vi.mocked(supabase.from).mockReturnValue(mockQuery as any)

      const result = await service.getProfile('nonexistent')

      expect(result).toBeNull()
    })

    it('should update a profile', async () => {
      const mockUpdatedProfile = {
        id: '123',
        username: 'testuser',
        full_name: 'Updated Name',
        avatar_url: null,
        bio: 'Updated bio',
        website: null,
        created_at: '2023-01-01',
        updated_at: '2023-01-02'
      }

      const mockQuery = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockUpdatedProfile, error: null })
      }
      vi.mocked(supabase.from).mockReturnValue(mockQuery as any)

      const updates = { full_name: 'Updated Name', bio: 'Updated bio' }
      const result = await service.updateProfile('123', updates)

      expect(supabase.from).toHaveBeenCalledWith('profiles')
      expect(mockQuery.update).toHaveBeenCalledWith(updates)
      expect(mockQuery.eq).toHaveBeenCalledWith('id', '123')
      expect(result).toEqual(mockUpdatedProfile)
    })
  })

  describe('Portfolio Methods', () => {
    it('should get portfolios with filters', async () => {
      const mockPortfolios = [
        {
          id: '1',
          user_id: '123',
          title: 'Test Portfolio',
          description: 'Test description',
          category: 'digital-art',
          image_url: 'test.jpg',
          tags: ['test'],
          is_featured: false,
          view_count: 0,
          created_at: '2023-01-01',
          updated_at: '2023-01-01'
        }
      ]

      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        or: vi.fn().mockResolvedValue({ data: mockPortfolios, error: null })
      }
      vi.mocked(supabase.from).mockReturnValue(mockQuery as any)

      const filters = { category: 'digital-art', searchTerm: 'test' }
      const result = await service.getPortfolios(filters)

      expect(supabase.from).toHaveBeenCalledWith('portfolios')
      expect(mockQuery.eq).toHaveBeenCalledWith('category', 'digital-art')
      expect(mockQuery.or).toHaveBeenCalledWith('title.ilike.%test%,description.ilike.%test%')
      expect(result).toEqual(mockPortfolios)
    })

    it('should create a new portfolio', async () => {
      const newPortfolio = {
        user_id: '123',
        title: 'New Portfolio',
        description: 'New description',
        category: 'photography',
        image_url: 'new.jpg',
        tags: ['new', 'portfolio']
      }

      const mockCreatedPortfolio = {
        id: '456',
        ...newPortfolio,
        is_featured: false,
        view_count: 0,
        created_at: '2023-01-01',
        updated_at: '2023-01-01'
      }

      const mockQuery = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockCreatedPortfolio, error: null })
      }
      vi.mocked(supabase.from).mockReturnValue(mockQuery as any)

      const result = await service.createPortfolio(newPortfolio)

      expect(supabase.from).toHaveBeenCalledWith('portfolios')
      expect(mockQuery.insert).toHaveBeenCalledWith(newPortfolio)
      expect(result).toEqual(mockCreatedPortfolio)
    })
  })

  describe('Interaction Methods', () => {
    it('should toggle like on a portfolio', async () => {
      // Mock no existing like
      const mockSelectQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116' } })
      }

      // Mock insert like
      const mockInsertQuery = {
        insert: vi.fn().mockResolvedValue({ error: null })
      }

      vi.mocked(supabase.from)
        .mockReturnValueOnce(mockSelectQuery as any)
        .mockReturnValueOnce(mockInsertQuery as any)

      const result = await service.toggleLike('portfolio-123', 'user-456')

      expect(result).toBe(true) // Like was added
    })

    it('should add a comment to a portfolio', async () => {
      const mockComment = {
        id: 'comment-123',
        portfolio_id: 'portfolio-123',
        user_id: 'user-456',
        type: 'comment' as const,
        content: 'Great work!',
        created_at: '2023-01-01',
        profile: {
          username: 'testuser',
          full_name: 'Test User',
          avatar_url: null
        }
      }

      const mockQuery = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockComment, error: null })
      }
      vi.mocked(supabase.from).mockReturnValue(mockQuery as any)

      const result = await service.addComment('portfolio-123', 'user-456', 'Great work!')

      expect(supabase.from).toHaveBeenCalledWith('interactions')
      expect(mockQuery.insert).toHaveBeenCalledWith({
        portfolio_id: 'portfolio-123',
        user_id: 'user-456',
        type: 'comment',
        content: 'Great work!'
      })
      expect(result).toEqual(mockComment)
    })
  })

  describe('Utility Methods', () => {
    it('should check username availability', async () => {
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ 
          data: null, 
          error: { code: 'PGRST116' } 
        })
      }
      vi.mocked(supabase.from).mockReturnValue(mockQuery as any)

      const result = await service.checkUsernameAvailability('newuser')

      expect(supabase.from).toHaveBeenCalledWith('profiles')
      expect(mockQuery.eq).toHaveBeenCalledWith('username', 'newuser')
      expect(result).toBe(true) // Username is available
    })

    it('should search portfolios', async () => {
      const mockPortfolios = [
        {
          id: '1',
          title: 'Searchable Portfolio',
          description: 'Contains search term',
          category: 'digital-art',
          user_id: '123',
          image_url: 'test.jpg',
          tags: ['search'],
          is_featured: false,
          view_count: 5,
          created_at: '2023-01-01',
          updated_at: '2023-01-01'
        }
      ]

      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        or: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({ data: mockPortfolios, error: null })
      }
      vi.mocked(supabase.from).mockReturnValue(mockQuery as any)

      const result = await service.searchPortfolios('search', 10)

      expect(supabase.from).toHaveBeenCalledWith('portfolios')
      expect(mockQuery.limit).toHaveBeenCalledWith(10)
      expect(result).toEqual(mockPortfolios)
    })
  })
})