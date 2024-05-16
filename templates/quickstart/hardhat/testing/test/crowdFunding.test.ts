import "@nomicfoundation/hardhat-chai-matchers";
import { expect } from "chai";
import { ethers } from "ethers";
import { getWallet, LOCAL_RICH_WALLETS, deployContract } from "../deploy/utils";

describe("CrowdfundingCampaign", function () {
  let campaign;
  let owner, addr1, addr2;

  beforeEach(async function () {
    owner = getWallet(LOCAL_RICH_WALLETS[0].privateKey);
    addr1 = getWallet(LOCAL_RICH_WALLETS[1].privateKey);
    addr2 = getWallet(LOCAL_RICH_WALLETS[2].privateKey);
    const fundingGoalInWei = ethers.parseEther('1').toString();
    campaign = await deployContract("CrowdfundingCampaign", [fundingGoalInWei], { wallet: owner, silent: true });
  });

  describe("Contribute", function () {
    it("should reject contributions of 0", async function () {
      await expect(campaign.connect(addr1).contribute({ value: ethers.parseEther("0") })).to.be.revertedWith("Contribution must be greater than 0");
    });

    it("should aggregate contributions in totalFundsRaised", async function () {
      await campaign.connect(addr1).contribute({ value: ethers.parseEther("0.5") });
      await campaign.connect(addr2).contribute({ value: ethers.parseEther("0.3") });
      expect(await campaign.getTotalFundsRaised()).to.equal(ethers.parseEther("0.8"));
    });

    it("should emit GoalReached event when funding goal is met", async function () {
      await expect(campaign.connect(addr1).contribute({ value: ethers.parseEther("1") }))
        .to.emit(campaign, "GoalReached")
        .withArgs(ethers.parseEther("1"));
    });
  });
});
