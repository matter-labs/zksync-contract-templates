import { getWallet } from "../../../utils";
import { Deployer } from "@matterlabs/hardhat-zksync";
import * as hre from "hardhat";

// Replace with your deployed transparent proxy address
const proxyAddress = "YOUR_PROXY_ADDRESS_HERE";

export default async function () {
  const wallet = getWallet();
  const deployer = new Deployer(hre, wallet);

  const contractV2Artifact = await deployer.loadArtifact(
    "V2_ProxyableCrowdfundingCampaign"
  );

  // Upgrade the proxy to V2
  const upgradedContract = await hre.zkUpgrades.upgradeProxy(
    deployer.zkWallet,
    proxyAddress,
    contractV2Artifact
  );

  console.log(
    "Successfully upgraded ProxyableCrowdfundingCampaign to V2_ProxyableCrowdfundingCampaign"
  );

  upgradedContract.connect(deployer.zkWallet);
  // wait some time before the next call
  await new Promise((resolve) => setTimeout(resolve, 2000));

  // Initialize V2 with a new campaign duration
  const durationInSeconds = 30 * 24 * 60 * 60; // For example, setting a 30-day duration
  const initTx = await upgradedContract.initializeV2(durationInSeconds);
  const receipt = await initTx.wait();

  console.log(
    `V2_ProxyableCrowdfundingCampaign initialized. Transaction Hash: ${receipt.hash}`
  );
}
