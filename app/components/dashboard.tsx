"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, Users, Plus, Sword, Shield, Heart, Zap } from "lucide-react"
import { mockRaids, mockSignUps, mockCharacters, classColors, getRoleFromSpec } from "../lib/mock-data"
import { useAuth } from "../lib/auth-context"

interface DashboardProps {
  onRaidSelect: (raidId: string) => void
}

export function Dashboard({ onRaidSelect }: DashboardProps) {
  const { user } = useAuth()

  const nextRaid = mockRaids
    .filter((raid) => new Date(raid.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0]

  const userSignUps = mockSignUps.filter((signup) => {
    const character = mockCharacters.find((c) => c.id === signup.characterId)
    return character?.userId === user?.id
  })

  const userCharacters = mockCharacters.filter((c) => c.userId === user?.id)

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
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-slate-100 mb-2">Welcome back, {user?.name}</h1>
        <p className="text-slate-400">
          Ready to conquer Northrend? Check your upcoming raids and manage your characters.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Your Characters</p>
                <p className="text-2xl font-bold text-slate-100">{userCharacters.length}</p>
              </div>
              <Users className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Active Sign-ups</p>
                <p className="text-2xl font-bold text-slate-100">{userSignUps.length}</p>
              </div>
              <Calendar className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Upcoming Raids</p>
                <p className="text-2xl font-bold text-slate-100">
                  {mockRaids.filter((r) => new Date(r.date) >= new Date()).length}
                </p>
              </div>
              <Sword className="w-8 h-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Avg Gear Score</p>
                <p className="text-2xl font-bold text-slate-100">
                  {userCharacters.length > 0
                    ? Math.round(userCharacters.reduce((sum, c) => sum + c.gs, 0) / userCharacters.length)
                    : 0}
                </p>
              </div>
              <Shield className="w-8 h-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Next Raid */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-slate-100 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-yellow-400" />
              Next Raid
            </CardTitle>
          </CardHeader>
          <CardContent>
            {nextRaid ? (
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-100">{nextRaid.title}</h3>
                    <p className="text-slate-400">{nextRaid.instance}</p>
                  </div>
                  <Badge
                    variant="outline"
                    className={`${
                      nextRaid.status === "open"
                        ? "border-green-500 text-green-400"
                        : nextRaid.status === "full"
                          ? "border-yellow-500 text-yellow-400"
                          : "border-red-500 text-red-400"
                    }`}
                  >
                    {nextRaid.status.toUpperCase()}
                  </Badge>
                </div>

                <div className="flex items-center gap-4 text-sm text-slate-400">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {new Date(nextRaid.date).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {nextRaid.startTime}
                  </div>
                </div>

                <div className="flex gap-2">
                  <div className="flex items-center gap-1 text-sm">
                    <Shield className="w-4 h-4 text-blue-400" />
                    <span className="text-slate-300">{nextRaid.caps.tank}</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm">
                    <Heart className="w-4 h-4 text-green-400" />
                    <span className="text-slate-300">{nextRaid.caps.heal}</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm">
                    <Sword className="w-4 h-4 text-red-400" />
                    <span className="text-slate-300">{nextRaid.caps.melee}</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm">
                    <Zap className="w-4 h-4 text-purple-400" />
                    <span className="text-slate-300">{nextRaid.caps.ranged}</span>
                  </div>
                </div>

                <Button
                  onClick={() => onRaidSelect(nextRaid.id)}
                  className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-slate-900 font-semibold"
                >
                  View Details
                </Button>
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400">No upcoming raids scheduled</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Your Sign-ups */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-slate-100 flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-400" />
              Your Sign-ups
            </CardTitle>
          </CardHeader>
          <CardContent>
            {userSignUps.length > 0 ? (
              <div className="space-y-3">
                {userSignUps.map((signup) => {
                  const character = mockCharacters.find((c) => c.id === signup.characterId)
                  const raid = mockRaids.find((r) => r.id === signup.raidId)
                  if (!character || !raid) return null

                  const role = getRoleFromSpec(character.class, character.spec)

                  return (
                    <div key={signup.id} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          {getRoleIcon(role)}
                          <span className="font-medium" style={{ color: classColors[character.class] }}>
                            {character.name}
                          </span>
                        </div>
                        <div className="text-sm text-slate-400">
                          {raid.title} • {new Date(raid.date).toLocaleDateString()}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onRaidSelect(raid.id)}
                        className="text-slate-400 hover:text-slate-100"
                      >
                        View
                      </Button>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400">No active sign-ups</p>
                <p className="text-sm text-slate-500 mt-1">Sign up for raids to see them here</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Your Characters */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sword className="w-5 h-5 text-yellow-400" />
              Your Characters
            </div>
            <Button
              size="sm"
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Character
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {userCharacters.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {userCharacters.map((character) => {
                const role = getRoleFromSpec(character.class, character.spec)
                return (
                  <div key={character.id} className="p-4 bg-slate-700/50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-lg" style={{ color: classColors[character.class] }}>
                        {character.name}
                      </span>
                      {getRoleIcon(role)}
                    </div>
                    <div className="text-sm text-slate-400 space-y-1">
                      <div>
                        {character.spec} {character.class}
                      </div>
                      <div className="flex items-center justify-between">
                        <span>GS: {character.gs}</span>
                        <Badge variant="outline" className="text-xs">
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
              <Sword className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400">No characters added yet</p>
              <p className="text-sm text-slate-500 mt-1">Add your first character to get started</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
