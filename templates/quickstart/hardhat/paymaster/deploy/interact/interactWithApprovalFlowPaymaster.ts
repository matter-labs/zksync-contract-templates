import { ethers, upgrades } from "hardhat";
import { utils } from "zksync-ethers";

// Update with the addresses for your paymaster contract
// and token contract

const PAYMASTER_ADDRESS = process.env.APPROVAL_PAYMASTER_ADDRESS ?? "YOUR_PAYMASTER_ADDRESS";
const TOKEN_ADDRESS = process.env.TOKEN_ADDRESS ?? "YOUR_TOKEN_ADDRESS";

async function main () {
  const fundingGoal = "0.1";

  console.log("Deploying with funding goal:", fundingGoal);

  const factory = await ethers.getContractFactory(
    "CrowdfundingCampaign"
  );

  // Deploy the contract using a transparent proxy
  const crowdfundingContract = await upgrades.deployProxy(factory, [ethers.parseEther(fundingGoal).toString()], { initializer: "initialize" });
  await crowdfundingContract.waitForDeployment();

  
  
  const contributionAmount = ethers.parseEther("0.0001");

  // Get paymaster params for the ApprovalBased paymaster
  const paymasterParams = utils.getPaymasterParams(PAYMASTER_ADDRESS, {
    type: "ApprovalBased",
    token: TOKEN_ADDRESS,
    minimalAllowance: 1n,
    innerInput: new Uint8Array(),
  });
  // Determine the gas limit for the contribution transaction
  const gasLimit = await crowdfundingContract.contribute.estimateGas({
    value: contributionAmount,
    customData: {
      gasPerPubdata: utils.DEFAULT_GAS_PER_PUBDATA_LIMIT,
      paymasterParams: paymasterParams,
    },
  });

  const gasPrice = await ethers.providerL2.getGasPrice();

  // Contribute to the crowdfund contract
  // and have the paymaster cover the funds
  const transaction = await crowdfundingContract.contribute({
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
