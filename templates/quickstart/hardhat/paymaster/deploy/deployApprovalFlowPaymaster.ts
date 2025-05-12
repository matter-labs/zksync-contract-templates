import type { Contract } from "ethers";
import { ethers } from "hardhat";

async function main () {
  const [signer] = await ethers.getSigners();
  const TOKEN_CONTRACT_NAME = "MyERC20Token";
  const tokenContract = await ethers.deployContract(TOKEN_CONTRACT_NAME, [], {});
  const TOKEN_ADDRESS = await tokenContract.getAddress();
  console.log("Token contract deployed at:", TOKEN_ADDRESS);

  const paymaster = await deployContract("ApprovalFlowPaymaster", [TOKEN_ADDRESS]);

  await (
    await signer.sendTransaction({
      to: paymaster.target,
      value: ethers.parseEther("0.05"),
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
