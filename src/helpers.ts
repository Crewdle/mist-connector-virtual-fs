import { Blob, BlobOptions } from 'buffer';
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
  const hashedKey = crypto.createHash('sha256').update(key).digest();
  const iv: Buffer = crypto.randomBytes(16);
  const cipher: crypto.Cipher = crypto.createCipheriv(algorithm, hashedKey, iv);
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
  const hashedKey = crypto.createHash('sha256').update(key).digest();
  const iv: Buffer = encrypted.subarray(0, 16);
  const data: Buffer = encrypted.subarray(16);
  const decipher: crypto.Decipher = crypto.createDecipheriv(algorithm, hashedKey, iv);
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
  return '/' + getPathParts(path === '/' ? path + name : path + '/' + name).join('/');
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

/**
 * A file in the node file system
 * @ignore
 */
export class FilePolyfill extends Blob {
  /**
   * The name of the file
   */
  name: string = '';

  /**
   * The last modified time
   */
  lastModified: number = Date.now();

  /**
   * The webkit relative path
   */
  webkitRelativePath: string = '';

  /**
   * The constructor.
   * @param data The data
   * @param name The name
   * @param options The options
   */
  constructor(data: ArrayBuffer[], name: string, options?: BlobOptions) {
    super(data, options);
    this.name = name;
  }
}
