import { createContext, useCallback, useContext, useMemo, useState } from 'react'

const ToastContext = createContext(null)

function makeId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const removeToast = useCallback((id) => {
    setToasts((current) => current.filter((item) => item.id !== id))
  }, [])

  const addToast = useCallback(
    (message, type = 'info', duration = 3600) => {
      if (!message) {
        return ''
      }

      const id = makeId()
      setToasts((current) => [...current, { id, message, type }])

      if (duration > 0) {
        window.setTimeout(() => removeToast(id), duration)
      }

      return id
    },
    [removeToast],
  )

  const value = useMemo(
    () => ({
      addToast,
      removeToast,
    }),
    [addToast, removeToast],
  )

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed right-4 top-4 z-[100] flex w-[min(92vw,380px)] flex-col gap-3">
        {toasts.map((toast) => (
          <ToastCard key={toast.id} toast={toast} onClose={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const value = useContext(ToastContext)

  if (!value) {
    throw new Error('useToast must be used within ToastProvider')
  }

  return value
}

function ToastCard({ toast, onClose }) {
  const stylesByType = {
    success: {
      icon: '✓',
      className: 'border-emerald-200/90 bg-emerald-50/95 text-emerald-800',
    },
    error: {
      icon: '✕',
      className: 'border-rose-200/90 bg-rose-50/95 text-rose-800',
    },
    info: {
      icon: 'i',
      className: 'border-sky-200/90 bg-sky-50/95 text-sky-800',
    },
  }

  const tone = stylesByType[toast.type] || stylesByType.info

  return (
    <div className={`toast-enter pointer-events-auto rounded-2xl border px-4 py-3 shadow-lg backdrop-blur ${tone.className}`}>
      <div className="flex items-start gap-3">
        <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-current/30 text-xs font-semibold">
          {tone.icon}
        </span>
        <p className="flex-1 text-sm leading-6">{toast.message}</p>
        <button
          type="button"
          onClick={() => onClose(toast.id)}
          className="rounded-md px-1 text-xs opacity-70 transition hover:opacity-100"
          aria-label="Dismiss notification"
        >
          ✕
        </button>
      </div>
    </div>
  )
}