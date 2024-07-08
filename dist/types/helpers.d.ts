import { Blob, BlobOptions } from 'buffer';
/**
 * Encrypt a buffer with a key
 * @param buffer The buffer to encrypt
 * @param key The key to encrypt with
 * @returns The encrypted buffer
 * @ignore
 */
export declare function encrypt(buffer: Buffer, key: string): Buffer;
/**
 * Decrypt a buffer with a key
 * @param encrypted The encrypted buffer
 * @param key The key to decrypt with
 * @returns The decrypted buffer
 * @ignore
 */
export declare function decrypt(encrypted: Buffer, key: string): Buffer;
/**
 * Get the path name of an object from a path and a name
 * @param path The path to the object
 * @param name The name of the object
 * @returns The path name of the object
 * @ignore
 */
export declare function getPathName(path: string, name: string): string;
/**
 * Split a path name into its path and name
 * @param pathName The path name to split
 * @returns The path and name of the object
 * @ignore
 */
export declare function splitPathName(pathName: string): [string, string];
/**
 * A file in the node file system
 * @ignore
 */
export declare class FilePolyfill extends Blob {
    /**
     * The name of the file
     */
    name: string;
    /**
     * The last modified time
     */
    lastModified: number;
    /**
     * The webkit relative path
     */
    webkitRelativePath: string;
    /**
     * The constructor.
     * @param data The data
     * @param name The name
     * @param options The options
     */
    constructor(data: ArrayBuffer[], name: string, options?: BlobOptions);
}
