import { AnimatePresence, motion } from 'framer-motion'
import { Check, Info, TriangleAlert } from 'lucide-react'
import { useStore } from '@/store/useStore'

const icons = {
  success: <Check size={16} />,
  info: <Info size={16} />,
  error: <TriangleAlert size={16} />,
}
const tones = {
  success: 'bg-sage-deep',
  info: 'bg-ink',
  error: 'bg-clay',
}

export function Toaster() {
  const toast = useStore((s) => s.toast)
  return (
    <div className="pointer-events-none fixed bottom-6 left-1/2 z-[70] -translate-x-1/2">
      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className={`pointer-events-auto flex items-center gap-2.5 rounded-full px-4 py-2.5 text-sm font-medium text-white shadow-lift ${tones[toast.tone]}`}
          >
            <span className="grid h-5 w-5 place-items-center rounded-full bg-white/20">{icons[toast.tone]}</span>
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
