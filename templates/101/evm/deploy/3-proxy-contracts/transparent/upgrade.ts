import { ethers, upgrades } from "hardhat";

// Replace with your deployed transparent proxy address
const proxyAddress = "YOUR_PROXY_ADDRESS_HERE";

async function main() {
  const contractV2Factory = await ethers.getContractFactory(
    "V2_ProxyableCrowdfundingCampaign"
  );

  // Upgrade the proxy to V2
  const upgradedContract = await upgrades.upgradeProxy(proxyAddress, contractV2Factory);

  console.log(
    "Successfully upgraded ProxyableCrowdfundingCampaign to V2_ProxyableCrowdfundingCampaign"
  );

  // wait some time before the next call
  await new Promise((resolve) => setTimeout(resolve, 2000));

  // Initialize V2 with a new campaign duration
  const durationInSeconds = 30 * 24 * 60 * 60; // For example, setting a 30-day duration
  const initTx = await upgradedContract.initializeV2(durationInSeconds);
  const receipt = await initTx.wait();

  console.log(
    `V2_ProxyableCrowdfundingCampaign initialized. Transaction Hash: ${receipt?.hash}`
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
