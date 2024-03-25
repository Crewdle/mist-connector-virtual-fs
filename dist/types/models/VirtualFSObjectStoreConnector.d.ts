import { IObjectStoreConnector, ObjectDescriptor, ObjectKind } from '@crewdle/web-sdk-types';
/**
 * The virtual file system object store connector.
 * @category Connector
 */
export declare class VirtualFSObjectStoreConnector implements IObjectStoreConnector {
    private readonly storeKey;
    /**
     * The root path.
     * @ignore
     */
    private rootPath;
    /**
     * The constructor.
     * @param storeKey The store key.
     */
    constructor(storeKey: string);
    /**
     * Get a file.
     * @param path The path.
     * @returns A promise that resolves with the file.
     */
    get(path: string): Promise<File>;
    /**
     * List the objects.
     * @param path The path.
     * @param recursive True to list recursively.
     * @returns A promise that resolves with the object descriptors.
     */
    list(path: string, recursive: boolean): Promise<ObjectDescriptor[]>;
    /**
     * Create a folder.
     * @param path The path.
     * @returns A promise that resolves when the folder is created.
     */
    createFolder(path: string): Promise<void>;
    /**
     * Write a file.
     * @param file The file.
     * @param path The path.
     * @returns A promise that resolves when the file is written.
     */
    writeFile(file: File, path?: string | undefined): Promise<void>;
    /**
     * Move an object.
     * @param path The path.
     * @param newPath The new path.
     * @returns A promise that resolves with the kind of the object moved.
     */
    moveObject(path: string, newPath: string): Promise<ObjectKind>;
    /**
     * Delete an object.
     * @param path The path.
     * @returns A promise that resolves with the kind of the object deleted.
     */
    deleteObject(path: string): Promise<ObjectKind>;
    /**
     * Calculate the size of an object.
     * @param path The path.
     * @returns A promise that resolves with the size of the object.
     */
    calculateSize(path: string): Promise<number>;
}
