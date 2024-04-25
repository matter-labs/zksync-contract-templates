import { getWallet } from "../utils";
import { Deployer } from '@matterlabs/hardhat-zksync';
import { HardhatRuntimeEnvironment } from "hardhat/types";

export default async function (hre: HardhatRuntimeEnvironment) {
    const wallet = getWallet();
    const deployer = new Deployer(hre, wallet);
    
    const crowdfundingCampaignAddressProxyAddress = 'Proxy address here';
    
    const crowdfundingCampaignV2_UUPS = await deployer.loadArtifact('CrowdfundingCampaignV2_UUPS');
    const upgradedCrowdfundingCampaign = await hre.zkUpgrades.upgradeProxy(deployer.zkWallet, crowdfundingCampaignAddressProxyAddress, crowdfundingCampaignV2_UUPS);
    console.log('Successfully upgraded crowdfundingCampaign to crowdfundingCampaignV2');

    upgradedCrowdfundingCampaign.connect(deployer.zkWallet);
    // wait some time before the next call
    await new Promise((resolve) => setTimeout(resolve, 2000));
    
    const durationInSeconds = 30 * 24 * 60 * 60; // For example, setting a 30-day duration

    const initTx = await upgradedCrowdfundingCampaign.initializeV2(durationInSeconds);
    const receipt = await initTx.wait();

    console.log('CrowdfundingCampaignV2 initialized!', receipt.hash);

    const fundraisingGoal = await upgradedCrowdfundingCampaign.getFundingGoal();
    console.log('Fundraising goal:', fundraisingGoal.toString());
}
