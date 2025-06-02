import { expect } from "chai";
import { Contract, ethers } from "ethers";
import { getWallet, LOCAL_RICH_WALLETS } from "../../utils";
import { Wallet } from "zksync-ethers";
import { Deployer } from "@matterlabs/hardhat-zksync";
import * as hre from "hardhat";
import * as zk from "zksync-ethers";
import fs from "fs";
import path from "path";
import {
  BeaconCrowdfundingCampaign,
  V2_BeaconCrowdfundingCampaign,
} from "../../typechain-types";

describe("Beacon Proxy Campaign", function () {
  let campaign: BeaconCrowdfundingCampaign;
  let owner: Wallet, addr1: Wallet;
  let beacon: ethers.Contract;

  beforeEach(async () => {
    owner = getWallet(LOCAL_RICH_WALLETS[0].privateKey);
    addr1 = getWallet(LOCAL_RICH_WALLETS[1].privateKey);
    const deployer = new Deployer(hre, owner);
    const contractArtifact = await deployer.loadArtifact(
      "BeaconCrowdfundingCampaign"
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

    const fundingGoalInWei = ethers.parseEther("0.777").toString();
    beacon = await hre.zkUpgrades.deployBeacon(
      deployer.zkWallet,
      contractArtifact,
      [],
      {},
      true
    );
    await beacon.waitForDeployment();
    campaign = (await hre.zkUpgrades.deployBeaconProxy(
      deployer.zkWallet,
      await beacon.getAddress(),
      contractArtifact,
      [fundingGoalInWei],
      {},
      true
    )) as unknown as BeaconCrowdfundingCampaign;
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
      ).to.be.reverted;
    });
  });

  describe("V2", function () {
    let v2Campaign: V2_BeaconCrowdfundingCampaign;
    let blockTimestamp: number;
    const durationInSeconds = 1800; // 5 hours

    beforeEach(async () => {
      const campaignAddress = await campaign.getAddress();
      const deployer = new Deployer(hre, owner);

      const contractV2Artifact = await deployer.loadArtifact(
        "V2_BeaconCrowdfundingCampaign"
      );

      beacon = await hre.zkUpgrades.upgradeBeacon(
        deployer.zkWallet,
        await beacon.getAddress(),
        contractV2Artifact,
        {},
        true
      );

      const attachTo = new zk.ContractFactory<any[], Contract>(
        contractV2Artifact.abi,
        contractV2Artifact.bytecode,
        deployer.zkWallet
      );
      const attachment = attachTo.attach(campaignAddress);
      v2Campaign = attachment.connect(
        deployer.zkWallet
      ) as unknown as V2_BeaconCrowdfundingCampaign;
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
