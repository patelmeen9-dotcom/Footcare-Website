export const SHOWROOM_NAMES = {
  KICK_SPORTS: "Footcare Kick Sports",
  STORE: "Foot Care Store",
  MALL: "Foot Care Mall",
} as const;

const BRAND_NAME_ALIASES: Record<string, string> = {
  sekchers: "SKECHERS",
  sketchers: "SKECHERS",
};

export function canonicalizeBrandName(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return trimmed;
  return BRAND_NAME_ALIASES[trimmed.toLowerCase()] || trimmed;
}

export function showroomNameForBrand(brandName: string): string {
  const brand = canonicalizeBrandName(brandName).toLowerCase();
  if (brand === "nike" || brand === "skechers") return SHOWROOM_NAMES.KICK_SPORTS;
  if (brand === "puma" || brand === "jockey") return SHOWROOM_NAMES.STORE;
  return SHOWROOM_NAMES.MALL;
}
