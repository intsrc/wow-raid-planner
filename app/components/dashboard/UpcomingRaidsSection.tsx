import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Calendar, Crown, Plus } from "lucide-react"
import { Character, Raid } from "@/lib/types"
import { RaidCard } from "./RaidCard"
import { CreateRaidForm } from "./CreateRaidForm"

interface UpcomingRaidsSectionProps {
  upcomingRaids: Raid[]
  user: any
  userCharacters: Character[]
  onRaidSelect: (raidId: string) => void
  onSignUp: (raidId: string, characterId: string, note: string) => void
  onWithdraw: (raidId: string) => void
  getSignUpsByRole: (raidId: string) => any
  isUserSignedUp: (raidId: string) => boolean
  onRaidCreated: () => void
}

export function UpcomingRaidsSection({ 
  upcomingRaids, 
  user, 
  userCharacters,
  onRaidSelect,
  onSignUp,
  onWithdraw,
  getSignUpsByRole,
  isUserSignedUp,
  onRaidCreated
}: UpcomingRaidsSectionProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-xl md:text-2xl font-bold text-foreground flex items-center gap-2">
          <Crown className="w-5 h-5 md:w-6 md:h-6 text-yellow-500" />
          Upcoming Raids
        </h2>
        {(user?.role === "RAID_LEADER" || user?.role === "ADMIN") && (
          <Dialog>
            <DialogTrigger asChild>
              <Button className="gap-2 w-full sm:w-auto bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800 text-white font-medium">
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Create New Raid</span>
                <span className="sm:hidden">Create Raid</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl w-[95vw] mx-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Crown className="w-5 h-5 text-yellow-500" />
                  Create New Raid
                </DialogTitle>
              </DialogHeader>
              <CreateRaidForm onRaidCreated={onRaidCreated} />
            </DialogContent>
          </Dialog>
        )}
      </div>

      {upcomingRaids.length > 0 ? (
        <div className="space-y-4">
          {upcomingRaids.map((raid) => {
            const raidSignUps = getSignUpsByRole(raid.id)
            const userSignedUp = isUserSignedUp(raid.id)
            
            return (
              <RaidCard 
                key={raid.id}
                raid={raid} 
                signUps={raidSignUps} 
                isUserSignedUp={userSignedUp} 
                user={user} 
                onRaidSelect={onRaidSelect}
                onSignUp={onSignUp}
                onWithdraw={onWithdraw}
                userCharacters={userCharacters}
              />
            )
          })}
        </div>
      ) : (
        <Card className="wotlk-card">
          <CardContent className="py-16">
            <div className="text-center">
              <Calendar className="w-16 h-16 text-muted-foreground/50 mx-auto mb-6" />
              <h3 className="text-xl font-semibold text-foreground mb-2">No Upcoming Raids</h3>
              <p className="text-muted-foreground mb-6">Check back later or contact your raid leaders</p>
              {(user?.role === "RAID_LEADER" || user?.role === "ADMIN") && (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="gap-2 bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800 text-white font-medium">
                      <Plus className="w-4 h-4" />
                      Create New Raid
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl w-[95vw] mx-auto">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <Crown className="w-5 h-5 text-yellow-500" />
                        Create New Raid
                      </DialogTitle>
                    </DialogHeader>
                    <CreateRaidForm onRaidCreated={onRaidCreated} />
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 