"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, ExternalLink, Shield, Heart, Sword, Zap } from "lucide-react"
import { getRoleFromSpec } from "../lib/character-utils"
import { classColors } from "../lib/mock-data"
import { useAuth } from "../lib/auth-context"
import { apiClient } from "@/lib/api-client"
import { Character, WowClass, Faction } from "@/lib/types"
import { SharedCharacterForm } from "./shared-character-form"
import { useModal } from "../contexts/modal-context"

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

const specsByClass: Record<string, string[]> = {
  "DEATH_KNIGHT": ["Blood", "Frost", "Unholy"],
  "DRUID": ["Balance", "Feral", "Restoration"],
  "HUNTER": ["Beast Mastery", "Marksmanship", "Survival"],
  "MAGE": ["Arcane", "Fire", "Frost"],
  "PALADIN": ["Holy", "Protection", "Retribution"],
  "PRIEST": ["Discipline", "Holy", "Shadow"],
  "ROGUE": ["Assassination", "Combat", "Subtlety"],
  "SHAMAN": ["Elemental", "Enhancement", "Restoration"],
  "WARLOCK": ["Affliction", "Demonology", "Destruction"],
  "WARRIOR": ["Arms", "Fury", "Protection"],
}

export function CharacterManager() {
  const { user } = useAuth()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCharacter, setEditingCharacter] = useState<Character | null>(null)
  const [userCharacters, setUserCharacters] = useState<Character[]>([])
  const [loading, setLoading] = useState(true)
  
  // Global modal hook
  const { showMessage, showConfirmation } = useModal()


  // Fetch characters on mount
  useEffect(() => {
    const fetchCharacters = async () => {
      try {
        setLoading(true)
        const characters = await apiClient.getCharacters()
        setUserCharacters(characters)
      } catch (err) {
        console.error('Error fetching characters:', err)
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchCharacters()
    }
  }, [user])

  const resetForm = () => {
    setEditingCharacter(null)
  }

  const handleOpenDialog = (character?: Character) => {
    if (character) {
      setEditingCharacter(character)
    } else {
      resetForm()
    }
    setIsDialogOpen(true)
  }

  const handleDelete = async (characterId: string) => {
    const character = userCharacters.find(c => c.id === characterId)
    showConfirmation(
      'Delete Character',
      `Are you sure you want to delete ${character?.name}? This action cannot be undone.`,
      async () => {
        try {
          await apiClient.deleteCharacter(characterId)
          // Refresh characters list
          const characters = await apiClient.getCharacters()
          setUserCharacters(characters)
          showMessage('Success', 'Character deleted successfully!', 'success')
        } catch (err) {
          console.error('Error deleting character:', err)
          showMessage('Error', err instanceof Error ? err.message : 'Failed to delete character', 'error')
        }
      }
    )
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
            <SharedCharacterForm 
              editingCharacter={editingCharacter}
              onCharacterCreated={async () => {
                const characters = await apiClient.getCharacters()
                setUserCharacters(characters)
                setIsDialogOpen(false)
                resetForm()
              }}
              onCharacterUpdated={async () => {
                const characters = await apiClient.getCharacters()
                setUserCharacters(characters)
                setIsDialogOpen(false)
                resetForm()
              }}
              onCancel={() => {
                setIsDialogOpen(false)
                resetForm()
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
        </div>
      ) : userCharacters.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {userCharacters.map((character) => {
            const role = getRoleFromSpec(character.class, character.spec)
            const classLabel = wowClasses.find(c => c.value === character.class)?.label || character.class
            return (
              <Card
                key={character.id}
                className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-colors"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg" style={{ color: classColors[classLabel] }}>
                        {character.name}
                      </CardTitle>
                      <p className="text-slate-400 text-sm">
                        {character.spec} {classLabel}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      {getRoleIcon(role)}
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
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 text-sm">Gear Score</span>
                      <span className="text-slate-100 font-medium">{character.gearScore}</span>
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
