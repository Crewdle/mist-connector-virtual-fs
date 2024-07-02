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
exports.VirtualFSReadableStream = void 0;
/**
 * Represents a readable stream for a virtual file system.
 */
class VirtualFSReadableStream {
    /**
     * Creates a new instance of VirtualFSReadableStream.
     * @param stream The underlying fs.ReadStream object.
     */
    constructor(stream) {
        this.stream = stream;
        this.stream = stream;
    }
    /**
     * Reads data from the stream.
     * @returns A promise that resolves to a Uint8Array or null if the end of the stream has been reached.
     */
    read() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                const data = this.stream.read();
                if (data !== null) {
                    resolve(new Uint8Array(data));
                }
                else {
                    this.stream.once('readable', () => {
                        const newData = this.stream.read();
                        if (newData !== null) {
                            resolve(new Uint8Array(newData));
                        }
                        else {
                            resolve(null);
                        }
                    });
                    this.stream.once('error', (error) => {
                        reject(error);
                    });
                    this.stream.once('end', () => {
                        resolve(null);
                    });
                }
            });
        });
    }
    /**
     * Closes the stream.
     * @returns A promise that resolves when the stream is closed.
     */
    close() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                this.stream.destroy();
                this.stream.on('close', () => {
                    resolve();
                });
                this.stream.on('error', (error) => {
                    reject(error);
                });
            });
        });
    }
}
exports.VirtualFSReadableStream = VirtualFSReadableStream;
