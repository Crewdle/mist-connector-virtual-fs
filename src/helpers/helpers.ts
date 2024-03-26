import * as crypto from 'crypto';

const algorithm = 'aes-256-ctr';

/**
 * Encrypt a buffer with a key
 * @param buffer The buffer to encrypt
 * @param key The key to encrypt with
 * @returns The encrypted buffer
 * @ignore
 */
export function encrypt(buffer: Buffer, key: string): Buffer {
  const iv: Buffer = crypto.randomBytes(16);
  const cipher: crypto.Cipher = crypto.createCipheriv(algorithm, key, iv);
  const result: Buffer = Buffer.concat([iv, cipher.update(buffer), cipher.final()]);
  return result;
}

/**
 * Decrypt a buffer with a key
 * @param encrypted The encrypted buffer
 * @param key The key to decrypt with
 * @returns The decrypted buffer
 * @ignore
 */
export function decrypt(encrypted: Buffer, key: string): Buffer {
  const iv: Buffer = encrypted.slice(0, 16);
  const data: Buffer = encrypted.slice(16);
  const decipher: crypto.Decipher = crypto.createDecipheriv(algorithm, key, iv);
  return Buffer.concat([decipher.update(data), decipher.final()]);
}

/**
 * Get the path name of an object from a path and a name
 * @param path The path to the object
 * @param name The name of the object
 * @returns The path name of the object
 * @ignore
 */
export function getPathName(path: string, name: string): string {
  return path === '/' ? path + name : path + '/' + name;
}

/**
 * Split a path name into its path and name
 * @param pathName The path name to split
 * @returns The path and name of the object
 * @ignore
 */
export function splitPathName(pathName: string): [string, string] {
  const parts = getPathParts(pathName);
  const name = parts.pop() || '';
  const path = parts.join('/');
  return [path.length === 0 ? '/' : path, name];
}

/**
 * Get the parts of a path
 * @param path The path to split
 * @returns The parts of the path
 * @ignore
 */
function getPathParts(path: string): string[] {
  return path.split('/').filter((part) => part.length > 0);
}
