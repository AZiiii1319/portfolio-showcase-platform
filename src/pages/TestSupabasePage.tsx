import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function TestSupabasePage() {
  const [status, setStatus] = useState('测试中...')
  const [error, setError] = useState('')

  useEffect(() => {
    testConnection()
  }, [])

  const testConnection = async () => {
    try {
      // 测试基本连接
      const { data, error } = await supabase
        .from('profiles')
        .select('count')
        .limit(1)

      if (error) {
        setError(`数据库连接错误: ${error.message}`)
        setStatus('连接失败')
      } else {
        setStatus('连接成功！')
      }
    } catch (err: any) {
      setError(`连接错误: ${err.message}`)
      setStatus('连接失败')
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Supabase 连接测试</h1>
      
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="mb-4">
          <strong>连接状态:</strong> {status}
        </div>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            <strong>错误信息:</strong> {error}
          </div>
        )}
        
        <div className="mt-6 text-sm text-gray-600">
          <p><strong>Supabase URL:</strong> {import.meta.env.VITE_SUPABASE_URL}</p>
          <p><strong>Anon Key:</strong> {import.meta.env.VITE_SUPABASE_ANON_KEY ? '已配置' : '未配置'}</p>
        </div>
        
        <button 
          onClick={testConnection}
          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          重新测试
        </button>
      </div>
    </div>
  )
}