import { getWallet } from "../utils";
import { Deployer } from '@matterlabs/hardhat-zksync';
import { HardhatRuntimeEnvironment } from "hardhat/types";
import * as zk from 'zksync-ethers';
import { Contract } from 'ethers';

export default async function (hre: HardhatRuntimeEnvironment) {
    const wallet = getWallet();
    const deployer = new Deployer(hre, wallet);

    // Placeholder for the deployed beacon address
    const beaconAddress = 'YOUR_BEACON_ADDRESS_HERE';
    
    const contractV2Artifact = await deployer.loadArtifact('CrowdfundingCampaignV2');

    // Upgrade the proxy to V2
    await hre.zkUpgrades.upgradeBeacon(deployer.zkWallet, beaconAddress, contractV2Artifact);

    console.log('Successfully upgraded crowdfundingCampaign to crowdfundingCampaignV2');

    const attachTo = new zk.ContractFactory<any[], Contract>(
        contractV2Artifact.abi,
        contractV2Artifact.bytecode,
        deployer.zkWallet,
        deployer.deploymentType,
    );
    
    // Placeholder for the deployed beacon proxy address
    const proxyAddress = 'YOUR_PROXY_ADDRESS_HERE';

    const upgradedContract  = attachTo.attach(proxyAddress);

    upgradedContract.connect(deployer.zkWallet);
    // wait some time before the next call
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Initialize V2 with a new campaign duration
    const durationInSeconds = 30 * 24 * 60 * 60; // For example, setting a 30-day duration
    const initTx = await upgradedContract.initializeV2(durationInSeconds);
    const receipt = await initTx.wait();

   console.log(`CrowdfundingCampaignV2 initialized. Transaction Hash: ${receipt.hash}`);
}