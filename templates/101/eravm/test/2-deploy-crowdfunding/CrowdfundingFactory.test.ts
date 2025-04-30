import "@nomicfoundation/hardhat-chai-matchers";
import { expect } from "chai";
import { ethers } from "ethers";
import { getWallet, LOCAL_RICH_WALLETS, deployContract } from "../../utils";
import { CrowdfundingFactory } from "../../typechain-types";
import { Wallet } from "zksync-ethers";

describe("CrowdfundingFactory", function () {
  let factory: CrowdfundingFactory;
  let owner: Wallet, addr1: Wallet;

  beforeEach(async function () {
    owner = getWallet(LOCAL_RICH_WALLETS[0].privateKey);
    addr1 = getWallet(LOCAL_RICH_WALLETS[1].privateKey);
    factory = (await deployContract("CrowdfundingFactory", [], {
      wallet: owner,
      silent: true,
    })) as unknown as CrowdfundingFactory;
  });

  describe("createCampaign", function () {
    it("should create a new CrowdfundingCampaign", async function () {
      const fundingGoalInWei = ethers.parseEther("1").toString();
      const createTx = await factory.createCampaign(fundingGoalInWei);
      await createTx.wait();

      const [event] = await factory.queryFilter(
        factory.filters.CampaignCreated()
      );

      const campaigns = await factory.getCampaigns();
      const newCampaignAddress = campaigns[campaigns.length - 1];

      expect(newCampaignAddress).to.equal(event.args[0]);
    });

    it("should emit a CampaignCreated event", async function () {
      const fundingGoalInWei = ethers.parseEther("1").toString();
      const createTx = await factory.createCampaign(fundingGoalInWei);
      await createTx.wait();

      const [event] = await factory.queryFilter(
        factory.filters.CampaignCreated()
      );

      expect(event.args[0]).to.be.properAddress;
      expect(event.args[1]).to.equal(fundingGoalInWei);
    });
  });
});
