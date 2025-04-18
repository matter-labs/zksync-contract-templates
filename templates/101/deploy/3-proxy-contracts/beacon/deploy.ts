import { ethers, upgrades } from "hardhat";

async function main() {
  const fundingGoalInWei = ethers.parseEther("0.1").toString();

  const beaconFactory = await ethers.getContractFactory(
    "BeaconCrowdfundingCampaign"
  );
  const beacon = await upgrades.deployBeacon(beaconFactory);
  await beacon.waitForDeployment();

  const crowdfunding = await upgrades.deployBeaconProxy(beacon, beaconFactory, [
    fundingGoalInWei,
  ]);
  await crowdfunding.waitForDeployment();
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
