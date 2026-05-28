export const TINT_LETTERS = ["a", "b", "c", "d", "e", "f"] as const;

export type TintLetter = (typeof TINT_LETTERS)[number];

export function getTintLetter(name: string): TintLetter {
  const normalized = name.trim().toLowerCase();
  if (normalized.length === 0) return TINT_LETTERS[0];

  let hash = 0;
  for (let i = 0; i < normalized.length; i++) {
    hash = (hash * 31 + normalized.charCodeAt(i)) >>> 0;
  }
  return TINT_LETTERS[hash % TINT_LETTERS.length];
}
