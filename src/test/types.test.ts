import { describe, it, expect } from 'vitest'
import { PORTFOLIO_CATEGORIES } from '../types/database'
import type { 
  Profile, 
  Portfolio, 
  PortfolioFilters,
  Comment,
  Like,
  InteractionType 
} from '../types/database'

describe('Database Types', () => {
  it('should have correct portfolio categories', () => {
    expect(PORTFOLIO_CATEGORIES).toHaveLength(9)
    expect(PORTFOLIO_CATEGORIES[0]).toEqual({
      value: 'digital-art',
      label: 'Digital Art'
    })
    expect(PORTFOLIO_CATEGORIES[8]).toEqual({
      value: 'other',
      label: 'Other'
    })
  })

  it('should define correct interaction types', () => {
    const likeType: InteractionType = 'like'
    const commentType: InteractionType = 'comment'
    
    expect(likeType).toBe('like')
    expect(commentType).toBe('comment')
  })

  it('should have proper type structure for Profile', () => {
    const mockProfile: Profile = {
      id: '123',
      username: 'testuser',
      full_name: 'Test User',
      avatar_url: null,
      bio: null,
      website: null,
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2023-01-01T00:00:00Z'
    }

    expect(mockProfile.id).toBe('123')
    expect(mockProfile.username).toBe('testuser')
    expect(mockProfile.full_name).toBe('Test User')
  })

  it('should have proper type structure for Portfolio', () => {
    const mockPortfolio: Portfolio = {
      id: '456',
      user_id: '123',
      title: 'Test Portfolio',
      description: 'Test description',
      category: 'digital-art',
      image_url: 'https://example.com/image.jpg',
      tags: ['test', 'portfolio'],
      is_featured: false,
      view_count: 0,
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2023-01-01T00:00:00Z'
    }

    expect(mockPortfolio.id).toBe('456')
    expect(mockPortfolio.user_id).toBe('123')
    expect(mockPortfolio.title).toBe('Test Portfolio')
    expect(mockPortfolio.tags).toEqual(['test', 'portfolio'])
  })

  it('should have proper type structure for Comment', () => {
    const mockComment: Comment = {
      id: '789',
      portfolio_id: '456',
      user_id: '123',
      type: 'comment',
      content: 'Great work!',
      created_at: '2023-01-01T00:00:00Z',
      profile: {
        id: '123',
        username: 'testuser',
        full_name: 'Test User',
        avatar_url: null,
        bio: null,
        website: null,
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z'
      }
    }

    expect(mockComment.type).toBe('comment')
    expect(mockComment.content).toBe('Great work!')
    expect(mockComment.profile?.username).toBe('testuser')
  })

  it('should have proper type structure for Like', () => {
    const mockLike: Like = {
      id: '101',
      portfolio_id: '456',
      user_id: '123',
      type: 'like',
      content: null,
      created_at: '2023-01-01T00:00:00Z'
    }

    expect(mockLike.type).toBe('like')
    expect(mockLike.content).toBeNull()
  })

  it('should have proper type structure for PortfolioFilters', () => {
    const filters: PortfolioFilters = {
      category: 'digital-art',
      searchTerm: 'test',
      userId: '123',
      featured: true
    }

    expect(filters.category).toBe('digital-art')
    expect(filters.searchTerm).toBe('test')
    expect(filters.userId).toBe('123')
    expect(filters.featured).toBe(true)
  })

  it('should allow partial PortfolioFilters', () => {
    const partialFilters: PortfolioFilters = {
      category: 'photography'
    }

    expect(partialFilters.category).toBe('photography')
    expect(partialFilters.searchTerm).toBeUndefined()
    expect(partialFilters.userId).toBeUndefined()
    expect(partialFilters.featured).toBeUndefined()
  })
})