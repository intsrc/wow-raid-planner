export interface Character {
  id: string
  userId: string
  name: string
  class: string
  spec: string
  gs: number
  armoryUrl: string
  faction: "Alliance" | "Horde"
}

export interface Raid {
  id: string
  title: string
  instance: string
  date: string
  startTime: string
  creatorId: string
  caps: {
    tank: number
    heal: number
    melee: number
    ranged: number
  }
  status: "open" | "locked" | "full"
  description?: string
}

export interface SignUp {
  id: string
  raidId: string
  characterId: string
  note?: string
  createdAt: string
}

export interface User {
  id: string
  discordId: string
  name: string
  avatarUrl: string
  role: "member" | "rl" | "admin"
}

export const mockUsers: User[] = [
  {
    id: "1",
    discordId: "123456789",
    name: "RaidLeader",
    avatarUrl: "/placeholder-user.jpg",
    role: "rl"
  },
  {
    id: "2",
    discordId: "123456790",
    name: "GuildMaster",
    avatarUrl: "/placeholder-user.jpg", 
    role: "admin"
  },
  {
    id: "3",
    discordId: "123456791",
    name: "TankMain",
    avatarUrl: "/placeholder-user.jpg",
    role: "member"
  },
  {
    id: "4",
    discordId: "123456792",
    name: "HealBot",
    avatarUrl: "/placeholder-user.jpg",
    role: "member"
  },
  {
    id: "5",
    discordId: "123456793",
    name: "DPSWarrior",
    avatarUrl: "/placeholder-user.jpg",
    role: "member"
  }
]

export const mockCharacters: Character[] = [
  // User 1 - RaidLeader
  {
    id: "1",
    userId: "1",
    name: "Arthas",
    class: "Death Knight",
    spec: "Frost",
    gs: 5800,
    armoryUrl: "https://example.com",
    faction: "Alliance",
  },
  {
    id: "2",
    userId: "1",
    name: "Jaina",
    class: "Mage",
    spec: "Arcane",
    gs: 5600,
    armoryUrl: "https://example.com",
    faction: "Alliance",
  },
  // User 2 - GuildMaster  
  {
    id: "3",
    userId: "2",
    name: "Thrall",
    class: "Shaman",
    spec: "Enhancement",
    gs: 5750,
    armoryUrl: "https://example.com",
    faction: "Horde",
  },
  // User 3 - TankMain
  {
    id: "4",
    userId: "3",
    name: "Tankenstein",
    class: "Warrior",
    spec: "Protection",
    gs: 5900,
    armoryUrl: "https://example.com",
    faction: "Alliance",
  },
  {
    id: "5",
    userId: "3",
    name: "Beartank",
    class: "Druid",
    spec: "Feral",
    gs: 5700,
    armoryUrl: "https://example.com",
    faction: "Alliance",
  },
  // User 4 - HealBot
  {
    id: "6",
    userId: "4",
    name: "Holypriest",
    class: "Priest",
    spec: "Holy",
    gs: 5650,
    armoryUrl: "https://example.com",
    faction: "Alliance",
  },
  {
    id: "7",
    userId: "4",
    name: "Treehugger",
    class: "Druid",
    spec: "Restoration",
    gs: 5550,
    armoryUrl: "https://example.com",
    faction: "Alliance",
  },
  // User 5 - DPSWarrior
  {
    id: "8",
    userId: "5",
    name: "Bladestorm",
    class: "Warrior",
    spec: "Fury",
    gs: 5800,
    armoryUrl: "https://example.com",
    faction: "Horde",
  },
  // Additional characters for better roster
  {
    id: "9",
    userId: "1",
    name: "Shadowmage",
    class: "Warlock",
    spec: "Destruction",
    gs: 5720,
    armoryUrl: "https://example.com",
    faction: "Horde",
  },
  {
    id: "10",
    userId: "2",
    name: "Lightbringer",
    class: "Paladin",
    spec: "Holy",
    gs: 5680,
    armoryUrl: "https://example.com",
    faction: "Alliance",
  },
  {
    id: "11",
    userId: "3",
    name: "Huntress",
    class: "Hunter",
    spec: "Marksmanship",
    gs: 5750,
    armoryUrl: "https://example.com",
    faction: "Alliance",
  },
  {
    id: "12",
    userId: "4",
    name: "Shadowstep",
    class: "Rogue",
    spec: "Combat",
    gs: 5820,
    armoryUrl: "https://example.com",
    faction: "Horde",
  }
]

