import { ethers } from "hardhat";
import { deployGeneralPaymaster } from "../../../utils";

async function main() {
  const [signer] = await ethers.getSigners();
  const paymaster = await deployGeneralPaymaster(signer);

  // Supplying paymaster with ETH
  await (
    await signer.sendTransaction({
      to: paymaster.target,
      value: ethers.parseEther("0.005"),
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
