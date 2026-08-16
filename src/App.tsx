import { useEffect } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { useStore } from '@/store/useStore'
import { AppShell } from '@/components/layout/AppShell'
import { Toaster } from '@/components/ui/Toast'
import { Login } from '@/pages/Login'
import { ProfileSelect } from '@/pages/ProfileSelect'
import { SetupWizard } from '@/pages/SetupWizard'
import { Home } from '@/pages/Home'
import { AllTasks } from '@/pages/AllTasks'
import { EventWorkspace } from '@/pages/EventWorkspace'
import { Expenses } from '@/pages/Expenses'
import { Settings } from '@/pages/Settings'
import { Vendors } from '@/pages/Vendors'
import { Guests } from '@/pages/Guests'
import { Shopping } from '@/pages/Shopping'
import { Documents } from '@/pages/Documents'

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
  const authed = useStore((s) => s.authed)

  useEffect(() => {
    void init()
  }, [init])

  // Cloud mode: nobody sees the dashboard (or setup) until the family passcode
  // has been entered. Local mode skips this entirely.
  if (requiresAuth && !authed) {
    if (!authReady) return <Loader message="Checking access…" />
    return <Login />
  }

  // Wait for the data load (which, in cloud mode, brings the shared wedding date
  // & events) before deciding whether setup is needed — otherwise every device
  // would flash the setup wizard even after someone has already set things up.
  if (!authReady || loading) return <Loader message="Setting up your wedding workspace…" />

  // First run: collect the wedding date & events. In cloud mode this only shows
  // when nobody has completed setup yet.
  if (!setupDone) return <SetupWizard />


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
          <Route path="tasks" element={<AllTasks />} />
          <Route path="event/:key" element={<EventWorkspace />} />
          <Route path="expenses" element={<Expenses />} />
          <Route path="budget" element={<Navigate to="/app/expenses" replace />} />
          <Route path="settings" element={<Settings />} />
          <Route path="vendors" element={<Vendors />} />
          <Route path="guests" element={<Guests />} />
          <Route path="documents" element={<Documents />} />
          <Route path="shopping" element={<Shopping />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster />
    </>
  )
}
