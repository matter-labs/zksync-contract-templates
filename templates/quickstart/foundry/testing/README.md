# Foundry with ZKsync Era v0.2-alpha

This repository enhances Foundry to support ZKsync Era, enabling Solidity-based compilation, deployment, testing, and interaction with smart contracts on ZKsync Era.

> 🔧 **Fork Notice:** This is a Foundry fork with added ZKsync support.
> 
> ⚠️ **Alpha Stage:** The project is in alpha, so you might encounter issues.
> 
> 🐞 **Found an Issue?** Please report it to help us improve.

## Changes Made

To use for ZKsync environments, include `--zksync` when running `forge` or `vm.zkVm(true)` in tests. The modifications include:

1. **Compilation:** `solc` and `zksolc` are used for compiling. The resulting bytecodes are combined into `DualCompiledContract` and managed through `Executor` to `CheatcodeTracer`.
2. **EVM Interactions:**
   - EVM calls are standard except for `address.balance` and `block.timestamp`/`block.number`, which pull data from ZKsync (ZK-storage and ZK-specific context, respectively).
3. **Transaction Handling:**
   - `CALL` and `CREATE` operations are captured and converted to ZKsync transactions. This process includes fetching ZKsync-equivalent bytecode, managing account nonces, and marking EOA appropriately to comply with ZKsync requirements.
4. **Execution and State Management:**
   - ZKsync VM processes the transaction and returns state changes, which are applied to `journaled_state`. Results are relayed back.
5. **Logging:**
   - `console.log()` outputs within ZKsync VM are captured and displayed in Foundry.
6. **Fuzzing**
   - Adds config option `no_zksync_reserved_addresses`. Since ZKsync reserves addresses below 2^16 as system addresses, a fuzz test would've required a broad `vm.assume` and many `vm.excludeSender` calls to exclude these. This is not only cumbersome but could also trigger `proptest`'s global `max_global_rejects` failure. When this option is set to `true` the `proptest` generation itself ensures that no invalid addresses are generated, and thus need not be filtered adding up to the `max_test_rejects` count.

## 📊 Features & Limitations

### Features

`Foundry-zksync` offers a set of features designed to work with ZKsync Era, providing a comprehensive toolkit for smart contract deployment and interaction:

- **Smart Contract Deployment**: Easily deploy smart contracts to ZKsync Era mainnet, testnet, or a local test node.
- **Contract Interaction**: Call and send transactions to deployed contracts on ZKsync Era testnet or local test node.
- **Solidity Testing**: Write tests in Solidity, similar to DappTools, for a familiar testing environment.
- **Fuzz Testing**: Benefit from fuzz testing, complete with shrinking of inputs and printing of counter-examples.
- **Remote RPC Forking**: Utilize remote RPC forking mode, leveraging Rust's asynchronous infrastructure like tokio.
- **Flexible Debug Logging**: Choose your debugging style:
  - DappTools-style: Utilize DsTest's emitted logs for debugging.
  - Hardhat-style: Leverage the popular console.sol contract.
- **Configurable Compiler Options**: Tailor compiler settings to your needs, including LLVM optimization modes.

### Limitations

While `foundry-zksync` is **alpha stage**, there are some limitations to be aware of:

