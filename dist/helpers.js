"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FilePolyfill = void 0;
exports.encrypt = encrypt;
exports.decrypt = decrypt;
exports.getPathName = getPathName;
exports.splitPathName = splitPathName;
const buffer_1 = require("buffer");
const crypto = __importStar(require("crypto"));
const algorithm = 'aes-256-ctr';
/**
 * Encrypt a buffer with a key
 * @param buffer The buffer to encrypt
 * @param key The key to encrypt with
 * @returns The encrypted buffer
 * @ignore
 */
function encrypt(buffer, key) {
    const hashedKey = crypto.createHash('sha256').update(key).digest();
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(algorithm, hashedKey, iv);
    const result = Buffer.concat([iv, cipher.update(buffer), cipher.final()]);
    return result;
}
/**
 * Decrypt a buffer with a key
 * @param encrypted The encrypted buffer
 * @param key The key to decrypt with
 * @returns The decrypted buffer
 * @ignore
 */
function decrypt(encrypted, key) {
    const hashedKey = crypto.createHash('sha256').update(key).digest();
    const iv = encrypted.subarray(0, 16);
    const data = encrypted.subarray(16);
    const decipher = crypto.createDecipheriv(algorithm, hashedKey, iv);
    return Buffer.concat([decipher.update(data), decipher.final()]);
}
/**
 * Get the path name of an object from a path and a name
 * @param path The path to the object
 * @param name The name of the object
 * @returns The path name of the object
 * @ignore
 */
function getPathName(path, name) {
    return '/' + getPathParts(path === '/' ? path + name : path + '/' + name).join('/');
}
/**
 * Split a path name into its path and name
 * @param pathName The path name to split
 * @returns The path and name of the object
 * @ignore
 */
function splitPathName(pathName) {
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
function getPathParts(path) {
    return path.split('/').filter((part) => part.length > 0);
}
/**
 * A file in the node file system
 * @ignore
 */
class FilePolyfill extends buffer_1.Blob {
    /**
     * The constructor.
     * @param data The data
     * @param name The name
     * @param options The options
     */
    constructor(data, name, options) {
        super(data, options);
        /**
         * The name of the file
         */
        this.name = '';
        /**
         * The last modified time
         */
        this.lastModified = Date.now();
        /**
         * The webkit relative path
         */
        this.webkitRelativePath = '';
        this.name = name;
    }
}
exports.FilePolyfill = FilePolyfill;
