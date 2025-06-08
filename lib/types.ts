// Types matching backend API models

export interface User {
  id: string
  discordId: string
  username: string
  email?: string
  avatarUrl?: string
  role: 'MEMBER' | 'RAID_LEADER' | 'ADMIN'
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface Character {
  id: string
  userId: string
  name: string
  class: WowClass
  spec: string
  role: WowRole
  gearScore: number
  faction: Faction
  createdAt: string
  updatedAt: string
}

export interface Raid {
  id: string
  title: string
  instance: string
  date: string
  startTime: string
  description?: string
  creatorId: string
  tankCap: number
  healCap: number
  meleeCap: number
  rangedCap: number
  status: RaidStatus
  isRosterFinalized: boolean
  rosterFinalizedAt?: string
  rosterFinalizedBy?: string
  createdAt: string
  updatedAt: string
  creator?: User
  signUps?: SignUp[]
  rosterSlots?: RosterSlot[]
}

export interface SignUp {
  id: string
  raidId: string
  userId: string
  characterId: string
  note?: string
  status: SignUpStatus
  createdAt: string
  updatedAt: string
  user?: User
  character?: Character
  raid?: Raid
}

export interface RosterSlot {
  id: string
  raidId: string
  characterId: string
  userId: string
  role: WowRole
  position?: string
  createdAt: string
  character?: Character
  user?: User
}

export interface Roster {
  id: string
  raidId: string
  tankIds: string[]
  healIds: string[]
  meleeIds: string[]
  rangedIds: string[]
  benchIds: string[]
  finalized: boolean
  createdAt: string
  updatedAt: string
  raid?: Raid
  tanks?: Character[]
  heals?: Character[]
  melee?: Character[]
  ranged?: Character[]
  bench?: Character[]
}

export interface RosterSuggestion {
  tanks: Character[]
  heals: Character[]
  melee: Character[]
  ranged: Character[]
  bench: Character[]
  metrics: {
    totalGearScore: number
    averageGearScore: number
    roleBalance: {
      tanks: number
      heals: number
      melee: number
      ranged: number
    }
    factionsCount: {
      alliance: number
      horde: number
    }
  }
}

// Enums
export enum WowClass {
  DEATH_KNIGHT = 'DEATH_KNIGHT',
  DRUID = 'DRUID',
  HUNTER = 'HUNTER',
  MAGE = 'MAGE',
  PALADIN = 'PALADIN',
  PRIEST = 'PRIEST',
  ROGUE = 'ROGUE',
  SHAMAN = 'SHAMAN',
  WARLOCK = 'WARLOCK',
  WARRIOR = 'WARRIOR'
}

export enum WowRole {
  TANK = 'TANK',
  HEAL = 'HEAL',
  MELEE = 'MELEE',
  RANGED = 'RANGED'
}

export enum Faction {
  ALLIANCE = 'ALLIANCE',
  HORDE = 'HORDE'
}

export enum RaidStatus {
  OPEN = 'OPEN',
  FULL = 'FULL', 
  LOCKED = 'LOCKED'
}

export enum SignUpStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  DECLINED = 'DECLINED', 
  WITHDRAWN = 'WITHDRAWN'
}

// API Response types
export interface AuthResponse {
  access_token: string
  user: User
}

export interface ApiError {
  message: string
  error: string
  statusCode: number
}

// Request types
export interface CreateCharacterRequest {
  name: string
  class: WowClass
  spec: string
  gearScore: number
  faction: Faction
}

export interface UpdateCharacterRequest {
  name?: string
  class?: WowClass
  spec?: string
  gearScore?: number
  faction?: Faction
}

export interface CreateRaidRequest {
  title: string
  instance: string
  date: string
  startTime: string
  description?: string
  tankCap: number
  healCap: number
  meleeCap: number
  rangedCap: number
}

export interface UpdateRaidRequest {
  title?: string
  instance?: string
  date?: string
  startTime?: string
  description?: string
  tankCap?: number
  healCap?: number
  meleeCap?: number
  rangedCap?: number
  status?: RaidStatus
}

export interface CreateSignUpRequest {
  raidId: string
  characterId: string
  note?: string
}

export interface UpdateSignUpRequest {
  note?: string
  status?: SignUpStatus
}

export interface CreateRosterSlotRequest {
  characterId: string
  role: WowRole
  position?: string
}

export interface UpdateRosterRequest {
  tankIds?: string[]
  healIds?: string[]
  meleeIds?: string[]
  rangedIds?: string[]
  benchIds?: string[]
  finalized?: boolean
}

// Utility types
export type WowClassSpec = {
  [K in WowClass]: string[]
}

export const WOW_CLASS_SPECS: WowClassSpec = {
  [WowClass.DEATH_KNIGHT]: ['Blood', 'Frost', 'Unholy'],
  [WowClass.DRUID]: ['Balance', 'Feral Combat', 'Restoration'],
  [WowClass.HUNTER]: ['Beast Mastery', 'Marksmanship', 'Survival'],
  [WowClass.MAGE]: ['Arcane', 'Fire', 'Frost'],
  [WowClass.PALADIN]: ['Holy', 'Protection', 'Retribution'],
  [WowClass.PRIEST]: ['Discipline', 'Holy', 'Shadow'],
  [WowClass.ROGUE]: ['Assassination', 'Combat', 'Subtlety'],
  [WowClass.SHAMAN]: ['Elemental', 'Enhancement', 'Restoration'],
  [WowClass.WARLOCK]: ['Affliction', 'Demonology', 'Destruction'],
  [WowClass.WARRIOR]: ['Arms', 'Fury', 'Protection']
}

export const WOW_INSTANCES = [
  'Naxxramas',
  'The Eye of Eternity',
  'The Obsidian Sanctum',
  'Vault of Archavon',
  'Ulduar',
  'Trial of the Crusader',
  'Icecrown Citadel',
  'The Ruby Sanctum'
] as const

export type WowInstance = typeof WOW_INSTANCES[number] 