import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export function RegisterPage() {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [usernameError, setUsernameError] = useState('')
  const [emailError, setEmailError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [confirmPasswordError, setConfirmPasswordError] = useState('')

  const { signUp } = useAuth()
  const navigate = useNavigate()

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

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!email) {
      return '邮箱地址不能为空'
    }
    if (!emailRegex.test(email)) {
      return '请输入有效的邮箱地址'
    }
    return ''
  }

  const validatePassword = (password: string) => {
    if (!password) {
      return '密码不能为空'
    }
    if (password.length < 6) {
      return '密码至少需要6个字符'
    }
    if (password.length > 50) {
      return '密码不能超过50个字符'
    }
    return ''
  }

  const validateConfirmPassword = (confirmPassword: string, password: string) => {
    if (!confirmPassword) {
      return '请确认密码'
    }
    if (confirmPassword !== password) {
      return '两次输入的密码不一致'
    }
    return ''
  }

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setUsername(value)
    setUsernameError(validateUsername(value))
    setError('')
  }

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setEmail(value)
    setEmailError(validateEmail(value))
    setError('')
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setPassword(value)
    setPasswordError(validatePassword(value))
    if (confirmPassword) {
      setConfirmPasswordError(validateConfirmPassword(confirmPassword, value))
    }
    setError('')
  }

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setConfirmPassword(value)
    setConfirmPasswordError(validateConfirmPassword(value, password))
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate all fields
    const usernameValidationError = validateUsername(username)
    const emailValidationError = validateEmail(email)
    const passwordValidationError = validatePassword(password)
    const confirmPasswordValidationError = validateConfirmPassword(confirmPassword, password)
    
    setUsernameError(usernameValidationError)
    setEmailError(emailValidationError)
    setPasswordError(passwordValidationError)
    setConfirmPasswordError(confirmPasswordValidationError)
    
    if (usernameValidationError || emailValidationError || passwordValidationError || confirmPasswordValidationError) {
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      await signUp(email, password, username)
      setSuccess('注册成功！请检查您的邮箱并点击验证链接完成注册。')
      // Don't navigate immediately, let user see the success message
      setTimeout(() => {
        navigate('/login')
      }, 3000)
    } catch (err: any) {
      console.error('Registration error:', err)
      if (err.message.includes('User already registered')) {
        setError('该邮箱已被注册，请使用其他邮箱或直接登录')
      } else if (err.message.includes('Password should be at least 6 characters')) {
        setError('密码至少需要6个字符')
      } else if (err.message.includes('Unable to validate email address')) {
        setError('邮箱地址格式不正确')
      } else {
        setError(err.message || '注册失败，请稍后重试')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            创建新账户
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
              {error}
            </div>
          )}
          
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
              {success}
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                用户名
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                value={username}
                onChange={handleUsernameChange}
                className={`input mt-1 ${usernameError ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                placeholder="请输入用户名"
                disabled={loading}
              />
              {usernameError && (
                <p className="mt-1 text-sm text-red-600">{usernameError}</p>
              )}
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                邮箱地址
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={handleEmailChange}
                className={`input mt-1 ${emailError ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                placeholder="请输入邮箱地址"
                disabled={loading}
              />
              {emailError && (
                <p className="mt-1 text-sm text-red-600">{emailError}</p>
              )}
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                密码
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={handlePasswordChange}
                className={`input mt-1 ${passwordError ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                placeholder="请输入密码"
                disabled={loading}
              />
              {passwordError && (
                <p className="mt-1 text-sm text-red-600">{passwordError}</p>
              )}
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                确认密码
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                value={confirmPassword}
                onChange={handleConfirmPasswordChange}
                className={`input mt-1 ${confirmPasswordError ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                placeholder="请再次输入密码"
                disabled={loading}
              />
              {confirmPasswordError && (
                <p className="mt-1 text-sm text-red-600">{confirmPasswordError}</p>
              )}
            </div>
          </div>

          <div>
            <button 
              type="submit" 
              className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  注册中...
                </div>
              ) : (
                '注册'
              )}
            </button>
          </div>

          <div className="text-center">
            <span className="text-sm text-gray-600">
              已有账户？{' '}
              <Link to="/login" className="text-primary-600 hover:text-primary-500">
                立即登录
              </Link>
            </span>
          </div>
        </form>
      </div>
    </div>
  )
}