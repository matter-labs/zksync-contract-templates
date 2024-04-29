import { getWallet } from "../utils";
import { Deployer } from '@matterlabs/hardhat-zksync';
import { HardhatRuntimeEnvironment } from "hardhat/types";

export default async function (hre: HardhatRuntimeEnvironment) {
    const wallet = getWallet();
    const deployer = new Deployer(hre, wallet);
    
    const proxyAddress = 'YOUR_PROXY_ADDRESS_HERE';
    
    const contractV2Artifact = await deployer.loadArtifact('CrowdfundingCampaignV2_UUPS');
    const upgradedContract = await hre.zkUpgrades.upgradeProxy(deployer.zkWallet, proxyAddress, contractV2Artifact);
    console.log('Successfully upgraded crowdfundingCampaign_UUPS to crowdfundingCampaignV2_UUPS');

    upgradedContract.connect(deployer.zkWallet);
    // wait some time before the next call
    await new Promise((resolve) => setTimeout(resolve, 2000));
    
    const durationInSeconds = 30 * 24 * 60 * 60; // For example, setting a 30-day duration

    const initTx = await upgradedContract.initializeV2(durationInSeconds);
    const receipt = await initTx.wait();

    console.log('CrowdfundingCampaignV2_UUPS initialized!', receipt.hash);
}
