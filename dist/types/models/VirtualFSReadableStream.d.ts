import * as fs from 'fs';
import { IReadableStream } from '@crewdle/web-sdk-types';
/**
 * Represents a readable stream for a virtual file system.
 */
export declare class VirtualFSReadableStream implements IReadableStream {
    private stream;
    /**
     * Creates a new instance of VirtualFSReadableStream.
     * @param stream The underlying fs.ReadStream object.
     */
    constructor(stream: fs.ReadStream);
    /**
     * Reads data from the stream.
     * @returns A promise that resolves to a Uint8Array or null if the end of the stream has been reached.
     */
    read(): Promise<Uint8Array | null>;
    /**
     * Closes the stream.
     * @returns A promise that resolves when the stream is closed.
     */
    close(): Promise<void>;
}
