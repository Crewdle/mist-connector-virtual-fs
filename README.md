# Crewdle Mist Virtual Filesystem Object Store Connector

## Introduction

The Crewdle Mist Virtual Filesystem Object Store Connector for Node is a streamlined solution designed for efficient and reliable disk-based object storage. This connector enables Node applications to easily store and manage objects on the disk, offering a perfect blend of durability and performance. With its straightforward integration and robust data handling capabilities, it's an ideal choice for developers seeking a practical and scalable disk storage solution within the Node ecosystem.

## Getting Started

Before diving in, ensure you have installed the [Crewdle Mist SDK](https://www.npmjs.com/package/@crewdle/web-sdk).

## Installation

```bash
npm install @crewdle/mist-connector-virtual-fs
```

## Usage

```TypeScript
import { VirtualFSObjectStoreConnector } from '@crewdle/mist-connector-virtual-fs';

// Create a new SDK instance
const sdk = await SDK.getInstance('[VENDOR ID]', '[ACCESS TOKEN]', {
  objectStoreConnector: VirtualFSObjectStoreConnector,
});
```

## Need Help?

Reach out to support@crewdle.com or raise an issue in our repository for any assistance.

## Join Our Community

For an engaging discussion about your specific use cases or to connect with fellow developers, we invite you to join our Discord community. Follow this link to become a part of our vibrant group: [Join us on Discord](https://discord.gg/XJ3scBYX).
