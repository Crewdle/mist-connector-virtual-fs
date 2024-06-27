import * as fs from 'fs';
import { IWritableStream } from "@crewdle/web-sdk-types";

/**
 * Represents a writable stream for a file.
 */
export class VirtualFSWritableStream implements IWritableStream {

  /**
   * Creates a writable stream for a file.
   * @param stream The write stream to be used.
   */
  constructor(private stream: fs.WriteStream) {
  }

  /**
   * Writes a chunk of data to the stream.
   * @param chunk The chunk of data to write.
   * @returns A promise that resolves when the write operation is complete.
   */
  async write(chunk: ArrayBuffer): Promise<void> {
    return new Promise((resolve, reject) => {
      const buffer = Buffer.from(chunk);
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
}
