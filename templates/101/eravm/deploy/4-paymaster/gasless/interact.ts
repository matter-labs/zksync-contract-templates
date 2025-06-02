import { ethers } from "hardhat";
import { utils } from "zksync-ethers";
import { deployCrowdfundContract } from "../../../utils";

// Update with the address for your paymaster contract
const PAYMASTER_ADDRESS =
  process.env.GENERAL_PAYMASTER_ADDRESS ?? "YOUR_PAYMASTER_ADDRESS";

async function main() {
  // Deploy a crowdfund contract for this example.
  // We will use the paymaster to cover funds when
  // the user contributes to the crowdfund
  const [wallet] = await ethers.getSigners();
  const contract = await deployCrowdfundContract(wallet);
  const contributionAmount = ethers.parseEther("0.01");

  // Get paymaster params for the Gasless paymaster
  const paymasterParams = utils.getPaymasterParams(PAYMASTER_ADDRESS, {
    type: "General",
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

  const fees = await ethers.provider.getFeeData();
  const gasPrice = fees.gasPrice;

  // Contribute to the crowdfund contract
  // and have the paymaster cover the funds
  const transaction = await contract.contribute({
    value: contributionAmount,
    maxPriorityFeePerGas: 0n,
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
