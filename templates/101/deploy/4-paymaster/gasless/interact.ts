import {
  getProvider,
  deployContract,
  getWallet,
  LOCAL_RICH_WALLETS,
} from "../../../utils";
import { ethers } from "ethers";
import { utils, Wallet } from "zksync-ethers";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { CrowdfundingCampaign } from "../../../typechain-types";

// Update with the address for your paymaster contract
const PAYMASTER_ADDRESS = "YOUR_PAYMASTER_ADDRESS";

export default async function (hre: HardhatRuntimeEnvironment) {
  const provider = getProvider();
  console.log("Deploying a CrowdfundingCampaign contract...");

  // Deploy a crowdfund contract for this example.
  // We will use the paymaster to cover funds when
  // the user contributes to the crowdfund
  const deployedContract = await deployCrowdfundContract();
  const contractArtifact = await hre.artifacts.readArtifact(
    "CrowdfundingCampaign"
  );
  const contract = new ethers.Contract(
    await deployedContract.getAddress(),
    contractArtifact.abi,
    getWallet(LOCAL_RICH_WALLETS[1].privateKey)
  );
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
  // Contribute to the crowdfund contract
  // and have the paymaster cover the funds
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

  console.log(
    `Contributing ${ethers.formatEther(
      contributionAmount.toString()
    )} to the crowdfund contract...`
  );
  console.log(`Transaction hash: ${transaction.hash}`);

  await transaction.wait();
  console.log("Contribution successful!");
}

export async function deployCrowdfundContract(
  wallet?: Wallet
): Promise<CrowdfundingCampaign> {
  const contractArtifactName = "CrowdfundingCampaign";
  const constructorArguments = [ethers.parseEther(".02").toString()];
  return (await deployContract(contractArtifactName, constructorArguments, {
    wallet,
    silent: true,
  })) as unknown as CrowdfundingCampaign;
}
