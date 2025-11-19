// Test utilities and mock data factories
import type { Profile, Portfolio, Comment, Like } from '../types/database'

export const createMockProfile = (overrides: Partial<Profile> = {}): Profile => ({
    id: '123',
    username: 'testuser',
    full_name: 'Test User',
    avatar_url: null,
    bio: null,
    website: null,
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z',
    ...overrides
})

export const createMockPortfolio = (overrides: Partial<Portfolio> = {}): Portfolio => ({
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
    updated_at: '2023-01-01T00:00:00Z',
    ...overrides
})

export const createMockComment = (overrides: Partial<Comment> = {}): Comment => ({
    id: '789',
    portfolio_id: '456',
    user_id: '123',
    type: 'comment',
    content: 'Great work!',
    created_at: '2023-01-01T00:00:00Z',
    profile: createMockProfile(),
    ...overrides
})

export const createMockLike = (overrides: Partial<Like> = {}): Like => ({
    id: '101',
    portfolio_id: '456',
    user_id: '123',
    type: 'like',
    content: null,
    created_at: '2023-01-01T00:00:00Z',
    ...overrides
})

// Mock Supabase responses
export const mockSupabaseResponse = <T>(data: T, error: any = null) => ({
    data,
    error
})

export const mockSupabaseError = (message: string, code?: string) => ({
    data: null,
    error: {
        message,
        code,
        details: null,
        hint: null
    }
})

// Common test data
export const TEST_USER_ID = '123'
export const TEST_PORTFOLIO_ID = '456'
export const TEST_COMMENT_ID = '789'
export const TEST_LIKE_ID = '101'

export const MOCK_CATEGORIES = [
    'digital-art',
    'photography',
    'ui-ux-design',
    'illustration',
    'graphic-design',
    'web-design',
    '3d-modeling',
    'animation',
    'other'
] as const