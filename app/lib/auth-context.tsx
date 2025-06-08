"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useSearchParams } from "next/navigation"
import { apiClient } from "@/lib/api-client"
import { User } from "@/lib/types"

interface AuthContextType {
  user: User | null
  login: (discordId: string) => Promise<void>
  loginWithDiscord: () => void
  logout: () => Promise<void>
  loading: boolean
  error: string | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Check if user is already authenticated
    const initAuth = async () => {
      // Check URL params for auth status
      const urlParams = new URLSearchParams(window.location.search)
      const authStatus = urlParams.get('auth')
      const authMessage = urlParams.get('message')

      if (authStatus === 'success') {
        const token = urlParams.get('token')
        
        // Clear URL params
        window.history.replaceState({}, document.title, window.location.pathname)
        
        if (token) {
          // Save token and load user profile
          try {
            // Store token using the API client (which handles localStorage)
            apiClient.setToken(decodeURIComponent(token))
            
            const profile = await apiClient.getProfile()
            setUser(profile)
          } catch (error) {
            console.error('Failed to load user profile after Discord auth:', error)
            setError('Failed to load profile after authentication')
          }
        } else {
          setError('No authentication token received')
        }
      } else if (authStatus === 'error') {
        // Clear URL params
        window.history.replaceState({}, document.title, window.location.pathname)
        setError(authMessage ? decodeURIComponent(authMessage) : 'Authentication failed')
      } else if (apiClient.isAuthenticated()) {
        try {
          const profile = await apiClient.getProfile()
          setUser(profile)
        } catch (error) {
          console.error('Failed to load user profile:', error)
          await apiClient.logout()
        }
      }
      setLoading(false)
    }

    initAuth()

    // Listen for auth errors (token expiry, etc.)
    const handleAuthError = () => {
      setUser(null)
      setError('Your session has expired. Please login again.')
    }

    window.addEventListener('auth-error', handleAuthError)
    return () => window.removeEventListener('auth-error', handleAuthError)
  }, [])

  const login = async (discordId: string): Promise<void> => {
    try {
      setLoading(true)
      setError(null)
      
      const authResponse = await apiClient.login(discordId)
      setUser(authResponse.user)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed'
      setError(errorMessage)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const loginWithDiscord = () => {
    setError(null)
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'
    window.location.href = `${backendUrl}/auth/discord`
  }

  const logout = async (): Promise<void> => {
    try {
      await apiClient.logout()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setUser(null)
      setError(null)
    }
  }

  return (
    <AuthContext.Provider value={{ user, login, loginWithDiscord, logout, loading, error }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
