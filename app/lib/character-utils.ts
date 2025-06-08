import { classColors } from "./mock-data"

// WoW class mapping for beautiful display
export const wowClasses = [
  { value: "DEATH_KNIGHT", label: "Death Knight" },
  { value: "DRUID", label: "Druid" },
  { value: "HUNTER", label: "Hunter" },
  { value: "MAGE", label: "Mage" },
  { value: "PALADIN", label: "Paladin" },
  { value: "PRIEST", label: "Priest" },
  { value: "ROGUE", label: "Rogue" },
  { value: "SHAMAN", label: "Shaman" },
  { value: "WARLOCK", label: "Warlock" },
  { value: "WARRIOR", label: "Warrior" },
]

export const specsByClass: Record<string, string[]> = {
  "DEATH_KNIGHT": ["Blood", "Frost", "Unholy"],
  "DRUID": ["Balance", "Feral", "Restoration"],
  "HUNTER": ["Beast Mastery", "Marksmanship", "Survival"],
  "MAGE": ["Arcane", "Fire", "Frost"],
  "PALADIN": ["Holy", "Protection", "Retribution"],
  "PRIEST": ["Discipline", "Holy", "Shadow"],
  "ROGUE": ["Assassination", "Combat", "Subtlety"],
  "SHAMAN": ["Elemental", "Enhancement", "Restoration"],
  "WARLOCK": ["Affliction", "Demonology", "Destruction"],
  "WARRIOR": ["Arms", "Fury", "Protection"],
}

// Helper function to get beautiful class label
export function getClassLabel(classValue: string): string {
  const classObj = wowClasses.find(c => c.value === classValue)
  return classObj ? classObj.label : classValue
}

// Get proper class color for display
export function getClassColor(classLabel: string): string {
  return classColors[classLabel] || "#FFFFFF"
}

// PROPER role mapping with all the edge cases handled correctly
export function getRoleFromSpec(className: string, spec: string): string {
  // Normalize inputs to handle both formats (DEATH_KNIGHT vs Death Knight)
  const normalizedClass = className.toUpperCase().replace(/\s+/g, '_')
  const normalizedSpec = spec
  
  // Tank specs mapping
  const tankSpecs = ["Protection", "Blood", "Feral"]
  // Heal specs mapping  
  const healSpecs = ["Holy", "Discipline", "Restoration"]
  
  // Debug logging
  console.log(`Role detection: ${normalizedClass} ${normalizedSpec}`)
  
  // Handle specific class/spec combinations first (these override general rules)
  if (normalizedClass === "PRIEST" && normalizedSpec === "Shadow") {
    console.log(`-> ranged (priest shadow)`)
    return "ranged"
  }
  if (normalizedClass === "DRUID" && normalizedSpec === "Balance") {
    console.log(`-> ranged (druid balance)`)
    return "ranged"
  }
  if (normalizedClass === "SHAMAN" && normalizedSpec === "Elemental") {
    console.log(`-> ranged (shaman elemental)`)
    return "ranged"
  }
  if (normalizedClass === "DEATH_KNIGHT" && normalizedSpec === "Frost") {
    console.log(`-> tank (dk frost)`)
    return "tank" // DK Frost is tank in WOTLK
  }
  
  // General role mapping
  if (tankSpecs.includes(normalizedSpec)) {
    console.log(`-> tank (general tank spec)`)
    return "tank"
  }
  if (healSpecs.includes(normalizedSpec)) {
    console.log(`-> heal (general heal spec)`)
    return "heal"
  }
  
  // Classes that are always ranged (regardless of spec)
  if (["HUNTER", "MAGE", "WARLOCK"].includes(normalizedClass)) {
    console.log(`-> ranged (always ranged class)`)
    return "ranged"
  }
  
  // Everything else is melee
  console.log(`-> melee (default)`)
  return "melee"
}

// Get spec color based on role
export function getSpecColor(className: string, spec: string): string {
  const role = getRoleFromSpec(className, spec)
  
  switch (role) {
    case "tank":
      return "#3B82F6" // blue-500
    case "heal":
      return "#10B981" // emerald-500
    case "ranged":
      return "#8B5CF6" // violet-500
    case "melee":
      return "#EF4444" // red-500
    default:
      return "#6B7280" // gray-500
  }
} 