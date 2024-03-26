import * as fs from 'fs';
import { fileTypeFromBuffer } from 'file-type';

import { IObjectStoreConnector, ObjectDescriptor, ObjectKind } from '@crewdle/web-sdk-types';
import { FilePolyfill, decrypt, encrypt, getPathName, splitPathName } from '../helpers/helpers';

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
  ) {
    this.rootPath = `./data.enc/${this.storeKey}`;

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
          entries: recursive ? await this.list(pathName, recursive) : [],
        });
      } else {
        descriptors.push({
          kind: ObjectKind.File,
          name: object,
          path: path,
          pathName: pathName,
          type: 'application/octet-stream',
          size: stats.size,
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
  async createFolder(path: string): Promise<void> {
    const internalPath = getPathName(this.rootPath, path);
    fs.mkdirSync(internalPath, { recursive: true });
  }

  /**
   * Write a file.
   * @param file The file.
   * @param path The path.
   * @returns A promise that resolves when the file is written.
   */
  async writeFile(file: File, path?: string | undefined): Promise<void> {
    const internalPath = getPathName(this.rootPath, path || '');
    const fileBuffer: Buffer = Buffer.from(await file.arrayBuffer());
    const encrypted = encrypt(fileBuffer, this.storeKey);
    if (!fs.existsSync(internalPath)) {
      fs.mkdirSync(internalPath, { recursive: true });
    }
    fs.writeFileSync(internalPath, encrypted);
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
   * Calculate the size of an object.
   * @param path The path.
   * @returns A promise that resolves with the size of the object.
   */
  async calculateSize(path: string): Promise<number> {
    const internalPath = getPathName(this.rootPath, path);
    const stats = fs.statSync(internalPath);
    return stats.size;
  }
}
