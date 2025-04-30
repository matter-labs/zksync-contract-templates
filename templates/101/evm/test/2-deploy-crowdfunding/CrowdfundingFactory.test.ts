import "@nomicfoundation/hardhat-chai-matchers";
import { expect } from "chai";
import { ethers, type Signer } from "ethers";
import { CrowdfundingFactory } from "../../typechain-types";
import hre from "hardhat";

describe("CrowdfundingFactory", function () {
  let factory: CrowdfundingFactory;
  let owner: Signer, addr1: Signer;

  beforeEach(async function () {
    const signers = await hre.ethers.getSigners();
    owner = signers[0];
    addr1 = signers[1];

    const contractFactory = await hre.ethers.getContractFactory("CrowdfundingFactory");
    const contract = await contractFactory.deploy();
    factory = contract as unknown as CrowdfundingFactory;
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
