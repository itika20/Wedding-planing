import { useEffect } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { useStore } from '@/store/useStore'
import { AppShell } from '@/components/layout/AppShell'
import { Toaster } from '@/components/ui/Toast'
import { ProfileSelect } from '@/pages/ProfileSelect'
import { Home } from '@/pages/Home'
import { EventWorkspace } from '@/pages/EventWorkspace'
import { Budget } from '@/pages/Budget'
import { ActivityPage } from '@/pages/ActivityPage'
import { Settings } from '@/pages/Settings'
import { Placeholder } from '@/pages/Placeholder'

function RequireUser({ children }: { children: React.ReactNode }) {
  const currentUserId = useStore((s) => s.currentUserId)
  const loading = useStore((s) => s.loading)
  if (loading) return null
  if (!currentUserId) return <Navigate to="/" replace />
  return <>{children}</>
}

export default function App() {
  const init = useStore((s) => s.init)
  const loading = useStore((s) => s.loading)
  const location = useLocation()

  useEffect(() => {
    void init()
  }, [init])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="text-4xl animate-fade-up">💍</div>
          <div className="h-1 w-40 skeleton" />
          <p className="text-sm text-ink-soft">Setting up your wedding workspace…</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname.split('/')[1] || 'root'}>
          <Route path="/" element={<ProfileSelect />} />
          <Route
            path="/app"
            element={
              <RequireUser>
                <AppShell />
              </RequireUser>
            }
          >
            <Route index element={<Navigate to="/app/home" replace />} />
            <Route path="home" element={<Home />} />
            <Route path="event/:key" element={<EventWorkspace />} />
            <Route path="budget" element={<Budget />} />
            <Route path="activity" element={<ActivityPage />} />
            <Route path="settings" element={<Settings />} />
            <Route path="vendors" element={<Placeholder page="vendors" />} />
            <Route path="guests" element={<Placeholder page="guests" />} />
            <Route path="calendar" element={<Placeholder page="calendar" />} />
            <Route path="documents" element={<Placeholder page="documents" />} />
            <Route path="shopping" element={<Placeholder page="shopping" />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AnimatePresence>
      <Toaster />
    </>
  )
}
