import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Sword, Plus, Shield, Heart, Zap } from "lucide-react"
import { Character, Faction } from "@/lib/types"
import { SharedCharacterForm } from "../shared-character-form"
import { classColors } from '../../lib/constants'
import { getRoleFromSpec } from '../../lib/dashboard-utils'

interface UserCharactersCardProps {
  userCharacters: Character[]
  onCharacterCreated: () => void
}

export function UserCharactersCard({ userCharacters, onCharacterCreated }: UserCharactersCardProps) {
  
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

  return (
    <Card className="wotlk-card">
      <CardHeader>
        <CardTitle className="text-foreground flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Sword className="w-5 h-5 text-yellow-500" />
            Your Characters
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="gap-2 w-full sm:w-auto bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800 text-white font-medium">
                <Plus className="w-4 h-4" />
                Add Character
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md w-[95vw] mx-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Sword className="w-5 h-5 text-yellow-500" />
                  Add New Character
                </DialogTitle>
              </DialogHeader>
              <SharedCharacterForm onCharacterCreated={onCharacterCreated} />
            </DialogContent>
          </Dialog>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {userCharacters.length > 0 ? (
          <div className="space-y-3">
            {userCharacters.map((character) => {
              const role = getRoleFromSpec(character.class, character.spec)
              return (
                <div key={character.id} className="p-4 bg-muted rounded-lg">
                  {/* Mobile Layout */}
                  <div className="md:hidden">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 rounded-lg bg-background/50">
                        {getRoleIcon(role)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-lg mb-1" style={{ color: classColors[character.class] }}>
                          {character.name}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {character.spec} {character.class}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="font-semibold text-yellow-600 bg-yellow-600/10 px-3 py-1 rounded-md">
                        GS: {character.gearScore}
                      </div>
                      <Badge 
                        variant="outline" 
                        className={`text-xs px-2 py-1 ${
                          character.faction === Faction.ALLIANCE 
                            ? 'border-blue-500/30 text-blue-600 bg-blue-500/10' 
                            : 'border-red-500/30 text-red-600 bg-red-500/10'
                        }`}
                      >
                        {character.faction}
                      </Badge>
                    </div>
                  </div>

                  {/* Desktop Layout */}
                  <div className="hidden md:block">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-lg" style={{ color: classColors[character.class] }}>
                        {character.name}
                      </span>
                      {getRoleIcon(role)}
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <div>
                        {character.spec} {character.class}
                      </div>
                      <div className="flex items-center justify-between">
                        <span>GS: {character.gearScore}</span>
                        <Badge 
                          variant="outline" 
                          className={`text-xs px-2 py-0 ${
                            character.faction === Faction.ALLIANCE 
                              ? 'border-blue-500/30 text-blue-600 bg-blue-500/10' 
                              : 'border-red-500/30 text-red-600 bg-red-500/10'
                          }`}
                        >
                          {character.faction}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <Sword className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No characters added yet</p>
            <p className="text-sm text-muted-foreground mt-1">Add your first character to get started</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 