export const mockRaids: Raid[] = [
  {
    id: "1",
    title: "ICC 25 Heroic",
    instance: "Icecrown Citadel",
    date: "2025-06-15",
    startTime: "20:00",
    creatorId: "1",
    caps: { tank: 2, heal: 5, melee: 9, ranged: 9 },
    status: "open",
    description: "Full clear attempt, need experienced players with 5700+ GS",
  },
  {
    id: "2",
    title: "RS 10 Weekly",
    instance: "Ruby Sanctum",
    date: "2025-06-16",
    startTime: "19:30",
    creatorId: "1",
    caps: { tank: 2, heal: 3, melee: 3, ranged: 2 },
    status: "open",
  },
  {
    id: "3",
    title: "ToC 25 Normal",
    instance: "Trial of the Crusader",
    date: "2025-06-17",
    startTime: "20:30",
    creatorId: "1",
    caps: { tank: 2, heal: 5, melee: 9, ranged: 9 },
    status: "locked",
  },
]

export const mockSignUps: SignUp[] = [
  // ICC 25 Heroic sign-ups (raid id: "1")
  {
    id: "1",
    raidId: "1",
    characterId: "4", // Tankenstein (Tank)
    note: "Main tank, have all CDs ready",
    createdAt: "2024-12-15T10:00:00Z",
  },
  {
    id: "2",
    raidId: "1", 
    characterId: "5", // Beartank (Tank)
    createdAt: "2024-12-15T11:00:00Z",
  },
  {
    id: "3",
    raidId: "1",
    characterId: "6", // Holypriest (Heal)
    note: "Can bring consumables for raid",
    createdAt: "2024-12-15T12:00:00Z",
  },
  {
    id: "4",
    raidId: "1",
    characterId: "7", // Treehugger (Heal)
    createdAt: "2024-12-15T13:00:00Z",
  },
  {
    id: "5",
    raidId: "1",
    characterId: "10", // Lightbringer (Heal)
    createdAt: "2024-12-15T14:00:00Z",
  },
  {
    id: "6",
    raidId: "1",
    characterId: "8", // Bladestorm (Melee)
    note: "Fury warrior, high DPS",
    createdAt: "2024-12-15T15:00:00Z",
  },
  {
    id: "7", 
    raidId: "1",
    characterId: "12", // Shadowstep (Melee)
    createdAt: "2024-12-15T16:00:00Z",
  },
  {
    id: "8",
    raidId: "1", 
    characterId: "3", // Thrall (Melee)
    note: "Enhancement shaman, have bloodlust",
    createdAt: "2024-12-15T17:00:00Z",
  },
  {
    id: "9",
    raidId: "1",
    characterId: "2", // Jaina (Ranged)
    createdAt: "2024-12-15T18:00:00Z",
  },
  {
    id: "10",
    raidId: "1",
    characterId: "9", // Shadowmage (Ranged)
    createdAt: "2024-12-15T19:00:00Z",
  },
  {
    id: "11",
    raidId: "1",
    characterId: "11", // Huntress (Ranged)
    note: "Can kite if needed",
    createdAt: "2024-12-15T20:00:00Z",
  },
  // Current user's sign-up
  {
    id: "12",
    raidId: "1",
    characterId: "1", // Arthas (Tank) - current user
    note: "DK tank, can OT or DPS if needed",
    createdAt: "2024-12-15T21:00:00Z",
  },
]

export const classColors: Record<string, string> = {
  "Death Knight": "#C41F3B",
  Druid: "#FF7D0A",
  Hunter: "#ABD473",
  Mage: "#69CCF0",
  Paladin: "#F58CBA",
  Priest: "#FFFFFF",
  Rogue: "#FFF569",
  Shaman: "#0070DE",
  Warlock: "#9482C9",
  Warrior: "#C79C6E",
}

export const getRoleFromSpec = (className: string, spec: string): string => {
  const tankSpecs = ["Protection", "Blood", "Feral", "Frost"]
  const healSpecs = ["Holy", "Discipline", "Restoration"]

  if (tankSpecs.includes(spec)) return "tank"
  if (healSpecs.includes(spec)) return "heal"
  if (["Hunter", "Mage", "Warlock", "Priest"].includes(className)) return "ranged"
  return "melee"
}
