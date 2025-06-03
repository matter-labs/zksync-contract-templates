import { ethers } from "hardhat";
import { deployCrownToken, deployApprovalPaymaster } from "../../../utils";

async function main() {
  const [signer] = await ethers.getSigners();
  const crownToken = await deployCrownToken(signer);
  const crownTokenAddress = await crownToken.getAddress();

  const paymaster = await deployApprovalPaymaster(signer, crownTokenAddress);

  await (
    await signer.sendTransaction({
      to: paymaster.target,
      value: ethers.parseEther("0.05"),
    })
  ).wait();

  let paymasterBalance = await ethers.provider.getBalance(
    paymaster.target.toString()
  );
  console.log(
    `\nPaymaster ETH balance is now ${ethers.formatEther(
      paymasterBalance.toString()
    )}`
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
