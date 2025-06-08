import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, Users, Crown, Edit, UserPlus, UserMinus, ExternalLink, CheckCircle, ChevronDown, ChevronUp, Lock, Shield, Heart, Sword, Zap } from "lucide-react"
import { Character } from "@/lib/types"
import { getRelativeDate, getDateUrgency } from '../../lib/dashboard-utils'
import { SlotCounter, CompactSlotCounter } from './SlotCounter'
import { CharacterSignUpRow } from './CharacterSignUpRow'
import { EmptyRoleState } from './EmptyRoleState'
import { RaidStatusIndicator } from './RaidStatusIndicator'
import { SignUpDialog } from './SignUpDialog'

interface RaidCardProps {
  raid: any
  signUps: any
  isUserSignedUp: boolean
  user: any
  onRaidSelect: (raidId: string) => void
  onSignUp: (raidId: string, characterId: string, note: string) => void
  onWithdraw: (raidId: string) => void
  userCharacters: Character[]
}

// Expandable Raid Card Component
export function RaidCard({ 
  raid, 
  signUps, 
  isUserSignedUp, 
  user,
  onRaidSelect,
  onSignUp,
  onWithdraw,
  userCharacters 
}: RaidCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  
  // Provide fallback for signUps if undefined
  const safeSignUps = signUps || { tank: [], heal: [], melee: [], ranged: [] }
  const totalSignedUp = Object.values(safeSignUps).flat().length

  // Enhanced date formatting
  const raidDate = new Date(raid.date)
  const dateUrgency = getDateUrgency(raidDate)
  const relativeDate = getRelativeDate(raidDate)

  return (
    <Card className="wotlk-card overflow-hidden">
      {/* Clickable Header - Always Visible */}
      <CardHeader 
        className="pb-4 cursor-pointer transition-colors duration-200 hover:bg-card/80" 
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {/* Mobile Layout - Completely Redesigned for Mobile UX */}
        <div className="md:hidden space-y-4">
          {/* Header - Clean title with expand indicator */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Crown className="w-5 h-5 text-yellow-500 flex-shrink-0" />
                <CardTitle className="text-lg font-bold text-foreground truncate">{raid.title}</CardTitle>
              </div>
              <p className="text-sm text-muted-foreground truncate">{raid.instance}</p>
            </div>
            <button className="p-1 -mr-1 text-muted-foreground">
              {isExpanded ? <ChevronUp className="w-6 h-6" /> : <ChevronDown className="w-6 h-6" />}
            </button>
          </div>
          
          {/* When & Status - Stack vertically for readability */}
          <div className="space-y-3">
            {/* Date & Time - Enhanced with urgency styling */}
            <div className={`flex items-center justify-between text-sm px-3 py-2.5 rounded-lg border transition-all duration-200 ${
              dateUrgency === 'today' 
                ? 'bg-red-500/15 border-red-500/30 text-red-700' 
                : dateUrgency === 'tomorrow' 
                ? 'bg-orange-500/15 border-orange-500/30 text-orange-700'
                : dateUrgency === 'soon' 
                ? 'bg-yellow-500/15 border-yellow-500/30 text-yellow-700'
                : 'bg-muted/50 border-border text-foreground'
            }`}>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <div>
                  <div className="font-semibold leading-tight">
                    {raidDate.toLocaleDateString('en-US', { 
                      weekday: 'short',
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </div>
                  <div className="text-xs opacity-80">
                    {getRelativeDate(raidDate)}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold leading-tight">{raid.startTime}</div>
                {(dateUrgency === 'today' || dateUrgency === 'tomorrow') && (
                  <div className="text-xs font-bold opacity-90">
                    {dateUrgency.toUpperCase()}
                  </div>
                )}
              </div>
            </div>
            
            {/* Status - Clear and prominent */}
            <div className="flex items-center justify-between">
              <div className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium ${
                isUserSignedUp 
                  ? 'bg-emerald-500/15 text-emerald-700 border border-emerald-500/30'
                  : raid.status === 'LOCKED'
                  ? 'bg-red-500/15 text-red-700 border border-red-500/30'
                  : 'bg-blue-500/15 text-blue-700 border border-blue-500/30'
              }`}>
                {isUserSignedUp ? (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm">You're in</span>
                  </>
                ) : raid.status === 'LOCKED' ? (
                  <>
                    <Lock className="w-4 h-4" />
                    <span className="text-sm">Locked</span>
                  </>
                ) : (
                  <>
                    <Users className="w-4 h-4" />
                    <span className="text-sm ">Open for signups</span>
                  </>
                )}
              </div>
              
              {/* Roster count - Big and clear */}
              <div className="text-right">
                <div className="text-2xl font-bold text-foreground leading-none">{totalSignedUp}</div>
                <div className="text-xs text-muted-foreground">of 25 players</div>
              </div>
            </div>
            
            {/* Simple visual progress - only if not expanded */}
            {!isExpanded && (
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Roster Progress</span>
                  <span>{Math.round((totalSignedUp / 25) * 100)}% filled</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-700 rounded-full ${
                      totalSignedUp >= 25 ? 'bg-emerald-500' : 
                      totalSignedUp >= 20 ? 'bg-yellow-500' : 
                      'bg-blue-500'
                    }`}
                    style={{ width: `${Math.min((totalSignedUp / 25) * 100, 100)}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden md:flex items-center justify-between">
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

      {/* Mobile Collapsed: Clean Quick Actions */}
      {!isExpanded && (
        <div className="px-4 md:px-6 pb-4">
          {/* Mobile: Simple role summary + quick action */}
          <div className="md:hidden space-y-3">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-4 text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Shield className="w-3 h-3 text-blue-500" />
                  {safeSignUps.tank.length}/{raid.tankCap}
                </span>
                <span className="flex items-center gap-1">
                  <Heart className="w-3 h-3 text-emerald-500" />
                  {safeSignUps.heal.length}/{raid.healCap}
                </span>
                <span className="flex items-center gap-1">
                  <Sword className="w-3 h-3 text-red-500" />
                  {safeSignUps.melee.length}/{raid.meleeCap}
                </span>
                <span className="flex items-center gap-1">
                  <Zap className="w-3 h-3 text-purple-500" />
                  {safeSignUps.ranged.length}/{raid.rangedCap}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  setIsExpanded(true)
                }}
                className="text-xs px-3"
              >
                Details
              </Button>
            </div>
            
            {/* Quick Action Button */}
            <div className="flex gap-2">
              {isUserSignedUp ? (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    onWithdraw(raid.id)
                  }}
                  disabled={raid.status === 'LOCKED'}
                  className="flex-1 text-sm"
                >
                  <UserMinus className="w-4 h-4 mr-2" />
                  {raid.status === 'LOCKED' ? 'Locked' : 'Withdraw'}
                </Button>
              ) : raid.status === 'LOCKED' ? (
                <Button 
                  variant="outline" 
                  size="sm"
                  disabled
                  className="flex-1 text-sm"
                >
                  <Lock className="w-4 h-4 mr-2" />
                  Roster Locked
                </Button>
              ) : (
                <SignUpDialog raid={raid} onSignUp={(characterId, note) => {
                  onSignUp(raid.id, characterId, note)
                }} userCharacters={userCharacters} />
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  onRaidSelect(raid.id)
                }}
                className="px-3"
              >
                <ExternalLink className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Desktop: Keep original compact counters */}
          <div className="hidden md:grid md:grid-cols-4 gap-2 mt-4">
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
          <div className="flex flex-col gap-3 pt-6 border-t border-border/50">
            <Button
              onClick={() => onRaidSelect(raid.id)}
              variant="outline"
              className="btn-enhanced w-full gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              View Full Details
            </Button>
            {isUserSignedUp ? (
              <Button 
                variant="destructive" 
                className="btn-enhanced w-full gap-2"
                onClick={() => onWithdraw(raid.id)}
                disabled={raid.status === 'LOCKED'}
              >
                <UserMinus className="w-4 h-4" />
                {raid.status === 'LOCKED' ? 'Roster Locked' : 'Withdraw from Raid'}
              </Button>
            ) : raid.status === 'LOCKED' ? (
              <Button 
                variant="outline" 
                className="btn-enhanced w-full gap-2"
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