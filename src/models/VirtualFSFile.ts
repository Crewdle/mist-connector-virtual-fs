import * as fs from 'fs';

import { IFile, IFileOptions, IReadableStream } from '@crewdle/web-sdk-types';
import { VirtualFSReadableStream } from './VirtualFSReadableStream';
import { decrypt } from '../helpers';

/**
 * Represents a file in the virtual file system.
 */
export class VirtualFSFile implements IFile {
  lastModified: number;

  /**
   * Creates a new instance of the VirtualFSFile class.
   * @param name - The name of the file.
   * @param path - The path of the file.
   * @param size - The size of the file in bytes.
   * @param type - The type of the file.
   * @param storeKey - The store key to decrypt the file.
   * @param writeOptions - Represents the options for writing a file.
   */
  constructor(public name: string, public path: string, public size: number, public type: string, private storeKey: string, private rootPath: string, private writeOptions: IFileOptions) {
    this.lastModified = fs.statSync(this.pathName).mtimeMs;
  }

  /**
   * Gets the full path of the file.
   */
  get pathName(): string {
    return `${this.rootPath}/${this.path}/${this.name}`;
  }

  /**
   * Returns a promise that resolves with the file content as an ArrayBuffer.
   * @returns A promise that resolves with the file content as an ArrayBuffer.
   */
  async arrayBuffer(): Promise<ArrayBuffer> {
    const buffer = this.getBuffer();
    return buffer.buffer;
  }

  /**
   * Returns a promise that resolves with the file content as a string.
   * @returns A promise that resolves with the file content as a string.
   */
  async text(): Promise<string> {
    const buffer = this.getBuffer();
    return buffer.toString('utf-8');
  }

  /**
   * Returns a readable stream for the file content.
   * @returns A readable stream for the file content.
   */
  stream(): IReadableStream {
    const readStream = fs.createReadStream(this.pathName);
    return new VirtualFSReadableStream(readStream);
  }

  /**
   * Returns a new Blob object that contains a portion of the file content.
   * @param start - The start position of the slice (optional).
   * @param end - The end position of the slice (optional).
   * @param contentType - The content type of the Blob (optional).
   * @returns A new Blob object that contains a portion of the file content.
   */
  slice(start?: number, end?: number, contentType?: string): Blob {
    const fd = fs.openSync(this.pathName, 'r');
    try {
      const buffer = Buffer.alloc((end || this.size) - (start || 0));
      fs.readSync(fd, buffer, 0, buffer.length, start || 0);
      return new Blob([buffer], { type: contentType });
    } finally {
      fs.closeSync(fd);
    }
  }

  private getBuffer(): Buffer {
    let buffer: Buffer = fs.readFileSync(this.pathName);
    if (!this.writeOptions?.skipEncryption) {
      buffer = decrypt(buffer, this.storeKey);
    }
    return buffer;
  }
}
