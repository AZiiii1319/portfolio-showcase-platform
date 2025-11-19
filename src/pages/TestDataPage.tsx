import { useState, useEffect } from 'react'
import { LoadingSpinner } from '../components/common/LoadingSpinner'
import type { Portfolio } from '../types/database'

export function TestDataPage() {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [debugInfo, setDebugInfo] = useState<string[]>([])

  const addDebugInfo = (info: string) => {
    console.log(info)
    setDebugInfo(prev => [...prev, `${new Date().toLocaleTimeString()}: ${info}`])
  }

  useEffect(() => {
    addDebugInfo('组件已挂载，开始加载数据...')
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      addDebugInfo('开始 loadData 函数')
      
      // 添加延迟来测试是否进入了这个函数
      await new Promise(resolve => setTimeout(resolve, 1000))
      addDebugInfo('延迟测试完成')
      
      // 尝试直接 fetch API 作为备用测试
      addDebugInfo('尝试直接 fetch API...')
      try {
        const response = await fetch('https://hcyjdbglurjhwvbpulkg.supabase.co/rest/v1/portfolios?select=id,title&limit=3', {
          headers: {
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjeWpkYmdsdXJqaHd2YnB1bGtnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI5OTg2NDksImV4cCI6MjA3ODU3NDY0OX0.x-_QeoYdFg9oGHRUGRXawHr3ZD1RUJWM8WqLf-DFH6E',
            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjeWpkYmdsdXJqaHd2YnB1bGtnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI5OTg2NDksImV4cCI6MjA3ODU3NDY0OX0.x-_QeoYdFg9oGHRUGRXawHr3ZD1RUJWM8WqLf-DFH6E'
          }
        })
        const fetchData = await response.json()
        addDebugInfo(`直接 fetch 结果: ${JSON.stringify(fetchData)}`)
        
        // 如果 fetch 成功，获取完整数据
        if (fetchData && Array.isArray(fetchData) && fetchData.length > 0) {
          addDebugInfo('fetch 成功，获取完整作品数据...')
          const fullResponse = await fetch('https://hcyjdbglurjhwvbpulkg.supabase.co/rest/v1/portfolios?select=*&order=created_at.desc', {
            headers: {
              'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjeWpkYmdsdXJqaHd2YnB1bGtnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI5OTg2NDksImV4cCI6MjA3ODU3NDY0OX0.x-_QeoYdFg9oGHRUGRXawHr3ZD1RUJWM8WqLf-DFH6E',
              'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjeWpkYmdsdXJqaHd2YnB1bGtnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI5OTg2NDksImV4cCI6MjA3ODU3NDY0OX0.x-_QeoYdFg9oGHRUGRXawHr3ZD1RUJWM8WqLf-DFH6E'
            }
          })
          const allPortfolios = await fullResponse.json()
          addDebugInfo(`获取到 ${allPortfolios?.length || 0} 个完整作品`)
          
          if (allPortfolios && allPortfolios.length > 0) {
            addDebugInfo(`作品标题: ${allPortfolios.map(p => p.title).join(', ')}`)
            setPortfolios(allPortfolios)
          } else {
            addDebugInfo('警告: 完整数据为空')
            setPortfolios([])
          }
        } else {
          addDebugInfo('警告: fetch 返回空数据')
          setPortfolios([])
        }
      } catch (fetchError) {
        addDebugInfo(`直接 fetch 失败: ${fetchError}`)
        setPortfolios([])
      }
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '未知错误'
      addDebugInfo(`加载失败: ${errorMessage}`)
      setError(errorMessage)
    } finally {
      addDebugInfo('数据加载完成')
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">数据测试页面</h1>
        <LoadingSpinner size="lg" />
        <p className="mt-4">正在加载数据...</p>
        
        {/* 显示调试信息 */}
        {debugInfo.length > 0 && (
          <div className="mt-6 bg-gray-100 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">调试信息:</h3>
            <div className="space-y-1 text-sm font-mono">
              {debugInfo.map((info, index) => (
                <div key={index} className="text-gray-700">{info}</div>
              ))}
            </div>
            
            {/* 手动完成加载按钮 - 始终显示 */}
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
                当前作品数量: {portfolios.length}
              </p>
            </div>
          </div>
        )}
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">数据测试页面</h1>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <strong>错误:</strong> {error}
        </div>
        <button 
          onClick={loadData}
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          重新加载
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">数据测试页面</h1>
      
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">数据统计</h2>
        <p>总作品数: {portfolios.length}</p>
        <p>你的作品数: {portfolios.filter(p => p.user_id === '939907bc-b2aa-43fe-b11c-aa5abda460b3').length}</p>
      </div>

      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">所有作品列表</h2>
        {portfolios.length === 0 ? (
          <p className="text-gray-600">没有找到任何作品</p>
        ) : (
          <div className="space-y-4">
            {portfolios.map((portfolio) => (
              <div key={portfolio.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold">{portfolio.title}</h3>
                  <span className="text-sm text-gray-500">{portfolio.category}</span>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  作品ID: <code className="bg-gray-100 px-1 rounded">{portfolio.id}</code>
                </p>
                <p className="text-sm text-gray-600 mb-2">
                  用户ID: <code className="bg-gray-100 px-1 rounded">{portfolio.user_id}</code>
                </p>
                <p className="text-sm text-gray-600 mb-2">
                  浏览量: {portfolio.view_count} | 精选: {portfolio.is_featured ? '是' : '否'}
                </p>
                <p className="text-sm text-gray-700 line-clamp-2">
                  {portfolio.description}
                </p>
                <div className="mt-2">
                  <a 
                    href={`/portfolio/${portfolio.id}`}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    查看详情 →
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-8">
        <button 
          onClick={loadData}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          刷新数据
        </button>
      </div>
    </div>
  )
}