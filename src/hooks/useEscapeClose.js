import { useEffect } from 'react'

/** Close overlays with Escape (R-32). */
export function useEscapeClose(open, onClose) {
  useEffect(() => {
    if (!open) return
    function onKeyDown(e) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])
}
