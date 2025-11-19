import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { PortfolioGrid } from '../components/portfolio/PortfolioGrid'
import { SearchBar } from '../components/common/SearchBar'
import { CategoryFilter } from '../components/common/CategoryFilter'
import { LoadingSpinner } from '../components/common/LoadingSpinner'
import { Pagination } from '../components/common/Pagination'
import type { Portfolio } from '../types/database'

const PORTFOLIOS_PER_PAGE = 12

export function HomePage() {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPortfolios, setTotalPortfolios] = useState(0)
  const [featuredPortfolios, setFeaturedPortfolios] = useState<Portfolio[]>([])
  const [debugInfo, setDebugInfo] = useState<string[]>([])

  const addDebugInfo = (info: string) => {
    console.log('HomePage:', info)
    setDebugInfo(prev => [...prev, `${new Date().toLocaleTimeString()}: ${info}`])
  }

  const totalPages = Math.ceil(totalPortfolios / PORTFOLIOS_PER_PAGE)

  const loadPortfolios = useCallback(async (page: number = 1, search: string = '', category: string = '') => {
    try {
      setLoading(true)
      setError('')
      
      console.log('加载主页作品，页面:', page, '搜索:', search, '分类:', category)
      
      // 使用直接的 fetch API 获取作品数据
      let url = 'https://hcyjdbglurjhwvbpulkg.supabase.co/rest/v1/portfolios?select=*&order=created_at.desc'
      
      // 添加分类筛选
      if (category) {
        url += `&category=eq.${encodeURIComponent(category)}`
      }
      
      // 添加搜索筛选
      if (search) {
        url += `&or=(title.ilike.%${encodeURIComponent(search)}%,description.ilike.%${encodeURIComponent(search)}%)`
      }
      
      const response = await fetch(url, {
        headers: {
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjeWpkYmdsdXJqaHd2YnB1bGtnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI5OTg2NDksImV4cCI6MjA3ODU3NDY0OX0.x-_QeoYdFg9oGHRUGRXawHr3ZD1RUJWM8WqLf-DFH6E',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjeWpkYmdsdXJqaHd2YnB1bGtnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI5OTg2NDksImV4cCI6MjA3ODU3NDY0OX0.x-_QeoYdFg9oGHRUGRXawHr3ZD1RUJWM8WqLf-DFH6E'
        }
      })
      
      const allPortfolios = await response.json()
      console.log('获取到的作品数据:', allPortfolios?.length || 0, '个作品')
      
      if (!allPortfolios || !Array.isArray(allPortfolios)) {
        console.error('获取作品数据格式错误:', allPortfolios)
        setPortfolios([])
        setTotalPortfolios(0)
        return
      }
      
      // Calculate offset for pagination
      const offset = (page - 1) * PORTFOLIOS_PER_PAGE
      
      // Apply pagination on client side
      const paginatedPortfolios = allPortfolios.slice(offset, offset + PORTFOLIOS_PER_PAGE)
      
      setPortfolios(paginatedPortfolios)
      setTotalPortfolios(allPortfolios.length)
      
      console.log('设置作品数据:', paginatedPortfolios.length, '个作品，总数:', allPortfolios.length)
      
    } catch (err: any) {
      console.error('Error loading portfolios:', err)
      setError('加载作品失败')
    } finally {
      setLoading(false)
    }
  }, [])

  const loadFeaturedPortfolios = useCallback(async () => {
    try {
      console.log('加载精选作品...')
      
      // 使用直接的 fetch API 获取精选作品
      const response = await fetch('https://hcyjdbglurjhwvbpulkg.supabase.co/rest/v1/portfolios?select=*&is_featured=eq.true&order=created_at.desc&limit=6', {
        headers: {
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjeWpkYmdsdXJqaHd2YnB1bGtnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI5OTg2NDksImV4cCI6MjA3ODU3NDY0OX0.x-_QeoYdFg9oGHRUGRXawHr3ZD1RUJWM8WqLf-DFH6E',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjeWpkYmdsdXJqaHd2YnB1bGtnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI5OTg2NDksImV4cCI6MjA3ODU3NDY0OX0.x-_QeoYdFg9oGHRUGRXawHr3ZD1RUJWM8WqLf-DFH6E'
        }
      })
      
      const featured = await response.json()
      console.log('获取到的精选作品:', featured?.length || 0, '个')
      
      if (featured && Array.isArray(featured)) {
        setFeaturedPortfolios(featured)
      } else {
        setFeaturedPortfolios([])
      }
    } catch (err: any) {
      console.error('Error loading featured portfolios:', err)
      setFeaturedPortfolios([])
    }
  }, [])

  useEffect(() => {
    addDebugInfo('组件已挂载，开始加载数据...')
    loadFeaturedPortfolios()
  }, [loadFeaturedPortfolios])

  useEffect(() => {
    addDebugInfo(`开始加载作品，页面: ${currentPage}, 搜索: ${searchTerm}, 分类: ${selectedCategory}`)
    loadPortfolios(currentPage, searchTerm, selectedCategory)
  }, [loadPortfolios, currentPage, searchTerm, selectedCategory])

  const handleSearch = useCallback((search: string) => {
    setSearchTerm(search)
    setCurrentPage(1) // Reset to first page when searching
  }, [])

  const handleCategoryChange = useCallback((category: string) => {
    setSelectedCategory(category)
    setCurrentPage(1) // Reset to first page when filtering
  }, [])

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page)
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          发现优秀作品
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          探索创作者们的精彩作品，分享你的创意灵感
        </p>
      </div>

      {/* Featured Portfolios Section */}
      {featuredPortfolios.length > 0 && !searchTerm && !selectedCategory && (
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">精选作品</h2>
            <div className="flex items-center text-yellow-600">
              <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="text-sm font-medium">编辑推荐</span>
            </div>
          </div>
          <PortfolioGrid portfolios={featuredPortfolios} showAuthor={true} />
        </div>
      )}

      {/* Search and Filter Section */}
      <div className="mb-8 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex-1 max-w-md">
            <SearchBar 
              onSearch={handleSearch}
              placeholder="搜索作品标题或描述..."
              initialValue={searchTerm}
            />
          </div>
          
          {/* Results count */}
          <div className="text-sm text-gray-600">
            {loading ? (
              <div className="flex items-center">
                <LoadingSpinner size="sm" className="mr-2" />
                搜索中...
              </div>
            ) : (
              <span>
                {searchTerm || selectedCategory ? (
                  <>找到 {totalPortfolios} 个作品</>
                ) : (
                  <>共 {totalPortfolios} 个作品</>
                )}
              </span>
            )}
          </div>
        </div>

        {/* Category Filter */}
        <CategoryFilter 
          selectedCategory={selectedCategory}
          onCategoryChange={handleCategoryChange}
        />
      </div>

      {/* Loading State */}
      {loading && (
        <div className="space-y-6">
          {/* 显示调试信息 */}
          {debugInfo.length > 0 && (
            <div className="bg-gray-100 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">调试信息:</h3>
              <div className="space-y-1 text-sm font-mono">
                {debugInfo.map((info, index) => (
                  <div key={index} className="text-gray-700">{info}</div>
                ))}
              </div>
              
              {/* 手动完成加载按钮 */}
              <div className="mt-4">
                <button 
                  onClick={() => {
                    addDebugInfo('手动设置 loading = false')
                    setLoading(false)
                  }}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  手动完成加载
                </button>
                <p className="text-sm text-gray-600 mt-2">
                  如果数据加载卡住，点击此按钮强制完成加载
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  当前作品数量: {portfolios.length}，精选作品: {featuredPortfolios.length}
                </p>
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div key={item} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden animate-pulse">
                <div className="h-48 bg-gray-200"></div>
                <div className="p-4">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="text-center py-12">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md max-w-md mx-auto">
            {error}
            <button 
              onClick={() => loadPortfolios(currentPage, searchTerm, selectedCategory)}
              className="ml-2 text-red-800 underline hover:no-underline"
            >
              重试
            </button>
          </div>
        </div>
      )}

      {/* Portfolio Grid */}
      {!loading && !error && (
        <>
          {portfolios.length > 0 ? (
            <div className="space-y-8">
              <PortfolioGrid 
                portfolios={portfolios} 
                showAuthor={true} 
                searchTerm={searchTerm}
              />
              
              {/* Pagination */}
              {totalPages > 1 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                  className="mt-8"
                />
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                {searchTerm || selectedCategory ? '没有找到匹配的作品' : '还没有作品'}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || selectedCategory ? (
                  <>
                    尝试调整搜索条件或
                    <button 
                      onClick={() => {
                        setSearchTerm('')
                        setSelectedCategory('')
                      }}
                      className="text-primary-600 hover:text-primary-500 ml-1"
                    >
                      清除筛选
                    </button>
                  </>
                ) : (
                  '成为第一个分享作品的用户吧！'
                )}
              </p>
              {!searchTerm && !selectedCategory && (
                <div className="mt-6">
                  <Link
                    to="/start-creating"
                    className="btn-primary"
                  >
                    开始创作
                  </Link>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Call to Action (only show when there are portfolios and no search/filter) */}
      {!loading && !error && portfolios.length > 0 && !searchTerm && !selectedCategory && (
        <div className="text-center mt-12 pt-8 border-t border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            准备展示你的作品了吗？
          </h3>
          <p className="text-gray-600 mb-4">
            加入我们的创作者社区，分享你的精彩作品
          </p>
          <Link
            to="/start-creating"
            className="btn-primary"
          >
            开始创作
          </Link>
        </div>
      )}
    </div>
  )
}