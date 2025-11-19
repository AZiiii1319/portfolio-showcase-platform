import { useState } from 'react'
import { Link } from 'react-router-dom'

export function HeaderSimple() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">P</span>
              </div>
              <span className="ml-2 text-xl font-bold text-gray-900">Portfolio</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            <Link
              to="/"
              className="text-gray-900 hover:text-indigo-600 px-3 py-2 text-sm font-medium transition-colors"
            >
              首页
            </Link>
          </nav>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Link
              to="/login"
              className="text-gray-700 hover:text-indigo-600 px-3 py-2 text-sm font-medium transition-colors"
            >
              登录
            </Link>
            <Link
              to="/register"
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              注册
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 p-2 rounded-md"
            >
              <span className="sr-only">打开主菜单</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-gray-200">
              <Link
                to="/"
                className="text-gray-900 hover:text-indigo-600 block px-3 py-2 text-base font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                首页
              </Link>
              <Link
                to="/login"
                className="text-gray-700 hover:text-indigo-600 block px-3 py-2 text-base font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                登录
              </Link>
              <Link
                to="/register"
                className="text-gray-700 hover:text-indigo-600 block px-3 py-2 text-base font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                注册
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}