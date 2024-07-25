import * as fs from 'fs';
import https from 'follow-redirects/https';
import mime from 'mime';

import { FileStatus, IFile, IFileDescriptor, IFileOptions, IFolderDescriptor, IObjectStoreConnector, IWritableStream, ObjectDescriptor, ObjectKind } from '@crewdle/web-sdk-types';

import { FilePolyfill, encrypt, getPathName, splitPathName } from '../helpers';
import { IVirtualFSObjectStoreOptions } from './VirtualFSObjectStoreOptions';
import { VirtualFSWritableStream } from './VirtualFSWritableStream';
import { VirtualFSFile } from './VirtualFSFile';

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
   * @param options The file options.
   * @returns A promise that resolves with the file.
   */
  async get(path: string, options: IFileOptions): Promise<IFile> {
    const internalPath = getPathName(this.rootPath, path);
    const [folderPath, name] = splitPathName(path);
    const stats = fs.statSync(internalPath);
    const size = stats.size;
    const type = mime.getType(internalPath) || 'application/octet-stream';

    return new VirtualFSFile(name, folderPath, size, type, this.storeKey, this.rootPath, options);
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
   * @param options The file options.
   * @returns A promise that resolves when the file is written.
   */
  async writeFile(file: File, path?: string, { skipEncryption, fetchUrl }: IFileOptions = {}): Promise<IFileDescriptor> {
    const internalPath = getPathName(this.rootPath, path === '/' ? '' : path ?? '');
    let size = 0;
    let type = 'application/octet-stream';

    if (fetchUrl) {
      await new Promise<void>((resolve, reject) => {
        const fileStream = fs.createWriteStream(getPathName(internalPath, file.name));
        https.get(fetchUrl, (response) => {
          response.pipe(fileStream);
    
          fileStream.on('finish', () => {
            size = fileStream.bytesWritten;
            fileStream.close(() => {
              resolve();
            });
          });
        }).on('error', (err) => {
          fs.unlink(getPathName(internalPath, file.name), () => {});
          console.error(`Error downloading the file: ${err.message}`);
          reject(err);
        });
      });
    } else {
      let fileBuffer: Buffer = Buffer.from(await file.arrayBuffer());
      if (!skipEncryption) {
        fileBuffer = encrypt(fileBuffer, this.storeKey);
      }
      if (!fs.existsSync(internalPath)) {
        fs.mkdirSync(internalPath, { recursive: true });
      }
      fs.writeFileSync(getPathName(internalPath, file.name), fileBuffer);
      size = file.size;
      type = file.type;
    }

    return {
      kind: ObjectKind.File,
      name: file.name,
      path: path || '/',
      pathName: getPathName(path || '/', file.name),
      absolutePathName: getPathName(internalPath, file.name),
      type,
      size,
      status: FileStatus.Synced,
    };
  }

  /**
   * Creates a writable stream for a file.
   * @param path The path to the file.
   * @param options The file options.
   * @returns A promise that resolves with an {@link IWritableStream | IWritableStream }.
   */
  async createWritableStream(pathName: string, options: IFileOptions = {}): Promise<IWritableStream> {
    const [path, name] = splitPathName(pathName);
    const internalPath = getPathName(this.rootPath, path === '/' ? '' : path ?? '');
    if (!fs.existsSync(internalPath)) {
      fs.mkdirSync(internalPath, { recursive: true });
    }

    const internalPathName = getPathName(internalPath, name);
    const writable = fs.createWriteStream(internalPathName, { flags: 'a' });

    return new VirtualFSWritableStream(writable, options, this.storeKey);
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
