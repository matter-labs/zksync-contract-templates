import * as hre from "hardhat";
import { getWallet, getProvider } from "../utils";
import { ethers } from "ethers";
import { utils } from "zksync-ethers";

// Address of the contract to interact with
const CONTRACT_ADDRESS = "YOUR-CONTRACT-ADDRESS";
const PAYMASTER_ADDRESS = "YOUR-PAYMASTER-ADDRESS";
if (!CONTRACT_ADDRESS || !PAYMASTER_ADDRESS)
    throw new Error("Contract and Paymaster addresses are required.");

export default async function() {
  console.log(`Running script to interact with contract ${CONTRACT_ADDRESS} using paymaster ${PAYMASTER_ADDRESS}`);

  // Load compiled contract info
  const contractArtifact = await hre.artifacts.readArtifact(
    "CrowdfundingCampaignV2"
  );

  // Initialize contract instance for interaction
  const contract = new ethers.Contract(
    CONTRACT_ADDRESS,
    contractArtifact.abi,
    getWallet()
  );

  const provider = getProvider();
  let balanceBeforeTransaction = await provider.getBalance(getWallet().address);
  console.log(`Wallet balance before contribution: ${ethers.formatEther(balanceBeforeTransaction)} ETH`);

  const contributionAmount = ethers.parseEther("0.01");
  // Get paymaster params
  const paymasterParams = utils.getPaymasterParams(PAYMASTER_ADDRESS, {
    type: "General",
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
  
  let balanceAfterTransaction = await provider.getBalance(getWallet().address);
  // Check the wallet balance after the transaction
  // We only pay the contribution amount, so the balance should be less than before
  // Gas fees are covered by the paymaster
  console.log(`Wallet balance after contribution: ${ethers.formatEther(balanceAfterTransaction)} ETH`);
}
