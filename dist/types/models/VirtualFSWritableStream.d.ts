/// <reference types="node" />
import * as fs from 'fs';
import { IWritableStream } from "@crewdle/web-sdk-types";
/**
 * Represents a writable stream for a file.
 */
export declare class VirtualFSWritableStream implements IWritableStream {
    /**
     * The stream.
     * @ignore
     */
    private stream;
    /**
     * Creates a writable stream for a file.
     * @param stream The write stream to be used.
     */
    constructor(stream: fs.WriteStream);
    write(chunk: ArrayBuffer): Promise<void>;
    close(): Promise<void>;
}
