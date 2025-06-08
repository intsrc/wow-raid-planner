"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Calendar, Users, Settings, LogOut, Shield, Crown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { AuthProvider, useAuth } from "./lib/auth-context"
import { ModalProvider } from "./contexts/modal-context"
import { Dashboard } from "./components/dashboard"
import { CalendarView } from "./components/calendar-view"
import { RaidDetails } from "./components/raid-details"
import { CharacterManager } from "./components/character-manager"
import { RosterBuilder } from "./components/roster-builder"
import { AdminPanel } from "./components/admin-panel"

function SearchParamsHandler({ onParamsChange }: { onParamsChange: (view: string, raidId?: string) => void }) {
  const searchParams = useSearchParams()

  useEffect(() => {
    const view = searchParams.get('view') || 'dashboard'
    const raidId = searchParams.get('raidId') || undefined
    onParamsChange(view, raidId)
  }, [searchParams, onParamsChange])

  return null
}

function AppContent() {
  const { user, login, loginWithDiscord, logout, loading, error } = useAuth()
  const router = useRouter()
  const [currentView, setCurrentView] = useState("dashboard")
  const [selectedRaidId, setSelectedRaidId] = useState<string | null>(null)
  const [loggingIn, setLoggingIn] = useState(false)

  // Handle URL parameter changes
  const handleParamsChange = (view: string, raidId?: string) => {
    setCurrentView(view)
    if (raidId) {
      setSelectedRaidId(raidId)
    }
  }

  // Update URL when view changes
  const updateView = (view: string, raidId?: string | null) => {
    setCurrentView(view)
    if (raidId) {
      setSelectedRaidId(raidId)
    }
    
    const params = new URLSearchParams()
    params.set('view', view)
    if (raidId) {
      params.set('raidId', raidId)
    }
    
    router.push(`/?${params.toString()}`)
  }

  const handleLogin = () => {
    setLoggingIn(true)
    loginWithDiscord()
  }

  if (loading) {
    return (
      <div className="min-h-screen wotlk-frost-bg flex items-center justify-center">
        <Card className="w-full max-w-md wotlk-card">
          <CardContent className="p-6">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 guild-emblem rounded-full flex items-center justify-center mb-4">
                <Crown className="w-8 h-8 text-slate-900 animate-pulse" />
              </div>
              <p className="text-muted-foreground">Loading Verkhovna Rada RaidPlanner...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen wotlk-frost-bg flex items-center justify-center">
        <Card className="w-full max-w-md wotlk-card">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 guild-emblem rounded-full flex items-center justify-center mb-4">
              <Crown className="w-8 h-8 text-slate-900" />
            </div>
            <CardTitle className="text-2xl font-bold text-foreground">
              Verkhovna Rada RaidPlanner
            </CardTitle>
            <p className="text-muted-foreground">
              Professional guild raid management for WOTLK
            </p>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                <p className="text-destructive text-sm">{error}</p>
              </div>
            )}
            <Button
              className="w-full"
              onClick={handleLogin}
              disabled={loggingIn}
            >
              {loggingIn ? (
                <>
                  <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Connecting...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z" />
                  </svg>
                  Continue with Discord
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const renderContent = () => {
    switch (currentView) {
      case "calendar":
        return (
          <CalendarView
            onRaidSelect={(id) => updateView("raid-details", id)}
          />
        )
      case "raid-details":
        return (
          <RaidDetails
            raidId={selectedRaidId}
            onBack={() => updateView("calendar")}
            onRosterBuilder={(id) => updateView("roster-builder", id)}
          />
        )
      case "roster-builder":
        return <RosterBuilder raidId={selectedRaidId} onBack={() => updateView("raid-details", selectedRaidId)} />
      case "characters":
        return <CharacterManager />
      case "admin":
        return <AdminPanel />
      default:
        return (
          <Dashboard
            onRaidSelect={(id) => updateView("raid-details", id)}
          />
        )
    }
  }

  return (
    <div className="min-h-screen wotlk-frost-bg">
      <Suspense fallback={null}>
        <SearchParamsHandler onParamsChange={handleParamsChange} />
      </Suspense>
      
      {/* Header */}
      <header className="wotlk-card border-x-0 border-t-0 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 guild-emblem rounded-full flex items-center justify-center">
                <Crown className="w-4 h-4 text-slate-900" />
              </div>
              <h1 className="text-xl font-semibold text-foreground">Verkhovna Rada RaidPlanner</h1>
            </div>

            <nav className="hidden md:flex space-x-1">
              <Button
                variant={currentView === "dashboard" ? "secondary" : "ghost"}
                onClick={() => updateView("dashboard")}
                className="text-muted-foreground hover:text-foreground"
              >
                <Shield className="w-4 h-4 mr-2" />
                Dashboard
              </Button>
              <Button
                variant={currentView === "calendar" ? "secondary" : "ghost"}
                onClick={() => updateView("calendar")}
                className="text-muted-foreground hover:text-foreground"
              >
                <Calendar className="w-4 h-4 mr-2" />
                Raids
              </Button>
              <Button
                variant={currentView === "characters" ? "secondary" : "ghost"}
                onClick={() => updateView("characters")}
                className="text-muted-foreground hover:text-foreground"
              >
                <Users className="w-4 h-4 mr-2" />
                Characters
              </Button>
              {(user.role === "ADMIN" || user.role === "RAID_LEADER") && (
                <Button
                  variant={currentView === "admin" ? "secondary" : "ghost"}
                  onClick={() => updateView("admin")}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Admin
                </Button>
              )}
            </nav>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={user.avatarUrl || undefined} />
                  <AvatarFallback>{user.username.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-foreground">{user.username}</p>
                  <Badge variant="secondary" className="text-xs">
                    {getRoleDisplayName(user.role)}
                  </Badge>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                className="text-muted-foreground hover:text-foreground"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {renderContent()}
      </main>
    </div>
  )
}

function getRoleDisplayName(role: string): string {
  switch (role) {
    case "ADMIN":
      return "Admin"
    case "RAID_LEADER":
      return "Raid Leader"
    case "MEMBER":
      return "Member"
    default:
      return "Unknown"
  }
}

export default function App() {
  return (
    <AuthProvider>
      <ModalProvider>
        <AppContent />
      </ModalProvider>
    </AuthProvider>
  )
}
