import { ObjectStoreConnectorConstructor } from '@crewdle/web-sdk-types';
import { IVirtualFSObjectStoreOptions } from './models/VirtualFSObjectStoreOptions';
import { VirtualFSObjectStoreConnector } from './models/VirtualFSObjectStoreConnector';

/**
 * Get the virtual file system object store connector.
 * @param options The options.
 * @returns The object store connector constructor.
 */
export function getVirtualFSObjectStoreConnector(options?: IVirtualFSObjectStoreOptions): ObjectStoreConnectorConstructor {
  if (!options) {
    return VirtualFSObjectStoreConnector;
  }

  return class VirtualFSObjectStoreConnectorWithInjectedOptions extends VirtualFSObjectStoreConnector {
    constructor(storeKey: string) {
      super(storeKey, options);
    }
  }
}

export { IVirtualFSObjectStoreOptions };
export { VirtualFSObjectStoreConnector };
