"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { apiClient } from "@/lib/api-client"
import { WowClass, Faction, Character } from "@/lib/types"
import { useModal } from "../contexts/modal-context"
import { wowClasses, specsByClass, getClassColor, getRoleFromSpec } from "../lib/character-utils"

interface SharedCharacterFormProps {
  onCharacterCreated?: () => void
  onCancel?: () => void
  editingCharacter?: Character | null
  onCharacterUpdated?: () => void
}



export function SharedCharacterForm({ 
  onCharacterCreated, 
  onCancel, 
  editingCharacter,
  onCharacterUpdated 
}: SharedCharacterFormProps) {
  const [formData, setFormData] = useState({
    name: editingCharacter?.name || '',
    class: editingCharacter?.class || '',
    spec: editingCharacter?.spec || '',
    gearScore: editingCharacter?.gearScore || 5000,
    faction: editingCharacter?.faction || Faction.HORDE
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Global modal hook
  const { showMessage } = useModal()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      if (editingCharacter) {
        // Update existing character
        await apiClient.updateCharacter(editingCharacter.id, {
          name: formData.name,
          class: formData.class as WowClass,
          spec: formData.spec,
          gearScore: formData.gearScore,
          faction: formData.faction as Faction
        })
        
        if (onCharacterUpdated) {
          onCharacterUpdated()
        }
        showMessage('Success', 'Character updated successfully!', 'success')
      } else {
        // Create new character
        await apiClient.createCharacter({
          name: formData.name,
          class: formData.class as WowClass,
          spec: formData.spec,
          gearScore: formData.gearScore,
          faction: formData.faction as Faction
        })
        
        // Reset form for new character creation
        setFormData({
          name: '',
          class: '',
          spec: '',
          gearScore: 5000,
          faction: Faction.HORDE
        })
        
        if (onCharacterCreated) {
          onCharacterCreated()
        }
        showMessage('Success', 'Character created successfully!', 'success')
      }
    } catch (err) {
      console.error('Error saving character:', err)
      showMessage('Error', err instanceof Error ? err.message : 'Failed to save character', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Character Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({...formData, name: e.target.value})}
          placeholder="Enter character name"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="class">Class</Label>
          <Select 
            value={formData.class} 
            onValueChange={(value) => setFormData({...formData, class: value, spec: ''})}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select class" />
            </SelectTrigger>
            <SelectContent>
              {wowClasses.map((wowClass) => (
                <SelectItem key={wowClass.value} value={wowClass.value}>
                  <span style={{ color: getClassColor(wowClass.label) }} className="font-medium">
                    {wowClass.label}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="spec">Specialization</Label>
          <Select 
            value={formData.spec} 
            onValueChange={(value) => setFormData({...formData, spec: value})}
            disabled={!formData.class}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select spec" />
            </SelectTrigger>
            <SelectContent>
              {formData.class && specsByClass[formData.class]?.map((spec) => {
                const role = getRoleFromSpec(formData.class, spec)
                const roleColor = role === 'tank' ? '#3B82F6' : 
                                 role === 'heal' ? '#10B981' : 
                                 role === 'ranged' ? '#8B5CF6' : '#EF4444'
                return (
                  <SelectItem key={spec} value={spec}>
                    <span style={{ color: roleColor }} className="font-medium">{spec}</span>
                  </SelectItem>
                )
              })}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="gearScore">Gear Score</Label>
          <Input
            id="gearScore"
            type="number"
            min="1000"
            max="8000"
            value={formData.gearScore}
            onChange={(e) => setFormData({...formData, gearScore: parseInt(e.target.value)})}
            required
          />
        </div>

        <div>
          <Label htmlFor="faction">Faction</Label>
          <Select 
            value={formData.faction} 
            onValueChange={(value) => setFormData({...formData, faction: value as Faction})}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select faction" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={Faction.ALLIANCE}>
                <span className="text-blue-400 font-medium">Alliance</span>
              </SelectItem>
              <SelectItem value={Faction.HORDE}>
                <span className="text-red-400 font-medium">Horde</span>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <Button type="submit" className="flex-1" disabled={isSubmitting}>
          {isSubmitting ? 
            (editingCharacter ? 'Updating...' : 'Creating...') : 
            (editingCharacter ? 'Update Character' : 'Create Character')
          }
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" className="flex-1" disabled={isSubmitting} onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>


    </form>
  )
} 