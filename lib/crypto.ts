import { createCipheriv, createDecipheriv, randomBytes } from "crypto"

const ALGORITHM = "aes-256-cbc"
const IV_LENGTH = 16

function getKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY
  if (!key) {
    throw new Error("ENCRYPTION_KEY environment variable is not set")
  }
  if (key.length !== 64) {
    throw new Error("ENCRYPTION_KEY must be 64 hex characters (32 bytes)")
  }
  return Buffer.from(key, "hex")
}

/**
 * Encrypts a plain-text string.
 * Returns a base64-encoded string in the format "iv:encrypted".
 */
export function encrypt(text: string): string {
  const key = getKey()
  const iv = randomBytes(IV_LENGTH)
  const cipher = createCipheriv(ALGORITHM, key, iv)
  const encrypted = Buffer.concat([cipher.update(text, "utf8"), cipher.final()])
  const ivBase64 = iv.toString("base64")
  const encBase64 = encrypted.toString("base64")
  return `${ivBase64}:${encBase64}`
}

/**
 * Decrypts a string produced by encrypt().
 * Expects a base64-encoded string in the format "iv:encrypted".
 */
export function decrypt(text: string): string {
  const key = getKey()
  const [ivBase64, encBase64] = text.split(":")
  if (!ivBase64 || !encBase64) {
    throw new Error("Invalid encrypted text format")
  }
  const iv = Buffer.from(ivBase64, "base64")
  const encrypted = Buffer.from(encBase64, "base64")
  const decipher = createDecipheriv(ALGORITHM, key, iv)
  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()])
  return decrypted.toString("utf8")
}
