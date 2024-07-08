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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VirtualFSFile = void 0;
const fs = __importStar(require("fs"));
const VirtualFSReadableStream_1 = require("./VirtualFSReadableStream");
const helpers_1 = require("../helpers");
/**
 * Represents a file in the virtual file system.
 */
class VirtualFSFile {
    /**
     * Creates a new instance of the VirtualFSFile class.
     * @param name - The name of the file.
     * @param path - The path of the file.
     * @param size - The size of the file in bytes.
     * @param type - The type of the file.
     * @param storeKey - The store key to decrypt the file.
     * @param options - Represents the options for reading or writing a file.
     */
    constructor(name, path, size, type, storeKey, rootPath, options) {
        this.name = name;
        this.path = path;
        this.size = size;
        this.type = type;
        this.storeKey = storeKey;
        this.rootPath = rootPath;
        this.options = options;
        this.lastModified = fs.statSync(this.pathName).mtimeMs;
    }
    /**
     * Gets the full path of the file.
     */
    get pathName() {
        return `${this.rootPath}/${this.path}/${this.name}`;
    }
    /**
     * Returns a promise that resolves with the file content as an ArrayBuffer.
     * @returns A promise that resolves with the file content as an ArrayBuffer.
     */
    arrayBuffer() {
        return __awaiter(this, void 0, void 0, function* () {
            const buffer = this.getBuffer();
            return buffer.buffer;
        });
    }
    /**
     * Returns a promise that resolves with the file content as a string.
     * @returns A promise that resolves with the file content as a string.
     */
    text() {
        return __awaiter(this, void 0, void 0, function* () {
            const buffer = this.getBuffer();
            return buffer.toString('utf8');
        });
    }
    /**
     * Returns a readable stream for the file content.
     * @returns A readable stream for the file content.
     */
    stream() {
        const readStream = fs.createReadStream(this.pathName);
        return new VirtualFSReadableStream_1.VirtualFSReadableStream(readStream);
    }
    /**
     * Returns a new Blob object that contains a portion of the file content.
     * @param start - The start position of the slice (optional).
     * @param end - The end position of the slice (optional).
     * @param contentType - The content type of the Blob (optional).
     * @returns A new Blob object that contains a portion of the file content.
     */
    slice(start, end, contentType) {
        const fd = fs.openSync(this.pathName, 'r');
        try {
            const buffer = Buffer.alloc((end || this.size) - (start || 0));
            fs.readSync(fd, buffer, 0, buffer.length, start || 0);
            return new Blob([buffer], { type: contentType });
        }
        finally {
            fs.closeSync(fd);
        }
    }
    getBuffer() {
        var _a;
        let buffer = fs.readFileSync(this.pathName);
        if (!((_a = this.options) === null || _a === void 0 ? void 0 : _a.skipEncryption)) {
            buffer = (0, helpers_1.decrypt)(buffer, this.storeKey);
        }
        return buffer;
    }
}
exports.VirtualFSFile = VirtualFSFile;
