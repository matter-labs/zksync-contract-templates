import { expect } from "chai";
import { ethers } from "hardhat";
import { getWallet, LOCAL_RICH_WALLETS, getProvider } from "../../utils";
import {
  ApprovalFlowPaymaster,
  CrowdfundingCampaign,
  CrownToken,
} from "../../typechain-types";
import { Contract, Provider, utils, Wallet } from "zksync-ethers";
import { deployCrowdfundContract } from "../../deploy/4-paymaster/gasless/interact";
import * as hre from "hardhat";
import { Deployer } from "@matterlabs/hardhat-zksync";
import {
  deployCrownToken,
  deployPaymaster,
} from "../../deploy/4-paymaster/approval/deploy";

describe("ApprovalPaymaster", function () {
  let campaign: CrowdfundingCampaign;
  let token: CrownToken;
  let paymaster: ApprovalFlowPaymaster;
  let owner: Wallet, addr1: Wallet;
  let provider: Provider;
  let contributionAmount: bigint;
  let deployer: Deployer;
  let startingBalance: bigint;

  beforeEach(async function () {
    owner = getWallet(LOCAL_RICH_WALLETS[0].privateKey);
    addr1 = getWallet(LOCAL_RICH_WALLETS[1].privateKey);
    contributionAmount = ethers.parseEther("0.01");
    startingBalance = await addr1.getBalance();

    provider = getProvider();
    deployer = new Deployer(hre, owner);

    token = await deployCrownToken(owner, true);
    paymaster = await deployPaymaster(owner, token, true);
    campaign = await deployCrowdfundContract(owner);

    await owner.sendTransaction({
      to: paymaster.target,
      value: ethers.parseEther("0.005"),
    });
    await token.connect(owner).mint(await addr1.getAddress(), "1");
    await token.connect(owner).mint(await paymaster.getAddress(), "3");
  });

  it("paymaster has a balance of 0.005 ETH", async function () {
    const balance = await provider.getBalance(await paymaster.getAddress());
    expect(balance).to.equal(ethers.parseEther("0.005"));
  });

  it("paymaster has a balance of 3 CROWN", async function () {
    const balance = await provider.getBalance(
      await paymaster.getAddress(),
      "latest",
      await token.getAddress()
    );
    expect(balance).to.equal(3);
  });

  it("contributor has a balance of 1 CROWN", async function () {
    const balance = await provider.getBalance(
      await addr1.getAddress(),
      "latest",
      await token.getAddress()
    );
    expect(balance).to.equal(1);
  });

  describe("contributing with paymaster", function () {
    let contract: Contract;

    beforeEach(async function () {
      const contractArtifact = await deployer.loadArtifact(
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
        await token.getAddress(),
        contributionAmount,
        provider
      );

      const balance = await provider.getBalance(
        await paymaster.getAddress(),
        "latest",
        await token.getAddress()
      );
      expect(balance).to.equal(4);
      expect(
        (await provider.getBalance(await campaign.getAddress())).toString()
      ).to.equal(contributionAmount);
    });

    it("contributor only spends for contribution", async function () {
      await contribute(
        contract,
        await paymaster.getAddress(),
        await token.getAddress(),
        contributionAmount,
        provider
      );
      const updatedBalance = startingBalance - contributionAmount;
      expect(await addr1.getBalance()).to.equal(updatedBalance.toString());
    });

    it("contributor pays gas with CROWN", async function () {
      await contribute(
        contract,
        await paymaster.getAddress(),
        await token.getAddress(),
        contributionAmount,
        provider
      );
      const balance = await provider.getBalance(
        await addr1.getAddress(),
        "latest",
        await token.getAddress()
      );
      expect(balance).to.equal(0);
    });
  });
});

async function contribute(
  campaign: Contract,
  paymasterAddress: string,
  tokenAddress: string,
  contributionAmount: bigint,
  provider: Provider
) {
  // Get paymaster params for the ApprovalBased paymaster
  const paymasterParams = utils.getPaymasterParams(paymasterAddress, {
    type: "ApprovalBased",
    token: tokenAddress,
    minimalAllowance: 1n,
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
