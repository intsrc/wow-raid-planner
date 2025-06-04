"use client"

import { useState } from "react"
import { Calendar, Users, Sword, Settings, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { AuthProvider, useAuth } from "./lib/auth-context"
import { Dashboard } from "./components/dashboard"
import { CalendarView } from "./components/calendar-view"
import { RaidDetails } from "./components/raid-details"
import { CharacterManager } from "./components/character-manager"
import { RosterBuilder } from "./components/roster-builder"
import { AdminPanel } from "./components/admin-panel"

function AppContent() {
  const { user, logout } = useAuth()
  const [currentView, setCurrentView] = useState("dashboard")
  const [selectedRaidId, setSelectedRaidId] = useState<string | null>(null)

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <Card className="w-full max-w-md bg-slate-800/50 border-slate-700">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center mb-4">
              <Sword className="w-8 h-8 text-slate-900" />
            </div>
            <CardTitle className="text-2xl font-bold text-slate-100">RaidPlanner</CardTitle>
            <p className="text-slate-400">Guild raid management made simple</p>
          </CardHeader>
          <CardContent>
            <Button
              className="w-full bg-[#5865F2] hover:bg-[#4752C4] text-white"
              onClick={() => {
                // Mock Discord login
                window.location.href = "/auth/discord"
              }}
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z" />
              </svg>
              Continue with Discord
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
            onRaidSelect={(id) => {
              setSelectedRaidId(id)
              setCurrentView("raid-details")
            }}
          />
        )
      case "raid-details":
        return (
          <RaidDetails
            raidId={selectedRaidId}
            onBack={() => setCurrentView("calendar")}
            onRosterBuilder={(id) => {
              setSelectedRaidId(id)
              setCurrentView("roster-builder")
            }}
          />
        )
      case "roster-builder":
        return <RosterBuilder raidId={selectedRaidId} onBack={() => setCurrentView("raid-details")} />
      case "characters":
        return <CharacterManager />
      case "admin":
        return <AdminPanel />
      default:
        return (
          <Dashboard
            onRaidSelect={(id) => {
              setSelectedRaidId(id)
              setCurrentView("raid-details")
            }}
          />
        )
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Header */}
      <header className="bg-slate-800/50 border-b border-slate-700 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center">
                <Sword className="w-5 h-5 text-slate-900" />
              </div>
              <h1 className="text-xl font-bold text-slate-100">RaidPlanner</h1>
            </div>

            <nav className="hidden md:flex space-x-1">
              <Button
                variant={currentView === "dashboard" ? "secondary" : "ghost"}
                onClick={() => setCurrentView("dashboard")}
                className="text-slate-300 hover:text-slate-100"
              >
                Dashboard
              </Button>
              <Button
                variant={currentView === "calendar" ? "secondary" : "ghost"}
                onClick={() => setCurrentView("calendar")}
                className="text-slate-300 hover:text-slate-100"
              >
                <Calendar className="w-4 h-4 mr-2" />
                Calendar
              </Button>
              <Button
                variant={currentView === "characters" ? "secondary" : "ghost"}
                onClick={() => setCurrentView("characters")}
                className="text-slate-300 hover:text-slate-100"
              >
                <Users className="w-4 h-4 mr-2" />
                Characters
              </Button>
              {(user.role === "admin" || user.role === "rl") && (
                <Button
                  variant={currentView === "admin" ? "secondary" : "ghost"}
                  onClick={() => setCurrentView("admin")}
                  className="text-slate-300 hover:text-slate-100"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Admin
                </Button>
              )}
            </nav>

            <div className="flex items-center space-x-3">
              <Avatar className="w-8 h-8">
                <AvatarImage src={user.avatarUrl || "/placeholder.svg"} />
                <AvatarFallback className="bg-slate-700 text-slate-300">{user.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <span className="text-slate-300 hidden sm:block">{user.name}</span>
              <Badge variant="outline" className="border-yellow-500 text-yellow-400 hidden sm:block">
                {user.role.toUpperCase()}
              </Badge>
              <Button variant="ghost" size="sm" onClick={logout} className="text-slate-400 hover:text-slate-100">
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">{renderContent()}</main>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}
