import { ethers } from "hardhat";
import type { Contract } from "ethers";

async function main () {
 const paymaster = await deployContract("GaslessPaymaster", []);
 const [signer] = await ethers.getSigners();

  // Supplying paymaster with ETH
  await (
    await signer.sendTransaction({
      to: paymaster.target,
      value: ethers.parseEther("0.005"),
    })
  ).wait();

  let paymasterBalance = await ethers.provider.getBalance(paymaster.target.toString());
  console.log(
    `\nPaymaster ETH balance is now ${ethers.formatEther(
      paymasterBalance.toString()
    )}`
  );
}

async function deployContract(
  contractArtifactName: string,
  constructorArgs: any[],
  quiet = false
): Promise<Contract> {
  const contract = await ethers.deployContract(contractArtifactName, constructorArgs, {});
  await contract.waitForDeployment();

  !quiet
    ? console.log(
        `${contractArtifactName} contract deployed at ${await contract.getAddress()}`
      )
    : null;

  return contract;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
