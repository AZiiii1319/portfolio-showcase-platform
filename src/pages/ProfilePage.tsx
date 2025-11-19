import { useState, useEffect, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabaseService } from '../lib/supabaseService'
import type { Profile, Portfolio } from '../types/database'
import { PortfolioGrid } from '../components/portfolio/PortfolioGrid'
import { ProfileEditForm } from '../components/profile/ProfileEditForm'
import { AvatarUpload } from '../components/profile/AvatarUpload'
import { useToast } from '../hooks/useToast'
import { Toast } from '../components/ui/Toast'

export function ProfilePage() {
  const { userId } = useParams<{ userId?: string }>()
  const { user, profile: currentUserProfile, refreshProfile } = useAuth()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [portfolios, setPortfolios] = useState<Portfolio[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [activeTab, setActiveTab] = useState<'portfolios' | 'about'>('portfolios')
  const { toasts, success, error: showError, removeToast } = useToast()

  // Determine if this is the current user's profile or someone else's
  const isOwnProfile = !userId || userId === user?.id
  const targetUserId = userId || user?.id

  useEffect(() => {
    loadProfileData()
  }, [targetUserId])

  const loadProfileData = async () => {
    if (!targetUserId) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError('')

      // Load profile data
      let profileData: Profile | null = null
      if (isOwnProfile && currentUserProfile) {
        profileData = currentUserProfile
      } else {
        profileData = await supabaseService.getProfile(targetUserId)
      }

      if (!profileData) {
        setError('用户资料未找到')
        return
      }

      setProfile(profileData)

      // Load user's portfolios
      const portfoliosData = await supabaseService.getPortfolios({
        userId: targetUserId
      })
      setPortfolios(portfoliosData)

    } catch (err: any) {
      console.error('Error loading profile data:', err)
      setError('加载用户资料失败')
    } finally {
      setLoading(false)
    }
  }

  const handleProfileUpdate = async (updates: Partial<Profile>) => {
    if (!user || !targetUserId) return

    try {
      await supabaseService.updateProfile(targetUserId, updates)
      
      // Refresh profile data
      if (isOwnProfile) {
        await refreshProfile()
      } else {
        await loadProfileData()
      }
      
      setIsEditing(false)
      success('个人资料更新成功！')
    } catch (err: any) {
      console.error('Error updating profile:', err)
      showError('更新个人资料失败：' + (err.message || '未知错误'))
      throw err
    }
  }

  const handleAvatarUpdate = async (avatarUrl: string) => {
    if (!user || !targetUserId) return

    try {
      await supabaseService.updateProfile(targetUserId, { avatar_url: avatarUrl })
      
      // Refresh profile data
      if (isOwnProfile) {
        await refreshProfile()
      } else {
        await loadProfileData()
      }
      
      success('头像更新成功！')
    } catch (err: any) {
      console.error('Error updating avatar:', err)
      showError('头像更新失败：' + (err.message || '未知错误'))
      throw err
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">用户未找到</h2>
          <p className="text-gray-600">请检查用户ID是否正确</p>
        </div>
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
        {/* Profile Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          {/* Avatar Section */}
          <div className="flex-shrink-0">
            <AvatarUpload
              currentAvatarUrl={profile.avatar_url}
              onAvatarUpdate={handleAvatarUpdate}
              canEdit={isOwnProfile}
              size="large"
            />
          </div>

          {/* Profile Info */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 truncate">
                  {profile.full_name || profile.username}
                </h1>
                {profile.full_name && (
                  <p className="text-lg text-gray-600">@{profile.username}</p>
                )}
                {profile.bio && (
                  <p className="mt-2 text-gray-700">{profile.bio}</p>
                )}
                {profile.website && (
                  <a
                    href={profile.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center text-primary-600 hover:text-primary-700"
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    访问网站
                  </a>
                )}
              </div>

              {/* Action Buttons */}
              {isOwnProfile && (
                <div className="mt-4 sm:mt-0 flex gap-2">
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="btn-outline"
                  >
                    {isEditing ? '取消编辑' : '编辑资料'}
                  </button>
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="mt-4 flex gap-6">
              <div className="text-center">
                <div className="text-xl font-bold text-gray-900">{portfolios.length}</div>
                <div className="text-sm text-gray-600">作品</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-gray-900">
                  {portfolios.reduce((sum, p) => sum + p.view_count, 0)}
                </div>
                <div className="text-sm text-gray-600">总浏览量</div>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Form */}
        {isEditing && isOwnProfile && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <ProfileEditForm
              profile={profile}
              onSave={handleProfileUpdate}
              onCancel={() => setIsEditing(false)}
            />
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('portfolios')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'portfolios'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              作品集 ({portfolios.length})
            </button>
            <button
              onClick={() => setActiveTab('about')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'about'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              关于
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'portfolios' && (
            <div>
              {portfolios.length > 0 ? (
                <PortfolioGrid portfolios={portfolios} />
              ) : (
                <div className="text-center py-12">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">
                    {isOwnProfile ? '还没有作品' : '该用户还没有发布作品'}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {isOwnProfile ? '开始创建您的第一个作品吧！' : ''}
                  </p>
                  {isOwnProfile && (
                    <div className="mt-6">
                      <Link to="/manage" className="btn-primary">
                        创建作品
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'about' && (
            <div className="prose max-w-none">
              {profile.bio ? (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">个人简介</h3>
                  <p className="text-gray-700 whitespace-pre-wrap">{profile.bio}</p>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">
                    {isOwnProfile ? '您还没有添加个人简介' : '该用户还没有添加个人简介'}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
    </>
  )
}