import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabaseService } from '../lib/supabaseService'
import { useToast } from '../hooks/useToast'
import { LoadingSpinner } from '../components/common/LoadingSpinner'
import { LikeButton } from '../components/ui/LikeButton'
import type { PortfolioWithStats, Comment, PortfolioWithProfile } from '../types/database'
import { PORTFOLIO_CATEGORIES } from '../types/database'

export function PortfolioDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const navigate = useNavigate()
  const { success, error } = useToast()
  
  const [portfolio, setPortfolio] = useState<PortfolioWithProfile | null>(null)
  const [portfolioStats, setPortfolioStats] = useState<PortfolioWithStats | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [commentText, setCommentText] = useState('')
  const [submittingComment, setSubmittingComment] = useState(false)


  useEffect(() => {
    if (!id) {
      navigate('/')
      return
    }
    
    loadPortfolioData()
  }, [id, navigate])

  const loadPortfolioData = async () => {
    if (!id) return
    
    try {
      setLoading(true)
      
      console.log('开始加载作品详情，ID:', id)
      
      // 使用直接的 fetch API 获取作品数据
      const response = await fetch(`https://hcyjdbglurjhwvbpulkg.supabase.co/rest/v1/portfolios?select=*&id=eq.${id}`, {
        headers: {
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjeWpkYmdsdXJqaHd2YnB1bGtnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI5OTg2NDksImV4cCI6MjA3ODU3NDY0OX0.x-_QeoYdFg9oGHRUGRXawHr3ZD1RUJWM8WqLf-DFH6E',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjeWpkYmdsdXJqaHd2YnB1bGtnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI5OTg2NDksImV4cCI6MjA3ODU3NDY0OX0.x-_QeoYdFg9oGHRUGRXawHr3ZD1RUJWM8WqLf-DFH6E'
        }
      })
      
      const portfolioData = await response.json()
      console.log('获取到的作品数据:', portfolioData)
      
      if (!portfolioData || portfolioData.length === 0) {
        error('作品不存在')
        navigate('/')
        return
      }

      const portfolio = portfolioData[0]
      setPortfolio(portfolio)
      
      // 创建模拟的统计数据（暂时不使用复杂的 RPC 函数）
      const mockStats = {
        ...portfolio,
        like_count: 0,
        comment_count: 0,
        user_has_liked: false
      }
      setPortfolioStats(mockStats)
      
      // 暂时设置空的评论数组
      setComments([])
      
      console.log('作品详情加载成功')
      
    } catch (err) {
      console.error('Error loading portfolio:', err)
      error('加载作品失败')
    } finally {
      setLoading(false)
    }
  }

  const handleLikeChange = (isLiked: boolean, newCount: number) => {
    // Update the portfolio stats when like changes
    if (portfolioStats) {
      setPortfolioStats({
        ...portfolioStats,
        like_count: newCount,
        user_has_liked: isLiked
      })
    }
  }

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user || !id) {
      error('请先登录')
      return
    }

    if (!commentText.trim()) {
      error('请输入评论内容')
      return
    }

    try {
      setSubmittingComment(true)
      const newComment = await supabaseService.addComment(id, user.id, commentText.trim())
      
      setComments(prev => [...prev, newComment])
      setCommentText('')
      
      // Refresh stats
      const updatedStats = await supabaseService.getPortfolioWithStats(id)
      setPortfolioStats(updatedStats)
      
      success('评论发布成功')
    } catch (err) {
      console.error('Error adding comment:', err)
      error('评论发布失败')
    } finally {
      setSubmittingComment(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getCategoryLabel = (categoryValue: string) => {
    const category = PORTFOLIO_CATEGORIES.find(cat => cat.value === categoryValue)
    return category?.label || categoryValue
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!portfolio) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">作品不存在</h1>
          <Link to="/" className="text-primary-600 hover:text-primary-700">
            返回首页
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {/* Portfolio image */}
        <div className="relative">
          <img
            src={portfolio.image_url}
            alt={portfolio.title}
            className="w-full h-96 object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement
              target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzlDQTNBRiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPuaXoOazleWKoOi9veWbvueJhzwvdGV4dD48L3N2Zz4='
            }}
          />
          {portfolio.is_featured && (
            <div className="absolute top-4 left-4">
              <span className="bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                精选作品
              </span>
            </div>
          )}
        </div>
        
        {/* Portfolio content */}
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h1 className="text-3xl font-bold text-gray-900">
              {portfolio.title}
            </h1>
            <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">
              {getCategoryLabel(portfolio.category)}
            </span>
          </div>
          
          <div className="flex items-center mb-6">
            <img
              src={portfolio.profiles?.avatar_url || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiNGM0Y0RjYiLz4KPHN2ZyB4PSI4IiB5PSI4IiB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSI+CjxwYXRoIGQ9Ik0yMCAyMVYxOUE0IDQgMCAwIDAgMTYgMTVIOEE0IDQgMCAwIDAgNCAyMVYyMSIgc3Ryb2tlPSIjOUNBM0FGIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgo8Y2lyY2xlIGN4PSIxMiIgY3k9IjciIHI9IjQiIHN0cm9rZT0iIzlDQTNBRiIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPC9zdmc+Cjwvc3ZnPgo='}
              alt={portfolio.profiles?.full_name || portfolio.profiles?.username}
              className="w-10 h-10 rounded-full mr-3"
            />
            <div>
              <Link 
                to={`/profile/${portfolio.user_id}`}
                className="font-medium text-gray-900 hover:text-primary-600"
              >
                {portfolio.profiles?.full_name || portfolio.profiles?.username}
              </Link>
              <p className="text-sm text-gray-600">
                发布于 {formatDate(portfolio.created_at)}
              </p>
            </div>
          </div>
          
          {portfolio.description && (
            <div className="prose max-w-none mb-8">
              <p className="text-gray-700 whitespace-pre-wrap">
                {portfolio.description}
              </p>
            </div>
          )}

          {/* Tags */}
          {portfolio.tags && portfolio.tags.length > 0 && (
            <div className="mb-8">
              <div className="flex flex-wrap gap-2">
                {portfolio.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {/* Interaction buttons */}
          <div className="flex items-center space-x-4 mb-8">
            <LikeButton
              portfolioId={id!}
              initialLikeCount={portfolioStats?.like_count || 0}
              initialIsLiked={portfolioStats?.user_has_liked || false}
              onLikeChange={handleLikeChange}
              size="md"
              showCount={true}
            />
            <span className="text-gray-400">•</span>
            <span className="text-gray-600">
              浏览 ({portfolioStats?.view_count || 0})
            </span>
            <span className="text-gray-400">•</span>
            <span className="text-gray-600">
              评论 ({portfolioStats?.comment_count || 0})
            </span>
          </div>
          
          {/* Comments section */}
          <div className="border-t border-gray-200 pt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              评论 ({comments.length})
            </h3>
            
            {/* Comment form */}
            {user ? (
              <form onSubmit={handleSubmitComment} className="mb-6">
                <div className="flex space-x-3">
                  <img
                    src={user.user_metadata?.avatar_url || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiNGM0Y0RjYiLz4KPHN2ZyB4PSI4IiB5PSI4IiB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSI+CjxwYXRoIGQ9Ik0yMCAyMVYxOUE0IDQgMCAwIDAgMTYgMTVIOEE0IDQgMCAwIDAgNCAyMVYyMSIgc3Ryb2tlPSIjOUNBM0FGIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgo8Y2lyY2xlIGN4PSIxMiIgY3k9IjciIHI9IjQiIHN0cm9rZT0iIzlDQTNBRiIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPC9zdmc+Cjwvc3ZnPgo='}
                    alt="Your avatar"
                    className="w-8 h-8 rounded-full"
                  />
                  <div className="flex-1">
                    <textarea
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="写下你的评论..."
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                      rows={3}
                    />
                    <div className="mt-2 flex justify-end">
                      <button
                        type="submit"
                        disabled={submittingComment || !commentText.trim()}
                        className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                      >
                        {submittingComment && <LoadingSpinner size="sm" />}
                        <span>发布评论</span>
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            ) : (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg text-center">
                <p className="text-gray-600 mb-2">登录后可以发表评论</p>
                <Link
                  to="/login"
                  className="text-primary-600 hover:text-primary-700 font-medium"
                >
                  立即登录
                </Link>
              </div>
            )}
            
            {/* Comments list */}
            {comments.length > 0 ? (
              <div className="space-y-4">
                {comments.map((comment) => (
                  <div key={comment.id} className="flex space-x-3">
                    <img
                      src={comment.profile?.avatar_url || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiNGM0Y0RjYiLz4KPHN2ZyB4PSI4IiB5PSI4IiB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSI+CjxwYXRoIGQ9Ik0yMCAyMVYxOUE0IDQgMCAwIDAgMTYgMTVIOEE0IDQgMCAwIDAgNCAyMVYyMSIgc3Ryb2tlPSIjOUNBM0FGIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgo8Y2lyY2xlIGN4PSIxMiIgY3k9IjciIHI9IjQiIHN0cm9rZT0iIzlDQTNBRiIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPC9zdmc+Cjwvc3ZnPgo='}
                      alt={comment.profile?.full_name || comment.profile?.username}
                      className="w-8 h-8 rounded-full"
                    />
                    <div className="flex-1">
                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium text-gray-900">
                            {comment.profile?.full_name || comment.profile?.username}
                          </span>
                          <span className="text-sm text-gray-500">
                            {formatDate(comment.created_at)}
                          </span>
                        </div>
                        <p className="text-gray-700 whitespace-pre-wrap">
                          {comment.content}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-gray-600 text-center py-8">
                暂无评论，成为第一个评论的人吧！
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}