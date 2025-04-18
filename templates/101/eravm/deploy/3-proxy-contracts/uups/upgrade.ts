import { ethers, upgrades } from "hardhat";

// Replace with the address of the proxy contract you want to upgrade
const proxyAddress = "0x4768d649Da9927a8b3842108117eC0ca7Bc6953f";
// const proxyAddress = "YOUR_PROXY_ADDRESS_HERE";

async function main() {
  const contractV2factory = await ethers.getContractFactory(
    "V2_UUPSCrowdfundingCampaign"
  );

  const upgradedContract = await upgrades.upgradeProxy(
    proxyAddress,
    contractV2factory
  );
  console.log(
    "Successfully upgraded UUPSCrowdfundingCampaign to V2_UUPSCrowdfundingCampaign"
  );

  // wait some time before the next call
  await new Promise((resolve) => setTimeout(resolve, 0));

  const durationInSeconds = 30 * 24 * 60 * 60; // For example, setting a 30-day duration

  const initTx = await upgradedContract.initializeV2(durationInSeconds);
  const receipt = await initTx.wait();

  console.log("V2_UUPSCrowdfundingCampaign initialized! Transaction Hash: ", receipt.hash);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
