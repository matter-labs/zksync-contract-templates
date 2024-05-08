import { getWallet } from "./utils";
import { Deployer } from '@matterlabs/hardhat-zksync';
import { ethers } from "ethers";
import { HardhatRuntimeEnvironment } from "hardhat/types";

export default async function (hre: HardhatRuntimeEnvironment) {
    const wallet = getWallet();
    const deployer = new Deployer(hre, wallet);

    const contractArtifact = await deployer.loadArtifact("CrowdfundingCampaign");
    const fundingGoalInWei = ethers.parseEther('0.1').toString();
    // Deploy the contract using a transparent proxy
    const crowdfunding = await hre.zkUpgrades.deployProxy(
        getWallet(),
        contractArtifact,
        [fundingGoalInWei],
        { initializer: 'initialize' }
    );

    await crowdfunding.waitForDeployment();
}
