import { ethers } from "hardhat";

async function main() {
  const contractArtifactName = "CrowdfundingFactory";
  const crowdfundingFactory = await ethers.deployContract(contractArtifactName, [], {});
  await crowdfundingFactory.waitForDeployment();
  
  console.log(`🏭 CrowdfundingFactory address: ${crowdfundingFactory.target}`);
  
  const factoryContract = crowdfundingFactory;

  // Define funding goal for the campaign, e.g., 0.1 ether
  const fundingGoalInWei = ethers.parseEther("0.1").toString();

  // Use the factory to create a new CrowdfundingCampaign
  const createTx = await factoryContract.createCampaign(fundingGoalInWei);
  await createTx.wait();

  // Retrieve the address of the newly created CrowdfundingCampaign
  const campaigns = await factoryContract.getCampaigns();
  const newCampaignAddress = campaigns[campaigns.length - 1];

  console.log(`🚀 New CrowdfundingCampaign deployed at: ${newCampaignAddress}`);
  console.log("✅ Deployment and campaign creation complete!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
