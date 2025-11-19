import { useState } from 'react'
import { supabaseService } from '../../lib/supabaseService'
import type { Profile } from '../../types/database'

interface ProfileEditFormProps {
  profile: Profile
  onSave: (updates: Partial<Profile>) => Promise<void>
  onCancel: () => void
}

export function ProfileEditForm({ profile, onSave, onCancel }: ProfileEditFormProps) {
  const [formData, setFormData] = useState({
    username: profile.username || '',
    full_name: profile.full_name || '',
    bio: profile.bio || '',
    website: profile.website || ''
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [checkingUsername, setCheckingUsername] = useState(false)

  const validateUsername = (username: string) => {
    if (!username) {
      return '用户名不能为空'
    }
    if (username.length < 3) {
      return '用户名至少需要3个字符'
    }
    if (username.length > 20) {
      return '用户名不能超过20个字符'
    }
    if (!/^[a-zA-Z0-9_\u4e00-\u9fa5]+$/.test(username)) {
      return '用户名只能包含字母、数字、下划线和中文'
    }
    return ''
  }

  const validateWebsite = (website: string) => {
    if (!website) return ''
    
    try {
      new URL(website)
      return ''
    } catch {
      return '请输入有效的网站地址'
    }
  }

  const checkUsernameAvailability = async (username: string) => {
    if (username === profile.username) return true
    
    try {
      setCheckingUsername(true)
      const isAvailable = await supabaseService.checkUsernameAvailability(username, profile.id)
      return isAvailable
    } catch (error) {
      console.error('Error checking username availability:', error)
      return false
    } finally {
      setCheckingUsername(false)
    }
  }

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleUsernameBlur = async () => {
    const username = formData.username.trim()
    const usernameError = validateUsername(username)
    
    if (usernameError) {
      setErrors(prev => ({ ...prev, username: usernameError }))
      return
    }

    if (username !== profile.username) {
      const isAvailable = await checkUsernameAvailability(username)
      if (!isAvailable) {
        setErrors(prev => ({ ...prev, username: '该用户名已被使用' }))
      }
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    // Validate username
    const usernameError = validateUsername(formData.username.trim())
    if (usernameError) {
      newErrors.username = usernameError
    }

    // Validate website
    const websiteError = validateWebsite(formData.website.trim())
    if (websiteError) {
      newErrors.website = websiteError
    }

    // Validate bio length
    if (formData.bio.length > 500) {
      newErrors.bio = '个人简介不能超过500个字符'
    }

    // Validate full name length
    if (formData.full_name.length > 50) {
      newErrors.full_name = '全名不能超过50个字符'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    // Check username availability one more time before saving
    if (formData.username !== profile.username) {
      const isAvailable = await checkUsernameAvailability(formData.username.trim())
      if (!isAvailable) {
        setErrors(prev => ({ ...prev, username: '该用户名已被使用' }))
        return
      }
    }

    try {
      setLoading(true)
      
      const updates: Partial<Profile> = {
        username: formData.username.trim(),
        full_name: formData.full_name.trim() || null,
        bio: formData.bio.trim() || null,
        website: formData.website.trim() || null
      }

      await onSave(updates)
    } catch (error: any) {
      console.error('Error saving profile:', error)
      setErrors({ submit: error.message || '保存失败，请稍后重试' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Username */}
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-gray-700">
            用户名 *
          </label>
          <div className="mt-1 relative">
            <input
              type="text"
              id="username"
              value={formData.username}
              onChange={(e) => handleInputChange('username', e.target.value)}
              onBlur={handleUsernameBlur}
              className={`input ${errors.username ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
              placeholder="请输入用户名"
              disabled={loading}
            />
            {checkingUsername && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
              </div>
            )}
          </div>
          {errors.username && (
            <p className="mt-1 text-sm text-red-600">{errors.username}</p>
          )}
        </div>

        {/* Full Name */}
        <div>
          <label htmlFor="full_name" className="block text-sm font-medium text-gray-700">
            全名
          </label>
          <input
            type="text"
            id="full_name"
            value={formData.full_name}
            onChange={(e) => handleInputChange('full_name', e.target.value)}
            className={`input mt-1 ${errors.full_name ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
            placeholder="请输入全名"
            disabled={loading}
          />
          {errors.full_name && (
            <p className="mt-1 text-sm text-red-600">{errors.full_name}</p>
          )}
        </div>
      </div>

      {/* Website */}
      <div>
        <label htmlFor="website" className="block text-sm font-medium text-gray-700">
          个人网站
        </label>
        <input
          type="url"
          id="website"
          value={formData.website}
          onChange={(e) => handleInputChange('website', e.target.value)}
          className={`input mt-1 ${errors.website ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
          placeholder="https://example.com"
          disabled={loading}
        />
        {errors.website && (
          <p className="mt-1 text-sm text-red-600">{errors.website}</p>
        )}
      </div>

      {/* Bio */}
      <div>
        <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
          个人简介
        </label>
        <textarea
          id="bio"
          rows={4}
          value={formData.bio}
          onChange={(e) => handleInputChange('bio', e.target.value)}
          className={`input mt-1 ${errors.bio ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
          placeholder="介绍一下自己..."
          disabled={loading}
        />
        <div className="mt-1 flex justify-between">
          {errors.bio ? (
            <p className="text-sm text-red-600">{errors.bio}</p>
          ) : (
            <div></div>
          )}
          <p className="text-sm text-gray-500">
            {formData.bio.length}/500
          </p>
        </div>
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
          disabled={loading || checkingUsername || Object.keys(errors).length > 0}
        >
          {loading ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              保存中...
            </div>
          ) : (
            '保存更改'
          )}
        </button>
      </div>
    </form>
  )
}