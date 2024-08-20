import { getWallet } from "../../../utils";
import { Deployer } from "@matterlabs/hardhat-zksync";
import { ethers } from "ethers";
import { HardhatRuntimeEnvironment } from "hardhat/types";

export default async function (hre: HardhatRuntimeEnvironment) {
  const wallet = getWallet();
  const deployer = new Deployer(hre, wallet);

  const contractArtifact = await deployer.loadArtifact(
    "BeaconCrowdfundingCampaign"
  );
  const fundingGoalInWei = ethers.parseEther("0.1").toString();

  const beacon = await hre.zkUpgrades.deployBeacon(
    getWallet(),
    contractArtifact
  );
  await beacon.waitForDeployment();

  const crowdfunding = await hre.zkUpgrades.deployBeaconProxy(
    deployer.zkWallet,
    await beacon.getAddress(),
    contractArtifact,
    [fundingGoalInWei]
  );
  await crowdfunding.waitForDeployment();
}
