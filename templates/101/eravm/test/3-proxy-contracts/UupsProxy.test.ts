import { expect } from "chai";
import { ethers } from "ethers";
import { getWallet, LOCAL_RICH_WALLETS } from "../../utils";
import { Wallet } from "zksync-ethers";
import { Deployer } from "@matterlabs/hardhat-zksync";
import * as hre from "hardhat";
import {
  UUPSCrowdfundingCampaign,
  V2_UUPSCrowdfundingCampaign,
} from "../../typechain-types";
import fs from "fs";
import path from "path";

describe("UUPS Proxy Campaign", function () {
  let campaign: UUPSCrowdfundingCampaign;
  let owner: Wallet, addr1: Wallet;

  beforeEach(async () => {
    owner = getWallet(LOCAL_RICH_WALLETS[0].privateKey);
    addr1 = getWallet(LOCAL_RICH_WALLETS[1].privateKey);
    const deployer = new Deployer(hre, owner);
    const contractArtifact = await deployer.loadArtifact(
      "UUPSCrowdfundingCampaign"
    );

    // delete the .upgradable/ZKsync-anvil.json file
    // to ensure that the contract is deployed
    // from scratch
    const filePath = path.join(
      __dirname,
      "../../",
      ".upgradable/ZKsync-anvil.json"
    );

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    const fundingGoalInWei = ethers.parseEther("1").toString();
    campaign = (await hre.zkUpgrades.deployProxy(
      deployer.zkWallet,
      contractArtifact,
      [fundingGoalInWei],
      { initializer: "initialize" },
      true
    )) as unknown as UUPSCrowdfundingCampaign;
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
      const deployer = new Deployer(hre, owner);
      const contractV2Artifact = await deployer.loadArtifact(
        "V2_UUPSCrowdfundingCampaign"
      );

      v2campaign = (await hre.zkUpgrades.upgradeProxy(
        deployer.zkWallet,
        await campaign.getAddress(),
        contractV2Artifact,
        {},
        true
      )) as unknown as V2_UUPSCrowdfundingCampaign;

      // wait some time before the next call
      await new Promise((resolve) => setTimeout(resolve, 0));
      v2campaign.connect(deployer.zkWallet);

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
    //
    // it("only allows contributions before the deadline", async () => {
    //   await time.increase(durationInSeconds - 1);
    //   await expect(
    //     v2campaign.connect(addr1).contribute({ value: ethers.parseEther("1") })
    //   ).to.be.revertedWith("The deadline has passed");
    // });
  });
});
