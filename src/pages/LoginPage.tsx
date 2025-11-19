import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [emailError, setEmailError] = useState('')
  const [passwordError, setPasswordError] = useState('')

  const { signIn } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const from = location.state?.from?.pathname || '/'

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
    return ''
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
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate all fields
    const emailValidationError = validateEmail(email)
    const passwordValidationError = validatePassword(password)
    
    setEmailError(emailValidationError)
    setPasswordError(passwordValidationError)
    
    if (emailValidationError || passwordValidationError) {
      return
    }

    setLoading(true)
    setError('')

    try {
      await signIn(email, password)
      navigate(from, { replace: true })
    } catch (err: any) {
      console.error('Login error:', err)
      if (err.message.includes('Invalid login credentials')) {
        setError('邮箱或密码错误，请检查后重试')
      } else if (err.message.includes('Email not confirmed')) {
        setError('请先验证您的邮箱地址')
      } else {
        setError(err.message || '登录失败，请稍后重试')
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
            登录您的账户
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
              {error}
            </div>
          )}
          
          <div className="space-y-4">
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
                  登录中...
                </div>
              ) : (
                '登录'
              )}
            </button>
          </div>

          <div className="text-center">
            <span className="text-sm text-gray-600">
              还没有账户？{' '}
              <Link to="/register" className="text-primary-600 hover:text-primary-500">
                立即注册
              </Link>
            </span>
          </div>
        </form>
      </div>
    </div>
  )
}