import { useState, useEffect } from 'react'

export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const raw = localStorage.getItem(key)
      return raw != null ? JSON.parse(raw) : initialValue
    } catch {
      return initialValue
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // ignore quota / private mode errors
    }
  }, [key, value])

  return [value, setValue]
}

export function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}
