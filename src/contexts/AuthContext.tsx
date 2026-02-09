import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { getToken, setToken as storeToken, clearToken as clearStoredToken } from '../lib/api'

type AuthContextValue = {
  token: string | null
  login: (t: string) => void
  logout: () => void
  isReady: boolean
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setTokenState] = useState<string | null>(null)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    setTokenState(getToken())
    setIsReady(true)
  }, [])

  const login = (t: string) => {
    storeToken(t)
    setTokenState(t)
  }

  const logout = () => {
    clearStoredToken()
    setTokenState(null)
  }

  return (
    <AuthContext.Provider value={{ token, login, logout, isReady }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
