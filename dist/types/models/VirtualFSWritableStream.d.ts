import * as fs from 'fs';
import { IFileOptions, IWritableStream } from "@crewdle/web-sdk-types";
/**
 * Represents a writable stream for a file.
 */
export declare class VirtualFSWritableStream implements IWritableStream {
    private stream;
    private options;
    private storeKey;
    /**
     * Creates a writable stream for a file.
     * @param stream The write stream to be used.
     * @param options The options for the file.
     * @param storeKey The store key to encrypt the file.
     */
    constructor(stream: fs.WriteStream, options: IFileOptions, storeKey: string);
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
