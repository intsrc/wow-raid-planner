"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  ArrowLeft,
  Calendar,
  Clock,
  Users,
  Shield,
  Heart,
  Sword,
  Zap,
  Edit,
  Settings,
  UserPlus,
  UserMinus,
} from "lucide-react"
import { mockRaids, mockSignUps, mockCharacters, classColors, getRoleFromSpec } from "../lib/mock-data"
import { useAuth } from "../lib/auth-context"

interface RaidDetailsProps {
  raidId: string | null
  onBack: () => void
  onRosterBuilder: (raidId: string) => void
}

export function RaidDetails({ raidId, onBack, onRosterBuilder }: RaidDetailsProps) {
  const { user } = useAuth()
  const [selectedCharacter, setSelectedCharacter] = useState<string>("")
  const [signUpNote, setSignUpNote] = useState("")

  const raid = mockRaids.find((r) => r.id === raidId)
  const raidSignUps = mockSignUps.filter((s) => s.raidId === raidId)
  const userCharacters = mockCharacters.filter((c) => c.userId === user?.id)

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
  const userSignedUp = raidSignUps.some((signup) => {
    const character = mockCharacters.find((c) => c.id === signup.characterId)
    return character?.userId === user?.id
  })

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "border-green-500 text-green-400 bg-green-500/10"
      case "full":
        return "border-yellow-500 text-yellow-400 bg-yellow-500/10"
      case "locked":
        return "border-red-500 text-red-400 bg-red-500/10"
      default:
        return "border-slate-500 text-slate-400 bg-slate-500/10"
    }
  }

  const handleSignUp = () => {
    if (!selectedCharacter) return
    // Mock sign up logic
    console.log("Signing up character:", selectedCharacter, "with note:", signUpNote)
    setSelectedCharacter("")
    setSignUpNote("")
  }

  const handleWithdraw = () => {
    // Mock withdraw logic
    console.log("Withdrawing from raid")
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={onBack} className="border-slate-600 text-slate-300 hover:bg-slate-700">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Calendar
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-slate-100">{raid.title}</h1>
          <p className="text-slate-400">{raid.instance}</p>
        </div>
        {(user?.role === "rl" || user?.role === "admin") && (
          <div className="flex gap-2">
            <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700">
              <Edit className="w-4 h-4 mr-2" />
              Edit Raid
            </Button>
            <Button
              onClick={() => onRosterBuilder(raid.id)}
              className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700"
            >
              <Settings className="w-4 h-4 mr-2" />
              Roster Builder
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Raid Info */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-slate-100 flex items-center justify-between">
                Raid Information
                <Badge variant="outline" className={getStatusColor(raid.status)}>
                  {raid.status.toUpperCase()}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 text-slate-300">
                <Calendar className="w-4 h-4" />
                {new Date(raid.date).toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <Clock className="w-4 h-4" />
                {raid.startTime} Server Time
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <Users className="w-4 h-4" />
                {raidSignUps.length} / {raid.caps.tank + raid.caps.heal + raid.caps.melee + raid.caps.ranged} signed up
              </div>

              {raid.description && (
                <div className="pt-2 border-t border-slate-700">
                  <p className="text-sm text-slate-400">{raid.description}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Role Caps */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-slate-100">Role Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  {
                    role: "tank",
                    icon: Shield,
                    color: "text-blue-400",
                    cap: raid.caps.tank,
                    filled: signUpsByRole.tank.length,
                  },
                  {
                    role: "heal",
                    icon: Heart,
                    color: "text-green-400",
                    cap: raid.caps.heal,
                    filled: signUpsByRole.heal.length,
                  },
                  {
                    role: "melee",
                    icon: Sword,
                    color: "text-red-400",
                    cap: raid.caps.melee,
                    filled: signUpsByRole.melee.length,
                  },
                  {
                    role: "ranged",
                    icon: Zap,
                    color: "text-purple-400",
                    cap: raid.caps.ranged,
                    filled: signUpsByRole.ranged.length,
                  },
                ].map(({ role, icon: Icon, color, cap, filled }) => (
                  <div key={role} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className={`w-4 h-4 ${color}`} />
                      <span className="text-slate-300 capitalize">{role}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-slate-700 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${filled >= cap ? "bg-green-500" : "bg-blue-500"}`}
                          style={{ width: `${Math.min((filled / cap) * 100, 100)}%` }}
                        />
                      </div>
                      <span className="text-sm text-slate-400 w-12 text-right">
                        {filled}/{cap}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Sign Up / Withdraw */}
          {raid.status === "open" && (
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-slate-100">{userSignedUp ? "Manage Sign-up" : "Sign Up"}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {!userSignedUp ? (
                  <>
                    <Select value={selectedCharacter} onValueChange={setSelectedCharacter}>
                      <SelectTrigger className="bg-slate-700 border-slate-600">
                        <SelectValue placeholder="Select character" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        {userCharacters.map((character) => (
                          <SelectItem key={character.id} value={character.id}>
                            <div className="flex items-center gap-2">
                              <span style={{ color: classColors[character.class] }}>{character.name}</span>
                              <span className="text-slate-400 text-sm">
                                {character.spec} {character.class}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Textarea
                      placeholder="Optional note (consumables, availability, etc.)"
                      value={signUpNote}
                      onChange={(e) => setSignUpNote(e.target.value)}
                      className="bg-slate-700 border-slate-600 text-slate-100"
                    />

                    <Button
                      onClick={handleSignUp}
                      disabled={!selectedCharacter}
                      className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                    >
                      <UserPlus className="w-4 h-4 mr-2" />
                      Sign Up
                    </Button>
                  </>
                ) : (
                  <Button onClick={handleWithdraw} variant="destructive" className="w-full">
                    <UserMinus className="w-4 h-4 mr-2" />
                    Withdraw
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sign-ups List */}
        <div className="lg:col-span-2">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-slate-100">Sign-ups ({raidSignUps.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {Object.entries(signUpsByRole).map(([role, signups]) => (
                  <div key={role}>
                    <div className="flex items-center gap-2 mb-3">
                      {getRoleIcon(role)}
                      <h3 className="font-semibold text-slate-100 capitalize">
                        {role} ({signups.length}/{raid.caps[role as keyof typeof raid.caps]})
                      </h3>
                    </div>

                    {signups.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {signups.map((signup) => (
                          <div key={signup.id} className="p-3 bg-slate-700/50 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium" style={{ color: classColors[signup.character.class] }}>
                                {signup.character.name}
                              </span>
                              <span className="text-xs text-slate-400">GS {signup.character.gs}</span>
                            </div>
                            <div className="text-sm text-slate-400">
                              {signup.character.spec} {signup.character.class}
                            </div>
                            {signup.note && <div className="text-xs text-slate-500 mt-1 italic">"{signup.note}"</div>}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4 text-slate-500 bg-slate-700/30 rounded-lg">
                        No {role}s signed up yet
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
