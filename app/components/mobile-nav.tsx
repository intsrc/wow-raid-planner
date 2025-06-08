"use client"

import { useState } from 'react'
import { Menu, X, Shield, Calendar, Users, Settings, LogOut, Crown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet'

interface MobileNavProps {
  currentView: string
  user: any
  onViewChange: (view: string) => void
  onLogout: () => void
}

function getRoleDisplayName(role: string): string {
  switch (role) {
    case "ADMIN":
      return "Admin"
    case "RAID_LEADER":
      return "Raid Leader"
    case "MEMBER":
      return "Member"
    default:
      return "Unknown"
  }
}

export function MobileNav({ currentView, user, onViewChange, onLogout }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleNavigation = (view: string) => {
    onViewChange(view)
    setIsOpen(false)
  }

  const menuItems = [
    {
      view: 'dashboard',
      label: 'Dashboard',
      icon: Shield,
      available: true
    },
    {
      view: 'calendar',
      label: 'Raids',
      icon: Calendar,
      available: true
    },
    {
      view: 'characters',
      label: 'Characters',
      icon: Users,
      available: true
    },
    {
      view: 'admin',
      label: 'Admin',
      icon: Settings,
      available: user?.role === 'ADMIN' || user?.role === 'RAID_LEADER'
    }
  ]

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80 sm:w-96">
        <SheetHeader className="text-left">
          <SheetTitle className="flex items-center gap-3">
            <Avatar className="w-12 h-12">
              <AvatarImage src={user?.avatarUrl || undefined} />
              <AvatarFallback className="text-lg">
                {user?.username?.charAt(0)?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-foreground truncate">{user?.username}</p>
              <Badge variant="secondary" className="text-xs">
                {getRoleDisplayName(user?.role)}
              </Badge>
            </div>
          </SheetTitle>
        </SheetHeader>
        {/* Navigation Menu */}
        <nav className="flex flex-col gap-2 py-4">
          {menuItems.filter(item => item.available).map((item) => {
            const Icon = item.icon
            const isActive = currentView === item.view
            
            return (
              <Button
                key={item.view}
                variant={isActive ? "secondary" : "ghost"}
                className={`justify-start gap-3 h-12 px-4 ${
                  isActive 
                    ? "bg-secondary text-secondary-foreground" 
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                }`}
                onClick={() => handleNavigation(item.view)}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Button>
            )
          })}
        </nav>

        {/* Logout Button */}
        <div className="absolute bottom-6 left-6 right-6">
          <Button
            variant="outline"
            className="w-full justify-start gap-3 h-12 text-muted-foreground hover:text-destructive hover:border-destructive/50"
            onClick={() => {
              onLogout()
              setIsOpen(false)
            }}
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Sign Out</span>
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
} 