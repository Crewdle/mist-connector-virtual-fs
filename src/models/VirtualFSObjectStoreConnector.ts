import * as fs from 'fs';
import { fileTypeFromBuffer } from 'file-type';

import { FileStatus, IFileDescriptor, IFolderDescriptor, IObjectStoreConnector, IWritableStream, ObjectDescriptor, ObjectKind } from '@crewdle/web-sdk-types';

import { FilePolyfill, decrypt, encrypt, getPathName, splitPathName } from '../helpers';
import { IVirtualFSObjectStoreOptions } from './VirtualFSObjectStoreOptions';
import { VirtualFSWritableStream } from './VirtualFSWritableStream';

global.File = FilePolyfill as any;

/**
 * The virtual file system object store connector.
 */
export class VirtualFSObjectStoreConnector implements IObjectStoreConnector {
  /**
   * The root path.
   * @ignore
   */
  private rootPath: string;

  /**
   * The constructor.
   * @param storeKey The store key.
   */
  constructor(
    private readonly storeKey: string,
    readonly options?: IVirtualFSObjectStoreOptions,
  ) {
    const baseFolder = options?.baseFolder ?? '.';
    this.rootPath = `${baseFolder}/data.enc/${this.storeKey}`;

    if (!fs.existsSync(this.rootPath)) {
      fs.mkdirSync(this.rootPath, { recursive: true });
    }
  }

  /**
   * Get a file.
   * @param path The path.
   * @returns A promise that resolves with the file.
   */
  async get(path: string): Promise<File> {
    const internalPath = getPathName(this.rootPath, path);

    const encrypted: Buffer = fs.readFileSync(internalPath);
    const decrypted: Buffer = decrypt(encrypted, this.storeKey);
    const type = await fileTypeFromBuffer(decrypted);

    const file = new File([decrypted], path, { type: type?.mime ?? 'application/octet-stream' });
    return file;
  }

  /**
   * List the objects.
   * @param path The path.
   * @param recursive True to list recursively.
   * @returns A promise that resolves with the object descriptors.
   */
  async list(path: string, recursive: boolean): Promise<ObjectDescriptor[]> {
    const internalPath = getPathName(this.rootPath, path);

    const objects = fs.readdirSync(internalPath);
    const descriptors: ObjectDescriptor[] = [];

    for (const object of objects) {
      const stats = fs.statSync(`${internalPath}/${object}`);
      const pathName = getPathName(path, object);
      if (stats.isDirectory()) {
        descriptors.push({
          kind: ObjectKind.Folder,
          name: object,
          path: path,
          pathName: pathName,
          absolutePathName: `${internalPath}/${object}`,
          entries: recursive ? await this.list(pathName, recursive) : [],
        });
      } else {
        descriptors.push({
          kind: ObjectKind.File,
          name: object,
          path: path,
          pathName: pathName,
          absolutePathName: `${internalPath}/${object}`,
          type: 'application/octet-stream',
          size: stats.size,
          status: FileStatus.Synced,
        });
      }
    }

    return descriptors;
  }

  /**
   * Create a folder.
   * @param path The path.
   * @returns A promise that resolves when the folder is created.
   */
  async createFolder(path: string): Promise<IFolderDescriptor> {
    const internalPath = getPathName(this.rootPath, path);
    fs.mkdirSync(internalPath, { recursive: true });

    const [folderPath, name] = splitPathName(path);

    return {
      kind: ObjectKind.Folder,
      name: name,
      path: folderPath,
      pathName: path,
      absolutePathName: internalPath,
    };
  }

  /**
   * Write a file.
   * @param file The file.
   * @param path The path.
   * @returns A promise that resolves when the file is written.
   */
  async writeFile(file: File, path?: string | undefined, skipEncryption?: boolean): Promise<IFileDescriptor> {
    const internalPath = getPathName(this.rootPath, path === '/' ? '' : path ?? '');
    let fileBuffer: Buffer = Buffer.from(await file.arrayBuffer());
    if (!skipEncryption) {
      fileBuffer = encrypt(fileBuffer, this.storeKey);
    }
    if (!fs.existsSync(internalPath)) {
      fs.mkdirSync(internalPath, { recursive: true });
    }
    fs.writeFileSync(getPathName(internalPath, file.name), fileBuffer);

    return {
      kind: ObjectKind.File,
      name: file.name,
      path: path || '/',
      pathName: getPathName(path || '/', file.name),
      absolutePathName: internalPath,
      type: file.type,
      size: file.size,
      status: FileStatus.Synced,
    };
  }

  /**
   * Creates a writable stream for a file.
   * @param path The path to the file.
   * @returns A promise that resolves with an {@link IWritableStream | IWritableStream }.
   */
  async createWritableStream(path: string): Promise<IWritableStream> {
    const writable = fs.createWriteStream(path, { flags: 'a' });
    return new VirtualFSWritableStream(writable);
  }

  /**
   * Move an object.
   * @param path The path.
   * @param newPath The new path.
   * @returns A promise that resolves with the kind of the object moved.
   */
  async moveObject(path: string, newPath: string): Promise<ObjectKind> {
    const internalPath = getPathName(this.rootPath, path);
    const internalNewPath = getPathName(this.rootPath, newPath);
    const [newPathParent] = splitPathName(internalNewPath);
    if (!fs.existsSync(newPathParent)) {
      fs.mkdirSync(newPathParent, { recursive: true });
    }
    fs.renameSync(internalPath, internalNewPath);
    const stats = fs.statSync(internalNewPath);
    return stats.isDirectory() ? ObjectKind.Folder : ObjectKind.File;
  }

  /**
   * Delete an object.
   * @param path The path.
   * @returns A promise that resolves with the kind of the object deleted.
   */
  async deleteObject(path: string): Promise<ObjectKind> {
    const internalPath = getPathName(this.rootPath, path);
    const stats = fs.statSync(internalPath);
    if (stats.isDirectory()) {
      fs.rmdirSync(internalPath, { recursive: true });
      return ObjectKind.Folder;
    } else {
      fs.unlinkSync(internalPath);
      return ObjectKind.File;
    }
  }

  /**
   * Calculate the size of an object and its children at the given path.
   * @param path The path.
   * @returns A promise that resolves with the size of the object.
   */
  async calculateSize(path: string): Promise<number> {
    const internalPath = getPathName(this.rootPath, path);
    const stats = fs.statSync(internalPath);
    if (stats.isDirectory()) {
      let totalSize = 0;
      const objects = fs.readdirSync(internalPath);
      for (const object of objects) {
        const objectPath = `${internalPath}/${object}`;
        const objectStats = fs.statSync(objectPath);
        if (objectStats.isDirectory()) {
          totalSize += await this.calculateSize(`${path}/${object}`);
        } else {
          totalSize += objectStats.size;
        }
      }
      return totalSize;
    } else {
      return stats.size;
    }
  }
}
