import { supabase } from '../lib/supabase'

export async function testSupabaseConnection() {
  try {
    console.log('开始测试 Supabase 连接...')
    
    // 测试基本连接
    const { data, error } = await supabase
      .from('portfolios')
      .select('count')
      .limit(1)
    
    if (error) {
      console.error('Supabase 连接失败:', error)
      return { success: false, error: error.message }
    }
    
    console.log('Supabase 连接成功!')
    return { success: true, data }
    
  } catch (err) {
    console.error('测试连接时发生错误:', err)
    return { success: false, error: err instanceof Error ? err.message : '未知错误' }
  }
}

export async function testPortfolioQuery() {
  try {
    console.log('测试作品查询...')
    
    const { data, error } = await supabase
      .from('portfolios')
      .select('id, title, user_id')
      .limit(5)
    
    if (error) {
      console.error('作品查询失败:', error)
      return { success: false, error: error.message }
    }
    
    console.log('作品查询成功:', data)
    return { success: true, data }
    
  } catch (err) {
    console.error('查询作品时发生错误:', err)
    return { success: false, error: err instanceof Error ? err.message : '未知错误' }
  }
}