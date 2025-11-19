import { Link } from 'react-router-dom'
import { LikeButton } from '../ui/LikeButton'
import type { Portfolio } from '../../types/database'

interface PortfolioGridProps {
  portfolios: Portfolio[]
  showAuthor?: boolean
  searchTerm?: string
}

export function PortfolioGrid({ portfolios, showAuthor = false, searchTerm }: PortfolioGridProps) {
  if (portfolios.length === 0) {
    return (
      <div className="text-center py-12">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">暂无作品</h3>
        <p className="mt-1 text-sm text-gray-500">
          {searchTerm ? `没有找到包含 "${searchTerm}" 的作品` : '还没有发布任何作品'}
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {portfolios.map((portfolio) => (
        <PortfolioCard 
          key={portfolio.id} 
          portfolio={portfolio} 
          showAuthor={showAuthor}
          searchTerm={searchTerm}
        />
      ))}
    </div>
  )
}

interface PortfolioCardProps {
  portfolio: Portfolio
  showAuthor?: boolean
  searchTerm?: string
}

// Helper function to highlight search terms
function highlightText(text: string, searchTerm?: string) {
  if (!searchTerm || !text) return text
  
  const regex = new RegExp(`(${searchTerm})`, 'gi')
  const parts = text.split(regex)
  
  return parts.map((part, index) => 
    regex.test(part) ? (
      <mark key={index} className="bg-yellow-200 text-yellow-900 px-1 rounded">
        {part}
      </mark>
    ) : part
  )
}

function PortfolioCard({ portfolio, showAuthor = false, searchTerm }: PortfolioCardProps) {
  return (
    <div className="group bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200">
      {/* Portfolio Image */}
      <Link to={`/portfolio/${portfolio.id}`} className="block">
        <div className="relative w-full h-48 bg-gray-200 overflow-hidden">
          <img
            src={portfolio.image_url}
            alt={portfolio.title}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
            loading="lazy"
            onError={(e) => {
              const target = e.target as HTMLImageElement
              target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzlDQTNBRiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPuaXoOazleWKoOi9veWbvueJhzwvdGV4dD48L3N2Zz4='
            }}
          />
        </div>
      </Link>

      {/* Portfolio Info */}
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <Link to={`/portfolio/${portfolio.id}`}>
              <h3 className="text-lg font-semibold text-gray-900 truncate group-hover:text-primary-600 transition-colors">
                {highlightText(portfolio.title, searchTerm)}
              </h3>
            </Link>
            
            {portfolio.description && (
              <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                {highlightText(portfolio.description, searchTerm)}
              </p>
            )}

            {/* Tags */}
            {portfolio.tags && portfolio.tags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {portfolio.tags.slice(0, 3).map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                  >
                    {tag}
                  </span>
                ))}
                {portfolio.tags.length > 3 && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    +{portfolio.tags.length - 3}
                  </span>
                )}
              </div>
            )}

            {/* Author Info (if showAuthor is true) */}
            {showAuthor && (portfolio as any).profiles && (
              <div className="mt-3 flex items-center">
                <div className="flex-shrink-0">
                  {(portfolio as any).profiles.avatar_url ? (
                    <img
                      src={(portfolio as any).profiles.avatar_url}
                      alt={(portfolio as any).profiles.username}
                      className="w-6 h-6 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="ml-2">
                  <p className="text-sm font-medium text-gray-900">
                    {(portfolio as any).profiles.full_name || (portfolio as any).profiles.username}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Featured Badge */}
          {portfolio.is_featured && (
            <div className="flex-shrink-0 ml-2">
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                精选
              </span>
            </div>
          )}
        </div>

        {/* Stats and Actions */}
        <div className="mt-3 flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              {portfolio.view_count}
            </div>
            
            {/* Like Button */}
            <div onClick={(e) => e.stopPropagation()}>
              <LikeButton
                portfolioId={portfolio.id}
                size="sm"
                showCount={true}
                className="text-xs"
              />
            </div>
          </div>
          
          <div className="text-xs">
            {new Date(portfolio.created_at).toLocaleDateString('zh-CN')}
          </div>
        </div>
      </div>
    </div>
  )
}