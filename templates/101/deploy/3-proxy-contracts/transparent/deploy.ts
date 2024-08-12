import { getWallet } from "../../../utils";
import { Deployer } from "@matterlabs/hardhat-zksync";
import { ethers } from "ethers";
import * as hre from "hardhat";
import { HardhatRuntimeEnvironment } from "hardhat/types";

export default async function (hre: HardhatRuntimeEnvironment) {
  const wallet = getWallet();
  const deployer = new Deployer(hre, wallet);
  const fundingGoal = "0.1";

  console.log("Deploying with funding goal:", fundingGoal);

  const contractArtifact = await deployer.loadArtifact(
    "ProxyableCrowdfundingCampaign"
  );
  const fundingGoalInWei = ethers.parseEther(fundingGoal).toString();
  // Deploy the contract using a transparent proxy
  const crowdfunding = await hre.zkUpgrades.deployProxy(
    getWallet(),
    contractArtifact,
    [ethers.parseEther(fundingGoal).toString()],
    { initializer: "initialize" }
  );

  return await crowdfunding.waitForDeployment();
}
