import * as fs from 'fs';

import { IReadableStream } from '@crewdle/web-sdk-types';

/**
 * Represents a readable stream for a virtual file system.
 */
export class VirtualFSReadableStream implements IReadableStream {

  /**
   * Creates a new instance of VirtualFSReadableStream.
   * @param stream The underlying fs.ReadStream object.
   */
  constructor(private stream: fs.ReadStream) {
    this.stream = stream;
  }

  /**
   * Reads data from the stream.
   * @returns A promise that resolves to a Uint8Array or null if the end of the stream has been reached.
   */
  async read(): Promise<Uint8Array | null> {
    return new Promise((resolve, reject) => {
      const data = this.stream.read();
      if (data !== null) {
        resolve(new Uint8Array(data));
      } else {
        this.stream.once('readable', () => {
          const newData = this.stream.read();
          if (newData !== null) {
            resolve(new Uint8Array(newData));
          } else {
            resolve(null);
          }
        });
        this.stream.once('error', (error) => {
          reject(error);
        });
        this.stream.once('end', () => {
          resolve(null);
        });
      }
    });
  }

  /**
   * Closes the stream.
   * @returns A promise that resolves when the stream is closed.
   */
  async close(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.stream.destroy();
      this.stream.on('close', () => {
        resolve();
      });
      this.stream.on('error', (error) => {
        reject(error);
      });
    });
  }
}
