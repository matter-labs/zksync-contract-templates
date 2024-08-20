import { getWallet } from "../../../utils";
import { Deployer } from "@matterlabs/hardhat-zksync";
import { HardhatRuntimeEnvironment } from "hardhat/types";

// Replace with the address of the proxy contract you want to upgrade
const proxyAddress = "0x60Aa68f9D0D736B9a0a716d04323Ba3b22602840";

export default async function (hre: HardhatRuntimeEnvironment) {
  const wallet = getWallet();
  const deployer = new Deployer(hre, wallet);

  const contractV2Artifact = await deployer.loadArtifact(
    "V2_UUPSCrowdfundingCampaign"
  );
  const upgradedContract = await hre.zkUpgrades.upgradeProxy(
    deployer.zkWallet,
    proxyAddress,
    contractV2Artifact
  );
  console.log(
    "Successfully upgraded UUPSCrowdfundingCampaign to V2_UUPSCrowdfundingCampaign"
  );

  upgradedContract.connect(deployer.zkWallet);
  // wait some time before the next call
  await new Promise((resolve) => setTimeout(resolve, 0));

  const durationInSeconds = 30 * 24 * 60 * 60; // For example, setting a 30-day duration

  const initTx = await upgradedContract.initializeV2(durationInSeconds);
  const receipt = await initTx.wait();

  console.log("V2_UUPSCrowdfundingCampaign initialized!", receipt.hash);
}
