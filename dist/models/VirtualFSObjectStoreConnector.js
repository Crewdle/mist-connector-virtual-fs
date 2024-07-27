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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VirtualFSObjectStoreConnector = void 0;
const fs = __importStar(require("fs"));
const https_1 = __importDefault(require("follow-redirects/https"));
const mime_1 = __importDefault(require("mime"));
const web_sdk_types_1 = require("@crewdle/web-sdk-types");
const helpers_1 = require("../helpers");
const VirtualFSWritableStream_1 = require("./VirtualFSWritableStream");
const VirtualFSFile_1 = require("./VirtualFSFile");
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
     * @param options The file options.
     * @returns A promise that resolves with the file.
     */
    get(path, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const internalPath = (0, helpers_1.getPathName)(this.rootPath, path);
            const [folderPath, name] = (0, helpers_1.splitPathName)(path);
            const stats = fs.statSync(internalPath);
            const size = stats.size;
            const type = mime_1.default.getType(internalPath) || 'application/octet-stream';
            return new VirtualFSFile_1.VirtualFSFile(name, folderPath, size, type, this.storeKey, this.rootPath, options);
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
     * @param options The file options.
     * @returns A promise that resolves when the file is written.
     */
    writeFile(file_1, path_1) {
        return __awaiter(this, arguments, void 0, function* (file, path, { skipEncryption, fetchUrl } = {}) {
            const internalPath = (0, helpers_1.getPathName)(this.rootPath, path === '/' ? '' : path !== null && path !== void 0 ? path : '');
            let size = 0;
            let type = 'application/octet-stream';
            if (fetchUrl) {
                yield new Promise((resolve, reject) => {
                    const fileStream = fs.createWriteStream((0, helpers_1.getPathName)(internalPath, file.name));
                    https_1.default.get(fetchUrl, (response) => {
                        response.pipe(fileStream);
                        fileStream.on('finish', () => {
                            size = fileStream.bytesWritten;
                            fileStream.close(() => {
                                resolve();
                            });
                        });
                    }).on('error', (err) => {
                        fs.unlink((0, helpers_1.getPathName)(internalPath, file.name), () => { });
                        console.error(`Error downloading the file: ${err.message}`);
                        reject(err);
                    });
                });
            }
            else {
                let fileBuffer = Buffer.from(yield file.arrayBuffer());
                if (!skipEncryption) {
                    fileBuffer = (0, helpers_1.encrypt)(fileBuffer, this.storeKey);
                }
                if (!fs.existsSync(internalPath)) {
                    fs.mkdirSync(internalPath, { recursive: true });
                }
                fs.writeFileSync((0, helpers_1.getPathName)(internalPath, file.name), fileBuffer);
                size = file.size;
                type = file.type;
            }
            return {
                kind: web_sdk_types_1.ObjectKind.File,
                name: file.name,
                path: path || '/',
                pathName: (0, helpers_1.getPathName)(path || '/', file.name),
                absolutePathName: (0, helpers_1.getPathName)(internalPath, file.name),
                type,
                size,
                status: web_sdk_types_1.FileStatus.Synced,
            };
        });
    }
    /**
     * Creates a writable stream for a file.
     * @param path The path to the file.
     * @param options The file options.
     * @returns A promise that resolves with an {@link IWritableStream | IWritableStream }.
     */
    createWritableStream(pathName_1) {
        return __awaiter(this, arguments, void 0, function* (pathName, options = {}) {
            const [path, name] = (0, helpers_1.splitPathName)(pathName);
            const internalPath = (0, helpers_1.getPathName)(this.rootPath, path === '/' ? '' : path !== null && path !== void 0 ? path : '');
            if (!fs.existsSync(internalPath)) {
                fs.mkdirSync(internalPath, { recursive: true });
            }
            const internalPathName = (0, helpers_1.getPathName)(internalPath, name);
            const writable = fs.createWriteStream(internalPathName, { flags: 'a' });
            return new VirtualFSWritableStream_1.VirtualFSWritableStream(writable, options, this.storeKey);
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
