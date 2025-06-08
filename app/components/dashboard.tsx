"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Clock, Users, Plus, Sword, Shield, Heart, Zap, Crown, Edit, UserPlus, UserMinus, ExternalLink, AlertCircle, CheckCircle, TrendingUp, ChevronDown, ChevronUp, Lock } from "lucide-react"
import { useAuth } from "../lib/auth-context"
import { useState, useEffect } from "react"
import { apiClient } from "@/lib/api-client"
import { Raid, Character, SignUp, WowRole, WowClass, Faction } from "@/lib/types"
import { SharedCharacterForm } from "./shared-character-form"
import { MessageModal, MessageType } from "./ui/message-modal"
import { getRoleFromSpec as getRoleFromSpecUtil } from "../lib/character-utils"

// WoW class colors for better UI
const classColors: Record<string, string> = {
  DEATH_KNIGHT: '#C41F3B',
  DRUID: '#FF7D0A',
  HUNTER: '#A9D271',
  MAGE: '#40C7EB',
  PALADIN: '#F58CBA',
  PRIEST: '#FFFFFF',
  ROGUE: '#FFF569',
  SHAMAN: '#0070DE',
  WARLOCK: '#8787ED',
  WARRIOR: '#C79C6E'
}

// Helper function to determine role from class and spec
const getRoleFromSpec = (wowClass: string, spec: string): string => {
  return getRoleFromSpecUtil(wowClass, spec)
}

interface DashboardProps {
  onRaidSelect: (raidId: string) => void
}

