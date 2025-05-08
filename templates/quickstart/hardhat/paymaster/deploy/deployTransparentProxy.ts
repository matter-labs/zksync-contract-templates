import { ethers, upgrades } from "hardhat";

async function main() {
  const fundingGoal = "0.1";

  console.log("Deploying with funding goal:", fundingGoal);

  const factory = await ethers.getContractFactory(
    "CrowdfundingCampaign"
  );

  // Deploy the contract using a transparent proxy
  const crowdfunding = await upgrades.deployProxy(factory, [ethers.parseEther(fundingGoal).toString()], { initializer: "initialize" });
  return await crowdfunding.waitForDeployment();
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
