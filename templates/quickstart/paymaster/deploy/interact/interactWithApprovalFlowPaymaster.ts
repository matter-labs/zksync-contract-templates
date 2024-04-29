import * as hre from "hardhat";
import { getWallet, getProvider } from "../utils";
import { ethers } from "ethers";
import { utils } from "zksync-ethers";

// Address of the contract to interact with
const CONTRACT_ADDRESS = "YOUR-CONTRACT-ADDRESS";
const PAYMASTER_ADDRESS = "YOUR-PAYMASTER-ADDRESS";
// Sepolia CROWN token address
const TOKEN_ADDRESS = "0x927488F48ffbc32112F1fF721759649A89721F8F"

if (!CONTRACT_ADDRESS || !PAYMASTER_ADDRESS)
    throw new Error("Contract and Paymaster addresses are required.");

export default async function() {
  console.log(`Running script to interact with contract ${CONTRACT_ADDRESS} using paymaster ${PAYMASTER_ADDRESS}`);

  // Load compiled contract info
  const contractArtifact = await hre.artifacts.readArtifact(
    "CrowdfundingCampaignV2"
  );
  const provider = getProvider();
  // Initialize contract instance for interaction
  const contract = new ethers.Contract(
    CONTRACT_ADDRESS,
    contractArtifact.abi,
    getWallet()
  );

  const contributionAmount = ethers.parseEther("0.0001");
  // Get paymaster params for the ApprovalBased paymaster
  const paymasterParams = utils.getPaymasterParams(PAYMASTER_ADDRESS, {
    type: "ApprovalBased",
    token: TOKEN_ADDRESS, 
    minimalAllowance: 1n,
    innerInput: new Uint8Array(),
  });

  const gasLimit = await contract.contribute.estimateGas({
    value: contributionAmount,
    customData: {
      gasPerPubdata: utils.DEFAULT_GAS_PER_PUBDATA_LIMIT,
      paymasterParams: paymasterParams,
    },
  });

  const transaction = await contract.contribute({
    value: contributionAmount,
    maxPriorityFeePerGas: 0n,
    maxFeePerGas: await provider.getGasPrice(),
    gasLimit,
    // Pass the paymaster params as custom data
    customData: {
      gasPerPubdata: utils.DEFAULT_GAS_PER_PUBDATA_LIMIT,
      paymasterParams,
    },
  });
  console.log(`Transaction hash: ${transaction.hash}`);

  await transaction.wait();
}
