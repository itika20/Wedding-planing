import { useEffect } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { useStore } from '@/store/useStore'
import { AppShell } from '@/components/layout/AppShell'
import { Toaster } from '@/components/ui/Toast'
import { Login } from '@/pages/Login'
import { ProfileSelect } from '@/pages/ProfileSelect'
import { SetupWizard } from '@/pages/SetupWizard'
import { Home } from '@/pages/Home'
import { EventWorkspace } from '@/pages/EventWorkspace'
import { Expenses } from '@/pages/Expenses'
import { ActivityPage } from '@/pages/ActivityPage'
import { Settings } from '@/pages/Settings'
import { Vendors } from '@/pages/Vendors'
import { Guests } from '@/pages/Guests'
import { Shopping } from '@/pages/Shopping'
import { Documents } from '@/pages/Documents'
import { CalendarPage } from '@/pages/CalendarPage'

function RequireUser({ children }: { children: React.ReactNode }) {
  const currentUserId = useStore((s) => s.currentUserId)
  const loading = useStore((s) => s.loading)
  if (loading) return null
  if (!currentUserId) return <Navigate to="/" replace />
  return <>{children}</>
}

function Loader({ message }: { message: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="text-4xl animate-fade-up">💍</div>
        <div className="h-1 w-40 skeleton" />
        <p className="text-sm text-ink-soft">{message}</p>
      </div>
    </div>
  )
}

export default function App() {
  const init = useStore((s) => s.init)
  const loading = useStore((s) => s.loading)
  const setupDone = useStore((s) => s.settings.setupDone)
  const requiresAuth = useStore((s) => s.requiresAuth)
  const authReady = useStore((s) => s.authReady)
  const session = useStore((s) => s.session)

  useEffect(() => {
    void init()
  }, [init])

  // Cloud mode: nobody sees the dashboard (or setup) until an allowlisted
  // family member is signed in. Local mode skips this entirely.
  if (requiresAuth && !session) {
    if (!authReady) return <Loader message="Checking your sign-in…" />
    return <Login />
  }

  // First run (or "edit details"): collect the wedding date & events before anything else.
  if (!setupDone) return <SetupWizard />

  if (loading) return <Loader message="Setting up your wedding workspace…" />


  return (
    <>
      <Routes>
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
          <Route path="expenses" element={<Expenses />} />
          <Route path="budget" element={<Navigate to="/app/expenses" replace />} />
          <Route path="activity" element={<ActivityPage />} />
          <Route path="settings" element={<Settings />} />
          <Route path="vendors" element={<Vendors />} />
          <Route path="guests" element={<Guests />} />
          <Route path="calendar" element={<CalendarPage />} />
          <Route path="documents" element={<Documents />} />
          <Route path="shopping" element={<Shopping />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster />
    </>
  )
}
