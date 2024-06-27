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
exports.VirtualFSObjectStoreConnector = void 0;
const fs = __importStar(require("fs"));
const file_type_1 = require("file-type");
const web_sdk_types_1 = require("@crewdle/web-sdk-types");
const helpers_1 = require("../helpers");
const VirtualFSWritableStream_1 = require("./VirtualFSWritableStream");
global.File = helpers_1.FilePolyfill;
/**
 * The virtual file system object store connector.
 */
class VirtualFSObjectStoreConnector {
    /**
     * The constructor.
     * @param storeKey The store key.
     */
    constructor(storeKey, options) {
        var _a;
        this.storeKey = storeKey;
        this.options = options;
        const baseFolder = (_a = options === null || options === void 0 ? void 0 : options.baseFolder) !== null && _a !== void 0 ? _a : '.';
        this.rootPath = `${baseFolder}/data.enc/${this.storeKey}`;
        if (!fs.existsSync(this.rootPath)) {
            fs.mkdirSync(this.rootPath, { recursive: true });
        }
    }
    /**
     * Get a file.
     * @param path The path.
     * @returns A promise that resolves with the file.
     */
    get(path) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const internalPath = (0, helpers_1.getPathName)(this.rootPath, path);
            const encrypted = fs.readFileSync(internalPath);
            const decrypted = (0, helpers_1.decrypt)(encrypted, this.storeKey);
            const type = yield (0, file_type_1.fileTypeFromBuffer)(decrypted);
            const file = new File([decrypted], path, { type: (_a = type === null || type === void 0 ? void 0 : type.mime) !== null && _a !== void 0 ? _a : 'application/octet-stream' });
            return file;
        });
    }
    /**
     * List the objects.
     * @param path The path.
     * @param recursive True to list recursively.
     * @returns A promise that resolves with the object descriptors.
     */
    list(path, recursive) {
        return __awaiter(this, void 0, void 0, function* () {
            const internalPath = (0, helpers_1.getPathName)(this.rootPath, path);
            const objects = fs.readdirSync(internalPath);
            const descriptors = [];
            for (const object of objects) {
                const stats = fs.statSync(`${internalPath}/${object}`);
                const pathName = (0, helpers_1.getPathName)(path, object);
                if (stats.isDirectory()) {
                    descriptors.push({
                        kind: web_sdk_types_1.ObjectKind.Folder,
                        name: object,
                        path: path,
                        pathName: pathName,
                        absolutePathName: `${internalPath}/${object}`,
                        entries: recursive ? yield this.list(pathName, recursive) : [],
                    });
                }
                else {
                    descriptors.push({
                        kind: web_sdk_types_1.ObjectKind.File,
                        name: object,
                        path: path,
                        pathName: pathName,
                        absolutePathName: `${internalPath}/${object}`,
                        type: 'application/octet-stream',
                        size: stats.size,
                        status: web_sdk_types_1.FileStatus.Synced,
                    });
                }
            }
            return descriptors;
        });
    }
    /**
     * Create a folder.
     * @param path The path.
     * @returns A promise that resolves when the folder is created.
     */
    createFolder(path) {
        return __awaiter(this, void 0, void 0, function* () {
            const internalPath = (0, helpers_1.getPathName)(this.rootPath, path);
            fs.mkdirSync(internalPath, { recursive: true });
            const [folderPath, name] = (0, helpers_1.splitPathName)(path);
            return {
                kind: web_sdk_types_1.ObjectKind.Folder,
                name: name,
                path: folderPath,
                pathName: path,
                absolutePathName: internalPath,
            };
        });
    }
    /**
     * Write a file.
     * @param file The file.
     * @param path The path.
     * @returns A promise that resolves when the file is written.
     */
    writeFile(file, path, skipEncryption) {
        return __awaiter(this, void 0, void 0, function* () {
            const internalPath = (0, helpers_1.getPathName)(this.rootPath, path === '/' ? '' : path !== null && path !== void 0 ? path : '');
            let fileBuffer = Buffer.from(yield file.arrayBuffer());
            if (!skipEncryption) {
                fileBuffer = (0, helpers_1.encrypt)(fileBuffer, this.storeKey);
            }
            if (!fs.existsSync(internalPath)) {
                fs.mkdirSync(internalPath, { recursive: true });
            }
            fs.writeFileSync((0, helpers_1.getPathName)(internalPath, file.name), fileBuffer);
            return {
                kind: web_sdk_types_1.ObjectKind.File,
                name: file.name,
                path: path || '/',
                pathName: (0, helpers_1.getPathName)(path || '/', file.name),
                absolutePathName: internalPath,
                type: file.type,
                size: file.size,
                status: web_sdk_types_1.FileStatus.Synced,
            };
        });
    }
    /**
     * Creates a writable stream for a file.
     * @param path The path to the file.
     * @returns A promise that resolves with an {@link IWritableStream | IWritableStream }.
     */
    createWritableStream(path) {
        return __awaiter(this, void 0, void 0, function* () {
            const writable = fs.createWriteStream(path, { flags: 'a' });
            return new VirtualFSWritableStream_1.VirtualFSWritableStream(writable);
        });
    }
    /**
     * Move an object.
     * @param path The path.
     * @param newPath The new path.
     * @returns A promise that resolves with the kind of the object moved.
     */
    moveObject(path, newPath) {
        return __awaiter(this, void 0, void 0, function* () {
            const internalPath = (0, helpers_1.getPathName)(this.rootPath, path);
            const internalNewPath = (0, helpers_1.getPathName)(this.rootPath, newPath);
            const [newPathParent] = (0, helpers_1.splitPathName)(internalNewPath);
            if (!fs.existsSync(newPathParent)) {
                fs.mkdirSync(newPathParent, { recursive: true });
            }
            fs.renameSync(internalPath, internalNewPath);
            const stats = fs.statSync(internalNewPath);
            return stats.isDirectory() ? web_sdk_types_1.ObjectKind.Folder : web_sdk_types_1.ObjectKind.File;
        });
    }
    /**
     * Delete an object.
     * @param path The path.
     * @returns A promise that resolves with the kind of the object deleted.
     */
    deleteObject(path) {
        return __awaiter(this, void 0, void 0, function* () {
            const internalPath = (0, helpers_1.getPathName)(this.rootPath, path);
            const stats = fs.statSync(internalPath);
            if (stats.isDirectory()) {
                fs.rmdirSync(internalPath, { recursive: true });
                return web_sdk_types_1.ObjectKind.Folder;
            }
            else {
                fs.unlinkSync(internalPath);
                return web_sdk_types_1.ObjectKind.File;
            }
        });
    }
    /**
     * Calculate the size of an object and its children at the given path.
     * @param path The path.
     * @returns A promise that resolves with the size of the object.
     */
    calculateSize(path) {
        return __awaiter(this, void 0, void 0, function* () {
            const internalPath = (0, helpers_1.getPathName)(this.rootPath, path);
            const stats = fs.statSync(internalPath);
            if (stats.isDirectory()) {
                let totalSize = 0;
                const objects = fs.readdirSync(internalPath);
                for (const object of objects) {
                    const objectPath = `${internalPath}/${object}`;
                    const objectStats = fs.statSync(objectPath);
                    if (objectStats.isDirectory()) {
                        totalSize += yield this.calculateSize(`${path}/${object}`);
                    }
                    else {
                        totalSize += objectStats.size;
                    }
                }
                return totalSize;
            }
            else {
                return stats.size;
            }
        });
    }
}
exports.VirtualFSObjectStoreConnector = VirtualFSObjectStoreConnector;
