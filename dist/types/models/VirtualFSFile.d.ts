import { IFile, IFileOptions, IReadableStream } from '@crewdle/web-sdk-types';
/**
 * Represents a file in the virtual file system.
 */
export declare class VirtualFSFile implements IFile {
    name: string;
    path: string;
    type: string;
    private storeKey;
    private rootPath;
    private options;
    lastModified: number;
    private _size;
    private _buffer?;
    /**
     * Creates a new instance of the VirtualFSFile class.
     * @param name - The name of the file.
     * @param path - The path of the file.
     * @param size - The size of the file in bytes.
     * @param type - The type of the file.
     * @param storeKey - The store key to decrypt the file.
     * @param options - Represents the options for reading or writing a file.
     */
    constructor(name: string, path: string, size: number, type: string, storeKey: string, rootPath: string, options: IFileOptions);
    /**
     * Gets the full path of the file.
     */
    get pathName(): string;
    /**
     * Gets the size of the file in bytes.
     */
    get size(): number;
    /**
     * Returns a promise that resolves with the file content as an ArrayBuffer.
     * @returns A promise that resolves with the file content as an ArrayBuffer.
     */
    arrayBuffer(): Promise<ArrayBuffer>;
    /**
     * Returns a promise that resolves with the file content as a string.
     * @returns A promise that resolves with the file content as a string.
     */
    text(): Promise<string>;
    /**
     * Returns a readable stream for the file content.
     * @returns A readable stream for the file content.
     */
    stream(): IReadableStream;
    /**
     * Returns a new Blob object that contains a portion of the file content.
     * @param start - The start position of the slice (optional).
     * @param end - The end position of the slice (optional).
     * @param contentType - The content type of the Blob (optional).
     * @returns A new Blob object that contains a portion of the file content.
     */
    slice(start?: number, end?: number, contentType?: string): Blob;
    private getBuffer;
}
