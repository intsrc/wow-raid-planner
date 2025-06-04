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

export const mockCharacters: Character[] = [
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
]

export const mockRaids: Raid[] = [
  {
    id: "1",
    title: "ICC 25 Heroic",
    instance: "Icecrown Citadel",
    date: "2024-01-15",
    startTime: "20:00",
    creatorId: "1",
    caps: { tank: 2, heal: 5, melee: 9, ranged: 9 },
    status: "open",
    description: "Full clear attempt, need experienced players",
  },
  {
    id: "2",
    title: "RS 10 Weekly",
    instance: "Ruby Sanctum",
    date: "2024-01-16",
    startTime: "19:30",
    creatorId: "1",
    caps: { tank: 2, heal: 3, melee: 3, ranged: 2 },
    status: "open",
  },
  {
    id: "3",
    title: "ToC 25 Normal",
    instance: "Trial of the Crusader",
    date: "2024-01-17",
    startTime: "20:30",
    creatorId: "1",
    caps: { tank: 2, heal: 5, melee: 9, ranged: 9 },
    status: "locked",
  },
]

export const mockSignUps: SignUp[] = [
  {
    id: "1",
    raidId: "1",
    characterId: "1",
    createdAt: "2024-01-10T10:00:00Z",
  },
  {
    id: "2",
    raidId: "1",
    characterId: "3",
    note: "Can bring consumables",
    createdAt: "2024-01-10T11:00:00Z",
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
