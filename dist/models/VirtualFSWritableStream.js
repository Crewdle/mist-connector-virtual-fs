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
/**
 * Represents a writable stream for a file.
 */
class VirtualFSWritableStream {
    /**
     * Creates a writable stream for a file.
     * @param stream The write stream to be used.
     */
    constructor(stream) {
        this.stream = stream;
    }
    write(chunk) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                const buffer = Buffer.from(chunk);
                this.stream.write(buffer, (err) => {
                    if (err) {
                        reject(err);
                    }
                    else {
                        resolve();
                    }
                });
            });
        });
    }
    close() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve) => {
                this.stream.end(() => {
                    resolve();
                });
            });
        });
    }
}
exports.VirtualFSWritableStream = VirtualFSWritableStream;
