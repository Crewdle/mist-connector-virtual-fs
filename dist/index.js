"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VirtualFSObjectStoreConnector = void 0;
exports.getVirtualFSObjectStoreConnector = getVirtualFSObjectStoreConnector;
const VirtualFSObjectStoreConnector_1 = require("./models/VirtualFSObjectStoreConnector");
Object.defineProperty(exports, "VirtualFSObjectStoreConnector", { enumerable: true, get: function () { return VirtualFSObjectStoreConnector_1.VirtualFSObjectStoreConnector; } });
/**
 * Get the virtual file system object store connector.
 * @param options The options.
 * @returns The object store connector constructor.
 */
function getVirtualFSObjectStoreConnector(options) {
    if (!options) {
        return VirtualFSObjectStoreConnector_1.VirtualFSObjectStoreConnector;
    }
    return class VirtualFSObjectStoreConnectorWithInjectedOptions extends VirtualFSObjectStoreConnector_1.VirtualFSObjectStoreConnector {
        constructor(storeKey) {
            super(storeKey, options);
        }
    };
}
