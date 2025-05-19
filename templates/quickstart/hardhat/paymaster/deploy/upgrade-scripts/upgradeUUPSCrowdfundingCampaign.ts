import { ethers, upgrades } from "hardhat";

// Replace with the address of the proxy contract you want to upgrade
const proxyAddress = process.env.UUPS_PROXY_ADDRESS ?? "YOUR_PROXY_ADDRESS_HERE";

async function main() {
  const contractV2factory = await ethers.getContractFactory(
    "CrowdfundingCampaignV2_UUPS"
  );

  const upgradedContract = await upgrades.upgradeProxy(
    proxyAddress,
    contractV2factory
  );
  console.log(
    "Successfully upgraded CrowdfundingCampaign_UUPS to CrowdfundingCampaignV2_UUPS"
  );

  // wait some time before the next call
  await new Promise((resolve) => setTimeout(resolve, 0));

  const durationInSeconds = 30 * 24 * 60 * 60; // For example, setting a 30-day duration

  const initTx = await upgradedContract.initializeV2(durationInSeconds);
  const receipt = await initTx.wait();

  console.log("CrowdfundingCampaignV2_UUPS initialized! Transaction Hash: ", receipt?.hash);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
