import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabaseService } from '../lib/supabaseService'
import type { Portfolio } from '../types/database'
import { PortfolioForm } from '../components/portfolio/PortfolioForm'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { useToast } from '../hooks/useToast'
import { Toast } from '../components/ui/Toast'

export function PortfolioManagePage() {
  const { user } = useAuth()
  const [portfolios, setPortfolios] = useState<Portfolio[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingPortfolio, setEditingPortfolio] = useState<Portfolio | null>(null)
  const [deletingPortfolio, setDeletingPortfolio] = useState<Portfolio | null>(null)
  const { toasts, success, error: showError, removeToast } = useToast()

  useEffect(() => {
    if (user) {
      loadPortfolios()
    }
  }, [user])

  const loadPortfolios = async () => {
    if (!user) return

    try {
      setLoading(true)
      setError('')
      
      const data = await supabaseService.getPortfolios({ userId: user.id })
      setPortfolios(data)
    } catch (err: any) {
      console.error('Error loading portfolios:', err)
      setError('加载作品失败')
    } finally {
      setLoading(false)
    }
  }

  const handleCreatePortfolio = (portfolio: Portfolio) => {
    setPortfolios(prev => [portfolio, ...prev])
    setShowCreateForm(false)
    success('作品创建成功！')
  }

  const handleUpdatePortfolio = (updatedPortfolio: Portfolio) => {
    setPortfolios(prev => 
      prev.map(p => p.id === updatedPortfolio.id ? updatedPortfolio : p)
    )
    setEditingPortfolio(null)
    success('作品更新成功！')
  }

  const handleDeletePortfolio = async (portfolio: Portfolio) => {
    try {
      await supabaseService.deletePortfolio(portfolio.id)
      setPortfolios(prev => prev.filter(p => p.id !== portfolio.id))
      setDeletingPortfolio(null)
      success('作品删除成功！')
    } catch (err: any) {
      console.error('Error deleting portfolio:', err)
      showError('删除作品失败：' + (err.message || '未知错误'))
    }
  }

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">请先登录</h2>
          <Link to="/login" className="btn-primary">
            立即登录
          </Link>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <>
      {/* Toast Notifications */}
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={() => removeToast(toast.id)}
        />
      ))}

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">作品管理</h1>
            <p className="mt-2 text-gray-600">管理您的作品集</p>
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="btn-primary"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            创建作品
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
            {error}
          </div>
        )}

        {/* Create Form Modal */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">创建新作品</h2>
                <PortfolioForm
                  onSave={handleCreatePortfolio}
                  onCancel={() => setShowCreateForm(false)}
                />
              </div>
            </div>
          </div>
        )}

        {/* Edit Form Modal */}
        {editingPortfolio && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">编辑作品</h2>
                <PortfolioForm
                  portfolio={editingPortfolio}
                  onSave={handleUpdatePortfolio}
                  onCancel={() => setEditingPortfolio(null)}
                />
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Dialog */}
        {deletingPortfolio && (
          <ConfirmDialog
            title="删除作品"
            message={`确定要删除作品"${deletingPortfolio.title}"吗？此操作无法撤销。`}
            confirmText="删除"
            cancelText="取消"
            onConfirm={() => handleDeletePortfolio(deletingPortfolio)}
            onCancel={() => setDeletingPortfolio(null)}
            type="danger"
          />
        )}

        {/* Portfolio List */}
        {portfolios.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {portfolios.map((portfolio) => (
              <PortfolioManageCard
                key={portfolio.id}
                portfolio={portfolio}
                onEdit={setEditingPortfolio}
                onDelete={setDeletingPortfolio}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">还没有作品</h3>
            <p className="mt-1 text-sm text-gray-500">开始创建您的第一个作品吧！</p>
            <div className="mt-6">
              <button
                onClick={() => setShowCreateForm(true)}
                className="btn-primary"
              >
                创建作品
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

interface PortfolioManageCardProps {
  portfolio: Portfolio
  onEdit: (portfolio: Portfolio) => void
  onDelete: (portfolio: Portfolio) => void
}

function PortfolioManageCard({ portfolio, onEdit, onDelete }: PortfolioManageCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Portfolio Image */}
      <div className="aspect-w-16 aspect-h-9">
        <img
          src={portfolio.image_url}
          alt={portfolio.title}
          className="w-full h-48 object-cover"
        />
      </div>

      {/* Portfolio Info */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900 truncate flex-1">
            {portfolio.title}
          </h3>
          {portfolio.is_featured && (
            <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
              精选
            </span>
          )}
        </div>

        {portfolio.description && (
          <p className="text-sm text-gray-600 line-clamp-2 mb-3">
            {portfolio.description}
          </p>
        )}

        {/* Tags */}
        {portfolio.tags && portfolio.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
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

        {/* Stats */}
        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              {portfolio.view_count}
            </div>
          </div>
          
          <div className="text-xs">
            {new Date(portfolio.created_at).toLocaleDateString('zh-CN')}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2">
          <Link
            to={`/portfolio/${portfolio.id}`}
            className="flex-1 btn-outline text-center text-sm"
          >
            查看
          </Link>
          <button
            onClick={() => onEdit(portfolio)}
            className="flex-1 btn-outline text-sm"
          >
            编辑
          </button>
          <button
            onClick={() => onDelete(portfolio)}
            className="px-3 py-2 border border-red-300 text-red-700 bg-white hover:bg-red-50 text-sm font-medium rounded-md transition-colors"
          >
            删除
          </button>
        </div>
      </div>
    </div>
  )
}