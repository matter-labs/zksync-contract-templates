import type { HardhatUserConfig } from "hardhat/config";
// import "@nomicfoundation/hardhat-chai-matchers";
import "@nomicfoundation/hardhat-toolbox";
import "@matterlabs/hardhat-zksync";
// import "@typechain/hardhat";

const config: HardhatUserConfig = {
  solidity: "0.8.24",
  defaultNetwork: "inMemoryNode",
  networks: {
    inMemoryNode: {
      url: "http://127.0.0.1:8011",
      ethNetwork: "", // in-memory node doesn't support eth node; removing this line will cause an error
      zksync: true,
    },
    zkSyncSepoliaTestnet: {
      url: "https://sepolia.era.zksync.dev",
      ethNetwork: "sepolia",
      zksync: true,
      verifyURL:
        " https://block-explorer-api.sepolia.zksync.dev/api",
    },
    zkSyncMainnet: {
      url: "https://mainnet.era.zksync.io",
      ethNetwork: "mainnet",
      zksync: true,
      verifyURL:
        "https://block-explorer-api.mainnet.zksync.io/api",
    },
    hardhat: {
      zksync: true,
    },
  },
};

export default config;
