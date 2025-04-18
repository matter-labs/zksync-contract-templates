import { ethers } from "hardhat";
import { utils } from "zksync-ethers";

// Update with the addresses for your paymaster contract
// and token contract
const TOKEN_ADDRESS = "YOUR_TOKEN_ADDRESS";
const PAYMASTER_ADDRESS = "YOUR_PAYMASTER_ADDRESS";

async function main () {
  const CONTRACT_NAME = "CrowdfundingCampaign";
  const ARGS = [ethers.parseEther(".02").toString()];
  const contract = await ethers.deployContract(CONTRACT_NAME, ARGS, {});
  await contract.waitForDeployment();
  
  const contributionAmount = ethers.parseEther("0.0001");

  // Get paymaster params for the ApprovalBased paymaster
  const paymasterParams = utils.getPaymasterParams(PAYMASTER_ADDRESS, {
    type: "ApprovalBased",
    token: TOKEN_ADDRESS,
    minimalAllowance: 1n,
    innerInput: new Uint8Array(),
  });
  // Determine the gas limit for the contribution transaction
  const gasLimit = await contract.contribute.estimateGas({
    value: contributionAmount,
    customData: {
      gasPerPubdata: utils.DEFAULT_GAS_PER_PUBDATA_LIMIT,
      paymasterParams: paymasterParams,
    },
  });

  const gasPrice = await ethers.providerL2.getGasPrice();

  // Contribute to the crowdfund contract
  // and have the paymaster cover the funds
  const transaction = await contract.contribute({
    value: contributionAmount,
    maxFeePerGas: gasPrice,
    gasLimit,
    // Pass the paymaster params as custom data
    customData: {
      gasPerPubdata: utils.DEFAULT_GAS_PER_PUBDATA_LIMIT,
      paymasterParams,
    },
  });

  console.log(
    `Contributing ${ethers.formatEther(
      contributionAmount.toString()
    )} to the crowdfund contract...`
  );
  console.log(`Transaction hash: ${transaction.hash}`);

  await transaction.wait();
  console.log("Contribution successful!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
