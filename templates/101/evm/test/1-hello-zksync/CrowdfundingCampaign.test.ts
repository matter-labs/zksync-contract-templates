import { expect } from "chai";
import { ethers, type Signer } from "ethers";
import { CrowdfundingCampaign } from "../../typechain-types";
import hre from "hardhat";

describe("CrowdfundingCampaign", function () {
  let campaign: CrowdfundingCampaign;
  let owner: Signer, addr1: Signer, addr2: Signer;

  beforeEach(async function () {
    const signers = await hre.ethers.getSigners();
    owner = signers[0];
    addr1 = signers[1];
    addr2 = signers[2];
    const fundingGoalInWei = ethers.parseEther("1").toString();
    const contractFactory = await hre.ethers.getContractFactory("CrowdfundingCampaign");
    const contract = await contractFactory.deploy(fundingGoalInWei);

    campaign = contract as unknown as CrowdfundingCampaign;
  });

  describe("contribute", function () {
    it("should reject contributions of 0", async function () {
      await expect(
        campaign.connect(addr1).contribute({ value: ethers.parseEther("0") })
      ).to.be.revertedWith("Contribution must be greater than 0");
    });

    it("should aggregate contributions in totalFundsRaised", async function () {
      await campaign
        .connect(addr1)
        .contribute({ value: ethers.parseEther("0.5") });
      await campaign
        .connect(addr2)
        .contribute({ value: ethers.parseEther("0.3") });
      expect(await campaign.getTotalFundsRaised()).to.equal(
        ethers.parseEther("0.8")
      );
    });

    it("should emit GoalReached event when funding goal is met", async function () {
      await expect(
        campaign.connect(addr1).contribute({ value: ethers.parseEther("1") })
      )
        .to.emit(campaign, "GoalReached")
        .withArgs(ethers.parseEther("1"));
    });
  });

  describe("withdrawFunds", function () {
    it("should revert if called by a non-owner", async function () {
      await expect(campaign.connect(addr1).withdrawFunds()).to.be.revertedWith(
        "Only the owner can withdraw funds"
      );
    });

    it("should revert if funding goal hasn't been reached", async function () {
      await expect(campaign.connect(owner).withdrawFunds()).to.be.revertedWith(
        "Funding goal not reached"
      );
    });

    it("should transfer the funds to the owner when funds have been raised", async function () {
      await campaign.connect(addr1).contribute({ value: 500000000000000000n });
      await campaign.connect(addr2).contribute({ value: 500000000000000000n });

      const ownerAddress = await owner.getAddress();
      const initialBalance = await hre.ethers.provider.getBalance(ownerAddress);

      await campaign.connect(owner).withdrawFunds();
      const finalBalance = await hre.ethers.provider.getBalance(ownerAddress);
      expect(ethers.formatEther(finalBalance - initialBalance)).to.match(
        /0\.999/
      );
    });
  });

  describe("getFundingGoal", function () {
    it("should return the correct funding goal", async function () {
      const fundingGoal = await campaign.getFundingGoal();
      expect(fundingGoal).to.equal(ethers.parseEther("1"));
    });
  });

  describe("getTotalFundsRaised", function () {
    it("should return 0 when no contributions have been made", async function () {
      const totalFundsRaised = await campaign.getTotalFundsRaised();
      expect(totalFundsRaised).to.equal(ethers.parseEther("0"));
    });
  });
});
