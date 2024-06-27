import * as fs from 'fs';
import { IWritableStream } from "@crewdle/web-sdk-types";

/**
 * Represents a writable stream for a file.
 */
export class VirtualFSWritableStream implements IWritableStream {
  /**
   * The stream.
   * @ignore
   */
  private stream: fs.WriteStream;

  /**
   * Creates a writable stream for a file.
   * @param stream The write stream to be used.
   */
  constructor(stream: fs.WriteStream) {
    this.stream = stream;
  }

  async write(chunk: ArrayBuffer): Promise<void> {
    return new Promise((resolve, reject) => {
      const buffer = Buffer.from(chunk);
      this.stream.write(buffer, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  async close(): Promise<void> {
    return new Promise((resolve) => {
      this.stream.end(() => {
        resolve();
      });
    });
  }
}
