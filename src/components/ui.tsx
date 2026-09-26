import { motion, AnimatePresence } from 'motion/react'
import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { ArrowLeft, Check, LoaderCircle, X } from 'lucide-react'

export const spring = { type: 'spring' as const, stiffness: 360, damping: 32 }
export function AppButton({ children, onClick, variant = 'primary', disabled = false, icon: Icon, className = '' }: { children: ReactNode; onClick?: () => void; variant?: 'primary' | 'secondary' | 'text' | 'danger'; disabled?: boolean; icon?: LucideIcon; className?: string }) {
  return <motion.button whileTap={{ scale: .97 }} transition={spring} className={`app-button ${variant} ${className}`} onClick={onClick} disabled={disabled}>{Icon && <Icon size={19} strokeWidth={2.1} />}{children}</motion.button>
}
export function IconButton({ icon: Icon, onClick, label, className = '' }: { icon: LucideIcon; onClick: () => void; label: string; className?: string }) {
  return <motion.button whileTap={{ scale: .9 }} aria-label={label} title={label} className={`icon-button ${className}`} onClick={onClick}><Icon size={21} strokeWidth={2} /></motion.button>
}
export function PageHeader({ title, onBack, right }: { title: string; onBack: () => void; right?: ReactNode }) {
  return <header className="page-header"><IconButton icon={ArrowLeft} label="Назад" onClick={onBack} /><h1>{title}</h1><div className="page-header-right">{right}</div></header>
}
export function Spinner({ size = 22 }: { size?: number }) { return <LoaderCircle size={size} className="spin" aria-label="Загрузка" /> }
export function SuccessMark() { return <motion.div className="success-mark" initial={{ scale: .45, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ ...spring, delay: .1 }}><motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ ...spring, delay: .25 }}><Check size={36} strokeWidth={2.5} /></motion.div></motion.div> }
export function Avatar({ initials, large = false }: { initials: string; large?: boolean }) { return <div className={`avatar ${large ? 'large' : ''}`}>{initials}</div> }
export function Modal({ open, title, onClose, children }: { open: boolean; title: string; onClose: () => void; children: ReactNode }) {
  return <AnimatePresence>{open && <div className="modal-root"><motion.button className="modal-backdrop" aria-label="Закрыть" onClick={onClose} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} /><motion.div className="modal-sheet" role="dialog" aria-modal="true" aria-label={title} initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={spring}><div className="modal-handle" /><div className="modal-heading"><h2>{title}</h2><IconButton icon={X} label="Закрыть" onClick={onClose} /></div>{children}</motion.div></div>}</AnimatePresence>
}
export function Skeleton({ width = '100%' }: { width?: string }) { return <div className="skeleton" style={{ width }} /> }
export function Toast({ message }: { message: string | null }) { return <AnimatePresence>{message && <motion.div className="toast" role="status" initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }} transition={spring}>{message}</motion.div>}</AnimatePresence> }
