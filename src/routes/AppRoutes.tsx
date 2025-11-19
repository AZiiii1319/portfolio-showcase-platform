import { Routes, Route } from 'react-router-dom'
import { Layout } from '../components/layout/Layout'
import { HomePage } from '../pages/HomePage'
import { HomePageSimple } from '../pages/HomePageSimple'
import { TestSupabasePage } from '../pages/TestSupabasePage'
import { TestDataPage } from '../pages/TestDataPage'
import { LoginPage } from '../pages/LoginPage'
import { RegisterPage } from '../pages/RegisterPage'
import { ProfilePage } from '../pages/ProfilePage'
import { PortfolioDetailPage } from '../pages/PortfolioDetailPage'
import { PortfolioManagePage } from '../pages/PortfolioManagePage'
import { ProtectedRoute } from '../components/auth/ProtectedRoute'

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        {/* Public routes */}
        <Route index element={<HomePage />} />
        <Route path="/test" element={<TestSupabasePage />} />
        <Route path="/test-data" element={<TestDataPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/portfolio/:id" element={<PortfolioDetailPage />} />
        
        {/* Protected routes */}
        <Route path="/profile" element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        } />
        <Route path="/profile/:userId" element={<ProfilePage />} />
        <Route path="/manage" element={
          <ProtectedRoute>
            <PortfolioManagePage />
          </ProtectedRoute>
        } />
      </Route>
    </Routes>
  )
}