"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, ExternalLink, Shield, Heart, Sword, Zap } from "lucide-react"
import { mockCharacters, classColors, getRoleFromSpec, type Character } from "../lib/mock-data"
import { useAuth } from "../lib/auth-context"

const wowClasses = [
  "Death Knight",
  "Druid",
  "Hunter",
  "Mage",
  "Paladin",
  "Priest",
  "Rogue",
  "Shaman",
  "Warlock",
  "Warrior",
]

const specsByClass: Record<string, string[]> = {
  "Death Knight": ["Blood", "Frost", "Unholy"],
  Druid: ["Balance", "Feral", "Restoration"],
  Hunter: ["Beast Mastery", "Marksmanship", "Survival"],
  Mage: ["Arcane", "Fire", "Frost"],
  Paladin: ["Holy", "Protection", "Retribution"],
  Priest: ["Discipline", "Holy", "Shadow"],
  Rogue: ["Assassination", "Combat", "Subtlety"],
  Shaman: ["Elemental", "Enhancement", "Restoration"],
  Warlock: ["Affliction", "Demonology", "Destruction"],
  Warrior: ["Arms", "Fury", "Protection"],
}

export function CharacterManager() {
  const { user } = useAuth()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCharacter, setEditingCharacter] = useState<Character | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    class: "",
    spec: "",
    gs: "",
    armoryUrl: "",
    faction: "Alliance" as "Alliance" | "Horde",
  })

  const userCharacters = mockCharacters.filter((c) => c.userId === user?.id)

  const resetForm = () => {
    setFormData({
      name: "",
      class: "",
      spec: "",
      gs: "",
      armoryUrl: "",
      faction: "Alliance",
    })
    setEditingCharacter(null)
  }

  const handleOpenDialog = (character?: Character) => {
    if (character) {
      setEditingCharacter(character)
      setFormData({
        name: character.name,
        class: character.class,
        spec: character.spec,
        gs: character.gs.toString(),
        armoryUrl: character.armoryUrl,
        faction: character.faction,
      })
    } else {
      resetForm()
    }
    setIsDialogOpen(true)
  }

  const handleSave = () => {
    // Mock save logic
    console.log("Saving character:", formData)
    setIsDialogOpen(false)
    resetForm()
  }

  const handleDelete = (characterId: string) => {
    // Mock delete logic
    console.log("Deleting character:", characterId)
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 mb-2">Character Manager</h1>
          <p className="text-slate-400">Manage your characters for raid sign-ups</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => handleOpenDialog()}
              className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-slate-900"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Character
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-slate-800 border-slate-700 text-slate-100">
            <DialogHeader>
              <DialogTitle>{editingCharacter ? "Edit Character" : "Add New Character"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name" className="text-slate-300">
                  Character Name
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  className="bg-slate-700 border-slate-600 text-slate-100"
                  placeholder="Enter character name"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="faction" className="text-slate-300">
                    Faction
                  </Label>
                  <Select
                    value={formData.faction}
                    onValueChange={(value: "Alliance" | "Horde") =>
                      setFormData((prev) => ({ ...prev, faction: value }))
                    }
                  >
                    <SelectTrigger className="bg-slate-700 border-slate-600">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      <SelectItem value="Alliance">Alliance</SelectItem>
                      <SelectItem value="Horde">Horde</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="class" className="text-slate-300">
                    Class
                  </Label>
                  <Select
                    value={formData.class}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, class: value, spec: "" }))}
                  >
                    <SelectTrigger className="bg-slate-700 border-slate-600">
                      <SelectValue placeholder="Select class" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      {wowClasses.map((cls) => (
                        <SelectItem key={cls} value={cls}>
                          <span style={{ color: classColors[cls] }}>{cls}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="spec" className="text-slate-300">
                    Specialization
                  </Label>
                  <Select
                    value={formData.spec}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, spec: value }))}
                    disabled={!formData.class}
                  >
                    <SelectTrigger className="bg-slate-700 border-slate-600">
                      <SelectValue placeholder="Select spec" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      {formData.class &&
                        specsByClass[formData.class]?.map((spec) => (
                          <SelectItem key={spec} value={spec}>
                            {spec}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="gs" className="text-slate-300">
                    Gear Score
                  </Label>
                  <Input
                    id="gs"
                    type="number"
                    value={formData.gs}
                    onChange={(e) => setFormData((prev) => ({ ...prev, gs: e.target.value }))}
                    className="bg-slate-700 border-slate-600 text-slate-100"
                    placeholder="5000"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="armory" className="text-slate-300">
                  Armory URL (Optional)
                </Label>
                <Input
                  id="armory"
                  value={formData.armoryUrl}
                  onChange={(e) => setFormData((prev) => ({ ...prev, armoryUrl: e.target.value }))}
                  className="bg-slate-700 border-slate-600 text-slate-100"
                  placeholder="https://wowarmory.com/character/..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  className="border-slate-600 text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={!formData.name || !formData.class || !formData.spec || !formData.gs}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                >
                  {editingCharacter ? "Update" : "Add"} Character
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {userCharacters.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {userCharacters.map((character) => {
            const role = getRoleFromSpec(character.class, character.spec)
            return (
              <Card
                key={character.id}
                className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-colors"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg" style={{ color: classColors[character.class] }}>
                        {character.name}
                      </CardTitle>
                      <p className="text-slate-400 text-sm">
                        {character.spec} {character.class}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      {getRoleIcon(role)}
                      <Badge variant="outline" className="text-xs">
                        {character.faction}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 text-sm">Gear Score</span>
                      <span className="text-slate-100 font-medium">{character.gs}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 text-sm">Role</span>
                      <div className="flex items-center gap-1">
                        {getRoleIcon(role)}
                        <span className="text-slate-100 text-sm capitalize">{role}</span>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenDialog(character)}
                        className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700"
                      >
                        <Edit className="w-3 h-3 mr-1" />
                        Edit
                      </Button>
                      {character.armoryUrl && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(character.armoryUrl, "_blank")}
                          className="border-slate-600 text-slate-300 hover:bg-slate-700"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(character.id)}
                        className="border-red-600 text-red-400 hover:bg-red-600/10"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="text-center py-12">
            <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-100 mb-2">No Characters Yet</h3>
            <p className="text-slate-400 mb-4">Add your first character to start signing up for raids</p>
            <Button
              onClick={() => handleOpenDialog()}
              className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-slate-900"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Character
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
