import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const StartCreatingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleStartCreating = () => {
    if (user) {
      // 如果用户已登录，直接跳转到作品管理页面
      navigate('/portfolio/manage');
    } else {
      // 如果用户未登录，跳转到登录页面
      navigate('/login', { 
        state: { 
          from: '/portfolio/manage',
          message: '请先登录以开始创作您的作品'
        }
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center px-4">
      <div className="max-w-2xl mx-auto text-center">
        {/* 主标题 */}
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
          准备展示你的作品了吗？
        </h1>
        
        {/* 副标题 */}
        <p className="text-xl md:text-2xl text-gray-600 mb-12 leading-relaxed">
          加入我们的创作者社区，分享你的精彩作品
        </p>

        {/* 特色说明 */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">轻松创建</h3>
            <p className="text-gray-600">简单直观的界面，让你专注于创作本身</p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">分享展示</h3>
            <p className="text-gray-600">与全世界分享你的创意和才华</p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">获得反馈</h3>
            <p className="text-gray-600">收到来自社区的点赞和宝贵建议</p>
          </div>
        </div>

        {/* 开始创作按钮 */}
        <button
          onClick={handleStartCreating}
          className="inline-flex items-center px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-lg rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-300"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          开始创作
        </button>

        {/* 用户状态提示 */}
        {!user && (
          <p className="mt-6 text-sm text-gray-500">
            还没有账户？
            <button
              onClick={() => navigate('/register')}
              className="text-blue-600 hover:text-blue-700 font-medium ml-1 underline"
            >
              立即注册
            </button>
          </p>
        )}

        {/* 装饰性元素 */}
        <div className="mt-16 relative">
          <div className="absolute inset-0 flex items-center justify-center opacity-10">
            <div className="w-64 h-64 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full blur-3xl"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StartCreatingPage;