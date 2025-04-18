import { ethers, network } from 'hardhat';

// Deploy a CrowdfundingCampaign contract
async function main() {
  const CONTRACT_NAME = "CrowdfundingCampaign";
  const ARGS = [ethers.parseEther(".02").toString()];
  console.log(`Deploying ${CONTRACT_NAME} contract to ${network.name}`);
  const contract = await ethers.deployContract(CONTRACT_NAME, ARGS, {});
  await contract.waitForDeployment();
  const contractAddress = await contract.getAddress();
  console.log(`${CONTRACT_NAME} deployed to ${contractAddress}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
