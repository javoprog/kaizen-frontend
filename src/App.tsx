import { lazy, Suspense, useEffect } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { AppShell } from './components/AppShell'
import { LoadingScreen } from './components/LoadingScreen'
import { useAuth } from './state/auth'

const AuthPage = lazy(() => import('./pages/AuthPage').then((module) => ({ default: module.AuthPage })))
const ComingSoonPage = lazy(() => import('./pages/ComingSoonPage').then((module) => ({ default: module.ComingSoonPage })))
const DashboardPage = lazy(() => import('./pages/DashboardPage').then((module) => ({ default: module.DashboardPage })))
const GoalCreatePage = lazy(() => import('./pages/GoalCreatePage').then((module) => ({ default: module.GoalCreatePage })))
const GoalsPage = lazy(() => import('./pages/GoalsPage').then((module) => ({ default: module.GoalsPage })))
const GoalWorkspacePage = lazy(() => import('./pages/GoalWorkspacePage').then((module) => ({ default: module.GoalWorkspacePage })))
const OnboardingPage = lazy(() => import('./pages/OnboardingPage').then((module) => ({ default: module.OnboardingPage })))
const PlanReviewPage = lazy(() => import('./pages/PlanReviewPage').then((module) => ({ default: module.PlanReviewPage })))

export default function App() {
  const { user, loading } = useAuth()
  const location = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [location.pathname])

  if (loading) return <LoadingScreen />
  if (!user) return <Suspense fallback={<LoadingScreen label="Opening Kaizen" />}><AuthPage /></Suspense>
  const isPlanReview = /^\/goals\/[^/]+\/(plan|edit-plan)$/.test(location.pathname)
  if (!user.onboardingCompleted && location.pathname !== '/onboarding' && !isPlanReview) {
    return <Navigate to="/onboarding" replace />
  }
  return (
    <Suspense fallback={<LoadingScreen label="Loading your workspace" />}>
      <Routes>
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route path="/goals/:id/plan" element={<PlanReviewPage />} />
        <Route path="/goals/:id/edit-plan" element={<PlanReviewPage mode="edit" />} />
        <Route element={<AppShell />}>
          <Route index element={<DashboardPage />} />
          <Route path="goals" element={<GoalsPage />} />
          <Route path="goals/new" element={<GoalCreatePage />} />
          <Route path="goals/:id" element={<GoalWorkspacePage />} />
          <Route path="profile" element={<ComingSoonPage title="Profile" />} />
          <Route path="settings" element={<ComingSoonPage title="Settings" />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}
