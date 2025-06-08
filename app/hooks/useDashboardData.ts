import { useState, useEffect } from 'react'
import { apiClient } from '@/lib/api-client'
import { Raid, Character, SignUp } from '@/lib/types'
import { MessageType } from '../components/ui/message-modal'
import { getRoleFromSpec } from '../lib/dashboard-utils'

interface MessageModal {
  isOpen: boolean
  title: string
  message: string
  type?: MessageType
}

export function useDashboardData(user: any) {
  const [raids, setRaids] = useState<Raid[]>([])
  const [userCharacters, setUserCharacters] = useState<Character[]>([])
  const [userSignUps, setUserSignUps] = useState<SignUp[]>([])
  const [allRaidSignUps, setAllRaidSignUps] = useState<SignUp[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Modal state
  const [messageModal, setMessageModal] = useState<MessageModal>({
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

  // Fetch data function
  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Fetch all data in parallel
      const [raidsData, charactersData, signUpsData] = await Promise.all([
        apiClient.getRaids(),
        apiClient.getCharacters(),
        apiClient.getSignUps()
      ])
      
      setRaids(raidsData)
      setUserCharacters(charactersData)
      setUserSignUps(signUpsData)
      
      // Fetch all raid signups for all upcoming raids
      const upcomingRaidIds = raidsData
        .filter((raid) => new Date(raid.date) >= new Date())
        .map(raid => raid.id)
      
      if (upcomingRaidIds.length > 0) {
        const allSignupsPromises = upcomingRaidIds.map(raidId => 
          apiClient.getSignUpsByRaid(raidId)
        )
        const allSignupsArrays = await Promise.all(allSignupsPromises)
        const flatAllSignups = allSignupsArrays.flat()
        setAllRaidSignUps(flatAllSignups)
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err)
      setError(err instanceof Error ? err.message : 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  // Handle sign-up for raid
  const handleSignUp = async (raidId: string, characterId: string, note: string) => {
    try {
      await apiClient.createSignUp({ raidId, characterId, note })
      
      // Refresh both user signups and all raid signups
      const [updatedSignUps, updatedRaidSignUps] = await Promise.all([
        apiClient.getSignUps(),
        apiClient.getSignUpsByRaid(raidId)
      ])
      setUserSignUps(updatedSignUps)
      
      // Update the specific raid's signups in allRaidSignUps
      setAllRaidSignUps(prev => [
        ...prev.filter(s => s.raidId !== raidId),
        ...updatedRaidSignUps
      ])
      
      // Show success message
      showMessage('Success', 'Successfully signed up for the raid!', 'success')
    } catch (err) {
      console.error('Error signing up for raid:', err)
      showMessage('Error', err instanceof Error ? err.message : 'Failed to sign up for raid', 'error')
    }
  }

  // Handle withdraw from raid
  const handleWithdraw = async (raidId: string) => {
    try {
      // Find the user's signup for this raid
      const userSignUp = userSignUps.find(s => s.raidId === raidId)
      if (userSignUp) {
        await apiClient.deleteSignUp(userSignUp.id)
        
        // Refresh both user signups and all raid signups
        const [updatedSignUps, updatedRaidSignUps] = await Promise.all([
          apiClient.getSignUps(),
          apiClient.getSignUpsByRaid(raidId)
        ])
        setUserSignUps(updatedSignUps)
        
        // Update the specific raid's signups in allRaidSignUps
        setAllRaidSignUps(prev => [
          ...prev.filter(s => s.raidId !== raidId),
          ...updatedRaidSignUps
        ])
        
        showMessage('Success', 'Successfully withdrew from raid!', 'success')
      }
    } catch (err) {
      console.error('Error withdrawing from raid:', err)
      showMessage('Error', err instanceof Error ? err.message : 'Failed to withdraw from raid', 'error')
    }
  }

  // Get ALL sign-ups for raid grouped by role (preloaded data)
  const getSignUpsByRole = (raidId: string) => {
    const raidSignUps = allRaidSignUps.filter(s => s.raidId === raidId)
    const signUpsWithCharacters = raidSignUps.map(signup => {
      // Character data comes from the signup.character property (populated by API)
      const character = signup.character
      return { 
        signup, 
        character, 
        role: character ? getRoleFromSpec(character.class, character.spec) : 'melee' 
      }
    }).filter(item => item.character)

    return {
      tank: signUpsWithCharacters.filter(item => item.role === 'tank'),
      heal: signUpsWithCharacters.filter(item => item.role === 'heal'),
      melee: signUpsWithCharacters.filter(item => item.role === 'melee'),
      ranged: signUpsWithCharacters.filter(item => item.role === 'ranged'),
    }
  }

  // Filter upcoming raids
  const upcomingRaids = raids
    .filter((raid) => new Date(raid.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  // Fetch data on component mount
  useEffect(() => {
    if (user) {
      fetchData()
    }
  }, [user])

  return {
    raids,
    userCharacters,
    userSignUps,
    allRaidSignUps,
    upcomingRaids,
    loading,
    error,
    messageModal,
    setMessageModal,
    showMessage,
    fetchData,
    handleSignUp,
    handleWithdraw,
    getSignUpsByRole
  }
} 