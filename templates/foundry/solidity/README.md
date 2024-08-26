## ZKsync Foundry Project Template

**Foundry is a blazing fast, portable and modular toolkit for Ethereum application development written in Rust.**

This project is set up using Foundry and is configured for ZKsync. It includes a structure for developing, deploying, and testing Solidity smart contracts. This project was scaffolded with [zksync-cli](https://github.com/matter-labs/zksync-cli).

## Project Layout

- **`/src`**: Contains Solidity smart contracts.
- **`/script`**: Scripts for contract deployment and interaction.
- **`/test`**: Test files.
- **`foundry.toml`**: Configuration settings for Foundry.

## How to Use

### Compilation

Compile the smart contracts using Foundry:

```
forge build --zksync
```

### Deployment

Deploy contracts using the script in the `/script` directory:

```
forge script script/DeployGreeter.s.sol:DeployGreeter --rpc-url <network> --account <your_keystore_name> 
```

### Interaction

Interact with the deployed greeter contract using:

```
cast send <contract_address> "setGreeting(string)" "Hi ZKsync" --rpc-url <network> --account <your_keystore_name> 
```

### Testing

Run tests for the contracts:

```
forge test --zksync
```

## Environment Settings

To keep private keys secure, consider using keystores. You can configure these settings using the command below and then follow the instructions.

```
cast wallet import <name_of_keystore> --interactive
```

## Useful Links

- [Foundry Documentation](https://book.getfoundry.sh/)
- [ZKsync Documentation](https://docs.zksync.io/)
- [Official ZKsync Site](https://zksync.io/)
- [GitHub](https://github.com/matter-labs)
- [Twitter](https://twitter.com/zksync)
- [Discord](https://join.zksync.dev/)

## License

This project is under the [MIT](./LICENSE) license.