- **Compile Time**: Some users may experience slower compile times.
- **Compiling Libraries**: Compiling non-inlinable libraries requires deployment and adding to configuration. For more information please refer to [official docs](https://docs.zksync.io/build/tooling/hardhat/compiling-libraries).

    ```toml
    libraries = [
        "src/MyLibrary.sol:MyLibrary:0xfD88CeE74f7D78697775aBDAE53f9Da1559728E4"
    ]
    ```

- **Create2 Address Derivation**: There are differences in Create2 Address derivation compared to Ethereum. [Read the details](https://docs.zksync.io/build/developer-reference/ethereum-differences/evm-instructions#create-create2).
- **Contract Verification**: Currently contract verification via the `--verify` flag do not work as expected but will be added shortly.  
- **Specific Foundry Features**: Currently features such as `--gas-report`, `--coverage` may not work as intended. We are actively working on providing support for these feature types.

For the most effective use of our library, we recommend familiarizing yourself with these features and limitations.

## Quick Install

Follow these steps to quickly install the binaries for `foundry-zksync`:

**Note:** This installation overrides any existing forge and cast binaries in ~/.foundry. You can use forge without the --zksync flag for standard EVM chains. To revert to a previous installation, follow the instructions [here](https://book.getfoundry.sh/getting-started/installation#using-foundryup).

1. **Clone the Repository**:
   Begin by cloning the `foundry-zksync` repository from GitHub. This will download the latest version of the source code to your local machine.

   ```bash
   git clone git@github.com:matter-labs/foundry-zksync.git
   ```

2. **Change Directory**:
   Navigate into the directory where the repository has been cloned. This is where you will run the installation commands.

   ```bash
   cd foundry-zksync
   ```

3. **Make the Installer Executable**:
   Before running the installation script, ensure it is executable. This step is crucial for allowing the script to run without permission issues.

   ```bash
   chmod +x ./install-foundry-zksync
   ```

4. **Run the Installer**:
   Now, you're ready to execute the installation script. This command initializes the setup and installs `foundry-zksync` binaries `forge` and `cast`.

   ```bash
   ./install-foundry-zksync
   ```

5. **Verify the Installation** (Recommended):
   After installation, it's good practice to verify that the binaries have been installed correctly. Run the following command to check the installed version:

   ```bash
   forge --version
   ```

This should return the installed version of `forge`, confirming that `foundry-zksync` is installed properly on your system.

## 📝 Development Prerequisites

Ensure you have the necessary tools and environments set up for development:

1. **Install Rust:** Use the command below to install Rust. This will also install `cargo`, Rust's package manager and build system.

   ```sh
   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
   ```

2. **Set Rust to Nightly Toolchain:** This project requires Rust's nightly version from September 30, 2023. Set your Rust toolchain to the appropriate nightly version using `rustup`:

   ```sh
   # Replace `<YOUR-TARGET>` with your specific platform target, e.g., `x86_64-unknown-linux-gnu`
   rustup install nightly-2023-09-30-<YOUR-TARGET>
   
   # Example for MacOS (Apple Silicon):
   rustup install nightly-2023-09-30-aarch64-apple-darwin
   ```

3. **MacOS Prerequisite - Install `make`:** MacOS users need to ensure `make` is installed. If not, install it using Homebrew:

   ```sh
   brew install make
   ```

   Then, set the path to GNU `make`:

   ```sh
   # For x86_64 MacOs users:
   # export PATH="/usr/local/opt/make/libexec/gnubin:$PATH"
   export PATH="/opt/homebrew/opt/make/libexec/gnubin:$PATH"
   ```

   Add this export line to your shell profile (`~/.bash_profile`, `~/.zshrc`, etc.) to make the change permanent.

## 💾 Installation

Each tool within our suite can be installed individually, or you can install the entire suite at once.

### Installing `forge` 🛠️

To install `forge`, execute the command below. This action will overwrite any previous `forge` installations, but the functionality remains consistent. Post-installation, `forge` will be accessible as an executable from `~/.cargo/bin`.

Run the following command:

```bash
cargo install --path ./crates/forge --profile local --force --locked
```

### Installing `cast` 📡

Similarly, to install `cast`, use the following command. Like `forge`, this will replace any existing `cast` installations without altering functionality. Once installed, `cast` becomes available as an executable in `~/.cargo/bin`.

Run the following command:

```bash
cargo install --path ./crates/cast --profile local --force --locked
```

### Installing the Entire Suite 📦

To install all the tools in the suite:

```bash
cargo build --release
```

## Quickstart 

In an empty directory, run the following command:

```bash
forge init
```

Let's check out what forge generated for us:

```bash
$ tree . -d -L 1
.
├── lib
├── script
├── src
└── test
```

### Private key setup

It's recommended to use Foundry keystore to store your development account private key.

1. Export your account private key.
2. Create a keystore and import your private key by running:

```shell
cast wallet import --interactive
# enter your PK when prompted and provide a password
```

> Note that the name `myKeystore` is arbitrary and can be updated. If you decide to use another name, be sure to reference it when using `cast`.

This will return an address (keystore address), **copy it for later use**.

#### Using the keystore

When running commands that require a private key, like `forge create` or `cast send`, use `--account myKeystore --sender <KEYSTORE_ADDRESS>`. This will require you to enter the keystore password you provided before.

### Compiling contracts

We can build the project with `forge build --zksync`:

```bash
$ forge build --zksync
Compiling smart contracts...
Compiled Successfully
```

#### Deploying missing libraries

In case missing libraries are detected during the compilation, we can deploy them using the following command:

```bash
forge create --deploy-missing-libraries --account myKeystore --sender <KEYSTORE_ADDRESS> --rpc-url <RPC_URL> --chain <CHAIN_ID> --zksync
```

After deployment is done, the configuration file will be updated and contracts will be automatically compiled again.

#### Running Tests

You can run the tests using `forge test --zksync`.

The command and its expected output are shown below:

```bash
$ forge test --zksync

Ran 2 tests for test/Counter.t.sol:CounterTest
[PASS] testFuzz_SetNumber(uint256) (runs: 256, μ: 8737, ~: 8737)
[PASS] test_Increment() (gas: 8702)
Suite result: ok. 2 passed; 0 failed; 0 skipped; finished in 3.57s (3.56s CPU time)

Ran 1 test suite in 3.57s (3.57s CPU time): 2 tests passed, 0 failed, 0 skipped (2 total tests)
