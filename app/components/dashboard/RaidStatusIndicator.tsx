import { AlertCircle, CheckCircle, TrendingUp, Users } from "lucide-react"

interface RaidStatusIndicatorProps {
  raid: any
  signUpsCount: number
  isUserSignedUp?: boolean
}

// Raid Status Indicator
export function RaidStatusIndicator({ raid, signUpsCount, isUserSignedUp }: RaidStatusIndicatorProps) {
  const totalSlots = raid.tankCap + raid.healCap + raid.meleeCap + raid.rangedCap
  const fillPercentage = (signUpsCount / totalSlots) * 100
  
  const getStatus = () => {
    // If user is signed up, show that status first
    if (isUserSignedUp) return { icon: CheckCircle, text: 'You\'re Signed Up', color: 'text-emerald-500 bg-emerald-500/10' }
    
    if (raid.status === 'LOCKED') return { icon: AlertCircle, text: 'Roster Locked', color: 'text-red-500 bg-red-500/10' }
    if (fillPercentage >= 100) return { icon: CheckCircle, text: 'Full Roster', color: 'text-emerald-500 bg-emerald-500/10' }
    if (fillPercentage >= 70) return { icon: TrendingUp, text: 'Filling Fast', color: 'text-orange-500 bg-orange-500/10' }
    return { icon: Users, text: 'Open for Sign-ups', color: 'text-blue-500 bg-blue-500/10' }
  }

  const status = getStatus()
  const StatusIcon = status.icon

  return (
    <div className={`status-badge inline-flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium ${status.color}`}>
      <StatusIcon className="w-4 h-4" />
      {status.text}
    </div>
  )
} 