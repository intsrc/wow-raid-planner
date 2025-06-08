"use client"

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Shield, Heart, Sword, Zap, Download, MessageSquare, Clock, Calendar } from "lucide-react"
import { RosterSlot, WowRole, Raid } from "@/lib/types"
import { classColors } from "../lib/mock-data"

interface RosterDisplayProps {
  rosterSlots: RosterSlot[]
  raid: Raid
  onExport?: () => void
  onPostToDiscord?: () => void
}

export function RosterDisplay({ rosterSlots, raid, onExport, onPostToDiscord }: RosterDisplayProps) {
  // Group roster slots by role
  const groupedRoster = rosterSlots.reduce((acc, slot) => {
    if (!acc[slot.role]) {
      acc[slot.role] = []
    }
    acc[slot.role].push(slot)
    return acc
  }, {} as Record<WowRole, RosterSlot[]>)

  const getRoleIcon = (role: WowRole) => {
    switch (role) {
      case WowRole.TANK:
        return <Shield className="w-5 h-5 text-blue-400" />
      case WowRole.HEAL:
        return <Heart className="w-5 h-5 text-green-400" />
      case WowRole.RANGED:
        return <Zap className="w-5 h-5 text-purple-400" />
      case WowRole.MELEE:
        return <Sword className="w-5 h-5 text-red-400" />
    }
  }

  const getRoleColor = (role: WowRole) => {
    switch (role) {
      case WowRole.TANK:
        return "border-blue-500 bg-blue-500/10"
      case WowRole.HEAL:
        return "border-green-500 bg-green-500/10"
      case WowRole.RANGED:
        return "border-purple-500 bg-purple-500/10"
      case WowRole.MELEE:
        return "border-red-500 bg-red-500/10"
    }
  }

  const getRoleCap = (role: WowRole) => {
    switch (role) {
      case WowRole.TANK:
        return raid.tankCap
      case WowRole.HEAL:
        return raid.healCap
      case WowRole.MELEE:
        return raid.meleeCap
      case WowRole.RANGED:
        return raid.rangedCap
    }
  }

  const formatClassLabel = (classValue: string) => {
    return classValue.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ')
  }

  const totalSlots = rosterSlots.length
  const maxSlots = raid.tankCap + raid.healCap + raid.meleeCap + raid.rangedCap

  return (
    <div className="space-y-6">
      {/* Roster Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            🏆 Finalized Roster
          </h2>
          <p className="text-slate-400 flex items-center gap-4 mt-1">
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {new Date(raid.date).toLocaleDateString()}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {raid.startTime}
            </span>
            <Badge variant="outline" className="border-green-500 text-green-400">
              {totalSlots}/{maxSlots} Slots Filled
            </Badge>
          </p>
        </div>
        
        <div className="flex gap-2">
          {onExport && (
            <Button 
              onClick={onExport}
              variant="outline" 
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          )}
          {onPostToDiscord && (
            <Button 
              onClick={onPostToDiscord}
              className="bg-[#5865F2] hover:bg-[#4752C4] text-white"
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Copy to Discord
            </Button>
          )}
        </div>
      </div>

      {/* Roster by Roles */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[WowRole.TANK, WowRole.HEAL, WowRole.MELEE, WowRole.RANGED].map((role) => {
          const roleSlots = groupedRoster[role] || []
          const roleCap = getRoleCap(role)
          
          return (
            <Card key={role} className={`bg-slate-800/50 border-2 ${getRoleColor(role)}`}>
              <CardHeader className="pb-3">
                <CardTitle className="text-slate-100 flex items-center gap-2 text-lg">
                  {getRoleIcon(role)}
                  <span className="capitalize">{role.toLowerCase()}</span>
                  <Badge variant="outline" className="ml-auto">
                    {roleSlots.length}/{roleCap}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {roleSlots.length > 0 ? (
                  roleSlots.map((slot, index) => (
                    <div
                      key={slot.id}
                      className="p-3 bg-slate-700/50 rounded-lg border border-slate-600"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span
                              className="font-semibold"
                              style={{ color: classColors[formatClassLabel(slot.character?.class || '')] || '#94a3b8' }}
                            >
                              {slot.character?.name || 'Unknown'}
                            </span>
                            {slot.position && (
                              <Badge variant="outline" className="text-xs border-yellow-500 text-yellow-400">
                                {slot.position}
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-slate-400 mt-1">
                            {slot.character?.spec} {formatClassLabel(slot.character?.class || '')}
                          </p>
                          <p className="text-xs text-slate-500">
                            GS: {slot.character?.gearScore || 'N/A'}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-500 text-sm italic text-center py-4">
                    No {role.toLowerCase()} assigned
                  </p>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Roster Summary */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-slate-100">Roster Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">{groupedRoster[WowRole.TANK]?.length || 0}</div>
              <div className="text-sm text-slate-400">Tanks</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">{groupedRoster[WowRole.HEAL]?.length || 0}</div>
              <div className="text-sm text-slate-400">Healers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-400">{groupedRoster[WowRole.MELEE]?.length || 0}</div>
              <div className="text-sm text-slate-400">Melee DPS</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">{groupedRoster[WowRole.RANGED]?.length || 0}</div>
              <div className="text-sm text-slate-400">Ranged DPS</div>
            </div>
          </div>
          
          {raid.rosterFinalizedAt && (
            <div className="mt-4 pt-4 border-t border-slate-700">
              <p className="text-sm text-slate-400">
                Finalized on {new Date(raid.rosterFinalizedAt).toLocaleDateString()} at {new Date(raid.rosterFinalizedAt).toLocaleTimeString()}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 