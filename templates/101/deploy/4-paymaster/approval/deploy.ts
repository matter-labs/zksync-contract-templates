import { Wallet } from "zksync-ethers";
import {
  deployContract,
  getWallet,
  getProvider,
  LOCAL_RICH_WALLETS,
} from "../../../utils";
import { BaseContract, ethers } from "ethers";
import { ApprovalFlowPaymaster, CrownToken } from "../../../typechain-types";

export default async function () {
  const wallet = getWallet(LOCAL_RICH_WALLETS[0].privateKey);
  const provider = getProvider();

  const crownToken = await deployCrownToken(wallet);

  const paymaster = await deployPaymaster(wallet, crownToken);

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

export async function deployCrownToken(
  wallet: Wallet,
  quiet = false
): Promise<CrownToken> {
  const contractArtifactName = "CrownToken";
  const contract = (await deployContract(contractArtifactName, [], {
    wallet,
    silent: true,
  })) as unknown as CrownToken;

  !quiet
    ? console.log(
        `\nCrownToken contract deployed at ${await contract.getAddress()}`
      )
    : null;

  return contract;
}

export async function deployPaymaster(
  wallet: Wallet,
  _tokenAddress: BaseContract,
  quiet = false
): Promise<ApprovalFlowPaymaster> {
  const contractArtifactName = "ApprovalFlowPaymaster";
  const tokenAddress = await _tokenAddress.getAddress();
  const contract = (await deployContract(contractArtifactName, [tokenAddress], {
    wallet,
    silent: true,
  })) as unknown as ApprovalFlowPaymaster;

  !quiet
    ? console.log(
        `ApprovalFlowPaymaster contract deployed at ${await contract.getAddress()}`
      )
    : null;

  return contract;
}
