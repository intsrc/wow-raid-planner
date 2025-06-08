import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { apiClient } from "@/lib/api-client"
import { MessageModal, MessageType } from "../ui/message-modal"
import { instances, defaultRaidComposition } from '../../lib/constants'

interface CreateRaidFormProps {
  onRaidCreated?: () => void
}

// Create Raid Form Component
export function CreateRaidForm({ onRaidCreated }: CreateRaidFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    instance: '',
    date: '',
    startTime: '',
    description: '',
    ...defaultRaidComposition
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Modal state
  const [messageModal, setMessageModal] = useState<{
    isOpen: boolean
    title: string
    message: string
    type?: MessageType
  }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'info'
  })

  const showMessage = (title: string, message: string, type: MessageType = 'info') => {
    setMessageModal({
      isOpen: true,
      title,
      message,
      type
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      await apiClient.createRaid(formData)
      
      // Reset form
      setFormData({
        title: '',
        instance: '',
        date: '',
        startTime: '',
        description: '',
        ...defaultRaidComposition
      })
      
      // Notify parent to refresh data
      if (onRaidCreated) {
        onRaidCreated()
      }
      
      showMessage('Success', 'Raid created successfully!', 'success')
    } catch (err) {
      console.error('Error creating raid:', err)
      showMessage('Error', err instanceof Error ? err.message : 'Failed to create raid', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="title">Raid Title</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
            placeholder="ICC 25 Heroic"
            required
          />
        </div>
        <div>
          <Label htmlFor="instance">Instance</Label>
          <Select 
            value={formData.instance} 
            onValueChange={(value) => setFormData({...formData, instance: value})}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select instance" />
            </SelectTrigger>
            <SelectContent>
              {instances.map((instance) => (
                <SelectItem key={instance} value={instance}>{instance}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="date">Date</Label>
          <Input
            id="date"
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({...formData, date: e.target.value})}
            required
          />
        </div>
        <div>
          <Label htmlFor="startTime">Start Time</Label>
          <Input
            id="startTime"
            type="time"
            value={formData.startTime}
            onChange={(e) => setFormData({...formData, startTime: e.target.value})}
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="description">Description (Optional)</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({...formData, description: e.target.value})}
          placeholder="Full clear attempt, need experienced players with 5700+ GS"
          rows={3}
        />
      </div>

      <div>
        <Label className="text-sm font-medium mb-3 block">Role Slots</Label>
        <div className="grid grid-cols-4 gap-4">
          <div>
            <Label htmlFor="tankCap" className="text-xs">Tanks</Label>
            <Input
              id="tankCap"
              type="number"
              min="1"
              max="10"
              value={formData.tankCap}
              onChange={(e) => setFormData({...formData, tankCap: parseInt(e.target.value)})}
            />
          </div>
          <div>
            <Label htmlFor="healCap" className="text-xs">Healers</Label>
            <Input
              id="healCap"
              type="number"
              min="1"
              max="10"
              value={formData.healCap}
              onChange={(e) => setFormData({...formData, healCap: parseInt(e.target.value)})}
            />
          </div>
          <div>
            <Label htmlFor="meleeCap" className="text-xs">Melee DPS</Label>
            <Input
              id="meleeCap"
              type="number"
              min="1"
              max="15"
              value={formData.meleeCap}
              onChange={(e) => setFormData({...formData, meleeCap: parseInt(e.target.value)})}
            />
          </div>
          <div>
            <Label htmlFor="rangedCap" className="text-xs">Ranged</Label>
            <Input
              id="rangedCap"
              type="number"
              min="1"
              max="15"
              value={formData.rangedCap}
              onChange={(e) => setFormData({...formData, rangedCap: parseInt(e.target.value)})}
            />
          </div>
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <Button 
          type="submit" 
          className="flex-1 bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800 text-white font-medium" 
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Creating...' : 'Create Raid'}
        </Button>
        <Button type="button" variant="outline" className="flex-1" disabled={isSubmitting}>
          Cancel
        </Button>
      </div>

      {/* Modal */}
      <MessageModal
        isOpen={messageModal.isOpen}
        onClose={() => setMessageModal(prev => ({ ...prev, isOpen: false }))}
        title={messageModal.title}
        message={messageModal.message}
        type={messageModal.type}
      />
    </form>
  )
} 