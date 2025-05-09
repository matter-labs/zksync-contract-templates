import { ethers } from "hardhat";
import { expect } from "chai";
import { Contract, Signer } from "zksync-ethers";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("MyNFT", function () {
  let nftContract: Contract;
  let owner: HardhatEthersSigner;
  let recipient: HardhatEthersSigner;

  before(async function () {
    // Get signers using hardhat-ethers
    [owner, recipient] = await ethers.getSigners();

    // Get contract factory and deploy
    const MyNFT = await ethers.getContractFactory("MyNFT");
    nftContract = await MyNFT.deploy(
      "MyNFTName",
      "MNFT",
      "https://mybaseuri.com/token/",
      owner.address
    );
    await nftContract.waitForDeployment();
  });

  it("Should deploy with correct name and symbol", async function () {
    expect(await nftContract.name()).to.equal("MyNFTName");
    expect(await nftContract.symbol()).to.equal("MNFT");
  });

  it("Should mint a new NFT to the recipient", async function () {
    const tx = await nftContract.mint(recipient.address);
    await tx.wait();
    const balance = await nftContract.balanceOf(recipient.address);
    expect(balance).to.equal(BigInt("1"));
  });

  it("Should have correct token URI after minting", async function () {
    const tokenId = 0; // Assuming the first token minted has ID 1
    const tokenURI = await nftContract.tokenURI(tokenId);
    expect(tokenURI).to.equal("https://mybaseuri.com/token/0");
  });

  it("Should allow owner to mint multiple NFTs", async function () {
    const tx1 = await nftContract.mint(recipient.address);
    await tx1.wait();
    const tx2 = await nftContract.mint(recipient.address);
    await tx2.wait();
    const balance = await nftContract.balanceOf(recipient.address);
    expect(balance).to.equal(BigInt("3")); // 1 initial nft + 2 minted
  });

  it("Should not allow non-owner to mint NFTs", async function () {
    try {
      const tx3 = await (nftContract.connect(recipient) as Contract).mint(
        recipient.address
      );
      await tx3.wait();
      expect.fail("Expected mint to revert, but it didn't");
    } catch (error) {
      if (error instanceof Error) {
        expect(error.message).to.include("execution reverted");
      } else {
        expect.fail("Expected an Error object, but got something else");
      }
    }
  });
});
