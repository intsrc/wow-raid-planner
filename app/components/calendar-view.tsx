"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, ChevronLeft, ChevronRight, Plus, Clock, Users } from "lucide-react"
import { mockRaids } from "../lib/mock-data"
import { useAuth } from "../lib/auth-context"

interface CalendarViewProps {
  onRaidSelect: (raidId: string) => void
}

export function CalendarView({ onRaidSelect }: CalendarViewProps) {
  const { user } = useAuth()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [view, setView] = useState<"month" | "list">("month")

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day))
    }

    return days
  }

  const getRaidsForDate = (date: Date | null) => {
    if (!date) return []
    const dateStr = date.toISOString().split("T")[0]
    return mockRaids.filter((raid) => raid.date === dateStr)
  }

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev)
      if (direction === "prev") {
        newDate.setMonth(prev.getMonth() - 1)
      } else {
        newDate.setMonth(prev.getMonth() + 1)
      }
      return newDate
    })
  }

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

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

  if (view === "list") {
    const upcomingRaids = mockRaids
      .filter((raid) => new Date(raid.date) >= new Date())
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-100 mb-2">Raid Calendar</h1>
            <p className="text-slate-400">Manage and view all guild raids</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex bg-slate-800 rounded-lg p-1">
              <Button
                variant={view === "month" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setView("month")}
                className="text-slate-300"
              >
                Month
              </Button>
              <Button
                variant={view === "list" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setView("list")}
                className="text-slate-300"
              >
                List
              </Button>
            </div>
            {(user?.role === "rl" || user?.role === "admin") && (
              <Button className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-slate-900">
                <Plus className="w-4 h-4 mr-2" />
                Create Raid
              </Button>
            )}
          </div>
        </div>

        <div className="space-y-4">
          {upcomingRaids.map((raid) => (
            <Card
              key={raid.id}
              className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-colors cursor-pointer"
            >
              <CardContent className="p-6" onClick={() => onRaidSelect(raid.id)}>
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold text-slate-100">{raid.title}</h3>
                      <Badge variant="outline" className={getStatusColor(raid.status)}>
                        {raid.status.toUpperCase()}
                      </Badge>
                    </div>
                    <p className="text-slate-400">{raid.instance}</p>
                    <div className="flex items-center gap-4 text-sm text-slate-400">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(raid.date).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {raid.startTime}
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {raid.caps.tank + raid.caps.heal + raid.caps.melee + raid.caps.ranged} slots
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700">
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 mb-2">Raid Calendar</h1>
          <p className="text-slate-400">Manage and view all guild raids</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-slate-800 rounded-lg p-1">
            <Button
              variant={view === "month" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setView("month")}
              className="text-slate-300"
            >
              Month
            </Button>
            <Button
              variant={view === "list" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setView("list")}
              className="text-slate-300"
            >
              List
            </Button>
          </div>
          {(user?.role === "rl" || user?.role === "admin") && (
            <Button className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-slate-900">
              <Plus className="w-4 h-4 mr-2" />
              Create Raid
            </Button>
          )}
        </div>
      </div>

      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-slate-100 text-xl">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateMonth("prev")}
                className="border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentDate(new Date())}
                className="border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                Today
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateMonth("next")}
                className="border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-1 mb-4">
            {dayNames.map((day) => (
              <div key={day} className="p-2 text-center text-sm font-medium text-slate-400">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {getDaysInMonth(currentDate).map((date, index) => {
              const raids = getRaidsForDate(date)
              const isToday = date && date.toDateString() === new Date().toDateString()

              return (
                <div
                  key={index}
                  className={`min-h-[100px] p-2 border border-slate-700 rounded-lg ${
                    date ? "bg-slate-800/30 hover:bg-slate-800/50" : "bg-slate-900/20"
                  } ${isToday ? "ring-2 ring-yellow-500/50" : ""}`}
                >
                  {date && (
                    <>
                      <div className={`text-sm font-medium mb-1 ${isToday ? "text-yellow-400" : "text-slate-300"}`}>
                        {date.getDate()}
                      </div>
                      <div className="space-y-1">
                        {raids.map((raid) => (
                          <div
                            key={raid.id}
                            onClick={() => onRaidSelect(raid.id)}
                            className={`text-xs p-1 rounded cursor-pointer hover:opacity-80 ${getStatusColor(raid.status)}`}
                          >
                            <div className="font-medium truncate">{raid.title}</div>
                            <div className="opacity-75">{raid.startTime}</div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
