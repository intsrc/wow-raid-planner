"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Users, 
  Calendar, 
  Settings, 
  Shield, 
  Loader2,
  AlertCircle 
} from "lucide-react"
import { apiClient } from "@/lib/api-client"
import { classColors } from "../lib/mock-data"
import { useAuth } from "../lib/auth-context"
import { useModal } from "../contexts/modal-context"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface AdminStats {
  totalUsers: number
  totalRaids: number
  totalCharacters: number
  activeRaids: number
  raidLeaders: number
  recentSignUps: number
}

interface AdminUser {
  id: string
  username: string
  discordId: string
  role: string
  createdAt: string
  characters: Array<{ id: string; name: string; class: string }>
  _count: { signUps: number }
}

interface AdminRaid {
  id: string
  title: string
  instance: string
  date: string
  status: string
  creator: { username: string }
  _count: { signUps: number }
  tankCap: number
  healCap: number
  meleeCap: number
  rangedCap: number
}

interface AdminCharacter {
  id: string
  name: string
  class: string
  spec: string
  gearScore: number
  user: { username: string }
  _count: { signUps: number }
}

export function AdminPanel() {
  const { user: currentUser } = useAuth()
  const { showConfirmation, showMessage } = useModal()
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("raids")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Data states
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [users, setUsers] = useState<AdminUser[]>([])
  const [raids, setRaids] = useState<AdminRaid[]>([])
  const [characters, setCharacters] = useState<AdminCharacter[]>([])

  // Pagination states
  const [usersPage, setUsersPage] = useState(1)
  const [raidsPage, setRaidsPage] = useState(1)
  const [charactersPage, setCharactersPage] = useState(1)

  // Tab counts (load once and show immediately)
  const [userCount, setUserCount] = useState(0)
  const [raidCount, setRaidCount] = useState(0)
  const [characterCount, setCharacterCount] = useState(0)

  // Edit states
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null)
  const [editingCharacter, setEditingCharacter] = useState<AdminCharacter | null>(null)

  useEffect(() => {
    loadDashboardData()
    loadAllTabCounts() // Load all counts immediately
  }, [])

  useEffect(() => {
    loadTabData()
  }, [activeTab, searchTerm])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      const statsData = await apiClient.getAdminStats()
      setStats(statsData)
      setError(null)
    } catch (err) {
      setError('Failed to load admin dashboard')
      console.error('Failed to load admin stats:', err)
    } finally {
      setLoading(false)
    }
  }

  const loadAllTabCounts = async () => {
    try {
      const [usersData, raidsData, charactersData] = await Promise.all([
        apiClient.getAdminUsers({ limit: 1 }), // Just get total counts
        apiClient.getAdminRaids({ limit: 1 }),
        apiClient.getAdminCharacters({ limit: 1 })
      ])
      setUserCount(usersData.total || 0)
      setRaidCount(raidsData.total || 0)
      setCharacterCount(charactersData.total || 0)
    } catch (err) {
      console.error('Failed to load tab counts:', err)
    }
  }

  const loadTabData = async () => {
    try {
      setError(null)
      switch (activeTab) {
        case 'users':
          const usersData = await apiClient.getAdminUsers({ 
            page: usersPage, 
            limit: 20, 
            search: searchTerm || undefined 
          })
          setUsers(usersData.users)
          setUserCount(usersData.total || 0) // Update count when loading data
          break
        case 'raids':
          const raidsData = await apiClient.getAdminRaids({ 
            page: raidsPage, 
            limit: 20, 
            search: searchTerm || undefined 
          })
          setRaids(raidsData.raids)
          setRaidCount(raidsData.total || 0) // Update count when loading data
          break
        case 'characters':
          const charactersData = await apiClient.getAdminCharacters({ 
            page: charactersPage, 
            limit: 20, 
            search: searchTerm || undefined 
          })
          setCharacters(charactersData.characters)
          setCharacterCount(charactersData.total || 0) // Update count when loading data
          break
      }
    } catch (err) {
      setError(`Failed to load ${activeTab}`)
      console.error(`Failed to load ${activeTab}:`, err)
    }
  }

  const handleDeleteUser = async (userId: string) => {
    const user = users.find(u => u.id === userId)
    showConfirmation(
      'Delete User',
      `Are you sure you want to delete ${user?.username}? This action cannot be undone.`,
      async () => {
        try {
          await apiClient.deleteUser(userId)
          setUsers(prev => prev.filter(u => u.id !== userId))
          loadDashboardData() // Refresh stats
          showMessage('Success', 'User deleted successfully!', 'success')
        } catch (err) {
          setError('Failed to delete user')
          console.error('Failed to delete user:', err)
          showMessage('Error', 'Failed to delete user', 'error')
        }
      }
    )
  }

  const handleDeleteCharacter = async (characterId: string) => {
    const character = characters.find(c => c.id === characterId)
    showConfirmation(
      'Delete Character',
      `Are you sure you want to delete ${character?.name}? This action cannot be undone.`,
      async () => {
        try {
          await apiClient.deleteCharacterAdmin(characterId)
          setCharacters(prev => prev.filter(c => c.id !== characterId))
          loadDashboardData() // Refresh stats
          loadAllTabCounts() // Refresh counts
          showMessage('Success', 'Character deleted successfully!', 'success')
        } catch (err) {
          setError('Failed to delete character')
          console.error('Failed to delete character:', err)
          showMessage('Error', 'Failed to delete character', 'error')
        }
      }
    )
  }

  const handleDeleteRaid = async (raidId: string) => {
    const raid = raids.find(r => r.id === raidId)
    showConfirmation(
      'Delete Raid',
      `Are you sure you want to delete "${raid?.title}" and all its signups? This action cannot be undone.`,
      async () => {
        try {
          await apiClient.deleteRaidAdmin(raidId)
          setRaids(prev => prev.filter(r => r.id !== raidId))
          loadDashboardData() // Refresh stats
          loadAllTabCounts() // Refresh counts
          showMessage('Success', 'Raid deleted successfully!', 'success')
        } catch (err) {
          setError('Failed to delete raid')
          console.error('Failed to delete raid:', err)
          showMessage('Error', 'Failed to delete raid', 'error')
        }
      }
    )
  }

  const handleEditUser = (user: AdminUser) => {
    setEditingUser(user)
  }

  const handleSaveUser = async (userId: string, role: string) => {
    try {
      await apiClient.updateUserRole(userId, role)
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role } : u))
      setEditingUser(null)
    } catch (err) {
      setError('Failed to update user')
      console.error('Failed to update user:', err)
    }
  }

  const handleEditCharacter = (character: AdminCharacter) => {
    setEditingCharacter(character)
  }

  const handleSaveCharacter = async (characterId: string, data: any) => {
    try {
      const updatedCharacter = await apiClient.updateCharacterAdmin(characterId, data)
      setCharacters(prev => prev.map(c => c.id === characterId ? { ...c, ...data } : c))
      setEditingCharacter(null)
    } catch (err) {
      setError('Failed to update character')
      console.error('Failed to update character:', err)
    }
  }

  const getRoleColor = (role: string) => {
    switch (role.toLowerCase()) {
      case "admin":
        return "border-red-500 text-red-400 bg-red-500/10"
      case "raid_leader":
        return "border-yellow-500 text-yellow-400 bg-yellow-500/10"
      default:
        return "border-blue-500 text-blue-400 bg-blue-500/10"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
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

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 mb-2">Admin Panel</h1>
          <p className="text-slate-400">Manage raids, users, and guild settings</p>
        </div>
        <Button className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-slate-900">
          <Settings className="w-4 h-4 mr-2" />
          Guild Settings
        </Button>
      </div>

      {error && (
        <Alert className="border-red-500/50 bg-red-500/10">
          <AlertCircle className="h-4 w-4 text-red-400" />
          <AlertDescription className="text-red-300">{error}</AlertDescription>
        </Alert>
      )}

      {/* Quick Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-xs md:text-sm">Total Raids</p>
                  <p className="text-xl md:text-2xl font-bold text-slate-100">{stats.totalRaids}</p>
                </div>
                <Calendar className="w-6 h-6 md:w-8 md:h-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-xs md:text-sm">Guild Members</p>
                  <p className="text-xl md:text-2xl font-bold text-slate-100">{stats.totalUsers}</p>
                </div>
                <Users className="w-6 h-6 md:w-8 md:h-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-xs md:text-sm">Characters</p>
                  <p className="text-xl md:text-2xl font-bold text-slate-100">{stats.totalCharacters}</p>
                </div>
                <Shield className="w-6 h-6 md:w-8 md:h-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-xs md:text-sm">Raid Leaders</p>
                  <p className="text-xl md:text-2xl font-bold text-slate-100">{stats.raidLeaders}</p>
                </div>
                <Users className="w-6 h-6 md:w-8 md:h-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle className="text-slate-100">Management</CardTitle>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                <Input
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-slate-700 border-slate-600 text-slate-100 w-full sm:w-auto"
                />
              </div>
              <Button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 w-full sm:w-auto">
                <Plus className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Add New</span>
                <span className="sm:hidden">Add</span>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3 bg-slate-700">
              <TabsTrigger value="raids" className="data-[state=active]:bg-slate-600 text-xs sm:text-sm">
                <span className="hidden sm:inline">Raids ({raidCount})</span>
                <span className="sm:hidden">Raids</span>
              </TabsTrigger>
              <TabsTrigger value="users" className="data-[state=active]:bg-slate-600 text-xs sm:text-sm">
                <span className="hidden sm:inline">Users ({userCount})</span>
                <span className="sm:hidden">Users</span>
              </TabsTrigger>
              <TabsTrigger value="characters" className="data-[state=active]:bg-slate-600 text-xs sm:text-sm">
                <span className="hidden sm:inline">Characters ({characterCount})</span>
                <span className="sm:hidden">Chars</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="raids" className="mt-6">
              <div className="responsive-table">
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-700">
                    <TableHead className="text-slate-300">Raid</TableHead>
                    <TableHead className="text-slate-300">Instance</TableHead>
                    <TableHead className="text-slate-300">Date</TableHead>
                    <TableHead className="text-slate-300">Status</TableHead>
                    <TableHead className="text-slate-300">Sign-ups</TableHead>
                    <TableHead className="text-slate-300">Creator</TableHead>
                    <TableHead className="text-slate-300">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {raids.map((raid) => (
                    <TableRow key={raid.id} className="border-slate-700">
                      <TableCell className="text-slate-100 font-medium">{raid.title}</TableCell>
                      <TableCell className="text-slate-300">{raid.instance}</TableCell>
                      <TableCell className="text-slate-300">{new Date(raid.date).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getStatusColor(raid.status)}>
                          {raid.status.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-slate-300">
                        {raid._count.signUps} / {raid.tankCap + raid.healCap + raid.meleeCap + raid.rangedCap}
                      </TableCell>
                      <TableCell className="text-slate-300">{raid.creator.username}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-red-400 hover:text-red-300"
                            onClick={() => handleDeleteRaid(raid.id)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="users" className="mt-6">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-700">
                    <TableHead className="text-slate-300">Name</TableHead>
                    <TableHead className="text-slate-300">Discord ID</TableHead>
                    <TableHead className="text-slate-300">Role</TableHead>
                    <TableHead className="text-slate-300">Characters</TableHead>
                    <TableHead className="text-slate-300">Sign-ups</TableHead>
                    <TableHead className="text-slate-300">Join Date</TableHead>
                    <TableHead className="text-slate-300">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id} className="border-slate-700">
                      <TableCell className="text-slate-100 font-medium">{user.username}</TableCell>
                      <TableCell className="text-slate-300 font-mono">{user.discordId}</TableCell>
                      <TableCell>
                        {editingUser?.id === user.id ? (
                          <select 
                            value={editingUser.role} 
                            onChange={(e) => setEditingUser({...editingUser, role: e.target.value})}
                            className="bg-slate-700 border-slate-600 text-slate-100 rounded px-2 py-1"
                          >
                            <option value="MEMBER">MEMBER</option>
                            <option value="RAID_LEADER">RAID LEADER</option>
                            <option value="ADMIN">ADMIN</option>
                          </select>
                        ) : (
                          <Badge variant="outline" className={getRoleColor(user.role)}>
                            {user.role.replace('_', ' ').toUpperCase()}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-slate-300">{user.characters.length}</TableCell>
                      <TableCell className="text-slate-300">{user._count.signUps}</TableCell>
                      <TableCell className="text-slate-300">{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {editingUser?.id === user.id ? (
                            <>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="text-green-400 hover:text-green-300"
                                onClick={() => handleSaveUser(user.id, editingUser.role)}
                              >
                                Save
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="text-slate-400 hover:text-slate-300"
                                onClick={() => setEditingUser(null)}
                              >
                                Cancel
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="text-slate-400 hover:text-slate-100"
                                onClick={() => handleEditUser(user)}
                              >
                                <Edit className="w-3 h-3" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="text-red-400 hover:text-red-300"
                                onClick={() => handleDeleteUser(user.id)}
                                disabled={user.id === currentUser?.id} // Don't allow self-deletion
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>

            <TabsContent value="characters" className="mt-6">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-700">
                    <TableHead className="text-slate-300">Character</TableHead>
                    <TableHead className="text-slate-300">Class</TableHead>
                    <TableHead className="text-slate-300">Spec</TableHead>
                    <TableHead className="text-slate-300">Gear Score</TableHead>
                    <TableHead className="text-slate-300">Owner</TableHead>
                    <TableHead className="text-slate-300">Sign-ups</TableHead>
                    <TableHead className="text-slate-300">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {characters.map((character) => (
                    <TableRow key={character.id} className="border-slate-700">
                      <TableCell className="font-medium" style={{ color: classColors[character.class] || '#94a3b8' }}>
                        {character.name}
                      </TableCell>
                      <TableCell className="text-slate-300">{character.class}</TableCell>
                      <TableCell className="text-slate-300">{character.spec}</TableCell>
                      <TableCell className="text-slate-300">{character.gearScore}</TableCell>
                      <TableCell className="text-slate-300">{character.user.username}</TableCell>
                      <TableCell className="text-slate-300">{character._count.signUps}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-slate-400 hover:text-slate-100"
                            onClick={() => handleEditCharacter(character)}
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-red-400 hover:text-red-300"
                            onClick={() => handleDeleteCharacter(character.id)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
