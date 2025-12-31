import Sqids from "sqids";

const sqids = new Sqids({
  minLength: 6,
  alphabet: "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
});

/**
 * Encodes a numeric ID into a URL-friendly string.
 * @param id The numeric ID to encode.
 * @returns The encoded string.
 */
export function encodeId(id: number): string {
  return sqids.encode([id]);
}

/**
 * Decodes a URL-friendly string back into a numeric ID.
 * @param id The encoded string to decode.
 * @returns The numeric ID, or null if decoding fails.
 */
export function decodeId(id: string): number | null {
  // If the ID is already a number (legacy support), return it
  if (!isNaN(Number(id))) {
    return parseInt(id);
  }

  const decoded = sqids.decode(id);
  return decoded.length > 0 ? decoded[0] : null;
}
