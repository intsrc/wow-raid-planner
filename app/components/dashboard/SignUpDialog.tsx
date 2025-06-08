import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Crown, Users, UserPlus, Shield, Heart, Sword, Zap } from "lucide-react"
import { Character } from "@/lib/types"
import { classColors, classMap } from '../../lib/constants'
import { getRoleFromSpec } from '../../lib/dashboard-utils'

interface SignUpDialogProps {
  raid: any
  onSignUp: (characterId: string, note: string) => void
  userCharacters: Character[]
}

// Sign Up Dialog Component
export function SignUpDialog({ raid, onSignUp, userCharacters }: SignUpDialogProps) {
  const [selectedCharacter, setSelectedCharacter] = useState<string>('')
  const [note, setNote] = useState('')
  const [isOpen, setIsOpen] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedCharacter) {
      onSignUp(selectedCharacter, note)
      setIsOpen(false)
      setSelectedCharacter('')
      setNote('')
    }
  }

  const getCharacterRole = (character: any) => {
    return getRoleFromSpec(character.class, character.spec)
  }

  const getClassLabel = (classValue: string) => {
    return classMap[classValue] || classValue
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'tank': return <Shield className="w-4 h-4 text-blue-500" />
      case 'heal': return <Heart className="w-4 h-4 text-emerald-500" />
      case 'melee': return <Sword className="w-4 h-4 text-red-500" />
      case 'ranged': return <Zap className="w-4 h-4 text-purple-500" />
      default: return <Sword className="w-4 h-4 text-red-500" />
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="btn-enhanced flex-1 gap-2 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-medium">
          <UserPlus className="w-4 h-4" />
          Sign Up Now
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md w-[95vw] mx-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-yellow-500" />
            Sign Up for {raid.title}
          </DialogTitle>
        </DialogHeader>
        
        {userCharacters.length === 0 ? (
          <div className="text-center py-6">
            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No Characters Available</h3>
            <p className="text-muted-foreground mb-4">You need to add a character before signing up for raids.</p>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Close
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="character" className="text-sm font-medium mb-3 block">
                Select Character
              </Label>
              <Select value={selectedCharacter} onValueChange={setSelectedCharacter}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a character to sign up with" />
                </SelectTrigger>
                <SelectContent>
                  {userCharacters.map((character) => {
                    const role = getCharacterRole(character)
                    const classLabel = getClassLabel(character.class)
                    return (
                      <SelectItem key={character.id} value={character.id}>
                        <div className="flex items-center gap-2">
                          {getRoleIcon(role)}
                          <span style={{ color: classColors[classLabel] }} className="font-medium">
                            {character.name}
                          </span>
                          <span className="text-muted-foreground text-sm">
                            {character.spec} {classLabel} (GS: {character.gearScore})
                          </span>
                        </div>
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="note" className="text-sm font-medium mb-2 block">
                Note (Optional)
              </Label>
              <Textarea
                id="note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Any additional information (e.g., 'Can bring flask', 'Available for early start')"
                rows={2}
                className="resize-none"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={!selectedCharacter}
                className="flex-1 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-medium"
              >
                Sign Up
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
} 