import { Wallet } from "zksync-ethers";
import {
  deployContract,
  getWallet,
  getProvider,
  LOCAL_RICH_WALLETS,
} from "../../../utils";
import { ethers } from "ethers";
import { GaslessPaymaster } from "../../../typechain-types";

export default async function () {
  const wallet = getWallet(LOCAL_RICH_WALLETS[0].privateKey);
  const provider = getProvider();

  const paymaster = await deployPaymaster(wallet);

  // Supplying paymaster with ETH
  await (
    await wallet.sendTransaction({
      to: paymaster.target,
      value: ethers.parseEther("0.005"),
    })
  ).wait();

  let paymasterBalance = await provider.getBalance(paymaster.target.toString());
  console.log(
    `\nPaymaster ETH balance is now ${ethers.formatEther(
      paymasterBalance.toString()
    )}`
  );
}

export async function deployPaymaster(
  wallet: Wallet,
  silent = false
): Promise<GaslessPaymaster> {
  const contractArtifactName = "GaslessPaymaster";
  const contract = (await deployContract(contractArtifactName, [], {
    wallet,
    silent: true,
  })) as unknown as GaslessPaymaster;

  !silent
    ? console.log(
        `GaslessPaymaster contract deployed at ${await contract.getAddress()}`
      )
    : null;

  return contract;
}
