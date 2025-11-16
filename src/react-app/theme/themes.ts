export type ThemeTier = "core" | "ultra";

export const themeOptions = [
  {
    id: "dark",
    label: "Midnight (Default)",
    description: "Base Accounts 4.0 palette",
    tier: "core",
  },
  { id: "light", label: "Light", description: "Soft daylight surface", tier: "core" },
  { id: "slate", label: "Slate", description: "Cool neutral blues", tier: "core" },
  { id: "ocean", label: "Ocean", description: "Deep cyan gradients", tier: "core" },
  { id: "forest", label: "Forest", description: "Green & charcoal", tier: "core" },
  { id: "sunset", label: "Sunset", description: "Warm amber dusk", tier: "core" },
  { id: "rose", label: "Rose", description: "Cranberry glow", tier: "core" },
  { id: "midnight", label: "Pitch Black", description: "Zero light UI", tier: "core" },
  { id: "nord", label: "Nord", description: "Frosty blues & aurora", tier: "core" },
  { id: "dusk", label: "Dusk", description: "Violet twilight", tier: "core" },
  { id: "noir", label: "Noir", description: "High-contrast monochrome", tier: "core" },
  { id: "pastel", label: "Pastel", description: "Gentle onboarding vibes", tier: "core" },
  { id: "desert", label: "Desert", description: "Earthy oranges", tier: "core" },
  { id: "matrix", label: "Matrix", description: "Terminal greens", tier: "core" },
  { id: "horizon", label: "Horizon", description: "Blue horizon glow", tier: "core" },
  {
    id: "aurora",
    label: "Aurora",
    description: "Neon purple ultra palette",
    tier: "ultra",
  },
  { id: "crimson", label: "Crimson", description: "Bold red canvas", tier: "ultra" },
  { id: "monokai", label: "Monokai", description: "Editor-inspired", tier: "ultra" },
  { id: "dracula", label: "Dracula", description: "Soft goth purple", tier: "ultra" },
  { id: "gruvbox", label: "Gruvbox", description: "Muted amber & moss", tier: "ultra" },
  {
    id: "solarized",
    label: "Solarized",
    description: "Classic blue-yellow mix",
    tier: "ultra",
  },
  { id: "tokyo", label: "Tokyo Night", description: "Blue neon city", tier: "ultra" },
  { id: "catppuccin", label: "Catppuccin", description: "Cozy latte tones", tier: "ultra" },
  { id: "cyberpunk", label: "Cyberpunk", description: "Electric magenta", tier: "ultra" },
  { id: "lavender", label: "Lavender", description: "Calm lilac", tier: "ultra" },
  { id: "emerald", label: "Emerald", description: "Lush green", tier: "ultra" },
  { id: "amber", label: "Amber", description: "Honey glow", tier: "ultra" },
  { id: "coral", label: "Coral", description: "Rosy coral", tier: "ultra" },
  { id: "mint", label: "Mint", description: "Bright teal", tier: "ultra" },
  { id: "volcano", label: "Volcano", description: "Molten orange", tier: "ultra" },
  { id: "berry", label: "Berry", description: "Raspberry neon", tier: "ultra" },
  { id: "glacier", label: "Glacier", description: "Icy cyan", tier: "ultra" },
  { id: "ember", label: "Ember", description: "Fiery orange glow", tier: "ultra" },
] as const satisfies readonly {
  id: string;
  label: string;
  description?: string;
  tier: ThemeTier;
}[];

export type ThemeOption = (typeof themeOptions)[number];
export type ThemeName = ThemeOption["id"];

export const defaultTheme: ThemeName = "dark";
