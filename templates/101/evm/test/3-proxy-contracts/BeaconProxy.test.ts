import { expect } from "chai";
import { ethers, type Signer } from "ethers";
import * as hre from "hardhat";
import {
  BeaconCrowdfundingCampaign,
  V2_BeaconCrowdfundingCampaign,
} from "../../typechain-types";

describe("Beacon Proxy Campaign", function () {
  let campaign: BeaconCrowdfundingCampaign;
  let owner: Signer, addr1: Signer;
  let beacon: ethers.Contract;

  beforeEach(async () => {
    const signers = await hre.ethers.getSigners();
    owner = signers[0];
    addr1 = signers[1];

    const contractFactory = await hre.ethers.getContractFactory("BeaconCrowdfundingCampaign");
    beacon = await hre.upgrades.deployBeacon(contractFactory);
    await beacon.waitForDeployment();
    const fundingGoalInWei = ethers.parseEther("0.777").toString();
    campaign  = await hre.upgrades.deployBeaconProxy(beacon, contractFactory, [
        fundingGoalInWei,
      ]);
    campaign.waitForDeployment();
  });

  describe("V1", function () {
    it("has a funding goal of 0.777 ETH", async function () {
      expect(await campaign.getFundingGoal()).to.equal(
        ethers.parseEther("0.777").toString()
      );
    });

    it("does not allow initialize to be called more than once", async function () {
      await expect(
        campaign.initialize(ethers.parseEther("1").toString())
      ).to.be.revertedWith("Initializable: contract is already initialized");
    });
  });

  describe("V2", function () {
    let v2Campaign: V2_BeaconCrowdfundingCampaign;
    let blockTimestamp: number;
    const durationInSeconds = 1800; // 5 hours

    beforeEach(async () => {
      const campaignAddress = await campaign.getAddress();

      const contractV2Factory = await hre.ethers.getContractFactory("V2_BeaconCrowdfundingCampaign");

      beacon = await hre.upgrades.upgradeBeacon(beacon, contractV2Factory);

      const upgradedContract = contractV2Factory.attach(campaignAddress);
      v2Campaign = upgradedContract as unknown as V2_BeaconCrowdfundingCampaign;

      // wait some time before the next call
      await new Promise((resolve) => setTimeout(resolve, 0));

      // Initialize V2 with a new campaign duration
      const transaction = await v2Campaign.initializeV2(durationInSeconds);
      const receipt = await transaction.wait();
      blockTimestamp = (await receipt?.getBlock())?.timestamp || 0;
    });

    it("does not allow initializeV2 to be run more than once", async () => {
      await expect(
        v2Campaign.initializeV2(durationInSeconds)
      ).to.be.revertedWith("V2 already initialized");
    });

    it("has a deadline", async () => {
      expect(await v2Campaign.deadline()).to.equal(
        blockTimestamp + durationInSeconds
      );
    });

    it("only allows the owner to update the deadline", async () => {
      await expect(
        v2Campaign.connect(addr1).extendDeadline(durationInSeconds)
      ).to.be.revertedWith("Only the owner can extend the deadline");
    });
  });
});
