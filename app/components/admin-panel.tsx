"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Plus, Edit, Trash2, Users, Calendar, Settings, Shield } from "lucide-react"
import { mockRaids, mockCharacters, classColors } from "../lib/mock-data"

const mockUsers = [
  { id: "1", name: "Arthas", discordId: "123456789", role: "rl", joinDate: "2024-01-01" },
  { id: "2", name: "Jaina", discordId: "987654321", role: "member", joinDate: "2024-01-02" },
  { id: "3", name: "Thrall", discordId: "456789123", role: "member", joinDate: "2024-01-03" },
  { id: "4", name: "Sylvanas", discordId: "789123456", role: "admin", joinDate: "2024-01-04" },
]

export function AdminPanel() {
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("raids")

  const filteredRaids = mockRaids.filter(
    (raid) =>
      raid.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      raid.instance.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const filteredUsers = mockUsers.filter(
    (user) => user.name.toLowerCase().includes(searchTerm.toLowerCase()) || user.discordId.includes(searchTerm),
  )

  const filteredCharacters = mockCharacters.filter(
    (character) =>
      character.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      character.class.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "border-red-500 text-red-400 bg-red-500/10"
      case "rl":
        return "border-yellow-500 text-yellow-400 bg-yellow-500/10"
      default:
        return "border-blue-500 text-blue-400 bg-blue-500/10"
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

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Total Raids</p>
                <p className="text-2xl font-bold text-slate-100">{mockRaids.length}</p>
              </div>
              <Calendar className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Guild Members</p>
                <p className="text-2xl font-bold text-slate-100">{mockUsers.length}</p>
              </div>
              <Users className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Characters</p>
                <p className="text-2xl font-bold text-slate-100">{mockCharacters.length}</p>
              </div>
              <Shield className="w-8 h-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Raid Leaders</p>
                <p className="text-2xl font-bold text-slate-100">
                  {mockUsers.filter((u) => u.role === "rl" || u.role === "admin").length}
                </p>
              </div>
              <Users className="w-8 h-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-slate-100">Management</CardTitle>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                <Input
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-slate-700 border-slate-600 text-slate-100"
                />
              </div>
              <Button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Add New
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3 bg-slate-700">
              <TabsTrigger value="raids" className="data-[state=active]:bg-slate-600">
                Raids ({filteredRaids.length})
              </TabsTrigger>
              <TabsTrigger value="users" className="data-[state=active]:bg-slate-600">
                Users ({filteredUsers.length})
              </TabsTrigger>
              <TabsTrigger value="characters" className="data-[state=active]:bg-slate-600">
                Characters ({filteredCharacters.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="raids" className="mt-6">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-700">
                    <TableHead className="text-slate-300">Raid</TableHead>
                    <TableHead className="text-slate-300">Instance</TableHead>
                    <TableHead className="text-slate-300">Date</TableHead>
                    <TableHead className="text-slate-300">Status</TableHead>
                    <TableHead className="text-slate-300">Sign-ups</TableHead>
                    <TableHead className="text-slate-300">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRaids.map((raid) => (
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
                        {raid.caps.tank + raid.caps.heal + raid.caps.melee + raid.caps.ranged} slots
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" className="text-slate-400 hover:text-slate-100">
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300">
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>

            <TabsContent value="users" className="mt-6">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-700">
                    <TableHead className="text-slate-300">Name</TableHead>
                    <TableHead className="text-slate-300">Discord ID</TableHead>
                    <TableHead className="text-slate-300">Role</TableHead>
                    <TableHead className="text-slate-300">Join Date</TableHead>
                    <TableHead className="text-slate-300">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id} className="border-slate-700">
                      <TableCell className="text-slate-100 font-medium">{user.name}</TableCell>
                      <TableCell className="text-slate-300 font-mono">{user.discordId}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getRoleColor(user.role)}>
                          {user.role.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-slate-300">{new Date(user.joinDate).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" className="text-slate-400 hover:text-slate-100">
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300">
                            <Trash2 className="w-3 h-3" />
                          </Button>
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
                    <TableHead className="text-slate-300">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCharacters.map((character) => {
                    const owner = mockUsers.find((u) => u.id === character.userId)
                    return (
                      <TableRow key={character.id} className="border-slate-700">
                        <TableCell className="font-medium" style={{ color: classColors[character.class] }}>
                          {character.name}
                        </TableCell>
                        <TableCell className="text-slate-300">{character.class}</TableCell>
                        <TableCell className="text-slate-300">{character.spec}</TableCell>
                        <TableCell className="text-slate-300">{character.gs}</TableCell>
                        <TableCell className="text-slate-300">{owner?.name || "Unknown"}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm" className="text-slate-400 hover:text-slate-100">
                              <Edit className="w-3 h-3" />
                            </Button>
                            <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300">
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
