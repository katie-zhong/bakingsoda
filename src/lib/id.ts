/**
 * Every table uses short text ids generated in app code (see schema.ts
 * conventions). Crypto-random, URL-safe, 12 chars ≈ collision-free at
 * our scale by a comfortable margin.
 */
const ALPHABET = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
export function newId(size = 12): string {
  const bytes = crypto.getRandomValues(new Uint8Array(size));
  let id = "";
  for (const b of bytes) id += ALPHABET[b % ALPHABET.length];
  return id;
}
