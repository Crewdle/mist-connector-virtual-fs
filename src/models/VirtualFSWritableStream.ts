import * as fs from 'fs';
import { IFileOptions, IWritableStream } from "@crewdle/web-sdk-types";
import { encrypt } from '../helpers';

/**
 * Represents a writable stream for a file.
 */
export class VirtualFSWritableStream implements IWritableStream {
  /**
   * The chunks of data to write when encryption is enabled.
   */
  private chunks: ArrayBuffer[] = [];

  /**
   * Creates a writable stream for a file.
   * @param stream The write stream to be used.
   * @param options The options for the file.
   * @param storeKey The store key to encrypt the file.
   */
  constructor(private stream: fs.WriteStream, private options: IFileOptions, private storeKey: string) {}

  /**
   * Writes a chunk of data to the stream.
   * @param chunk The chunk of data to write.
   * @returns A promise that resolves when the write operation is complete.
   */
  async write(chunk: ArrayBuffer): Promise<void> {
    if (!this.options.skipEncryption) {
      this.chunks.push(chunk);
      return;
    }

    return new Promise((resolve, reject) => {
      let buffer = Buffer.from(chunk);

      this.stream.write(buffer, (error) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
  }

  /**
   * Closes the stream.
   * @returns A promise that resolves when the stream is closed.
   */
  async close(): Promise<void> {
    if (this.stream.writableEnded) {
      return;
    }

    if (!this.options.skipEncryption) {
      const buffer = Buffer.concat(this.chunks.map((chunk) => Buffer.from(chunk)));
      const encryptedBuffer = encrypt(buffer, this.storeKey);
      this.stream.write(encryptedBuffer);
    }

    await this.waitForDrain();

    return new Promise((resolve, reject) => {
      this.stream.on('error', (error) => {
        reject(error);
      });

      this.stream.end(() => {
        resolve();
        this.stream.destroy();
      });
    });
  }

  private async waitForDrain(): Promise<void> {
    return new Promise((resolve) => {
      if (this.stream.writableNeedDrain) {
        this.stream.once('drain', () => {
          resolve();
        });
      } else {
        resolve();
      }
    });
  }
}
