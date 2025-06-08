import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, Shield, Heart, Sword, Zap } from "lucide-react"
import { Character, SignUp, Raid } from "@/lib/types"
import { apiClient } from "@/lib/api-client"
import { classColors } from '../../lib/constants'
import { getRoleFromSpec } from '../../lib/dashboard-utils'
import { MessageType } from "../ui/message-modal"

interface UserSignUpsCardProps {
  userSignUps: SignUp[]
  userCharacters: Character[]
  raids: Raid[]
  onRaidSelect: (raidId: string) => void
  onSignUpDeleted: () => void
  showMessage: (title: string, message: string, type?: MessageType) => void
}

export function UserSignUpsCard({ 
  userSignUps, 
  userCharacters, 
  raids, 
  onRaidSelect, 
  onSignUpDeleted,
  showMessage 
}: UserSignUpsCardProps) {
  
  const getRoleIcon = (role: string) => {
    switch (role) {
      case "tank":
        return <Shield className="w-4 h-4" />
      case "heal":
        return <Heart className="w-4 h-4" />
      case "ranged":
        return <Zap className="w-4 h-4" />
      default:
        return <Sword className="w-4 h-4" />
    }
  }

  const handleWithdraw = async (signupId: string) => {
    try {
      await apiClient.deleteSignUp(signupId)
      onSignUpDeleted()
      showMessage('Success', 'Successfully withdrew from raid!', 'success')
    } catch (err) {
      console.error('Error withdrawing from raid:', err)
      showMessage('Error', err instanceof Error ? err.message : 'Failed to withdraw from raid', 'error')
    }
  }

  return (
    <Card className="wotlk-card">
      <CardHeader>
        <CardTitle className="text-foreground flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" />
          Your Sign-ups
        </CardTitle>
      </CardHeader>
      <CardContent>
        {userSignUps.length > 0 ? (
          <div className="space-y-3">
            {userSignUps.map((signup) => {
              const character = userCharacters.find((c) => c.id === signup.characterId)
              const raid = raids.find((r) => r.id === signup.raidId)
              if (!character || !raid) return null

              return (
                <div
                  key={signup.id}
                  className="p-3 bg-muted rounded-lg md:flex md:items-center md:justify-between"
                >
                  {/* Mobile Layout */}
                  <div className="md:hidden space-y-3">
                    <div className="flex items-center gap-3">
                      {getRoleIcon(getRoleFromSpec(character.class, character.spec))}
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-base" style={{ color: classColors[character.class] }}>
                          {character.name}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {raid.title}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(raid.date).toLocaleDateString('en-US', { 
                            weekday: 'short', 
                            month: 'short', 
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onRaidSelect(raid.id)}
                        className="flex-1"
                      >
                        View Details
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleWithdraw(signup.id)}
                        className="flex-1"
                      >
                        Withdraw
                      </Button>
                    </div>
                  </div>

                  {/* Desktop Layout - Original */}
                  <div className="hidden md:flex md:items-center md:gap-3 md:flex-1">
                    <div className="flex items-center gap-2">
                      {getRoleIcon(getRoleFromSpec(character.class, character.spec))}
                      <span className="font-medium" style={{ color: classColors[character.class] }}>
                        {character.name}
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {raid.title} • {new Date(raid.date).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="hidden md:flex md:items-center md:gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onRaidSelect(raid.id)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      View
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleWithdraw(signup.id)}
                    >
                      Withdraw
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No active sign-ups</p>
            <p className="text-sm text-muted-foreground mt-1">Sign up for raids to see them here</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 