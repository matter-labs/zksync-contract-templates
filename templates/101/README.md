# ZKsync 101

This project was scaffolded with [ZKsync CLI](https://github.com/matter-labs/zksync-cli).

ZKsync 101 is a quick start template to help you learn how to
be a super developer using ZKsync CLI to build projects in the
ZKsync ecosystem!

This project is a Nodejs project that uses hardhat, viem, and solidity.
You will learn how to build, deploy and test smart contracts with hardhat
onto the ZKsync in memory node and use ZKsync CLI to interact with the contracts.

## Project Layout

- `/contracts`: Contains solidity smart contracts.
- `/deploy`: Scripts for contract deployment and interaction.
- `/test`: Test files.
- `hardhat.config.ts`: Configuration settings, the default network is set to "inMemoryNode".

## How to Use

1. Install dependencies with `npm install --force`.

2. Configure your ZKsync CLI to use the In memory node settings for dev.

   ```bash
   zksync-cli dev config
   ```

3. Start up a local in-memory node with ZKsync CLI with the following command:

   ```bash
   zksync-cli dev start
   ```

4. Follow along on ZKsync Docs in our [ZKsync 101](https://docs.zksync.io/build/start-coding/zksync-101)!

### Environment Settings

This project pulls in environment variables from `.env` files.

Rename `.env.example` to `.env`, the provided private key is a local rich wallet
that is available in the local in-memory node.

```txt
WALLET_PRIVATE_KEY=your_private_key_here...
```

### Local Tests

Running `npm run test` by default runs the [zkSync In-memory Node](https://docs.zksync.io/build/test-and-debug/in-memory-node) provided by the [@matterlabs/hardhat-zksync-node](https://docs.zksync.io/build/tooling/hardhat/hardhat-zksync-node) tool.

Important: ZKsync In-memory Node currently supports only the L2 node. If contracts also need L1, use another testing environment like Dockerized Node.
Refer to [test documentation](https://docs.zksync.io/build/test-and-debug) for details.

## Useful Links

- [Docs](https://docs.zksync.io)
- [Official Site](https://zksync.io/)
- [GitHub](https://github.com/matter-labs)
- [Twitter](https://twitter.com/zksync)
- [Discord](https://join.zksync.dev/)

## License

This project is under the [MIT](./LICENSE) license.
