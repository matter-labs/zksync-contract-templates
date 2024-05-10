import { deployContract, getWallet, getProvider } from "./utils";
import { ethers } from "ethers";

// An example of a basic deploy script
// It will deploy a CrowdfundingCampaign contract to selected network
// `parseEther` converts ether to wei, and `.toString()` ensures serialization compatibility.
export default async function() {
  const contractArtifactName = "GaslessPaymaster";
  const constructorArguments = [];
  const contract = await deployContract(
    contractArtifactName,
    constructorArguments
  );
  const wallet = getWallet();
  const provider = getProvider();

  // Supplying paymaster with ETH
  await (
    await wallet.sendTransaction({
      to: contract.target,
      value: ethers.parseEther("0.005"),
    })
  ).wait();

  let paymasterBalance = await provider.getBalance(contract.target.toString());
  console.log(`Paymaster ETH balance is now ${paymasterBalance.toString()}`);
}
