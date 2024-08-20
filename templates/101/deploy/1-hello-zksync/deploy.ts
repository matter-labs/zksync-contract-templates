import { deployContract } from "../../utils";

import { ethers } from "ethers";

// Deploy a CrowdfundingCampaign contract
export default async function () {
  const contractArtifactName = "CrowdfundingCampaign";
  const constructorArguments = [ethers.parseEther(".02").toString()];
  await deployContract(contractArtifactName, constructorArguments);
}
