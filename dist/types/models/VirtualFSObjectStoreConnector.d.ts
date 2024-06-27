import { IFileDescriptor, IFolderDescriptor, IObjectStoreConnector, IWritableStream, ObjectDescriptor, ObjectKind } from '@crewdle/web-sdk-types';
import { IVirtualFSObjectStoreOptions } from './VirtualFSObjectStoreOptions';
/**
 * The virtual file system object store connector.
 */
export declare class VirtualFSObjectStoreConnector implements IObjectStoreConnector {
    private readonly storeKey;
    readonly options?: IVirtualFSObjectStoreOptions | undefined;
    /**
     * The root path.
     * @ignore
     */
    private rootPath;
    /**
     * The constructor.
     * @param storeKey The store key.
     */
    constructor(storeKey: string, options?: IVirtualFSObjectStoreOptions | undefined);
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
    createFolder(path: string): Promise<IFolderDescriptor>;
    /**
     * Write a file.
     * @param file The file.
     * @param path The path.
     * @returns A promise that resolves when the file is written.
     */
    writeFile(file: File, path?: string | undefined, skipEncryption?: boolean): Promise<IFileDescriptor>;
    /**
     * Creates a writable stream for a file.
     * @param path The path to the file.
     * @returns A promise that resolves with an {@link IWritableStream | IWritableStream }.
     */
    createWritableStream(pathName: string): Promise<IWritableStream>;
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
     * Calculate the size of an object and its children at the given path.
     * @param path The path.
     * @returns A promise that resolves with the size of the object.
     */
    calculateSize(path: string): Promise<number>;
}
