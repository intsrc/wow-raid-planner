"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, MessageSquare, Shield, Heart, Sword, Zap, AlertTriangle, Check } from "lucide-react"
import { getRoleFromSpec } from "../lib/character-utils"
import { classColors } from "../lib/mock-data"
import { apiClient } from "@/lib/api-client"
import { Raid, SignUp, Character } from "@/lib/types"
import { useModal } from "../contexts/modal-context"

interface RosterBuilderProps {
  raidId: string | null
  onBack: () => void
}

interface RosterSlot {
  id: string
  characterId?: string
  role: "tank" | "heal" | "melee" | "ranged"
}

export function RosterBuilder({ raidId, onBack }: RosterBuilderProps) {
  const [raid, setRaid] = useState<Raid | null>(null)
  const [raidSignUps, setRaidSignUps] = useState<SignUp[]>([])
  const [characters, setCharacters] = useState<Character[]>([])
  const [loading, setLoading] = useState(true)

  // Initialize roster slots
  const [rosterSlots, setRosterSlots] = useState<RosterSlot[]>([])
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  
  // Global modal hook
  const { showMessage, showConfirmation } = useModal()

  // Track changes to roster
  useEffect(() => {
    setHasUnsavedChanges(true)
  }, [rosterSlots])

  // Touch support for mobile drag and drop
  const [draggedCharacterId, setDraggedCharacterId] = useState<string | null>(null)
  const [touchStartPosition, setTouchStartPosition] = useState({ x: 0, y: 0 })

  // Fetch raid details and related data
  useEffect(() => {
    const fetchRosterData = async () => {
      if (!raidId) return
      
      try {
        setLoading(true)
        const [raidData, signUpsData, charactersData] = await Promise.all([
          apiClient.getRaidById(raidId),
          apiClient.getSignUpsByRaid(raidId),
          apiClient.getCharacters()
        ])
        
        setRaid(raidData)
        setRaidSignUps(signUpsData)
        setCharacters(charactersData)

        // Try to load existing roster first
        try {
          const existingRoster = await apiClient.getRoster(raidId)
          if (existingRoster && existingRoster.length > 0) {
            // Convert backend roster slots to frontend format
            const slots: RosterSlot[] = []
            let slotId = 1

            // Create empty slots first
            for (let i = 0; i < raidData.tankCap; i++) {
              slots.push({ id: `tank-${slotId++}`, role: "tank" })
            }
            for (let i = 0; i < raidData.healCap; i++) {
              slots.push({ id: `heal-${slotId++}`, role: "heal" })
            }
            for (let i = 0; i < raidData.meleeCap; i++) {
              slots.push({ id: `melee-${slotId++}`, role: "melee" })
            }
            for (let i = 0; i < raidData.rangedCap; i++) {
              slots.push({ id: `ranged-${slotId++}`, role: "ranged" })
            }

            // Fill slots with existing roster data
            existingRoster.forEach(rosterSlot => {
              const roleSlots = slots.filter(s => s.role === rosterSlot.role.toLowerCase())
              const emptySlot = roleSlots.find(s => !s.characterId)
              if (emptySlot) {
                emptySlot.characterId = rosterSlot.characterId
              }
            })

            setRosterSlots(slots)
            setHasUnsavedChanges(false) // Existing roster loaded, no unsaved changes
          } else {
            // Initialize empty roster slots
            const slots: RosterSlot[] = []
            let slotId = 1

            for (let i = 0; i < raidData.tankCap; i++) {
              slots.push({ id: `tank-${slotId++}`, role: "tank" })
            }
            for (let i = 0; i < raidData.healCap; i++) {
              slots.push({ id: `heal-${slotId++}`, role: "heal" })
            }
            for (let i = 0; i < raidData.meleeCap; i++) {
              slots.push({ id: `melee-${slotId++}`, role: "melee" })
            }
            for (let i = 0; i < raidData.rangedCap; i++) {
              slots.push({ id: `ranged-${slotId++}`, role: "ranged" })
            }

            setRosterSlots(slots)
            setHasUnsavedChanges(false) // New roster, no unsaved changes yet
          }
        } catch (error) {
          console.error('Error loading existing roster:', error)
          // Initialize empty roster slots as fallback
          const slots: RosterSlot[] = []
          let slotId = 1

          for (let i = 0; i < raidData.tankCap; i++) {
            slots.push({ id: `tank-${slotId++}`, role: "tank" })
          }
          for (let i = 0; i < raidData.healCap; i++) {
            slots.push({ id: `heal-${slotId++}`, role: "heal" })
          }
          for (let i = 0; i < raidData.meleeCap; i++) {
            slots.push({ id: `melee-${slotId++}`, role: "melee" })
          }
          for (let i = 0; i < raidData.rangedCap; i++) {
            slots.push({ id: `ranged-${slotId++}`, role: "ranged" })
          }

          setRosterSlots(slots)
          setHasUnsavedChanges(false) // Fallback empty roster
        }
      } catch (err) {
        console.error('Error fetching roster data:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchRosterData()
  }, [raidId])

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
      </div>
    )
  }

  if (!raid) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-400">Raid not found</p>
        <Button onClick={onBack} className="mt-4">
          Go Back
        </Button>
      </div>
    )
  }

  const getSignUpsByRole = () => {
    const signUpsByRole = {
      tank: [] as any[],
      heal: [] as any[],
      melee: [] as any[],
      ranged: [] as any[],
    }

    // Only include CONFIRMED signups for roster building
    raidSignUps
      .filter(signup => signup.status === 'CONFIRMED')
      .forEach((signup) => {
        // Use character data from signup (populated by API) instead of searching characters array
        const character = signup.character
        if (character) {
          const role = getRoleFromSpec(character.class, character.spec)
          signUpsByRole[role as keyof typeof signUpsByRole].push({
            ...signup,
            character,
          })
        }
      })

    return signUpsByRole
  }

  const signUpsByRole = getSignUpsByRole()
  const assignedCharacterIds = new Set(rosterSlots.map((slot) => slot.characterId).filter(Boolean))

  const handleDragStart = (e: React.DragEvent, characterId: string) => {
    e.dataTransfer.setData("text/plain", characterId)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent, slotId: string) => {
    e.preventDefault()
    const characterId = e.dataTransfer.getData("text/plain")
    
    // Find the character from signups data
    const signup = raidSignUps.find(s => s.character?.id === characterId)
    const character = signup?.character
    if (!character) return

    const characterRole = getRoleFromSpec(character.class, character.spec)
    const slot = rosterSlots.find((s) => s.id === slotId)
    if (!slot) return

    // Check if character can fill this role
    if (characterRole !== slot.role) {
      showMessage('Invalid Assignment', `${character.name} is a ${characterRole} and cannot be assigned to a ${slot.role} slot.`, 'error')
      return
    }

    // Update roster slots
    setRosterSlots((prev) =>
      prev.map((s) => {
        if (s.id === slotId) {
          return { ...s, characterId }
        }
        // Remove character from any other slot they might be in
        if (s.characterId === characterId) {
          return { ...s, characterId: undefined }
        }
        return s
      })
    )
  }

  // Mobile touch handlers
  const handleTouchStart = (e: React.TouchEvent, characterId: string) => {
    const touch = e.touches[0]
    setTouchStartPosition({ x: touch.clientX, y: touch.clientY })
    setDraggedCharacterId(characterId)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault() // Prevent scrolling
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!draggedCharacterId) return

    const touch = e.changedTouches[0]
    const element = document.elementFromPoint(touch.clientX, touch.clientY)
    
    // Find the drop target slot
    const slotElement = element?.closest('[data-slot-id]')
    if (slotElement) {
      const slotId = slotElement.getAttribute('data-slot-id')
      if (slotId) {
        // Find character from signups data
        const signup = raidSignUps.find(s => s.character?.id === draggedCharacterId)
        const character = signup?.character
        if (!character) return

        const characterRole = getRoleFromSpec(character.class, character.spec)
        const slot = rosterSlots.find((s) => s.id === slotId)
        if (!slot) return

        // Check if character can fill this role
        if (characterRole !== slot.role) {
          showMessage('Invalid Assignment', `${character.name} is a ${characterRole} and cannot be assigned to a ${slot.role} slot.`, 'error')
          setDraggedCharacterId(null)
          return
        }

        // Update roster slots
        setRosterSlots((prev) =>
          prev.map((s) => {
            if (s.id === slotId) {
              return { ...s, characterId: draggedCharacterId }
            }
            // Remove character from any other slot they might be in
            if (s.characterId === draggedCharacterId) {
              return { ...s, characterId: undefined }
            }
            return s
          })
        )
      }
    }

    setDraggedCharacterId(null)
  }

  const handleRemoveFromSlot = (slotId: string) => {
    setRosterSlots((prev) => prev.map((s) => (s.id === slotId ? { ...s, characterId: undefined } : s)))
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "tank":
        return <Shield className="w-4 h-4 text-blue-400" />
      case "heal":
        return <Heart className="w-4 h-4 text-green-400" />
      case "ranged":
        return <Zap className="w-4 h-4 text-purple-400" />
      default:
        return <Sword className="w-4 h-4 text-red-400" />
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case "tank":
        return "border-blue-500 bg-blue-500/10"
      case "heal":
        return "border-green-500 bg-green-500/10"
      case "ranged":
        return "border-purple-500 bg-purple-500/10"
      default:
        return "border-red-500 bg-red-500/10"
    }
  }

  const getFilledSlots = () => {
    return rosterSlots.filter((slot) => slot.characterId).length
  }

  const getTotalSlots = () => {
    return rosterSlots.length
  }

  const postToDiscord = () => {
    // Mock Discord webhook
    console.log("Posting roster to Discord")
    showMessage("Discord", "Roster posted to Discord!", "success")
  }

  // Save roster as draft (can be modified later)
  const saveRosterDraft = async () => {
    if (!raid || !raidId) return

    try {
      // Convert roster slots to the backend format
      const rosterSlotData = rosterSlots
        .filter(slot => slot.characterId)
        .map(slot => ({
          characterId: slot.characterId!,
          role: slot.role.toUpperCase() as any, // Convert to backend enum format
          position: slot.role === 'tank' && rosterSlots.filter(s => s.role === 'tank' && s.characterId).indexOf(slot) === 0 
            ? 'Main Tank' 
            : undefined
        }))

      await apiClient.createOrUpdateRoster(raidId, rosterSlotData)
      setHasUnsavedChanges(false)
      showMessage('Success', 'Roster draft saved successfully!', 'success')
    } catch (error) {
      console.error('Error saving roster:', error)
      showMessage('Error', error instanceof Error ? error.message : 'Failed to save roster', 'error')
    }
  }

  // Finalize roster (locks it and makes it official)
  const finalizeRoster = async () => {
    if (!raid || !raidId) return

    // Check if roster is complete enough
    const filledSlots = getFilledSlots()
    if (filledSlots === 0) {
      showMessage('Cannot Finalize', 'Cannot finalize an empty roster!', 'warning')
      return
    }

    showConfirmation(
      'Finalize Roster',
      `Are you sure you want to finalize this roster?\n\nThis will:\n• Lock the roster (no more changes)\n• Make it visible to all raid members\n• Change raid status to LOCKED\n\nCurrent roster: ${filledSlots}/${getTotalSlots()} slots filled`,
      async () => {
        try {
          // First save the current roster state
          const rosterSlotData = rosterSlots
            .filter(slot => slot.characterId)
            .map(slot => ({
              characterId: slot.characterId!,
              role: slot.role.toUpperCase() as any,
              position: slot.role === 'tank' && rosterSlots.filter(s => s.role === 'tank' && s.characterId).indexOf(slot) === 0 
                ? 'Main Tank' 
                : undefined
            }))

          await apiClient.createOrUpdateRoster(raidId, rosterSlotData)
          
          // Then finalize it
          await apiClient.finalizeRoster(raidId)
          
          setHasUnsavedChanges(false)
          showMessage('Success', 'Roster finalized successfully! 🎉', 'success')
          
          // Go back to raid details after a short delay
          setTimeout(() => {
            onBack()
          }, 1500)
        } catch (error) {
          console.error('Error finalizing roster:', error)
          showMessage('Error', error instanceof Error ? error.message : 'Failed to finalize roster', 'error')
        }
      },
      'danger'
    )
  }

  return (
    <div className="space-y-6">
      {/* Mobile-Optimized Header */}
      <div className="space-y-4 md:space-y-0">
        {/* Back Button and Title - Mobile Layout */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              onClick={onBack} 
              className="text-foreground flex-shrink-0"
              size="sm"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Back to Raid</span>
              <span className="sm:hidden">Back</span>
            </Button>
            <div className="min-w-0 flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <h1 className="text-xl md:text-2xl font-bold text-foreground truncate">
                  {raid.title}
                </h1>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm text-muted-foreground hidden sm:inline">-</span>
                  <span className="text-sm md:text-base text-muted-foreground">Roster Builder</span>
                  {hasUnsavedChanges && (
                    <Badge variant="outline" className="border-yellow-500 text-yellow-600 bg-yellow-500/10">
                      Unsaved Changes
                    </Badge>
                  )}
                  {raid.isRosterFinalized && (
                    <Badge variant="outline" className="border-green-500 text-green-600 bg-green-500/10">
                      🏆 Finalized
                    </Badge>
                  )}
                </div>
              </div>
              <p className="text-muted-foreground text-sm mt-1">
                {getFilledSlots()}/{getTotalSlots()} slots filled
              </p>
            </div>
          </div>

          {/* Action Buttons - Mobile Stack */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:flex sm:gap-2">
            <Button
              onClick={saveRosterDraft}
              variant="outline"
              className="border-blue-500 text-blue-600 hover:bg-blue-500/10"
              disabled={getFilledSlots() === 0}
              size="sm"
            >
              <Check className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Save Draft</span>
              <span className="sm:hidden">Save</span>
            </Button>
            <Button
              onClick={finalizeRoster}
              className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white"
              disabled={getFilledSlots() === 0}
              size="sm"
            >
              <Check className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Finalize Roster</span>
              <span className="sm:hidden">Finalize</span>
            </Button>
            <Button 
              onClick={postToDiscord} 
              className="bg-[#5865F2] hover:bg-[#4752C4] text-white"
              size="sm"
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Post to Discord</span>
              <span className="sm:hidden">Discord</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Available Players */}
        <div className="lg:col-span-1">
          <Card className="wotlk-card">
            <CardHeader>
              <CardTitle className="text-foreground">Available Players</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(signUpsByRole).map(([role, signups]) => (
                  <div key={role}>
                    <div className="flex items-center gap-2 mb-2">
                      {getRoleIcon(role)}
                      <h3 className="font-medium text-foreground capitalize">{role}</h3>
                      <Badge variant="outline" className="text-xs">
                        {signups.length}
                      </Badge>
                    </div>

                    <div className="space-y-2">
                      {signups.map((signup) => {
                        const isAssigned = assignedCharacterIds.has(signup.character.id)
                        return (
                          <div
                            key={signup.character.id}
                            draggable={!isAssigned}
                            onDragStart={(e) => handleDragStart(e, signup.character.id)}
                            onTouchStart={(e) => handleTouchStart(e, signup.character.id)}
                            onTouchMove={handleTouchMove}
                            onTouchEnd={handleTouchEnd}
                            className={`p-2 rounded-lg border transition-opacity ${
                              isAssigned
                                ? "opacity-50 cursor-not-allowed border-border bg-muted/30"
                                : "border-border bg-card/50 hover:bg-card active:bg-card/80 cursor-move touch-manipulation"
                            } ${draggedCharacterId === signup.character.id ? 'opacity-70 scale-95' : ''}`}
                          >
                            <div className="flex items-center justify-between">
                              <span
                                className="font-medium text-sm"
                                style={{ color: classColors[signup.character.class] }}
                              >
                                {signup.character.name}
                              </span>
                              <span className="text-xs text-muted-foreground">{signup.character.gearScore}</span>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {signup.character.spec} {signup.character.class}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Roster Grid */}
        <div className="lg:col-span-3">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {["tank", "heal", "melee", "ranged"].map((role) => {
              const roleSlots = rosterSlots.filter((slot) => slot.role === role)
              const roleCap = role === 'tank' ? raid.tankCap :
                             role === 'heal' ? raid.healCap :
                             role === 'melee' ? raid.meleeCap :
                             raid.rangedCap

              return (
                <Card key={role} className={`wotlk-card border-2 ${getRoleColor(role)}`}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-foreground flex items-center gap-2">
                      {getRoleIcon(role)}
                      <span className="capitalize">{role}</span>
                      <Badge variant="outline" className="ml-auto">
                        {roleSlots.filter((s) => s.characterId).length}/{roleCap}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {roleSlots.map((slot) => (
                        <div
                          key={slot.id}
                          data-slot-id={slot.id}
                          onDragOver={handleDragOver}
                          onDrop={(e) => handleDrop(e, slot.id)}
                          className={`min-h-[60px] p-3 border-2 border-dashed rounded-lg transition-colors touch-manipulation ${
                            slot.characterId
                              ? "border-border bg-card/50"
                              : "border-border hover:border-muted-foreground/50 hover:bg-card/30 active:bg-card/50"
                          }`}
                        >
                          {slot.characterId ? (
                            <div className="flex items-center justify-between">
                              <div>
                                {(() => {
                                  const character = characters.find((c) => c.id === slot.characterId)
                                  return (
                                    <>
                                      <div
                                        className="font-medium text-sm"
                                        style={{
                                          color: classColors[character?.class || ""]
                                        }}
                                      >
                                        {character?.name}
                                      </div>
                                      <div className="text-xs text-slate-400">
                                        {character?.spec} {character?.class}
                                      </div>
                                    </>
                                  )
                                })()}
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveFromSlot(slot.id)}
                                className="text-slate-400 hover:text-slate-100 p-1 h-auto"
                              >
                                ×
                              </Button>
                            </div>
                          ) : (
                            <div className="text-center text-slate-500 text-sm">Drop {role} here</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Warnings */}
          {getFilledSlots() < getTotalSlots() && (
            <Card className="bg-yellow-500/10 border-yellow-500/50 mt-6">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-yellow-400">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="font-medium">Incomplete Roster</span>
                </div>
                <p className="text-yellow-300/80 text-sm mt-1">
                  {getTotalSlots() - getFilledSlots()} slots remaining to fill
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
