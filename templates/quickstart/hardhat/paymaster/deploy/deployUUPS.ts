import { ethers, upgrades } from "hardhat";

async function main() {
  const factory = await ethers.getContractFactory(
    "CrowdfundingCampaign_UUPS"
  );
  const fundingGoalInWei = ethers.parseEther("0.1").toString();

  const crowdfunding = await upgrades.deployProxy(
    factory,
    [fundingGoalInWei],
    { initializer: "initialize" }
  );

  await crowdfunding.waitForDeployment();
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
