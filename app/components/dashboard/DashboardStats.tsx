import { Card, CardContent } from "@/components/ui/card"
import { Users, Calendar, Crown, Shield } from "lucide-react"
import { Character, SignUp } from "@/lib/types"

interface DashboardStatsProps {
  userCharacters: Character[]
  userSignUps: SignUp[]
  upcomingRaidsCount: number
}

export function DashboardStats({ userCharacters, userSignUps, upcomingRaidsCount }: DashboardStatsProps) {
  const avgGearScore = userCharacters.length > 0
    ? Math.round(userCharacters.reduce((sum, c) => sum + c.gearScore, 0) / userCharacters.length)
    : 0

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
      <Card className="wotlk-card">
        <CardContent className="p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-xs md:text-sm">Your Characters</p>
              <p className="text-xl md:text-2xl font-bold text-foreground">{userCharacters.length}</p>
            </div>
            <Users className="w-6 h-6 md:w-8 md:h-8 text-primary" />
          </div>
        </CardContent>
      </Card>

      <Card className="wotlk-card">
        <CardContent className="p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-xs md:text-sm">Active Sign-ups</p>
              <p className="text-xl md:text-2xl font-bold text-foreground">{userSignUps.length}</p>
            </div>
            <Calendar className="w-6 h-6 md:w-8 md:h-8 text-green-500" />
          </div>
        </CardContent>
      </Card>

      <Card className="wotlk-card">
        <CardContent className="p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-xs md:text-sm">Upcoming Raids</p>
              <p className="text-xl md:text-2xl font-bold text-foreground">{upcomingRaidsCount}</p>
            </div>
            <Crown className="w-6 h-6 md:w-8 md:h-8 text-yellow-500" />
          </div>
        </CardContent>
      </Card>

      <Card className="wotlk-card">
        <CardContent className="p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-xs md:text-sm">Avg Gear Score</p>
              <p className="text-xl md:text-2xl font-bold text-foreground">{avgGearScore}</p>
            </div>
            <Shield className="w-6 h-6 md:w-8 md:h-8 text-purple-500" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 