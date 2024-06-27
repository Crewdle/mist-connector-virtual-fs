/// <reference types="node" />
import * as fs from 'fs';
import { IWritableStream } from "@crewdle/web-sdk-types";
/**
 * Represents a writable stream for a file.
 */
export declare class VirtualFSWritableStream implements IWritableStream {
    private stream;
    /**
     * Creates a writable stream for a file.
     * @param stream The write stream to be used.
     */
    constructor(stream: fs.WriteStream);
    /**
     * Writes a chunk of data to the stream.
     * @param chunk The chunk of data to write.
     * @returns A promise that resolves when the write operation is complete.
     */
    write(chunk: ArrayBuffer): Promise<void>;
    /**
     * Closes the stream.
     * @returns A promise that resolves when the stream is closed.
     */
    close(): Promise<void>;
}
