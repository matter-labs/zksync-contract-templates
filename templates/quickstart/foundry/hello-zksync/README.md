## Foundry

**Foundry is a blazing fast, portable and modular toolkit for Ethereum application development written in Rust.**

Foundry consists of:

-   **Forge**: Ethereum testing framework (like Truffle, Hardhat and DappTools).
-   **Cast**: Swiss army knife for interacting with EVM smart contracts, sending transactions and getting chain data.
-   **Anvil**: Local Ethereum node, akin to Ganache, Hardhat Network.
-   **Chisel**: Fast, utilitarian, and verbose solidity REPL.

## Documentation

https://book.getfoundry.sh/

## Usage

### Build

```shell
$ forge build
```

### Test

```shell
$ forge test
```

### Format

```shell
$ forge fmt
```

### Gas Snapshots

```shell
$ forge snapshot
```

### Anvil

```shell
$ anvil
```

### Private key setup

It's recommended to use Foundry keystore to store your development account private key.

1. Export your account private key.
2. Create a keystore and import your private key by running:

```shell
cast wallet import myKeystore --interactive
# enter your PK when prompted and provide a password
```

> Note that the name `myKeystore` is arbitrary and can be updated. If you decide to use another name, be sure to reference it when using `cast`.

This will return an address (keystore address), **copy it for later use**.

#### Using the keystore

When running commands that require a private key, like `forge create` or `cast send`, use `--account myKeystore --sender <KEYSTORE_ADDRESS>`. This will require you to enter the keystore password you provided before.

### Deploy

```shell
$ forge script script/Counter.s.sol:CounterScript --rpc-url <your_rpc_url> --account myKeystore --sender <KEYSTORE_ADDRESS>
```

### Cast

```shell
$ cast <subcommand>
```

### Help

```shell
$ forge --help
$ anvil --help
$ cast --help
```
