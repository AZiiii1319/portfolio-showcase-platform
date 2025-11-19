import { useState, useRef } from 'react'
import { supabaseService } from '../../lib/supabaseService'
import { useAuth } from '../../contexts/AuthContext'
import type { Portfolio, InsertPortfolio, UpdatePortfolio } from '../../types/database'
import { PORTFOLIO_CATEGORIES } from '../../types/database'

interface PortfolioFormProps {
  portfolio?: Portfolio
  onSave: (portfolio: Portfolio) => void
  onCancel: () => void
}

export function PortfolioForm({ portfolio, onSave, onCancel }: PortfolioFormProps) {
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    title: portfolio?.title || '',
    description: portfolio?.description || '',
    category: portfolio?.category || '',
    tags: portfolio?.tags?.join(', ') || '',
    image_url: portfolio?.image_url || ''
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(portfolio?.image_url || null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const isEditing = !!portfolio

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) {
      newErrors.title = '作品标题不能为空'
    } else if (formData.title.length > 100) {
      newErrors.title = '作品标题不能超过100个字符'
    }

    if (!formData.category) {
      newErrors.category = '请选择作品分类'
    }

    if (!formData.image_url && !imagePreview) {
      newErrors.image = '请上传作品图片'
    }

    if (formData.description && formData.description.length > 1000) {
      newErrors.description = '作品描述不能超过1000个字符'
    }

    // Validate tags
    if (formData.tags) {
      const tags = formData.tags.split(',').map(tag => tag.trim()).filter(Boolean)
      if (tags.length > 10) {
        newErrors.tags = '标签数量不能超过10个'
      }
      if (tags.some(tag => tag.length > 20)) {
        newErrors.tags = '单个标签不能超过20个字符'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setErrors(prev => ({ ...prev, image: '请选择图片文件' }))
      return
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, image: '图片大小不能超过 10MB' }))
      return
    }

    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)

    // Upload file
    handleImageUpload(file)
  }

  const handleImageUpload = async (file: File) => {
    if (!user) return

    try {
      setUploading(true)
      setErrors(prev => ({ ...prev, image: '' }))
      
      // Upload to Supabase Storage
      const imageUrl = await supabaseService.uploadPortfolioImage(file, user.id)
      
      setFormData(prev => ({ ...prev, image_url: imageUrl }))
      
    } catch (error: any) {
      console.error('Error uploading image:', error)
      setErrors(prev => ({ ...prev, image: '图片上传失败：' + (error.message || '未知错误') }))
      setImagePreview(null)
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm() || !user) return

    try {
      setLoading(true)
      
      const tags = formData.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(Boolean)

      if (isEditing && portfolio) {
        // Update existing portfolio
        const updates: UpdatePortfolio = {
          title: formData.title.trim(),
          description: formData.description.trim() || null,
          category: formData.category,
          image_url: formData.image_url,
          tags: tags.length > 0 ? tags : null
        }

        const updatedPortfolio = await supabaseService.updatePortfolio(portfolio.id, updates)
        onSave(updatedPortfolio)
      } else {
        // Create new portfolio
        const newPortfolio: InsertPortfolio = {
          user_id: user.id,
          title: formData.title.trim(),
          description: formData.description.trim() || null,
          category: formData.category,
          image_url: formData.image_url,
          tags: tags.length > 0 ? tags : null
        }

        const createdPortfolio = await supabaseService.createPortfolio(newPortfolio)
        onSave(createdPortfolio)
      }
    } catch (error: any) {
      console.error('Error saving portfolio:', error)
      setErrors({ submit: error.message || '保存失败，请稍后重试' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Image Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          作品图片 *
        </label>
        
        <div className="space-y-4">
          {/* Image Preview */}
          {imagePreview && (
            <div className="relative">
              <img
                src={imagePreview}
                alt="作品预览"
                className="w-full h-64 object-cover rounded-lg border border-gray-300"
              />
              {uploading && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                  <div className="text-white text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                    <p className="text-sm">上传中...</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Upload Button */}
          <div className="flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-gray-400 transition-colors">
            <div className="space-y-1 text-center">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 48 48"
              >
                <path
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <div className="flex text-sm text-gray-600">
                <label
                  htmlFor="image-upload"
                  className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500"
                >
                  <span>{imagePreview ? '更换图片' : '上传图片'}</span>
                  <input
                    ref={fileInputRef}
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="sr-only"
                    disabled={uploading}
                  />
                </label>
                <p className="pl-1">或拖拽到此处</p>
              </div>
              <p className="text-xs text-gray-500">PNG, JPG, GIF 最大 10MB</p>
            </div>
          </div>
        </div>

        {errors.image && (
          <p className="mt-1 text-sm text-red-600">{errors.image}</p>
        )}
      </div>

      {/* Title */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
          作品标题 *
        </label>
        <input
          type="text"
          id="title"
          value={formData.title}
          onChange={(e) => handleInputChange('title', e.target.value)}
          className={`input mt-1 ${errors.title ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
          placeholder="请输入作品标题"
          disabled={loading}
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-600">{errors.title}</p>
        )}
      </div>

      {/* Category */}
      <div>
        <label htmlFor="category" className="block text-sm font-medium text-gray-700">
          作品分类 *
        </label>
        <select
          id="category"
          value={formData.category}
          onChange={(e) => handleInputChange('category', e.target.value)}
          className={`input mt-1 ${errors.category ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
          disabled={loading}
        >
          <option value="">请选择分类</option>
          {PORTFOLIO_CATEGORIES.map((category) => (
            <option key={category.value} value={category.value}>
              {category.label}
            </option>
          ))}
        </select>
        {errors.category && (
          <p className="mt-1 text-sm text-red-600">{errors.category}</p>
        )}
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          作品描述
        </label>
        <textarea
          id="description"
          rows={4}
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          className={`input mt-1 ${errors.description ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
          placeholder="描述一下你的作品..."
          disabled={loading}
        />
        <div className="mt-1 flex justify-between">
          {errors.description ? (
            <p className="text-sm text-red-600">{errors.description}</p>
          ) : (
            <div></div>
          )}
          <p className="text-sm text-gray-500">
            {formData.description.length}/1000
          </p>
        </div>
      </div>

      {/* Tags */}
      <div>
        <label htmlFor="tags" className="block text-sm font-medium text-gray-700">
          标签
        </label>
        <input
          type="text"
          id="tags"
          value={formData.tags}
          onChange={(e) => handleInputChange('tags', e.target.value)}
          className={`input mt-1 ${errors.tags ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
          placeholder="用逗号分隔多个标签，如：设计, UI, 插画"
          disabled={loading}
        />
        {errors.tags ? (
          <p className="mt-1 text-sm text-red-600">{errors.tags}</p>
        ) : (
          <p className="mt-1 text-sm text-gray-500">
            最多10个标签，每个标签不超过20个字符
          </p>
        )}
      </div>

      {/* Submit Error */}
      {errors.submit && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {errors.submit}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="btn-outline"
          disabled={loading}
        >
          取消
        </button>
        <button
          type="submit"
          className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={loading || uploading || !formData.image_url}
        >
          {loading ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              {isEditing ? '更新中...' : '创建中...'}
            </div>
          ) : (
            isEditing ? '更新作品' : '创建作品'
          )}
        </button>
      </div>
    </form>
  )
}