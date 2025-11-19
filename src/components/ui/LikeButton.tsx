import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { supabaseService } from '../../lib/supabaseService'
import { useToast } from '../../hooks/useToast'
import { LoadingSpinner } from '../common/LoadingSpinner'

interface LikeButtonProps {
  portfolioId: string
  initialLikeCount?: number
  initialIsLiked?: boolean
  onLikeChange?: (isLiked: boolean, newCount: number) => void
  size?: 'sm' | 'md' | 'lg'
  showCount?: boolean
  className?: string
}

export function LikeButton({
  portfolioId,
  initialLikeCount = 0,
  initialIsLiked = false,
  onLikeChange,
  size = 'md',
  showCount = true,
  className = ''
}: LikeButtonProps) {
  const { user } = useAuth()
  const { error } = useToast()
  
  const [isLiked, setIsLiked] = useState(initialIsLiked)
  const [likeCount, setLikeCount] = useState(initialLikeCount)
  const [isLoading, setIsLoading] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)

  // Load like status and count when component mounts or user changes
  useEffect(() => {
    if (user) {
      loadLikeData()
    } else {
      setIsLiked(false)
    }
  }, [user, portfolioId])

  const loadLikeData = async () => {
    if (!user) return

    try {
      const [likeStatus, count] = await Promise.all([
        supabaseService.getUserLikeStatus(portfolioId, user.id),
        supabaseService.getLikeCount(portfolioId)
      ])
      
      setIsLiked(likeStatus)
      setLikeCount(count)
    } catch (err) {
      console.error('Error loading like data:', err)
    }
  }

  const handleLike = async () => {
    if (!user) {
      error('请先登录后再点赞')
      return
    }

    if (isLoading) return

    try {
      setIsLoading(true)
      setIsAnimating(true)
      
      const newIsLiked = await supabaseService.toggleLike(portfolioId, user.id)
      const newCount = newIsLiked ? likeCount + 1 : likeCount - 1
      
      setIsLiked(newIsLiked)
      setLikeCount(newCount)
      
      // Trigger animation
      setTimeout(() => setIsAnimating(false), 300)
      
      // Notify parent component
      onLikeChange?.(newIsLiked, newCount)
      
    } catch (err) {
      console.error('Error toggling like:', err)
      error('操作失败，请重试')
    } finally {
      setIsLoading(false)
    }
  }

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  }

  const buttonSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  }

  return (
    <button
      onClick={handleLike}
      disabled={isLoading || !user}
      className={`
        flex items-center space-x-2 transition-all duration-200 
        ${isLiked 
          ? 'text-red-500 hover:text-red-600' 
          : 'text-gray-600 hover:text-red-500'
        }
        ${!user ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}
        ${buttonSizeClasses[size]}
        ${className}
      `}
      title={user ? (isLiked ? '取消点赞' : '点赞') : '请先登录'}
    >
      {isLoading ? (
        <LoadingSpinner size="sm" />
      ) : (
        <div className={`relative ${isAnimating ? 'animate-pulse' : ''}`}>
          <svg 
            className={`${sizeClasses[size]} transition-all duration-200 ${
              isAnimating ? 'scale-125' : 'scale-100'
            }`}
            fill={isLiked ? "currentColor" : "none"} 
            stroke="currentColor" 
            viewBox="0 0 24 24"
            strokeWidth={isLiked ? 0 : 2}
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
            />
          </svg>
          
          {/* Animation effect */}
          {isAnimating && isLiked && (
            <div className="absolute inset-0 pointer-events-none">
              <svg 
                className={`${sizeClasses[size]} text-red-400 animate-ping`}
                fill="currentColor" 
                viewBox="0 0 24 24"
              >
                <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
          )}
        </div>
      )}
      
      {showCount && (
        <span className={`font-medium ${isAnimating ? 'animate-bounce' : ''}`}>
          {likeCount}
        </span>
      )}
    </button>
  )
}