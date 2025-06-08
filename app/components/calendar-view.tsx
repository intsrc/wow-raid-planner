"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, ChevronLeft, ChevronRight, Plus, Clock, Users, Loader2 } from "lucide-react"
import { useAuth } from "../lib/auth-context"
import { apiClient } from "@/lib/api-client"
import { Raid } from "@/lib/types"
import { format } from "date-fns"
import { useRouter } from "next/navigation"

interface CalendarViewProps {
  onRaidSelect: (raidId: string) => void
}

type ViewType = "month" | "list"

export function CalendarView({ onRaidSelect }: CalendarViewProps) {
  const { user } = useAuth()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [view, setView] = useState<ViewType>("month")
  const [raids, setRaids] = useState<Raid[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetchRaids()
  }, [])

  const fetchRaids = async () => {
    try {
      setLoading(true)
      const fetchedRaids = await apiClient.getRaids()
      setRaids(fetchedRaids)
      
      // Auto-navigate to first raid's month if no raids in current month
      if (fetchedRaids.length > 0) {
        const currentDateStr = currentDate.toISOString().split("T")[0]
        const hasRaidInCurrentMonth = fetchedRaids.some(raid => 
          raid.date.startsWith(currentDateStr.substring(0, 7)) // YYYY-MM
        )
        
        if (!hasRaidInCurrentMonth) {
          // Navigate to the first raid's month
          const firstRaidDate = new Date(fetchedRaids[0].date)
          setCurrentDate(firstRaidDate)
        }
      }
    } catch (error) {
      console.error('Failed to fetch raids:', error)
    } finally {
      setLoading(false)
    }
  }

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
    
    // Use local date comparison to avoid timezone issues
    const calendarDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())
    
    const matchingRaids = raids.filter((raid: Raid) => {
      // Create a local date from the raid's date string
      const raidDate = new Date(raid.date)
      const raidLocalDate = new Date(raidDate.getFullYear(), raidDate.getMonth(), raidDate.getDate())
      
      // Compare local dates
      return calendarDate.getTime() === raidLocalDate.getTime()
    })
    return matchingRaids
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
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ]

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case "OPEN":
        return "border-green-500 text-green-400 bg-green-500/10"
      case "FULL":
        return "border-yellow-500 text-yellow-400 bg-yellow-500/10"
      case "LOCKED":
        return "border-red-500 text-red-400 bg-red-500/10"
      default:
        return "border-slate-500 text-slate-400 bg-slate-500/10"
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  const upcomingRaids = raids
    .filter((raid: Raid) => new Date(raid.date) >= new Date())
    .sort((a: Raid, b: Raid) => new Date(a.date).getTime() - new Date(b.date).getTime())

  // Mobile view - list format like Google Calendar mobile
  const renderMobileView = () => {
    const today = new Date()
    const todayStr = format(today, 'yyyy-MM-dd')
    
    // Get raids for current month
    const monthRaids = raids.filter(raid => {
      const raidDate = new Date(raid.date)
      return raidDate.getMonth() === currentDate.getMonth() && 
             raidDate.getFullYear() === currentDate.getFullYear()
    })

    // Group raids by date
    const raidsByDate = monthRaids.reduce((acc, raid) => {
      const dateKey = format(new Date(raid.date), 'yyyy-MM-dd')
      if (!acc[dateKey]) acc[dateKey] = []
      acc[dateKey].push(raid)
      return acc
    }, {} as Record<string, typeof raids>)

    const sortedDates = Object.keys(raidsByDate).sort()

    return (
      <div className="space-y-4">
        {/* Month Navigation */}
        <div className="flex items-center justify-between bg-slate-800 p-4 rounded-lg">
          <button
            onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
            className="text-slate-400 hover:text-white p-2"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h2 className="text-xl font-semibold text-white">
            {format(currentDate, 'MMMM yyyy')}
          </h2>
          <button
            onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
            className="text-slate-400 hover:text-white p-2"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        {/* Today's Raids Section */}
        {raidsByDate[todayStr] && (
          <div className="bg-gradient-to-r from-red-900/50 to-red-800/50 border border-red-500/30 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-red-300 mb-3 flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Today's Raids
            </h3>
            <div className="space-y-2">
              {raidsByDate[todayStr].map(raid => (
                <div key={raid.id} className="bg-slate-800/80 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-white">{raid.title}</h4>
                      <p className="text-sm text-slate-300">
                        {format(new Date(raid.date), 'h:mm a')}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                        raid.status === 'OPEN' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                      }`}>
                        {raid.status === 'OPEN' ? 'Open' : raid.status === 'FULL' ? 'Full' : 'Closed'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upcoming Raids */}
        {sortedDates.length > 0 ? (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-white flex items-center">
              <Clock className="h-5 w-5 mr-2" />
              All Raids This Month
            </h3>
            {sortedDates.map(dateKey => {
              const isToday = dateKey === todayStr
              const date = new Date(dateKey)
              const dayRaids = raidsByDate[dateKey]

              return (
                <div 
                  key={dateKey} 
                  className={`bg-slate-800 rounded-lg p-4 border-l-4 ${
                    isToday ? 'border-red-500 bg-red-900/20' : 'border-slate-600'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className={`font-semibold ${isToday ? 'text-red-300' : 'text-white'}`}>
                        {format(date, 'EEEE, MMM d')}
                      </h4>
                      {isToday && (
                        <span className="text-xs text-red-400 font-medium">TODAY</span>
                      )}
                    </div>
                    <span className="text-sm text-slate-400">
                      {dayRaids.length} raid{dayRaids.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    {dayRaids.map(raid => (
                      <div 
                        key={raid.id} 
                        className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition cursor-pointer"
                        onClick={() => router.push(`/raids/${raid.id}`)}
                      >
                        <div className="flex-1">
                          <h5 className="font-medium text-white">{raid.title}</h5>
                          <div className="flex items-center space-x-4 text-sm text-slate-300 mt-1">
                            <span className="flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              {format(new Date(raid.date), 'h:mm a')}
                            </span>
                            <span className="flex items-center">
                              <Users className="h-3 w-3 mr-1" />
                              {raid.signUps?.filter(s => s.status === 'CONFIRMED').length || 0}/{raid.tankCap + raid.healCap + raid.meleeCap + raid.rangedCap}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end space-y-1">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            raid.status === 'OPEN' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                          }`}>
                            {raid.status === 'OPEN' ? 'Open' : raid.status === 'FULL' ? 'Full' : 'Closed'}
                          </span>
                          <ChevronRight className="h-4 w-4 text-slate-400" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-12 bg-slate-800 rounded-lg">
            <Calendar className="h-12 w-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">No raids scheduled this month</p>
          </div>
        )}
      </div>
    )
  }

  const renderCalendarGrid = (type: "desktop" | "mobile") => {
    const days = getDaysInMonth(currentDate);

    return days.map((date, index) => {
      const raids = getRaidsForDate(date);
      const isToday = date && date.toDateString() === new Date().toDateString();
      const cellClasses = `
        min-h-[120px] bg-background transition-colors border-r border-b border-border last:border-r-0
        ${type === 'mobile' ? 'min-h-[100px]' : 'sm:min-h-[120px]'}
        ${date ? "hover:bg-muted/50" : "bg-muted/20"}
        ${isToday ? "bg-yellow-500/10" : ""}
      `;

      return (
        <div key={index} className={cellClasses.trim()}>
          {date && (
            <div className="h-full flex flex-col p-2">
              <div className={`text-sm font-medium mb-1 ${isToday ? "text-yellow-600 font-bold" : "text-foreground"}`}>
                {date.getDate()}
              </div>
              
              <div className="flex-1 overflow-hidden">
                {raids.length > 0 ? (
                  <div className="space-y-1">
                    {/* Sliced for desktop, all for mobile */}
                    {(type === 'desktop' ? raids.slice(0, 3) : raids).map((raid) => (
                      <div
                        key={raid.id}
                        onClick={() => onRaidSelect(raid.id)}
                        className={`text-xs p-1 rounded cursor-pointer hover:opacity-80 transition-opacity ${getStatusColor(raid.status)}`}
                      >
                        <div className="font-medium truncate">{raid.title}</div>
                        <div className="opacity-75 text-[10px]">{raid.startTime}</div>
                      </div>
                    ))}
                    {type === 'desktop' && raids.length > 3 && (
                      <div className="text-[10px] text-muted-foreground text-center bg-muted/50 rounded px-1 py-0.5">
                        +{raids.length - 3} more
                      </div>
                    )}
                  </div>
                ) : (
                  isToday && (
                    <div className="flex items-center justify-center h-full">
                      <div className="w-1.5 h-1.5 rounded-full bg-yellow-500"></div>
                    </div>
                  )
                )}
              </div>
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <div className="space-y-6">
      {/* Mobile-Optimized Header */}
      <div className="space-y-4 md:space-y-0 md:flex md:items-center md:justify-between">
        <div className="text-center md:text-left">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Raid Calendar</h1>
          <p className="text-muted-foreground">Manage and view all guild raids</p>
        </div>
        
        {/* Mobile-First Controls */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="flex bg-muted rounded-lg p-1 w-full sm:w-auto">
            <Button
              variant={view === "month" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setView("month")}
              className="flex-1 sm:flex-none text-foreground"
            >
              Month
            </Button>
            <Button
              variant={view === "list" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setView("list")}
              className="flex-1 sm:flex-none text-foreground"
            >
              List
            </Button>
          </div>
          {(user?.role === "RAID_LEADER" || user?.role === "ADMIN") && (
            <Button className="w-full sm:w-auto bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800 text-white font-medium">
              <Plus className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Create New Raid</span>
              <span className="sm:hidden">Create Raid</span>
            </Button>
          )}
        </div>
      </div>

      {view === "list" ? (
        // List View
        <div className="space-y-4">
          {upcomingRaids.map((raid) => (
            <Card
              key={raid.id}
              className="wotlk-card hover:bg-card/80 transition-colors cursor-pointer"
            >
              <CardContent className="p-4 md:p-6" onClick={() => onRaidSelect(raid.id)}>
                {/* Mobile Layout */}
                <div className="md:hidden space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-foreground truncate">{raid.title}</h3>
                      <p className="text-muted-foreground text-sm">{raid.instance}</p>
                    </div>
                    <Badge variant="outline" className={getStatusColor(raid.status)}>
                      {raid.status.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      {new Date(raid.date).toLocaleDateString()} at {raid.startTime}
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Users className="w-4 h-4" />
                      0/25
                    </div>
                  </div>
                </div>

                {/* Desktop Layout */}
                <div className="hidden md:flex md:items-start md:justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold text-foreground">{raid.title}</h3>
                      <Badge variant="outline" className={getStatusColor(raid.status)}>
                        {raid.status.toUpperCase()}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground">{raid.instance}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {new Date(raid.date).toLocaleDateString()} at {raid.startTime}
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        0/25 players
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      onRaidSelect(raid.id)
                    }}
                    className="text-foreground"
                  >
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        // Month View
        <Card className="wotlk-card border-0 sm:border">
          <CardHeader className="pb-4 px-4 sm:px-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle className="text-foreground text-xl text-center sm:text-left">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </CardTitle>
              <div className="flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigateMonth("prev")}
                  className="text-foreground"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentDate(new Date())}
                  className="text-foreground px-4"
                >
                  Today
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigateMonth("next")}
                  className="text-foreground"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0 sm:p-6 sm:pt-0">
            {/* --- Desktop Static Calendar --- */}
            <div className="hidden sm:block">
              {/* Day Names Header */}
              <div className="grid grid-cols-7 mb-1">
                {dayNames.map((day) => (
                  <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground bg-muted/50 border-r border-border last:border-r-0">
                    <span>{day}</span>
                  </div>
                ))}
              </div>
              {/* Calendar Grid */}
              <div className="grid grid-cols-7 bg-border rounded-lg overflow-hidden border border-border">
                {renderCalendarGrid("desktop")}
              </div>
            </div>

            {/* --- Mobile Horizontally Scrollable Calendar --- */}
            <div className="sm:hidden overflow-x-auto">
              <div style={{ minWidth: '200%' }}> {/* Force container to be wider for scrolling */}
                {/* Day Names Header */}
                <div className="grid grid-cols-7">
                  {dayNames.map((day) => (
                    <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground bg-muted/50 border-r border-border">
                      {day}
                    </div>
                  ))}
                </div>
                {/* Calendar Grid */}
                <div className="grid grid-cols-7 bg-border border-y border-border">
                  {renderCalendarGrid("mobile")}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
