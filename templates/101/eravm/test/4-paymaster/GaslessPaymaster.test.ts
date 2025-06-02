import { expect } from "chai";
import { ethers } from "hardhat";
import { getWallet, LOCAL_RICH_WALLETS, getProvider } from "../../utils";
import { CrowdfundingCampaign, GaslessPaymaster } from "../../typechain-types";
import { Contract, Provider, utils, Wallet } from "zksync-ethers";
import { deployCrowdfundContract, deployGeneralPaymaster  } from "../../utils"
import * as hre from "hardhat";
import { Deployer } from "@matterlabs/hardhat-zksync";

describe("GaslessPaymaster", function () {
  let campaign: CrowdfundingCampaign;
  let paymaster: GaslessPaymaster;
  let owner: Wallet, addr1: Wallet;
  let provider: Provider;
  let contributionAmount: bigint;
  let startingBalance: bigint;

  beforeEach(async function () {
    owner = getWallet(LOCAL_RICH_WALLETS[0].privateKey);
    addr1 = getWallet(LOCAL_RICH_WALLETS[1].privateKey);
    provider = getProvider();
    contributionAmount = ethers.parseEther("0.01");
    startingBalance = await addr1.getBalance();
    paymaster = await deployGeneralPaymaster(owner);
    campaign = await deployCrowdfundContract(owner);

    // fund the paymaster
    await owner.sendTransaction({
      to: await paymaster.getAddress(),
      value: ethers.parseEther("0.077"),
    });
  });

  it("has a balance of 0.077 ETH", async function () {
    const balance = await provider.getBalance(await paymaster.getAddress());
    expect(balance).to.equal(ethers.parseEther("0.077"));
  });

  it("contributor has a starting balance", async function () {
    expect(await addr1.getBalance()).to.equal(startingBalance.toString());
  });

  describe("contributing with paymaster", function () {
    let contract: Contract;

    beforeEach(async function () {
      const contractArtifact = await hre.artifacts.readArtifact(
        "CrowdfundingCampaign"
      );
      contract = new ethers.Contract(
        await campaign.getAddress(),
        contractArtifact.abi,
        addr1
      );
    });

    it("pays for contributions", async function () {
      await contribute(
        contract,
        await paymaster.getAddress(),
        contributionAmount,
        provider
      );
      expect(
        await provider.getBalance(await paymaster.getAddress())
      ).to.be.lessThan(ethers.parseEther("0.077"));
      expect(
        (await provider.getBalance(await campaign.getAddress())).toString()
      ).to.equal(contributionAmount);
    });

    it("contributor only pays contribution amount", async function () {
      await contribute(
        contract,
        await paymaster.getAddress(),
        contributionAmount,
        provider
      );
      const updatedBalance = startingBalance - contributionAmount;
      expect(await addr1.getBalance()).to.equal(updatedBalance.toString());
    });
  });
});

async function contribute(
  campaign: Contract,
  paymasterAddress: string,
  contributionAmount: bigint,
  provider: Provider
) {
  // Get paymaster params for the Gasless paymaster
  const paymasterParams = utils.getPaymasterParams(paymasterAddress, {
    type: "General",
    innerInput: new Uint8Array(),
  });
  // Determine the gas limit for the contribution transaction
  const gasLimit = await campaign.contribute.estimateGas({
    value: contributionAmount,
    customData: {
      gasPerPubdata: utils.DEFAULT_GAS_PER_PUBDATA_LIMIT,
      paymasterParams: paymasterParams,
    },
  });
  // Contribute to the crowdfund contract
  // and have the paymaster cover the funds
  const transaction = await campaign.contribute({
    value: contributionAmount,
    maxPriorityFeePerGas: 0n,
    maxFeePerGas: await provider.getGasPrice(),
    gasLimit,
    // Pass the paymaster params as custom data
    customData: {
      gasPerPubdata: utils.DEFAULT_GAS_PER_PUBDATA_LIMIT,
      paymasterParams,
    },
  });

  return await transaction.wait();
}
