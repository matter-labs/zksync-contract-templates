import { expect } from "chai";
import { ethers, Signer } from "ethers";
import * as hre from "hardhat";
import {
  UUPSCrowdfundingCampaign,
  V2_UUPSCrowdfundingCampaign,
} from "../../typechain-types";

describe("UUPS Proxy Campaign", function () {
  let campaign: UUPSCrowdfundingCampaign;
  let owner: Signer, addr1: Signer;

  beforeEach(async () => {
    const signers = await hre.ethers.getSigners();
    owner = signers[0];
    addr1 = signers[1];
    const contractFactory = await hre.ethers.getContractFactory("UUPSCrowdfundingCampaign");
    const fundingGoalInWei = ethers.parseEther("1").toString();
     const crowdfunding = await hre.upgrades.deployProxy(
      contractFactory,
        [fundingGoalInWei],
        { initializer: "initialize" }
      );

    campaign = crowdfunding as unknown as UUPSCrowdfundingCampaign;
    campaign.waitForDeployment();
  });

  describe("V1", function () {
    it("has a funding goal of 1 ETH", async function () {
      expect(await campaign.getFundingGoal()).to.equal(
        ethers.parseEther("1").toString()
      );
    });

    it("does not allow initialize to be called more than once", async function () {
      await expect(
        campaign.initialize(ethers.parseEther("1").toString())
      ).to.be.revertedWith("Initializable: contract is already initialized");
    });
  });

  describe("V2", function () {
    let v2campaign: V2_UUPSCrowdfundingCampaign;
    let blockTimestamp: number;
    const durationInSeconds = 1800; // 5 hours

    beforeEach(async () => {
      const campaignAddress = await campaign.getAddress();

       const contractV2factory = await hre.ethers.getContractFactory(
          "V2_UUPSCrowdfundingCampaign"
        );
      
        v2campaign = await hre.upgrades.upgradeProxy(
          campaignAddress,
          contractV2factory,
          { unsafeAllow: ['missing-initializer-call']}
        ) as unknown as V2_UUPSCrowdfundingCampaign;

      // wait some time before the next call
      await new Promise((resolve) => setTimeout(resolve, 0));

      // Initialize V2 with a new campaign duration
      const transaction = await v2campaign.initializeV2(durationInSeconds);
      const receipt = await transaction.wait();
      blockTimestamp = (await receipt?.getBlock())?.timestamp || 0;
    });

    it("has a deadline", async () => {
      expect(await v2campaign.deadline()).to.equal(
        blockTimestamp + durationInSeconds
      );
    });

    it("only allows the owner to update the deadline", async () => {
      await expect(
        v2campaign.connect(addr1).extendDeadline(durationInSeconds)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("does not allow initializeV2 to be run more than once", async () => {
      await expect(
        v2campaign.initializeV2(durationInSeconds)
      ).to.be.revertedWith("V2 already initialized");
    });

    // in-memory-node does not support time manipulation yet
    
    // it("only allows contributions before the deadline", async () => {
    //   await time.increase(durationInSeconds - 1);
    //   await expect(
    //     v2campaign.connect(addr1).contribute({ value: ethers.parseEther("1") })
    //   ).to.be.revertedWith("The deadline has passed");
    // });
  });
});
