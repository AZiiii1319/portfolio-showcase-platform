import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

export function HomePageSimple() {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 模拟加载过程
    const timer = setTimeout(() => {
      setLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            发现优秀作品
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            探索创作者们的精彩作品，分享你的创意灵感
          </p>
        </div>
        
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">正在加载作品...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          发现优秀作品
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          探索创作者们的精彩作品，分享你的创意灵感
        </p>
      </div>
      
      <div className="text-center py-12">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">还没有作品</h3>
        <p className="mt-1 text-sm text-gray-500">成为第一个分享作品的用户吧！</p>
        <div className="mt-6">
          <Link
            to="/register"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
          >
            立即注册
          </Link>
        </div>
      </div>
    </div>
  )
}