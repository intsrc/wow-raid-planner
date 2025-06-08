import { Shield, Heart, Sword, Zap } from "lucide-react"

interface EmptyRoleStateProps {
  role: string
  count: number
}

// Empty State Component
export function EmptyRoleState({ role, count }: EmptyRoleStateProps) {
  const getEmptyMessage = () => {
    if (count === 0) return `No ${role}s yet - be the first!`
    return `${count} more ${role}${count > 1 ? 's' : ''} needed`
  }

  return (
    <div className="empty-state p-6 text-center border-2 border-dashed border-border/50 rounded-xl bg-muted/20">
      <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-muted/50 flex items-center justify-center">
        {role === 'tank' && <Shield className="w-6 h-6 text-muted-foreground/50" />}
        {role === 'heal' && <Heart className="w-6 h-6 text-muted-foreground/50" />}
        {role === 'melee' && <Sword className="w-6 h-6 text-muted-foreground/50" />}
        {role === 'ranged' && <Zap className="w-6 h-6 text-muted-foreground/50" />}
      </div>
      <p className="text-sm text-muted-foreground font-medium">{getEmptyMessage()}</p>
    </div>
  )
} 