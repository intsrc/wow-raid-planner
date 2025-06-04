"use client"

import { useState } from "react"
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
} from "lucide-react"
import { mockRaids, mockSignUps, mockCharacters, classColors, getRoleFromSpec } from "../lib/mock-data"
import { useAuth } from "../lib/auth-context"

// Edit Raid Dialog Component
function EditRaidDialog({ raid, onSave }: { raid: any, onSave: (updatedRaid: any) => void }) {
  const [isOpen, setIsOpen] = useState(false)
  const [formData, setFormData] = useState({
    title: raid.title,
    instance: raid.instance,
    date: raid.date,
    startTime: raid.startTime,
    description: raid.description || '',
    status: raid.status,
    tankCap: raid.caps.tank,
    healCap: raid.caps.heal,
    meleeCap: raid.caps.melee,
    rangedCap: raid.caps.ranged
  })

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

  const statusOptions = [
    { value: 'open', label: 'Open for Sign-ups', color: 'text-green-400' },
    { value: 'full', label: 'Full Roster', color: 'text-yellow-400' },
    { value: 'locked', label: 'Roster Locked', color: 'text-red-400' }
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const updatedRaid = {
      ...raid,
      title: formData.title,
      instance: formData.instance,
      date: formData.date,
      startTime: formData.startTime,
      description: formData.description,
      status: formData.status,
      caps: {
        tank: formData.tankCap,
        heal: formData.healCap,
        melee: formData.meleeCap,
        ranged: formData.rangedCap
      }
    }
    
    onSave(updatedRaid)
    setIsOpen(false)
  }

  const resetForm = () => {
    setFormData({
      title: raid.title,
      instance: raid.instance,
      date: raid.date,
      startTime: raid.startTime,
      description: raid.description || '',
      status: raid.status,
      tankCap: raid.caps.tank,
      healCap: raid.caps.heal,
      meleeCap: raid.caps.melee,
      rangedCap: raid.caps.ranged
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { 
      setIsOpen(open)
      if (!open) resetForm()
    }}>
      <DialogTrigger asChild>
        <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700">
          <Edit className="w-4 h-4 mr-2" />
          Edit Raid
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl bg-slate-800 border-slate-700 text-slate-100" onOpenAutoFocus={() => resetForm()}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="w-5 h-5 text-yellow-500" />
            Edit Raid: {raid.title}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="edit-title" className="text-slate-300">Raid Title</Label>
              <Input
                id="edit-title"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="bg-slate-700 border-slate-600 text-slate-100"
                required
              />
            </div>
            <div>
              <Label htmlFor="edit-instance" className="text-slate-300">Instance</Label>
              <Select 
                value={formData.instance} 
                onValueChange={(value) => setFormData({...formData, instance: value})}
              >
                <SelectTrigger className="bg-slate-700 border-slate-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  {instances.map((instance) => (
                    <SelectItem key={instance} value={instance}>{instance}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="edit-date" className="text-slate-300">Date</Label>
              <Input
                id="edit-date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
                className="bg-slate-700 border-slate-600 text-slate-100"
                required
              />
            </div>
            <div>
              <Label htmlFor="edit-startTime" className="text-slate-300">Start Time</Label>
              <Input
                id="edit-startTime"
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                className="bg-slate-700 border-slate-600 text-slate-100"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="edit-status" className="text-slate-300">Raid Status</Label>
            <Select 
              value={formData.status} 
              onValueChange={(value) => setFormData({...formData, status: value})}
            >
              <SelectTrigger className="bg-slate-700 border-slate-600">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                {statusOptions.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    <span className={status.color}>{status.label}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="edit-description" className="text-slate-300">Description (Optional)</Label>
            <Textarea
              id="edit-description"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="bg-slate-700 border-slate-600 text-slate-100"
              rows={3}
            />
          </div>

          <div>
            <Label className="text-slate-300 text-sm font-medium mb-3 block">Role Slots</Label>
            <div className="grid grid-cols-4 gap-4">
              <div>
                <Label htmlFor="edit-tankCap" className="text-xs text-slate-400">Tanks</Label>
                <Input
                  id="edit-tankCap"
                  type="number"
                  min="1"
                  max="10"
                  value={formData.tankCap}
                  onChange={(e) => setFormData({...formData, tankCap: parseInt(e.target.value)})}
                  className="bg-slate-700 border-slate-600 text-slate-100"
                />
              </div>
              <div>
                <Label htmlFor="edit-healCap" className="text-xs text-slate-400">Healers</Label>
                <Input
                  id="edit-healCap"
                  type="number"
                  min="1"
                  max="10"
                  value={formData.healCap}
                  onChange={(e) => setFormData({...formData, healCap: parseInt(e.target.value)})}
                  className="bg-slate-700 border-slate-600 text-slate-100"
                />
              </div>
              <div>
                <Label htmlFor="edit-meleeCap" className="text-xs text-slate-400">Melee DPS</Label>
                <Input
                  id="edit-meleeCap"
                  type="number"
                  min="1"
                  max="15"
                  value={formData.meleeCap}
                  onChange={(e) => setFormData({...formData, meleeCap: parseInt(e.target.value)})}
                  className="bg-slate-700 border-slate-600 text-slate-100"
                />
              </div>
              <div>
                <Label htmlFor="edit-rangedCap" className="text-xs text-slate-400">Ranged DPS</Label>
                <Input
                  id="edit-rangedCap"
                  type="number"
                  min="1"
                  max="15"
                  value={formData.rangedCap}
                  onChange={(e) => setFormData({...formData, rangedCap: parseInt(e.target.value)})}
                  className="bg-slate-700 border-slate-600 text-slate-100"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-slate-700">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsOpen(false)}
              className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
            >
              Save Changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// Mock roster data - in a real app this would come from the roster builder
const mockRoster = {
  "1": { // ICC 25 Heroic - FINALIZED ROSTER
    isFinalized: true,
    finalizedAt: "2024-12-15T22:00:00Z",
    finalizedBy: "1", // RaidLeader
    roster: {
      tank: [
        { characterId: "4", role: "tank", position: "Main Tank" }, // Tankenstein
        { characterId: "1", role: "tank", position: "Off Tank" }  // Arthas (current user)
      ],
      heal: [
        { characterId: "6", role: "heal", position: "Raid Leader" }, // Holypriest  
        { characterId: "7", role: "heal", position: "Healer" },     // Treehugger
        { characterId: "10", role: "heal", position: "Healer" },    // Lightbringer
        { characterId: "6", role: "heal", position: "Healer" },     // Another heal slot
        { characterId: "7", role: "heal", position: "Healer" }      // Another heal slot
      ],
      melee: [
        { characterId: "8", role: "melee", position: "Melee DPS" },  // Bladestorm
        { characterId: "12", role: "melee", position: "Melee DPS" }, // Shadowstep  
        { characterId: "3", role: "melee", position: "Melee DPS" },  // Thrall
        { characterId: "8", role: "melee", position: "Melee DPS" },  // Fill remaining slots
        { characterId: "12", role: "melee", position: "Melee DPS" },
        { characterId: "3", role: "melee", position: "Melee DPS" },
        { characterId: "8", role: "melee", position: "Melee DPS" },
        { characterId: "12", role: "melee", position: "Melee DPS" },
        { characterId: "3", role: "melee", position: "Melee DPS" }
      ],
      ranged: [
        { characterId: "2", role: "ranged", position: "Ranged DPS" }, // Jaina
        { characterId: "9", role: "ranged", position: "Ranged DPS" }, // Shadowmage
        { characterId: "11", role: "ranged", position: "Ranged DPS" }, // Huntress
        { characterId: "2", role: "ranged", position: "Ranged DPS" }, // Fill remaining slots
        { characterId: "9", role: "ranged", position: "Ranged DPS" },
        { characterId: "11", role: "ranged", position: "Ranged DPS" },
        { characterId: "2", role: "ranged", position: "Ranged DPS" },
        { characterId: "9", role: "ranged", position: "Ranged DPS" },
        { characterId: "11", role: "ranged", position: "Ranged DPS" }
      ]
    }
  },
  "2": { // RS 10 Weekly - NOT FINALIZED
    isFinalized: false,
    finalizedAt: null,
    finalizedBy: null,
    roster: {}
  },
  "3": { // ToC 25 Normal - FINALIZED ROSTER
    isFinalized: true,
    finalizedAt: "2024-12-14T20:00:00Z", 
    finalizedBy: "1", // RaidLeader
    roster: {
      tank: [
        { characterId: "5", role: "tank", position: "Main Tank" }, // Beartank
        { characterId: "4", role: "tank", position: "Off Tank" }  // Tankenstein
      ],
      heal: [
        { characterId: "10", role: "heal", position: "Raid Leader" }, // Lightbringer
        { characterId: "6", role: "heal", position: "Healer" },      // Holypriest
        { characterId: "7", role: "heal", position: "Healer" },      // Treehugger
        { characterId: "10", role: "heal", position: "Healer" },     // Fill slots
        { characterId: "6", role: "heal", position: "Healer" }
      ],
      melee: [
        { characterId: "3", role: "melee", position: "Melee DPS" },  // Thrall
        { characterId: "8", role: "melee", position: "Melee DPS" },  // Bladestorm
        { characterId: "12", role: "melee", position: "Melee DPS" }, // Shadowstep
        { characterId: "3", role: "melee", position: "Melee DPS" },  // Fill remaining
        { characterId: "8", role: "melee", position: "Melee DPS" },
        { characterId: "12", role: "melee", position: "Melee DPS" },
        { characterId: "3", role: "melee", position: "Melee DPS" },
        { characterId: "8", role: "melee", position: "Melee DPS" },
        { characterId: "12", role: "melee", position: "Melee DPS" }
      ],
      ranged: [
        { characterId: "9", role: "ranged", position: "Ranged DPS" }, // Shadowmage
        { characterId: "2", role: "ranged", position: "Ranged DPS" }, // Jaina
        { characterId: "11", role: "ranged", position: "Ranged DPS" }, // Huntress
        { characterId: "9", role: "ranged", position: "Ranged DPS" }, // Fill remaining
        { characterId: "2", role: "ranged", position: "Ranged DPS" },
        { characterId: "11", role: "ranged", position: "Ranged DPS" },
        { characterId: "9", role: "ranged", position: "Ranged DPS" },
        { characterId: "2", role: "ranged", position: "Ranged DPS" },
        { characterId: "11", role: "ranged", position: "Ranged DPS" }
      ]
    }
  }
}

// Roster Display Component
function RosterDisplay({ raid, raidSignUps }: { raid: any, raidSignUps: any[] }) {
  const rosterData = mockRoster[raid.id as keyof typeof mockRoster]
  
  if (!rosterData?.isFinalized) {
    return (
      <div className="text-center py-12">
        <Users className="w-16 h-16 text-slate-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-slate-100 mb-2">Roster Not Yet Finalized</h3>
        <p className="text-slate-400 mb-4">
          The raid leader hasn't finalized the roster yet. Check back later or contact your raid leader.
        </p>
        <p className="text-sm text-slate-500">
          Current sign-ups: {raidSignUps.length} / {raid.caps.tank + raid.caps.heal + raid.caps.melee + raid.caps.ranged}
        </p>
      </div>
    )
  }

  const getRosterByRole = () => {
    const rosterByRole = {
      tank: [] as any[],
      heal: [] as any[],
      melee: [] as any[],
      ranged: [] as any[],
    }

    Object.entries(rosterData.roster).forEach(([role, members]) => {
      members.forEach((member: any) => {
        const character = mockCharacters.find((c) => c.id === member.characterId)
        if (character) {
          rosterByRole[role as keyof typeof rosterByRole].push({
            ...member,
            character,
          })
        }
      })
    })

    return rosterByRole
  }

  const rosterByRole = getRosterByRole()
  const totalRosterSize = Object.values(rosterByRole).flat().length

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

  return (
    <div className="space-y-6">
      {/* Roster Status */}
      <div className="flex items-center justify-between p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-green-400 font-medium">Roster Finalized</span>
        </div>
        <div className="text-sm text-slate-300">
          {totalRosterSize}/25 • Finalized {rosterData.finalizedAt ? new Date(rosterData.finalizedAt).toLocaleDateString() : 'Unknown'}
        </div>
      </div>

      {/* Roster by Role */}
      {Object.entries(rosterByRole).map(([role, members]) => (
        <div key={role}>
          <div className="flex items-center gap-2 mb-3">
            {getRoleIcon(role)}
            <h3 className="font-semibold text-slate-100 capitalize">
              {role} ({members.length}/{raid.caps[role as keyof typeof raid.caps]})
            </h3>
          </div>

          {members.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {members.map((member) => (
                <div key={member.character.id} className="p-3 bg-slate-700/50 rounded-lg border border-slate-600/50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium" style={{ color: classColors[member.character.class] }}>
                      {member.character.name}
                    </span>
                    <div className="flex items-center gap-2">
                      {member.position === "Main Tank" && <Badge variant="outline" className="text-xs px-1 py-0 border-blue-500/50 text-blue-400">MT</Badge>}
                      {member.position === "Off Tank" && <Badge variant="outline" className="text-xs px-1 py-0 border-blue-500/50 text-blue-400">OT</Badge>}
                      {member.position === "Raid Leader" && <Badge variant="outline" className="text-xs px-1 py-0 border-yellow-500/50 text-yellow-400">RL</Badge>}
                      <span className="text-xs text-slate-400">GS {member.character.gs}</span>
                    </div>
                  </div>
                  <div className="text-sm text-slate-400">
                    {member.character.spec} {member.character.class}
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    <Badge 
                      variant="outline" 
                      className={`text-xs px-1 py-0 ${
                        member.character.faction === 'Alliance' 
                          ? 'border-blue-500/30 text-blue-600 bg-blue-500/10' 
                          : 'border-red-500/30 text-red-600 bg-red-500/10'
                      }`}
                    >
                      {member.character.faction}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-slate-500 bg-slate-700/30 rounded-lg">
              No {role}s in roster
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

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

  // Check if user is in final roster
  const rosterData = mockRoster[raid?.id as keyof typeof mockRoster]
  const isUserInRoster = rosterData?.isFinalized && userCharacters.some(character => 
    Object.values(rosterData.roster).flat().some((member: any) => member.characterId === character.id)
  )

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

  // Handle raid edit
  const handleEditRaid = (updatedRaid: any) => {
    // In a real app, this would make an API call
    console.log('Updating raid:', updatedRaid)
    
    // Mock API call simulation
    try {
      // Simulate successful update
      console.log('Raid updated successfully:', {
        id: updatedRaid.id,
        title: updatedRaid.title,
        instance: updatedRaid.instance,
        date: updatedRaid.date,
        startTime: updatedRaid.startTime,
        description: updatedRaid.description,
        status: updatedRaid.status,
        caps: updatedRaid.caps
      })
      
      // In a real app, you would update the local state or trigger a refetch
      // For now, we'll show a success message
      alert(`✅ Raid "${updatedRaid.title}" updated successfully!`)
      
      // The UI would automatically reflect changes if using proper state management
      // e.g., using React Query, SWR, or local state updates
      
    } catch (error) {
      console.error('Failed to update raid:', error)
      alert('❌ Failed to update raid. Please try again.')
    }
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
            <EditRaidDialog raid={raid} onSave={handleEditRaid} />
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

              {/* User roster status */}
              {rosterData?.isFinalized && (
                <div className="pt-2 border-t border-slate-700">
                  {isUserInRoster ? (
                    <div className="flex items-center gap-2 p-2 bg-green-500/10 border border-green-500/30 rounded-lg">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-green-400 text-sm font-medium">You're in the final roster!</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 p-2 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      <span className="text-yellow-400 text-sm">Roster finalized - you're not selected this time</span>
                    </div>
                  )}
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

        {/* Sign-ups and Roster Tabs */}
        <div className="lg:col-span-2">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-0">
              <Tabs defaultValue={rosterData?.isFinalized && isUserInRoster ? "roster" : "signups"} className="w-full">
                <div className="px-6 pt-6 pb-0">
                  <TabsList className="grid w-full grid-cols-2 bg-slate-700/50">
                    <TabsTrigger value="signups" className="data-[state=active]:bg-slate-600 text-slate-300">
                      Sign-ups ({raidSignUps.length})
                    </TabsTrigger>
                    <TabsTrigger value="roster" className="data-[state=active]:bg-slate-600 text-slate-300">
                      <div className="flex items-center gap-2">
                        Final Roster
                        {rosterData?.isFinalized && (
                          <div className="flex items-center gap-1">
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                            {isUserInRoster && <span className="text-xs text-green-400">(You're in!)</span>}
                          </div>
                        )}
                      </div>
                    </TabsTrigger>
                  </TabsList>
                </div>
                
                <TabsContent value="signups" className="px-6 pb-6 mt-6">
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
                </TabsContent>
                
                <TabsContent value="roster" className="px-6 pb-6 mt-6">
                  <RosterDisplay raid={raid} raidSignUps={raidSignUps} />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
