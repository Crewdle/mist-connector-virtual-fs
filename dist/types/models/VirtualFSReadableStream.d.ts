/// <reference types="node" />
import * as fs from 'fs';
import { IReadableStream } from '@crewdle/web-sdk-types';
export declare class VirtualFSReadableStream implements IReadableStream {
    private stream;
    constructor(stream: fs.ReadStream);
    read(): Promise<Uint8Array | null>;
    close(): Promise<void>;
}
