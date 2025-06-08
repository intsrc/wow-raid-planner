"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
  Check,
  X,
  AlertCircle,
} from "lucide-react"
import { getRoleFromSpec } from "../lib/character-utils"
import { classColors } from "../lib/mock-data"
import { useAuth } from "../lib/auth-context"
import { apiClient } from "@/lib/api-client"
import { Raid, SignUp, Character, SignUpStatus, RosterSlot } from "@/lib/types"
import { RosterDisplay } from "./roster-display"

// WoW class mapping for beautiful display
const wowClasses = [
  { value: "DEATH_KNIGHT", label: "Death Knight" },
  { value: "DRUID", label: "Druid" },
  { value: "HUNTER", label: "Hunter" },
  { value: "MAGE", label: "Mage" },
  { value: "PALADIN", label: "Paladin" },
  { value: "PRIEST", label: "Priest" },
  { value: "ROGUE", label: "Rogue" },
  { value: "SHAMAN", label: "Shaman" },
  { value: "WARLOCK", label: "Warlock" },
  { value: "WARRIOR", label: "Warrior" },
]

interface RaidDetailsProps {
  raidId: string | null
  onBack: () => void
  onRosterBuilder: (raidId: string) => void
}

export function RaidDetails({ raidId, onBack, onRosterBuilder }: RaidDetailsProps) {
  const { user } = useAuth()
  const [selectedCharacter, setSelectedCharacter] = useState<string>("")
  const [signUpNote, setSignUpNote] = useState("")
  const [raid, setRaid] = useState<Raid | null>(null)
  const [raidSignUps, setRaidSignUps] = useState<SignUp[]>([])
  const [userCharacters, setUserCharacters] = useState<Character[]>([])
  const [rosterSlots, setRosterSlots] = useState<RosterSlot[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<string>("")

  // Fetch raid details and related data
  useEffect(() => {
    const fetchRaidDetails = async () => {
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
        setUserCharacters(charactersData)
        
        // Set default tab based on roster finalization
        if (raidData.isRosterFinalized) {
          setActiveTab("roster")
          // Fetch roster slots if finalized
          try {
            const rosterData = await apiClient.getRoster(raidId)
            setRosterSlots(rosterData)
          } catch (err) {
            console.error('Error fetching roster:', err)
            setRosterSlots([])
          }
        } else {
          setActiveTab("signups")
        }
      } catch (err) {
        console.error('Error fetching raid details:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchRaidDetails()
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

    raidSignUps.forEach((signup) => {
      if (signup.character) {
        const role = getRoleFromSpec(signup.character.class, signup.character.spec)
        signUpsByRole[role as keyof typeof signUpsByRole].push({
          ...signup,
          character: signup.character,
        })
      }
    })

    return signUpsByRole
  }

  const signUpsByRole = getSignUpsByRole()
  const userSignedUp = raidSignUps.some((signup) => {
    return signup.character?.userId === user?.id
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
      case "SCHEDULED":
        return "border-green-500 text-green-400 bg-green-500/10"
      case "ACTIVE":
        return "border-yellow-500 text-yellow-400 bg-yellow-500/10"
      case "COMPLETED":
        return "border-blue-500 text-blue-400 bg-blue-500/10"
      case "CANCELLED":
        return "border-red-500 text-red-400 bg-red-500/10"
      default:
        return "border-slate-500 text-slate-400 bg-slate-500/10"
    }
  }

  const handleSignUp = async () => {
    if (!selectedCharacter) return
    
    try {
      await apiClient.createSignUp({
        raidId: raid.id,
        characterId: selectedCharacter,
        note: signUpNote,
      })
      
      // Refresh sign-ups
      const signUpsData = await apiClient.getSignUpsByRaid(raid.id)
      setRaidSignUps(signUpsData)
      
      setSelectedCharacter("")
      setSignUpNote("")
      alert('Successfully signed up for the raid!')
    } catch (err) {
      console.error('Error signing up:', err)
      alert(err instanceof Error ? err.message : 'Failed to sign up')
    }
  }

  const handleWithdraw = async () => {
    const userSignUp = raidSignUps.find((signup) => 
      signup.character?.userId === user?.id
    )
    
    if (!userSignUp) return
    
    try {
      await apiClient.deleteSignUp(userSignUp.id)
      
      // Refresh sign-ups
      const signUpsData = await apiClient.getSignUpsByRaid(raid.id)
      setRaidSignUps(signUpsData)
      
      alert('Successfully withdrew from the raid!')
    } catch (err) {
      console.error('Error withdrawing:', err)
      alert(err instanceof Error ? err.message : 'Failed to withdraw')
    }
  }

  // Handle sign-up approval/decline (for raid leaders)
  const handleApproveSignUp = async (signUpId: string) => {
    try {
      await apiClient.updateSignUp(signUpId, { status: SignUpStatus.CONFIRMED })
      
      // Refresh sign-ups
      const signUpsData = await apiClient.getSignUpsByRaid(raid.id)
      setRaidSignUps(signUpsData)
      
      alert('Sign-up approved!')
    } catch (err) {
      console.error('Error approving sign-up:', err)
      alert(err instanceof Error ? err.message : 'Failed to approve sign-up')
    }
  }

  const handleDeclineSignUp = async (signUpId: string) => {
    try {
      await apiClient.updateSignUp(signUpId, { status: SignUpStatus.DECLINED })
      
      // Refresh sign-ups
      const signUpsData = await apiClient.getSignUpsByRaid(raid.id)
      setRaidSignUps(signUpsData)
      
      alert('Sign-up declined!')
    } catch (err) {
      console.error('Error declining sign-up:', err)
      alert(err instanceof Error ? err.message : 'Failed to decline sign-up')
    }
  }

  // Helper function to get beautiful class label
  const getClassLabel = (classValue: string) => {
    const classObj = wowClasses.find(c => c.value === classValue)
    return classObj ? classObj.label : classValue
  }

  // Export roster functionality
  const handleExportRoster = () => {
    if (!raid || rosterSlots.length === 0) return

    const csvContent = "Character,Class,Spec,Role,Position,Gear Score\n" +
      rosterSlots.map(slot => {
        const character = slot.character
        if (!character) return ""
        return `${character.name},${getClassLabel(character.class)},${character.spec},${slot.role},${slot.position || ''},${character.gearScore}`
      }).filter(Boolean).join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${raid.title.replace(/\s+/g, "_")}_roster.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  // Post to Discord functionality
  const handlePostToDiscord = () => {
    if (!raid || rosterSlots.length === 0) return

    const rosterText = `**${raid.title} - Finalized Roster**\n` +
      `📅 ${new Date(raid.date).toLocaleDateString()} at ${raid.startTime}\n\n` +
      
      // Group by roles
      Object.entries(rosterSlots.reduce((acc, slot) => {
        if (!acc[slot.role]) acc[slot.role] = []
        acc[slot.role].push(slot)
        return acc
      }, {} as Record<string, RosterSlot[]>)).map(([role, slots]) => {
        const roleEmoji = role === 'TANK' ? '🛡️' : role === 'HEAL' ? '💚' : role === 'MELEE' ? '⚔️' : '🏹'
        return `${roleEmoji} **${role}**\n` +
          slots.map(slot => `• ${slot.character?.name} (${getClassLabel(slot.character?.class || '')})`).join('\n')
      }).join('\n\n')

    // Copy to clipboard
    navigator.clipboard.writeText(rosterText).then(() => {
      alert('Roster copied to clipboard! You can now paste it in Discord.')
    }).catch(() => {
      alert('Failed to copy to clipboard. Please try again.')
    })
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
        {(user?.role === 'RAID_LEADER' || user?.role === 'ADMIN') && (
          <div className="flex gap-2">
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
                  {raid.status}
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
                {raidSignUps.length} / {raid.tankCap + raid.healCap + raid.meleeCap + raid.rangedCap} signed up
              </div>

              {raid.description && (
                <div className="pt-2 border-t border-slate-700">
                  <p className="text-sm text-slate-400">{raid.description}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* LOCKED Raid Warning */}
          {raid.status === 'LOCKED' && (
            <Card className="bg-red-900/20 border-red-500/50">
              <CardHeader>
                <CardTitle className="text-red-400 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  Roster Locked
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-red-300 text-sm">
                  This raid's roster has been finalized. No more sign-ups or withdrawals are allowed.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Sign Up Section */}
          {!userSignedUp && userCharacters.length > 0 && raid.status !== 'LOCKED' && (
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-slate-100 flex items-center gap-2">
                  <UserPlus className="w-5 h-5" />
                  Sign Up for Raid
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm text-slate-300 mb-2 block">Select Character</label>
                  <Select value={selectedCharacter} onValueChange={setSelectedCharacter}>
                    <SelectTrigger className="bg-slate-700 border-slate-600">
                      <SelectValue placeholder="Choose a character" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      {userCharacters.map((character) => {
                        const classLabel = getClassLabel(character.class)
                        const role = getRoleFromSpec(character.class, character.spec)
                        return (
                          <SelectItem key={character.id} value={character.id}>
                            <div className="flex items-center gap-2">
                              {getRoleIcon(role)}
                              <span style={{ color: classColors[classLabel] }} className="font-medium">
                                {character.name}
                              </span>
                              <span className="text-slate-400 text-sm">
                                {character.spec} {classLabel} • GS: {character.gearScore}
                              </span>
                            </div>
                          </SelectItem>
                        )
                      })}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm text-slate-300 mb-2 block">Note (Optional)</label>
                  <Textarea
                    value={signUpNote}
                    onChange={(e) => setSignUpNote(e.target.value)}
                    className="bg-slate-700 border-slate-600 text-slate-100"
                    placeholder="Any additional notes..."
                    rows={3}
                  />
                </div>

                <Button
                  onClick={handleSignUp}
                  disabled={!selectedCharacter}
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                >
                  Sign Up
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Withdraw Section */}
          {userSignedUp && raid.status !== 'LOCKED' && (
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-slate-100 flex items-center gap-2">
                  <UserMinus className="w-5 h-5" />
                  You're Signed Up
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={handleWithdraw}
                  variant="outline"
                  className="w-full border-red-600 text-red-400 hover:bg-red-600/10"
                >
                  Withdraw from Raid
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Tabs for Sign-ups and Roster */}
        <div className="lg:col-span-2">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-slate-800 border-slate-700">
              <TabsTrigger 
                value="signups" 
                className="data-[state=active]:bg-slate-700 data-[state=active]:text-slate-100"
              >
                Sign-ups ({raidSignUps.length})
              </TabsTrigger>
              <TabsTrigger 
                value="roster" 
                className="data-[state=active]:bg-slate-700 data-[state=active]:text-slate-100"
                disabled={!raid.isRosterFinalized}
              >
                {raid.isRosterFinalized ? `🏆 Roster (${rosterSlots.length})` : 'Roster (Not Finalized)'}
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="signups" className="mt-6">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-slate-100">Sign-ups by Role</CardTitle>
                </CardHeader>
                <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.entries(signUpsByRole).map(([role, signups]) => {
                  const cap = role === 'tank' ? raid.tankCap : 
                             role === 'heal' ? raid.healCap :
                             role === 'melee' ? raid.meleeCap : raid.rangedCap
                  
                  return (
                    <div key={role} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getRoleIcon(role)}
                          <h3 className="font-semibold text-slate-100 capitalize">{role}</h3>
                        </div>
                        <Badge variant="outline" className="text-slate-400">
                          {signups.length}/{cap}
                        </Badge>
                      </div>
                      
                      <div className="space-y-2">
                        {signups.length > 0 ? (
                          signups.map((signup: any) => {
                            const classLabel = getClassLabel(signup.character.class)
                            const isRaidLeader = user?.role === 'RAID_LEADER' || user?.role === 'ADMIN'
                            const isPending = signup.status === 'PENDING'
                            
                            return (
                              <div
                                key={signup.id}
                                className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg"
                              >
                                <div className="flex-1">
                                  <span
                                    className="font-medium"
                                    style={{ color: classColors[classLabel] }}
                                  >
                                    {signup.character.name}
                                  </span>
                                  <p className="text-xs text-slate-400">
                                    {signup.character.spec} {classLabel} • GS: {signup.character.gearScore}
                                  </p>
                                  {signup.note && (
                                    <p className="text-xs text-slate-500 italic mt-1">"{signup.note}"</p>
                                  )}
                                </div>
                                <div className="flex items-center gap-2">
                                  <Badge 
                                    variant="outline" 
                                    className={`text-xs ${
                                      signup.status === 'CONFIRMED' ? 'border-green-500 text-green-400' :
                                      signup.status === 'DECLINED' ? 'border-red-500 text-red-400' :
                                      'border-yellow-500 text-yellow-400'
                                    }`}
                                  >
                                    {signup.status === 'TENTATIVE' ? 'PENDING' : signup.status}
                                  </Badge>
                                  {isRaidLeader && isPending && (
                                    <div className="flex gap-1">
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleApproveSignUp(signup.id)}
                                        className="h-6 w-6 p-0 border-green-500 text-green-400 hover:bg-green-500/10"
                                      >
                                        <Check className="w-3 h-3" />
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleDeclineSignUp(signup.id)}
                                        className="h-6 w-6 p-0 border-red-500 text-red-400 hover:bg-red-500/10"
                                      >
                                        <X className="w-3 h-3" />
                                      </Button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )
                          })
                        ) : (
                          <p className="text-slate-500 text-sm italic">No sign-ups yet</p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="roster" className="mt-6">
              {raid.isRosterFinalized && rosterSlots.length > 0 ? (
                <RosterDisplay 
                  rosterSlots={rosterSlots}
                  raid={raid}
                  onExport={handleExportRoster}
                  onPostToDiscord={handlePostToDiscord}
                />
              ) : (
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardContent className="text-center py-12">
                    <p className="text-slate-400 text-lg">Roster not finalized yet</p>
                    <p className="text-slate-500 text-sm mt-2">
                      The raid leader needs to finalize the roster before it can be viewed here.
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
