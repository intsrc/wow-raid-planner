"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Download, MessageSquare, Shield, Heart, Sword, Zap, AlertTriangle } from "lucide-react"
import { mockRaids, mockSignUps, mockCharacters, classColors, getRoleFromSpec } from "../lib/mock-data"

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
  const raid = mockRaids.find((r) => r.id === raidId)
  const raidSignUps = mockSignUps.filter((s) => s.raidId === raidId)

  // Initialize roster slots
  const [rosterSlots, setRosterSlots] = useState<RosterSlot[]>(() => {
    if (!raid) return []

    const slots: RosterSlot[] = []
    let slotId = 1

    // Create slots for each role
    for (let i = 0; i < raid.caps.tank; i++) {
      slots.push({ id: `tank-${slotId++}`, role: "tank" })
    }
    for (let i = 0; i < raid.caps.heal; i++) {
      slots.push({ id: `heal-${slotId++}`, role: "heal" })
    }
    for (let i = 0; i < raid.caps.melee; i++) {
      slots.push({ id: `melee-${slotId++}`, role: "melee" })
    }
    for (let i = 0; i < raid.caps.ranged; i++) {
      slots.push({ id: `ranged-${slotId++}`, role: "ranged" })
    }

    return slots
  })

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

    raidSignUps.forEach((signup) => {
      const character = mockCharacters.find((c) => c.id === signup.characterId)
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
    const character = mockCharacters.find((c) => c.id === characterId)
    const slot = rosterSlots.find((s) => s.id === slotId)

    if (!character || !slot) return

    const characterRole = getRoleFromSpec(character.class, character.spec)

    // Check if character role matches slot role
    if (characterRole !== slot.role) {
      alert(`Cannot assign ${character.name} (${characterRole}) to ${slot.role} slot`)
      return
    }

    setRosterSlots((prev) => prev.map((s) => (s.id === slotId ? { ...s, characterId } : s)))
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

  const exportRoster = () => {
    const roster = rosterSlots
      .filter((slot) => slot.characterId)
      .map((slot) => {
        const character = mockCharacters.find((c) => c.id === slot.characterId)
        return character ? `${character.name} (${character.class})` : ""
      })
      .filter(Boolean)

    const csvContent =
      "Character,Class,Role\n" +
      rosterSlots
        .filter((slot) => slot.characterId)
        .map((slot) => {
          const character = mockCharacters.find((c) => c.id === slot.characterId)
          return character ? `${character.name},${character.class},${slot.role}` : ""
        })
        .filter(Boolean)
        .join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${raid.title.replace(/\s+/g, "_")}_roster.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const postToDiscord = () => {
    // Mock Discord webhook
    console.log("Posting roster to Discord")
    alert("Roster posted to Discord!")
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={onBack} className="border-slate-600 text-slate-300 hover:bg-slate-700">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Raid
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-100">{raid.title} - Roster Builder</h1>
            <p className="text-slate-400">
              {getFilledSlots()}/{getTotalSlots()} slots filled
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={exportRoster}
            variant="outline"
            className="border-slate-600 text-slate-300 hover:bg-slate-700"
          >
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          <Button onClick={postToDiscord} className="bg-[#5865F2] hover:bg-[#4752C4]">
            <MessageSquare className="w-4 h-4 mr-2" />
            Post to Discord
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Available Players */}
        <div className="lg:col-span-1">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-slate-100">Available Players</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(signUpsByRole).map(([role, signups]) => (
                  <div key={role}>
                    <div className="flex items-center gap-2 mb-2">
                      {getRoleIcon(role)}
                      <h3 className="font-medium text-slate-100 capitalize">{role}</h3>
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
                            className={`p-2 rounded-lg border cursor-move transition-opacity ${
                              isAssigned
                                ? "opacity-50 cursor-not-allowed border-slate-600 bg-slate-700/30"
                                : "border-slate-600 bg-slate-700/50 hover:bg-slate-700"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span
                                className="font-medium text-sm"
                                style={{ color: classColors[signup.character.class] }}
                              >
                                {signup.character.name}
                              </span>
                              <span className="text-xs text-slate-400">{signup.character.gs}</span>
                            </div>
                            <div className="text-xs text-slate-400">
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
              const roleCap = raid.caps[role as keyof typeof raid.caps]

              return (
                <Card key={role} className={`bg-slate-800/50 border-2 ${getRoleColor(role)}`}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-slate-100 flex items-center gap-2">
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
                          onDragOver={handleDragOver}
                          onDrop={(e) => handleDrop(e, slot.id)}
                          className={`min-h-[60px] p-3 border-2 border-dashed rounded-lg transition-colors ${
                            slot.characterId
                              ? "border-slate-600 bg-slate-700/50"
                              : "border-slate-600 hover:border-slate-500 hover:bg-slate-700/30"
                          }`}
                        >
                          {slot.characterId ? (
                            <div className="flex items-center justify-between">
                              <div>
                                <div
                                  className="font-medium text-sm"
                                  style={{
                                    color:
                                      classColors[mockCharacters.find((c) => c.id === slot.characterId)?.class || ""],
                                  }}
                                >
                                  {mockCharacters.find((c) => c.id === slot.characterId)?.name}
                                </div>
                                <div className="text-xs text-slate-400">
                                  {mockCharacters.find((c) => c.id === slot.characterId)?.spec}{" "}
                                  {mockCharacters.find((c) => c.id === slot.characterId)?.class}
                                </div>
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