// Enhanced Slot Counter Component with better UX
function SlotCounter({ role, filled, cap, icon }: { role: string, filled: number, cap: number, icon: React.ReactNode }) {
  const percentage = (filled / cap) * 100
  const isFull = filled >= cap
  const isOverfilled = filled > cap
  const remaining = cap - filled
  
  const getStatusColor = () => {
    if (isOverfilled) return 'text-red-500'
    if (isFull) return 'text-yellow-600'
    if (filled / cap > 0.7) return 'text-orange-500'
    return 'text-emerald-500'
  }

  const getStatusText = () => {
    if (isOverfilled) return 'Overfilled'
    if (isFull) return 'Full'
    if (remaining === 1) return `Need ${remaining}`
    if (remaining > 1) return `Need ${remaining}`
    return 'Complete'
  }

  return (
    <div className="group relative p-4 rounded-xl border border-border/50 bg-gradient-to-br from-card to-card/80 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/15 transition-colors">
            {icon}
          </div>
          <span className="font-medium text-foreground capitalize">{role}s</span>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-foreground">{filled}</div>
          <div className="text-xs text-muted-foreground">of {cap}</div>
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className={`font-medium ${getStatusColor()}`}>
            {getStatusText()}
          </span>
          <span className="text-muted-foreground">
            {Math.round(percentage)}%
          </span>
        </div>
        
        <div className="relative h-2 bg-muted rounded-full overflow-hidden">
          <div 
            className={`progress-bar h-full transition-all duration-500 ease-out rounded-full ${
              isOverfilled 
                ? 'bg-gradient-to-r from-red-500 to-red-600' 
                : isFull 
                ? 'bg-gradient-to-r from-yellow-500 to-yellow-600' 
                : 'bg-gradient-to-r from-emerald-500 to-emerald-600'
            }`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
          {isOverfilled && (
            <div className="absolute inset-0 bg-red-500/20 animate-pulse" />
          )}
        </div>
      </div>
    </div>
  )
}

// Compact Slot Counter for Collapsed State
function CompactSlotCounter({ role, filled, cap, icon }: { role: string, filled: number, cap: number, icon: React.ReactNode }) {
  const percentage = (filled / cap) * 100
  const isFull = filled >= cap
  const isOverfilled = filled > cap
  
  const getStatusColor = () => {
    if (isOverfilled) return 'text-red-500'
    if (isFull) return 'text-yellow-600'
    if (filled / cap > 0.7) return 'text-orange-500'
    return 'text-emerald-500'
  }

  return (
    <div className="group relative p-2 rounded-lg border border-border/50 bg-gradient-to-br from-card to-card/80 transition-all duration-300">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <div className="p-1 rounded bg-primary/10 group-hover:bg-primary/15 transition-colors">
            {icon}
          </div>
          <span className="text-xs font-medium text-foreground capitalize">{role}s</span>
        </div>
        <div className="text-right">
          <div className="text-sm font-bold text-foreground">{filled}</div>
          <div className="text-xs text-muted-foreground leading-none">of {cap}</div>
        </div>
      </div>
      
      <div className="relative h-1.5 bg-muted rounded-full overflow-hidden">
        <div 
          className={`h-full transition-all duration-500 ease-out rounded-full ${
            isOverfilled 
              ? 'bg-gradient-to-r from-red-500 to-red-600' 
              : isFull 
              ? 'bg-gradient-to-r from-yellow-500 to-yellow-600' 
              : 'bg-gradient-to-r from-emerald-500 to-emerald-600'
          }`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
        {isOverfilled && (
          <div className="absolute inset-0 bg-red-500/20 animate-pulse" />
        )}
      </div>
    </div>
  )
}

// Enhanced Character Sign-up Row with Avatar
function CharacterSignUpRow({ character, signup, role }: { character: any, signup: any, role: string }) {
  // User data should come from character.user or signup.user if populated
  const user = character.user || signup.user
  
  const getRoleColor = (role: string) => {
    switch (role) {
      case 'tank': return 'text-blue-500 bg-blue-500/10'
      case 'heal': return 'text-emerald-500 bg-emerald-500/10'
      case 'melee': return 'text-red-500 bg-red-500/10'
      case 'ranged': return 'text-purple-500 bg-purple-500/10'
      default: return 'text-gray-500 bg-gray-500/10'
    }
  }

  return (
    <div className="signup-row group flex items-center gap-4 p-4 rounded-xl border border-border/50 bg-card/50 hover:bg-card/80 hover:shadow-md transition-all duration-200">
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
  )
}

// Empty State Component
function EmptyRoleState({ role, count }: { role: string, count: number }) {
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

// Raid Status Indicator
function RaidStatusIndicator({ raid, signUpsCount, isUserSignedUp }: { raid: any, signUpsCount: number, isUserSignedUp?: boolean }) {
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

// Sign Up Dialog Component
function SignUpDialog({ raid, onSignUp, userCharacters }: { raid: any, onSignUp: (characterId: string, note: string) => void, userCharacters: Character[] }) {
  const { user } = useAuth()
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
    const classMap: { [key: string]: string } = {
      'DEATH_KNIGHT': 'Death Knight',
      'DEMON_HUNTER': 'Demon Hunter',
      'DRUID': 'Druid',
      'HUNTER': 'Hunter',
      'MAGE': 'Mage',
      'MONK': 'Monk',
      'PALADIN': 'Paladin',
      'PRIEST': 'Priest',
      'ROGUE': 'Rogue',
      'SHAMAN': 'Shaman',
      'WARLOCK': 'Warlock',
      'WARRIOR': 'Warrior'
    }
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
        <Button className="btn-enhanced flex-1 gap-2 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800">
          <UserPlus className="w-4 h-4" />
          Sign Up Now
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
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
                className="flex-1 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800"
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

// Expandable Raid Card Component
function RaidCard({ raid, signUps, isUserSignedUp, user, onRaidSelect, onSignUp, onWithdraw, userCharacters }: { 
  raid: any, 
  signUps: any, 
  isUserSignedUp: boolean, 
  user: any,
  onRaidSelect: (raidId: string) => void,
  onSignUp: (raidId: string, characterId: string, note: string) => void,
  onWithdraw: (raidId: string) => void,
  userCharacters: Character[]
}) {
  const [isExpanded, setIsExpanded] = useState(false)
  // Provide fallback for signUps if undefined
  const safeSignUps = signUps || { tank: [], heal: [], melee: [], ranged: [] }
  const totalSignedUp = Object.values(safeSignUps).flat().length

  // Enhanced date formatting
  const raidDate = new Date(raid.date)
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(today.getDate() + 1)
  
  const getRelativeDate = () => {
    if (raidDate.toDateString() === today.toDateString()) return "Today"
    if (raidDate.toDateString() === tomorrow.toDateString()) return "Tomorrow"
    
    const diffTime = raidDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays <= 7) return `In ${diffDays} day${diffDays > 1 ? 's' : ''}`
    return raidDate.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'short', 
      day: 'numeric' 
    })
  }

  const getDateUrgency = () => {
    const diffTime = raidDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return 'today'
    if (diffDays === 1) return 'tomorrow'
    if (diffDays <= 3) return 'soon'
    return 'normal'
  }

  const dateUrgency = getDateUrgency()
  const relativeDate = getRelativeDate()

  return (
    <Card className="wotlk-card overflow-hidden">
      {/* Clickable Header - Always Visible */}
      <CardHeader 
        className="pb-4 cursor-pointer transition-colors duration-200 hover:bg-card/80" 
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 border border-yellow-500/20">
              <Crown className="w-5 h-5 text-yellow-500" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-xl text-foreground">{raid.title}</CardTitle>
              <p className="text-sm text-muted-foreground">{raid.instance}</p>
            </div>
          </div>

          {/* Enhanced but Compact Date Display */}
          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-3 px-3 py-2 rounded-lg border transition-all duration-200 ${
              dateUrgency === 'today' 
                ? 'bg-red-500/10 border-red-500/30 text-red-600' 
                : dateUrgency === 'tomorrow' 
                ? 'bg-orange-500/10 border-orange-500/30 text-orange-600'
                : dateUrgency === 'soon' 
                ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-600'
                : 'bg-primary/10 border-primary/30 text-primary'
            }`}>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <div>
                  <div className="text-sm font-semibold leading-none">
                    {raidDate.toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </div>
                  <div className="text-xs opacity-80 leading-none mt-0.5">
                    {relativeDate}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1 text-sm">
                <Clock className="w-3 h-3" />
                {raid.startTime}
              </div>
            </div>

            <RaidStatusIndicator raid={raid} signUpsCount={totalSignedUp} isUserSignedUp={isUserSignedUp} />
            <Badge variant="outline" className="px-2 py-1 text-xs">
              {totalSignedUp}/25
            </Badge>
            <div className="text-muted-foreground">
              {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </div>
          </div>
        </div>
      </CardHeader>
      {/* Compact Slot Counters - Only When Collapsed */}
      {!isExpanded && (
        <div className="px-6 pb-4">
          <div className="grid grid-cols-4 gap-3 mt-4">
            <CompactSlotCounter 
              role="tank" 
              filled={safeSignUps.tank.length} 
              cap={raid.tankCap}
              icon={<Shield className="w-3 h-3 text-blue-500" />}
            />
            <CompactSlotCounter 
              role="heal" 
              filled={safeSignUps.heal.length} 
              cap={raid.healCap}
              icon={<Heart className="w-3 h-3 text-emerald-500" />}
            />
            <CompactSlotCounter 
              role="melee" 
              filled={safeSignUps.melee.length} 
              cap={raid.meleeCap}
              icon={<Sword className="w-3 h-3 text-red-500" />}
            />
            <CompactSlotCounter 
              role="ranged" 
              filled={safeSignUps.ranged.length} 
              cap={raid.rangedCap}
              icon={<Zap className="w-3 h-3 text-purple-500" />}
            />
          </div>
        </div>
      )}
      {/* Expanded Content - Show/Hide */}
      {isExpanded && (
        <CardContent className="pt-0 space-y-6">
          {raid.description && (
            <p className="text-sm text-muted-foreground italic border-l-2 border-primary/30 pl-3">
              {raid.description}
            </p>
          )}

          {/* Enhanced Slot Counters */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <SlotCounter 
              role="tank" 
              filled={safeSignUps.tank.length} 
              cap={raid.tankCap}
              icon={<Shield className="w-5 h-5 text-blue-500" />}
            />
            <SlotCounter 
              role="heal" 
              filled={safeSignUps.heal.length} 
              cap={raid.healCap}
              icon={<Heart className="w-5 h-5 text-emerald-500" />}
            />
            <SlotCounter 
              role="melee" 
              filled={safeSignUps.melee.length} 
              cap={raid.meleeCap}
              icon={<Sword className="w-5 h-5 text-red-500" />}
            />
            <SlotCounter 
              role="ranged" 
              filled={safeSignUps.ranged.length} 
              cap={raid.rangedCap}
              icon={<Zap className="w-5 h-5 text-purple-500" />}
            />
          </div>

          {/* Enhanced Sign-ups Display */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Users className="w-5 h-5" />
                Current Roster ({totalSignedUp}/25)
              </h3>
              <Badge variant="outline" className="px-3 py-1">
                {Math.round((totalSignedUp / 25) * 100)}% filled
              </Badge>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Tanks */}
              <div className="space-y-3">
                <h4 className="font-medium text-foreground flex items-center gap-2">
                  <Shield className="w-4 h-4 text-blue-500" />
                  Tanks ({safeSignUps.tank.length}/{raid.tankCap})
                </h4>
                <div className="space-y-2">
                  {safeSignUps.tank.length > 0 ? (
                    safeSignUps.tank.map(({ signup, character }: any) => (
                      <CharacterSignUpRow key={signup.id} character={character} signup={signup} role="tank" />
                    ))
                  ) : (
                    <EmptyRoleState role="tank" count={raid.tankCap} />
                  )}
                </div>
              </div>

              {/* Healers */}
              <div className="space-y-3">
                <h4 className="font-medium text-foreground flex items-center gap-2">
                  <Heart className="w-4 h-4 text-emerald-500" />
                  Healers ({safeSignUps.heal.length}/{raid.healCap})
                </h4>
                <div className="space-y-2">
                  {safeSignUps.heal.length > 0 ? (
                    safeSignUps.heal.map(({ signup, character }: any) => (
                      <CharacterSignUpRow key={signup.id} character={character} signup={signup} role="heal" />
                    ))
                  ) : (
                    <EmptyRoleState role="heal" count={raid.healCap - safeSignUps.heal.length} />
                  )}
                </div>
              </div>

              {/* Melee DPS */}
              <div className="space-y-3">
                <h4 className="font-medium text-foreground flex items-center gap-2">
                  <Sword className="w-4 h-4 text-red-500" />
                  Melee DPS ({safeSignUps.melee.length}/{raid.meleeCap})
                </h4>
                <div className="space-y-2">
                  {safeSignUps.melee.length > 0 ? (
                    safeSignUps.melee.map(({ signup, character }: any) => (
                      <CharacterSignUpRow key={signup.id} character={character} signup={signup} role="melee" />
                    ))
                  ) : (
                    <EmptyRoleState role="melee" count={raid.meleeCap - safeSignUps.melee.length} />
                  )}
                </div>
              </div>

              {/* Ranged DPS */}
              <div className="space-y-3">
                <h4 className="font-medium text-foreground flex items-center gap-2">
                  <Zap className="w-4 h-4 text-purple-500" />
                  Ranged DPS ({safeSignUps.ranged.length}/{raid.rangedCap})
                </h4>
                <div className="space-y-2">
                  {safeSignUps.ranged.length > 0 ? (
                    safeSignUps.ranged.map(({ signup, character }: any) => (
                      <CharacterSignUpRow key={signup.id} character={character} signup={signup} role="ranged" />
                    ))
                  ) : (
                    <EmptyRoleState role="ranged" count={raid.rangedCap - safeSignUps.ranged.length} />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-border/50">
            <Button
              onClick={() => onRaidSelect(raid.id)}
              variant="outline"
              className="btn-enhanced flex-1 gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              View Full Details
            </Button>
            {isUserSignedUp ? (
              <Button 
                variant="destructive" 
                className="btn-enhanced flex-1 gap-2"
                onClick={() => onWithdraw(raid.id)}
                disabled={raid.status === 'LOCKED'}
              >
                <UserMinus className="w-4 h-4" />
                {raid.status === 'LOCKED' ? 'Roster Locked' : 'Withdraw from Raid'}
              </Button>
            ) : raid.status === 'LOCKED' ? (
              <Button 
                variant="outline" 
                className="btn-enhanced flex-1 gap-2"
                disabled
              >
                <Lock className="w-4 h-4" />
                Roster Locked
              </Button>
            ) : (
              <SignUpDialog raid={raid} onSignUp={(characterId, note) => {
                onSignUp(raid.id, characterId, note)
              }} userCharacters={userCharacters} />
            )}
          </div>
        </CardContent>
      )}
    </Card>
  )
}

// Create Raid Form Component
function CreateRaidForm({ onRaidCreated }: { onRaidCreated?: () => void }) {
  const [formData, setFormData] = useState({
    title: '',
    instance: '',
    date: '',
    startTime: '',
    description: '',
    tankCap: 2,
    healCap: 5,
    meleeCap: 9,
    rangedCap: 9
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Modal state
  const [messageModal, setMessageModal] = useState<{
    isOpen: boolean
    title: string
    message: string
    type?: MessageType
  }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'info'
  })

  const showMessage = (title: string, message: string, type: MessageType = 'info') => {
    setMessageModal({
      isOpen: true,
      title,
      message,
      type
    })
  }

  const instances = [
    'Icecrown Citadel',
    'Ruby Sanctum', 
    'Trial of the Crusader',
    'Ulduar',
    'Naxxramas',
    'The Eye of Eternity',
    'The Obsidian Sanctum',
    'Vault of Archavon'
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      await apiClient.createRaid(formData)
      
      // Reset form
      setFormData({
        title: '',
        instance: '',
        date: '',
        startTime: '',
        description: '',
        tankCap: 2,
        healCap: 5,
        meleeCap: 9,
        rangedCap: 9
      })
      
      // Notify parent to refresh data
      if (onRaidCreated) {
        onRaidCreated()
      }
      
      showMessage('Success', 'Raid created successfully!', 'success')
    } catch (err) {
      console.error('Error creating raid:', err)
      showMessage('Error', err instanceof Error ? err.message : 'Failed to create raid', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="title">Raid Title</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
            placeholder="ICC 25 Heroic"
            required
          />
        </div>
        <div>
          <Label htmlFor="instance">Instance</Label>
          <Select 
            value={formData.instance} 
            onValueChange={(value) => setFormData({...formData, instance: value})}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select instance" />
            </SelectTrigger>
            <SelectContent>
              {instances.map((instance) => (
                <SelectItem key={instance} value={instance}>{instance}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="date">Date</Label>
          <Input
            id="date"
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({...formData, date: e.target.value})}
            required
          />
        </div>
        <div>
          <Label htmlFor="startTime">Start Time</Label>
          <Input
            id="startTime"
            type="time"
            value={formData.startTime}
            onChange={(e) => setFormData({...formData, startTime: e.target.value})}
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="description">Description (Optional)</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({...formData, description: e.target.value})}
          placeholder="Full clear attempt, need experienced players with 5700+ GS"
          rows={3}
        />
      </div>

      <div>
        <Label className="text-sm font-medium mb-3 block">Role Slots</Label>
        <div className="grid grid-cols-4 gap-4">
          <div>
            <Label htmlFor="tankCap" className="text-xs">Tanks</Label>
            <Input
              id="tankCap"
              type="number"
              min="1"
              max="10"
              value={formData.tankCap}
              onChange={(e) => setFormData({...formData, tankCap: parseInt(e.target.value)})}
            />
          </div>
          <div>
            <Label htmlFor="healCap" className="text-xs">Healers</Label>
            <Input
              id="healCap"
              type="number"
              min="1"
              max="10"
              value={formData.healCap}
              onChange={(e) => setFormData({...formData, healCap: parseInt(e.target.value)})}
            />
          </div>
          <div>
            <Label htmlFor="meleeCap" className="text-xs">Melee DPS</Label>
            <Input
              id="meleeCap"
              type="number"
              min="1"
              max="15"
              value={formData.meleeCap}
              onChange={(e) => setFormData({...formData, meleeCap: parseInt(e.target.value)})}
            />
          </div>
          <div>
            <Label htmlFor="rangedCap" className="text-xs">Ranged DPS</Label>
            <Input
              id="rangedCap"
              type="number"
              min="1"
              max="15"
              value={formData.rangedCap}
              onChange={(e) => setFormData({...formData, rangedCap: parseInt(e.target.value)})}
            />
          </div>
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <Button type="submit" className="flex-1" disabled={isSubmitting}>
          {isSubmitting ? 'Creating...' : 'Create Raid'}
        </Button>
        <Button type="button" variant="outline" className="flex-1" disabled={isSubmitting}>
          Cancel
        </Button>
      </div>

      {/* Modal */}
      <MessageModal
        isOpen={messageModal.isOpen}
        onClose={() => setMessageModal(prev => ({ ...prev, isOpen: false }))}
        title={messageModal.title}
        message={messageModal.message}
        type={messageModal.type}
      />
    </form>
  )
}



export function Dashboard({ onRaidSelect }: DashboardProps) {
  const { user } = useAuth()
  const [raids, setRaids] = useState<Raid[]>([])
  const [userCharacters, setUserCharacters] = useState<Character[]>([])
  const [userSignUps, setUserSignUps] = useState<SignUp[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Modal state
  const [messageModal, setMessageModal] = useState<{
    isOpen: boolean
    title: string
    message: string
    type?: MessageType
  }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'info'
  })

  const showMessage = (title: string, message: string, type: MessageType = 'info') => {
    setMessageModal({
      isOpen: true,
      title,
      message,
      type
    })
  }

  // Fetch data function
  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Fetch all data in parallel
      const [raidsData, charactersData, signUpsData] = await Promise.all([
        apiClient.getRaids(),
        apiClient.getCharacters(),
        apiClient.getSignUps()
      ])
      
      setRaids(raidsData)
      setUserCharacters(charactersData)
      setUserSignUps(signUpsData)
    } catch (err) {
      console.error('Error fetching dashboard data:', err)
      setError(err instanceof Error ? err.message : 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  // Fetch data on component mount
  useEffect(() => {
    if (user) {
      fetchData()
    }
  }, [user])

  // Filter upcoming raids
  const upcomingRaids = raids
    .filter((raid) => new Date(raid.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  // Handle sign-up for raid
  const handleSignUp = async (raidId: string, characterId: string, note: string) => {
    try {
      await apiClient.createSignUp({ raidId, characterId, note })
      
      // Refresh sign-ups data
      const updatedSignUps = await apiClient.getSignUps()
      setUserSignUps(updatedSignUps)
      
      // Show success message
      showMessage('Success', 'Successfully signed up for the raid!', 'success')
    } catch (err) {
      console.error('Error signing up for raid:', err)
      showMessage('Error', err instanceof Error ? err.message : 'Failed to sign up for raid', 'error')
    }
  }

  // Handle withdraw from raid
  const handleWithdraw = async (raidId: string) => {
    try {
      // Find the user's signup for this raid
      const userSignUp = userSignUps.find(s => s.raidId === raidId)
      if (userSignUp) {
        await apiClient.deleteSignUp(userSignUp.id)
        // Refresh sign-ups data
        const updatedSignUps = await apiClient.getSignUps()
        setUserSignUps(updatedSignUps)
        showMessage('Success', 'Successfully withdrew from raid!', 'success')
      }
    } catch (err) {
      console.error('Error withdrawing from raid:', err)
      showMessage('Error', err instanceof Error ? err.message : 'Failed to withdraw from raid', 'error')
    }
  }

  // Get sign-ups for raid grouped by role
  const getSignUpsByRole = (raidId: string) => {
    const raidSignUps = userSignUps.filter(s => s.raidId === raidId)
    const signUpsWithCharacters = raidSignUps.map(signup => {
      const character = userCharacters.find(c => c.id === signup.characterId)
      return { 
        signup, 
        character, 
        role: character ? getRoleFromSpec(character.class, character.spec) : WowRole.MELEE 
      }
    }).filter(item => item.character)

    return {
      tank: signUpsWithCharacters.filter(item => item.role === WowRole.TANK),
      heal: signUpsWithCharacters.filter(item => item.role === WowRole.HEAL),
      melee: signUpsWithCharacters.filter(item => item.role === WowRole.MELEE),
      ranged: signUpsWithCharacters.filter(item => item.role === WowRole.RANGED),
    }
  }

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
            <Card key={i} className="wotlk-card">
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-muted rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="wotlk-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Your Characters</p>
                <p className="text-2xl font-bold text-foreground">{userCharacters.length}</p>
              </div>
              <Users className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="wotlk-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Active Sign-ups</p>
                <p className="text-2xl font-bold text-foreground">{userSignUps.length}</p>
              </div>
              <Calendar className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="wotlk-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Upcoming Raids</p>
                <p className="text-2xl font-bold text-foreground">
                  {upcomingRaids.length}
                </p>
              </div>
              <Crown className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="wotlk-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Avg Gear Score</p>
                <p className="text-2xl font-bold text-foreground">
                  {userCharacters.length > 0
                    ? Math.round(userCharacters.reduce((sum, c) => sum + c.gearScore, 0) / userCharacters.length)
                    : 0}
                </p>
              </div>
              <Shield className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Raids Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Crown className="w-6 h-6 text-yellow-500" />
            Upcoming Raids
          </h2>
          {(user?.role === "RAID_LEADER" || user?.role === "ADMIN") && (
            <Dialog>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="w-4 h-4" />
                  Create New Raid
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Crown className="w-5 h-5 text-yellow-500" />
                    Create New Raid
                  </DialogTitle>
                </DialogHeader>
                <CreateRaidForm onRaidCreated={fetchData} />
              </DialogContent>
            </Dialog>
          )}
        </div>

        {upcomingRaids.length > 0 ? (
          <div className="space-y-4">
            {upcomingRaids.map((raid) => {
              const raidSignUps = getSignUpsByRole(raid.id)
              const isUserSignedUp = userSignUps.some(s => s.raidId === raid.id)
              
              return (
                <RaidCard 
                  key={raid.id}
                  raid={raid} 
                  signUps={raidSignUps} 
                  isUserSignedUp={isUserSignedUp} 
                  user={user} 
                  onRaidSelect={onRaidSelect}
                  onSignUp={(raidId, characterId, note) => {
                    handleSignUp(raidId, characterId, note)
                  }}
                  onWithdraw={handleWithdraw}
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
                      <Button className="gap-2">
                        <Plus className="w-4 h-4" />
                        Create New Raid
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                          <Crown className="w-5 h-5 text-yellow-500" />
                          Create New Raid
                        </DialogTitle>
                      </DialogHeader>
                      <CreateRaidForm onRaidCreated={fetchData} />
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Your Sign-ups */}
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
                      className="flex items-center justify-between p-3 bg-muted rounded-lg"
                    >
                      <div className="flex items-center gap-3">
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
                      <div className="flex items-center gap-2">
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
                          onClick={async () => {
                            try {
                              await apiClient.deleteSignUp(signup.id)
                              // Refresh sign-ups data
                              const updatedSignUps = await apiClient.getSignUps()
                              setUserSignUps(updatedSignUps)
                              showMessage('Success', 'Successfully withdrew from raid!', 'success')
                            } catch (err) {
                              console.error('Error withdrawing from raid:', err)
                              showMessage('Error', err instanceof Error ? err.message : 'Failed to withdraw from raid', 'error')
                            }
                          }}
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

        {/* Your Characters */}
        <Card className="wotlk-card">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sword className="w-5 h-5 text-yellow-500" />
                Your Characters
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="sm" className="bg-primary hover:bg-primary/90">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Character
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Sword className="w-5 h-5 text-yellow-500" />
                      Add New Character
                    </DialogTitle>
                  </DialogHeader>
                  <SharedCharacterForm onCharacterCreated={fetchData} />
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
