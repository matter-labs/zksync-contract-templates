import { ethers, upgrades } from "hardhat"
import { V2_BeaconCrowdfundingCampaign } from "../../../typechain-types";

// Update with the address for your beacon contract
// and the beacon proxy address
const beaconAddress = "YOUR_BEACON_ADDRESS_HERE";
const proxyAddress = "YOUR_PROXY_ADDRESS_HERE";

async function main() {
  const beaconV2Factory = await ethers.getContractFactory(
    "V2_BeaconCrowdfundingCampaign"
  );

  // Upgrade the proxy to V2
  await upgrades.upgradeBeacon(
    beaconAddress,
    beaconV2Factory
  );

  console.log(
    "Successfully upgraded BeaconCrowdfundingCampaign to V2_BeaconCrowdfundingCampaign"
  );

  const upgradedContract = beaconV2Factory.attach(proxyAddress) as unknown as V2_BeaconCrowdfundingCampaign;

  // wait some time before the next call
  await new Promise((resolve) => setTimeout(resolve, 2000));

  // Initialize V2 with a new campaign duration
  const durationInSeconds = 30 * 24 * 60 * 60; // For example, setting a 30-day duration
  const initTx = await upgradedContract.initializeV2(durationInSeconds);
  const receipt = await initTx.wait();

  console.log(
    `V2_BeaconCrowdfundingCampaign initialized. Transaction Hash: ${receipt?.hash}`
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
