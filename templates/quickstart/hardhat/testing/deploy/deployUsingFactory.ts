import { deployContract, getWallet } from "./utils";
import { ethers } from "ethers";
import { HardhatRuntimeEnvironment } from "hardhat/types";

export default async function (hre: HardhatRuntimeEnvironment) {
  const contractArtifactName = "CrowdfundingFactory";
  const constructorArguments = [];
  const crowdfundingFactory = await deployContract(contractArtifactName, constructorArguments);

  console.log(`🏭 CrowdfundingFactory address: ${crowdfundingFactory.target}`);
  
  const contractArtifact = await hre.artifacts.readArtifact("CrowdfundingFactory");
  const factoryContract = new ethers.Contract(
    crowdfundingFactory.target,
    contractArtifact.abi,
    getWallet()
  );

  // Define funding goal for the campaign, e.g., 0.1 ether
  const fundingGoalInWei = ethers.parseEther('0.1').toString();

  // Use the factory to create a new CrowdfundingCampaign
  const createTx = await factoryContract.createCampaign(fundingGoalInWei);
  await createTx.wait();

  // Retrieve the address of the newly created CrowdfundingCampaign
  const campaigns = await factoryContract.getCampaigns();
  const newCampaignAddress = campaigns[campaigns.length - 1];

  console.log(`🚀 New CrowdfundingCampaign deployed at: ${newCampaignAddress}`);
  console.log('✅ Deployment and campaign creation complete!');
}
