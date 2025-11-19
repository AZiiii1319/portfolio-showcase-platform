import { useState, useRef } from 'react'
import { supabaseService } from '../../lib/supabaseService'
import { useAuth } from '../../contexts/AuthContext'

interface AvatarUploadProps {
  currentAvatarUrl: string | null
  onAvatarUpdate: (avatarUrl: string) => Promise<void>
  canEdit: boolean
  size?: 'small' | 'medium' | 'large'
}

export function AvatarUpload({ 
  currentAvatarUrl, 
  onAvatarUpdate, 
  canEdit, 
  size = 'medium' 
}: AvatarUploadProps) {
  const { user } = useAuth()
  const [uploading, setUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const sizeClasses = {
    small: 'w-16 h-16',
    medium: 'w-24 h-24',
    large: 'w-32 h-32'
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('请选择图片文件')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('图片大小不能超过 5MB')
      return
    }

    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string)
    }
    reader.readAsDataURL(file)

    // Upload file
    handleUpload(file)
  }

  const handleUpload = async (file: File) => {
    if (!user) return

    try {
      setUploading(true)
      
      // Upload to Supabase Storage
      const avatarUrl = await supabaseService.uploadAvatar(user.id, file)
      
      // Update profile with new avatar URL
      await onAvatarUpdate(avatarUrl)
      
      // Clear preview
      setPreviewUrl(null)
      
    } catch (error: any) {
      console.error('Error uploading avatar:', error)
      alert('头像上传失败：' + (error.message || '未知错误'))
      setPreviewUrl(null)
    } finally {
      setUploading(false)
    }
  }

  const handleClick = () => {
    if (canEdit && fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const displayUrl = previewUrl || currentAvatarUrl

  return (
    <div className="relative">
      <div 
        className={`${sizeClasses[size]} rounded-full overflow-hidden bg-gray-200 ${
          canEdit ? 'cursor-pointer hover:opacity-75 transition-opacity' : ''
        }`}
        onClick={handleClick}
      >
        {displayUrl ? (
          <img
            src={displayUrl}
            alt="头像"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
          </div>
        )}
        
        {/* Upload overlay */}
        {canEdit && (
          <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
            <svg className="w-6 h-6 text-white opacity-0 hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
        )}
        
        {/* Loading overlay */}
        {uploading && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
          </div>
        )}
      </div>

      {/* Upload button for larger sizes */}
      {canEdit && size === 'large' && (
        <button
          onClick={handleClick}
          disabled={uploading}
          className="mt-3 btn-outline text-sm w-full disabled:opacity-50"
        >
          {uploading ? '上传中...' : '更换头像'}
        </button>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        disabled={!canEdit || uploading}
      />
    </div>
  )
}