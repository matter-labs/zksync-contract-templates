import { ethers } from 'hardhat';
import type { CrowdfundingCampaign } from '../../typechain-types';

// Address of the contract to interact with
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS ?? "";
if (!CONTRACT_ADDRESS) throw "⛔️ Provide address of the contract to interact with!";

// Deploy and interact with a CrowdfundingCampaign contract
async function main() {
  const CONTRACT_NAME = "CrowdfundingCampaign";
  // Get the first signer
  const [signer] = await ethers.getSigners();
  
  // Get the contract factory and deploy
  const contractFactory = await ethers.getContractFactory(CONTRACT_NAME);
  const contract = contractFactory.connect(signer).attach(CONTRACT_ADDRESS) as CrowdfundingCampaign;

  // Run contract read function
  const response = await contract.getFundingGoal();
  console.log(`The funding goal is: ${response}`);

  // Run contract write function
  const transaction = await contract.contribute({
    value: ethers.parseEther("0.01"),
  });
  console.log(`Transaction hash of contribute fn: ${transaction.hash}`);

  // Wait until transaction is processed
  await transaction.wait();

  // Read message after transaction
  console.log(`The total funds raised is now: ${await contract.getTotalFundsRaised()}`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
