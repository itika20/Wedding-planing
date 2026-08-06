import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useStore } from '@/store/useStore'

export function ProfileSelect() {
  const users = useStore((s) => s.users)
  const setCurrentUser = useStore((s) => s.setCurrentUser)
  const navigate = useNavigate()

  const choose = (id: string) => {
    setCurrentUser(id)
    navigate('/app/home')
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 py-12">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-10 h-72 w-72 -translate-x-1/2 rounded-full bg-champagne/10 blur-3xl" />
        <div className="absolute bottom-0 right-10 h-64 w-64 rounded-full bg-rose/10 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-12 text-center"
      >
        <div className="mb-3 text-4xl">💍</div>
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-champagne-deep">Wedding 101</p>
        <h1 className="mt-2 font-display text-4xl font-semibold text-ink sm:text-5xl">Who's planning today?</h1>
      </motion.div>

      <div className="grid grid-cols-2 gap-6 sm:grid-cols-4 sm:gap-10">
        {users.map((u, i) => (
          <motion.button
            key={u.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{ y: -6 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => choose(u.id)}
            className="group flex flex-col items-center"
          >
            <div
              className="grid h-28 w-28 place-items-center rounded-3xl text-5xl shadow-soft transition-all duration-300 group-hover:shadow-glow sm:h-32 sm:w-32"
              style={{
                background: `linear-gradient(150deg, ${u.color}26, ${u.color}12)`,
                boxShadow: `inset 0 0 0 2px ${u.color}33`,
              }}
            >
              {u.emoji}
            </div>
            <p className="mt-4 font-display text-lg font-semibold text-ink">{u.name}</p>
          </motion.button>
        ))}
      </div>
    </div>
  )
}
