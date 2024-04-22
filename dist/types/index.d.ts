import { ObjectStoreConnectorConstructor } from '@crewdle/web-sdk-types';
import { IVirtualFSObjectStoreOptions } from './models/VirtualFSObjectStoreOptions';
import { VirtualFSObjectStoreConnector } from './models/VirtualFSObjectStoreConnector';
/**
 * Get the virtual file system object store connector.
 * @param options The options.
 * @returns The object store connector constructor.
 */
export declare function getVirtualFSObjectStoreConnector(options?: IVirtualFSObjectStoreOptions): ObjectStoreConnectorConstructor;
export { IVirtualFSObjectStoreOptions };
export { VirtualFSObjectStoreConnector };
