// WoW class colors for better UI
export const classColors: Record<string, string> = {
  DEATH_KNIGHT: '#C41F3B',
  DRUID: '#FF7D0A',
  HUNTER: '#A9D271',
  MAGE: '#40C7EB',
  PALADIN: '#F58CBA',
  PRIEST: '#FFFFFF',
  ROGUE: '#FFF569',
  SHAMAN: '#0070DE',
  WARLOCK: '#8787ED',
  WARRIOR: '#C79C6E'
}

// WoW instances
export const instances = [
  'Icecrown Citadel',
  'Ruby Sanctum', 
  'Trial of the Crusader',
  'Ulduar',
  'Naxxramas',
  'The Eye of Eternity',
  'The Obsidian Sanctum',
  'Vault of Archavon'
]

// Class mappings
export const classMap: { [key: string]: string } = {
  'DEATH_KNIGHT': 'Death Knight',
  'DEMON_HUNTER': 'Demon Hunter',
  'DRUID': 'Druid',
  'HUNTER': 'Hunter',
  'MAGE': 'Mage',
  'MONK': 'Monk',
  'PALADIN': 'Paladin',
  'PRIEST': 'Priest',
  'ROGUE': 'Rogue',
  'SHAMAN': 'Shaman',
  'WARLOCK': 'Warlock',
  'WARRIOR': 'Warrior'
}

// Default raid composition
export const defaultRaidComposition = {
  tankCap: 2,
  healCap: 5,
  meleeCap: 9,
  rangedCap: 9
} 