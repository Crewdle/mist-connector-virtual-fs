import * as fs from 'fs';

import { IFile, IFileOptions, IReadableStream } from '@crewdle/web-sdk-types';
import { VirtualFSReadableStream } from './VirtualFSReadableStream';
import { decrypt } from '../helpers';

/**
 * Represents a file in the virtual file system.
 */
export class VirtualFSFile implements IFile {
  lastModified: number;
  private _size: number;
  private _buffer?: Buffer;

  /**
   * Creates a new instance of the VirtualFSFile class.
   * @param name - The name of the file.
   * @param path - The path of the file.
   * @param size - The size of the file in bytes.
   * @param type - The type of the file.
   * @param storeKey - The store key to decrypt the file.
   * @param options - Represents the options for reading or writing a file.
   */
  constructor(public name: string, public path: string, size: number, public type: string, private storeKey: string, private rootPath: string, private options: IFileOptions) {
    this._size = size;
    this.lastModified = fs.statSync(this.pathName).mtimeMs;
  }

  /**
   * Gets the full path of the file.
   */
  get pathName(): string {
    return `${this.rootPath}/${this.path}/${this.name}`;
  }

  /**
   * Gets the size of the file in bytes.
   */
  get size(): number {
    if (!this.options?.skipEncryption) {
      return this.getBuffer().length;
    }

    return this._size;
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
    return buffer.toString('utf8');
  }

  /**
   * Returns a readable stream for the file content.
   * @returns A readable stream for the file content.
   */
  stream(): IReadableStream {
    if (!this.options?.skipEncryption) {
      // TODO Add support for streaming encrypted files
      throw new Error('Cannot stream encrypted files');
    }

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
    if (!this.options?.skipEncryption) {
      return new Blob([this.getBuffer().subarray(start, end)], { type: contentType });
    }

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
    if (this._buffer) {
      return this._buffer;
    }

    this._buffer = fs.readFileSync(this.pathName);
    if (!this.options?.skipEncryption) {
      this._buffer = decrypt(this._buffer, this.storeKey);
    }
    return this._buffer;
  }
}
