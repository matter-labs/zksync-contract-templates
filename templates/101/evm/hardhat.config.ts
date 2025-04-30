import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@typechain/hardhat";
import "@nomicfoundation/hardhat-chai-matchers";
import "@openzeppelin/hardhat-upgrades";

import dotenv from "dotenv";
dotenv.config();

const config: HardhatUserConfig = {
  defaultNetwork: "localhost",
  networks: {
    hardhat: {},
    localhost: {
      url: "http://127.0.0.1:8545",
      accounts: process.env.WALLET_PRIVATE_KEY ? [process.env.WALLET_PRIVATE_KEY] : [],
    },
    ZKsyncEraSepolia: {
      url: "https://sepolia.era.zksync.dev",
      accounts: process.env.WALLET_PRIVATE_KEY ? [process.env.WALLET_PRIVATE_KEY] : [],
    },
    ZKsyncEraMainnet: {
      url: "https://mainnet.era.zksync.io",
      accounts: process.env.WALLET_PRIVATE_KEY ? [process.env.WALLET_PRIVATE_KEY] : [],
    },
  },
  etherscan: {
    apiKey: {
      // no API key is required
      ZKsyncEraSepolia: "",
      ZKsyncEraMainnet: "",
    },
    customChains: [
      {
        network: "ZKsyncEraSepolia",
        chainId: 300,
        urls: {
          apiURL: "https://block-explorer-api.sepolia.zksync.dev/api",
          browserURL: "https://sepolia.explorer.zksync.io"
        }
      },
      {
        network: "ZKsyncEraMainnet",
        chainId: 324,
        urls: {
          apiURL: "https://block-explorer-api.mainnet.zksync.io/api",
          browserURL: "https://explorer.zksync.io"
        }
      }
    ]
  },
  solidity: "0.8.28",
};

export default config;
