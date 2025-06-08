"use client"

import { useAuth } from "../lib/auth-context"
import { MessageModal } from "./ui/message-modal"
import { useDashboardData } from "../hooks/useDashboardData"
import { DashboardStats } from "./dashboard/DashboardStats"
import { UpcomingRaidsSection } from "./dashboard/UpcomingRaidsSection"
import { UserSignUpsCard } from "./dashboard/UserSignUpsCard"
import { UserCharactersCard } from "./dashboard/UserCharactersCard"

interface DashboardProps {
  onRaidSelect: (raidId: string) => void
}

export function Dashboard({ onRaidSelect }: DashboardProps) {
  const { user } = useAuth()
  const {
    raids,
    userCharacters,
    userSignUps,
    upcomingRaids,
    loading,
    error,
    messageModal,
    setMessageModal,
    showMessage,
    fetchData,
    handleSignUp,
    handleWithdraw,
    getSignUpsByRole
  } = useDashboardData(user)

  // Helper function to check if user is signed up for a raid
  const isUserSignedUp = (raidId: string) => {
    return userSignUps.some(s => s.raidId === raidId)
  }

  // Show loading state
  if (loading) {
    return (
      <div className="space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground mb-2">Welcome back, {user?.username}</h1>
          <p className="text-muted-foreground">Loading your raid data...</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="wotlk-card p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-muted rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground mb-2">Welcome back, {user?.username}</h1>
          <div className="bg-destructive/10 border border-destructive/20 rounded-md p-4">
            <p className="text-destructive">Error loading data: {error}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-foreground mb-2">Welcome back, {user?.username}</h1>
        <p className="text-muted-foreground">
          Manage your raids and characters for World of Warcraft: Wrath of the Lich King
        </p>
      </div>

      {/* Quick Stats */}
      <DashboardStats 
        userCharacters={userCharacters}
        userSignUps={userSignUps}
        upcomingRaidsCount={upcomingRaids.length}
      />

      {/* Upcoming Raids Section */}
      <UpcomingRaidsSection
        upcomingRaids={upcomingRaids}
        user={user}
        userCharacters={userCharacters}
        onRaidSelect={onRaidSelect}
        onSignUp={handleSignUp}
        onWithdraw={handleWithdraw}
        getSignUpsByRole={getSignUpsByRole}
        isUserSignedUp={isUserSignedUp}
        onRaidCreated={fetchData}
      />

      {/* Bottom Section: User Sign-ups and Characters */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <UserSignUpsCard
          userSignUps={userSignUps}
          userCharacters={userCharacters}
          raids={raids}
          onRaidSelect={onRaidSelect}
          onSignUpDeleted={fetchData}
          showMessage={showMessage}
        />

        <UserCharactersCard
          userCharacters={userCharacters}
          onCharacterCreated={fetchData}
        />
      </div>

      {/* Modal */}
      <MessageModal
        isOpen={messageModal.isOpen}
        onClose={() => setMessageModal(prev => ({ ...prev, isOpen: false }))}
        title={messageModal.title}
        message={messageModal.message}
        type={messageModal.type}
      />
    </div>
  )
}
