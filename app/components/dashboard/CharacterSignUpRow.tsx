import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Shield, Heart, Sword, Zap } from "lucide-react"
import { classColors } from '../../lib/constants'
import { getRoleColor } from '../../lib/dashboard-utils'

interface CharacterSignUpRowProps {
  character: any
  signup: any
  role: string
}

// Enhanced Character Sign-up Row with Avatar - Mobile Optimized
export function CharacterSignUpRow({ character, signup, role }: CharacterSignUpRowProps) {
  // User data should come from character.user or signup.user if populated
  const user = character.user || signup.user
  
  return (
    <div className="signup-row group p-4 md:p-4 rounded-xl border border-border/50 bg-card/50 hover:bg-card/80 hover:shadow-md transition-all duration-200">
      {/* Mobile Layout */}
      <div className="md:hidden">
        <div className="flex items-center gap-3 mb-3">
          {/* Character Avatar */}
          <div className="relative flex-shrink-0">
            <Avatar className="character-avatar w-14 h-14 border-2 border-border group-hover:border-primary/30 transition-colors">
              <AvatarImage src={user?.avatarUrl || "/placeholder-user.jpg"} />
              <AvatarFallback 
                className="text-sm font-bold" 
                style={{ backgroundColor: `${classColors[character.class]}20`, color: classColors[character.class] }}
              >
                {character.name.slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            {/* Role indicator */}
            <div className={`role-indicator absolute -bottom-1 -right-1 w-7 h-7 rounded-full border-2 border-card flex items-center justify-center ${getRoleColor(role)}`}>
              {role === 'tank' && <Shield className="w-3.5 h-3.5" />}
              {role === 'heal' && <Heart className="w-3.5 h-3.5" />}
              {role === 'melee' && <Sword className="w-3.5 h-3.5" />}
              {role === 'ranged' && <Zap className="w-3.5 h-3.5" />}
            </div>
          </div>

          {/* Character Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span 
                className="text-base font-bold truncate"
                style={{ color: classColors[character.class] }}
              >
                {character.name}
              </span>
              <Badge 
                variant="outline" 
                className={`text-xs px-2 py-0.5 ${
                  character.faction === 'Alliance' 
                    ? 'border-blue-500/30 text-blue-600 bg-blue-500/10' 
                    : 'border-red-500/30 text-red-600 bg-red-500/10'
                }`}
              >
                {character.faction}
              </Badge>
            </div>
            <div className="flex items-center gap-3 text-sm text-muted-foreground mb-1">
              <span className="font-medium">{character.spec} {character.class}</span>
              <span className="font-bold text-yellow-600 bg-yellow-600/10 px-2 py-0.5 rounded-md">GS {character.gs}</span>
            </div>
            <div className="text-xs text-muted-foreground">
              Joined {new Date(signup.createdAt).toLocaleDateString()}
            </div>
          </div>
        </div>
        
        {/* Note section */}
        {signup.note && (
          <div className="bg-muted/30 p-3 rounded-lg border border-muted">
            <div className="text-xs text-muted-foreground mb-1 font-medium">Note:</div>
            <div className="text-sm italic text-foreground">"{signup.note}"</div>
          </div>
        )}
      </div>

      {/* Desktop Layout - Original */}
      <div className="hidden md:flex md:items-center md:gap-4">
        {/* Character Avatar */}
        <div className="relative">
          <Avatar className="character-avatar w-12 h-12 border-2 border-border group-hover:border-primary/30 transition-colors">
            <AvatarImage src={user?.avatarUrl || "/placeholder-user.jpg"} />
            <AvatarFallback 
              className="text-sm font-bold" 
              style={{ backgroundColor: `${classColors[character.class]}20`, color: classColors[character.class] }}
            >
              {character.name.slice(0, 2)}
            </AvatarFallback>
          </Avatar>
          {/* Role indicator */}
          <div className={`role-indicator absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-card flex items-center justify-center ${getRoleColor(role)}`}>
            {role === 'tank' && <Shield className="w-3 h-3" />}
            {role === 'heal' && <Heart className="w-3 h-3" />}
            {role === 'melee' && <Sword className="w-3 h-3" />}
            {role === 'ranged' && <Zap className="w-3 h-3" />}
          </div>
        </div>

        {/* Character Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span 
              className="font-semibold truncate"
              style={{ color: classColors[character.class] }}
            >
              {character.name}
            </span>
            <Badge 
              variant="outline" 
              className={`text-xs px-2 py-0 ${
                character.faction === 'Alliance' 
                  ? 'border-blue-500/30 text-blue-600 bg-blue-500/10' 
                  : 'border-red-500/30 text-red-600 bg-red-500/10'
              }`}
            >
              {character.faction}
            </Badge>
          </div>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span>{character.spec} {character.class}</span>
            <span className="font-medium text-yellow-600">GS {character.gs}</span>
          </div>
        </div>

        {/* Note & Actions */}
        <div className="flex items-center gap-3">
          {signup.note && (
            <div className="max-w-32 text-xs text-muted-foreground italic truncate bg-muted/50 px-2 py-1 rounded">
              "{signup.note}"
            </div>
          )}
          <div className="text-xs text-muted-foreground">
            {new Date(signup.createdAt).toLocaleDateString()}
          </div>
        </div>
      </div>
    </div>
  )
} 