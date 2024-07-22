"use strict";
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
exports.VirtualFSWritableStream = void 0;
const helpers_1 = require("../helpers");
/**
 * Represents a writable stream for a file.
 */
class VirtualFSWritableStream {
    /**
     * Creates a writable stream for a file.
     * @param stream The write stream to be used.
     * @param options The options for the file.
     * @param storeKey The store key to encrypt the file.
     */
    constructor(stream, options, storeKey) {
        this.stream = stream;
        this.options = options;
        this.storeKey = storeKey;
        /**
         * The chunks of data to write when encryption is enabled.
         */
        this.chunks = [];
    }
    /**
     * Writes a chunk of data to the stream.
     * @param chunk The chunk of data to write.
     * @returns A promise that resolves when the write operation is complete.
     */
    write(chunk) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.options.skipEncryption) {
                this.chunks.push(chunk);
                return;
            }
            return new Promise((resolve, reject) => {
                let buffer = Buffer.from(chunk);
                this.stream.write(buffer, (error) => {
                    if (error) {
                        reject(error);
                    }
                    else {
                        resolve();
                    }
                });
            });
        });
    }
    /**
     * Closes the stream.
     * @returns A promise that resolves when the stream is closed.
     */
    close() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.stream.writableEnded) {
                return;
            }
            if (!this.options.skipEncryption) {
                const buffer = Buffer.concat(this.chunks.map((chunk) => Buffer.from(chunk)));
                const encryptedBuffer = (0, helpers_1.encrypt)(buffer, this.storeKey);
                this.stream.write(encryptedBuffer);
            }
            yield this.waitForDrain();
            return new Promise((resolve, reject) => {
                this.stream.on('error', (error) => {
                    reject(error);
                });
                this.stream.end(() => {
                    resolve();
                    this.stream.destroy();
                });
            });
        });
    }
    waitForDrain() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve) => {
                if (this.stream.writableNeedDrain) {
                    this.stream.once('drain', () => {
                        resolve();
                    });
                }
                else {
                    resolve();
                }
            });
        });
    }
}
exports.VirtualFSWritableStream = VirtualFSWritableStream;
