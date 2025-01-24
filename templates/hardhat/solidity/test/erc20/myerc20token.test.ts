import { expect } from "chai";
import * as hre from "hardhat";
import { Contract } from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

describe("MyERC20Token", function () {
  let tokenContract: Contract;
  let owner: SignerWithAddress;
  let user: SignerWithAddress;

  before(async function () {
    // Get signers using hardhat-ethers
    [owner, user] = await hre.ethers.getSigners();

    // Get contract factory and deploy
    const MyERC20Token = await hre.ethers.getContractFactory("MyERC20Token");
    tokenContract = await MyERC20Token.deploy();
    await tokenContract.waitForDeployment();
  });

  it("Should deploy with correct name and symbol", async function () {
    expect(await tokenContract.name()).to.equal("DefaultTokenName");
    expect(await tokenContract.symbol()).to.equal("DTN");
  });

  it("Should mint tokens to owner", async function () {
    const balance = await tokenContract.balanceOf(owner.address);
    expect(balance).to.equal(ethers.parseEther("1000000"));
  });

  it("Should allow user to transfer tokens", async function () {
    const transferAmount = hre.ethers.parseEther("50"); // Transfer 50 tokens
    const tx = await tokenContract.transfer(user.address, transferAmount);
    await tx.wait();
    const userBalance = await tokenContract.balanceOf(user.address);
    expect(userBalance).to.equal(transferAmount);
  });

  it("Should have correct initial supply", async function () {
    const initialSupply = await tokenContract.totalSupply();
    expect(initialSupply).to.equal(BigInt("1000000000000000000000000")); // 1 million tokens with 18 decimals
  });

  it("Should allow owner to burn tokens", async function () {
    const burnAmount = hre.ethers.parseEther("10"); // Burn 10 tokens
    const tx = await tokenContract.burn(burnAmount);
    await tx.wait();
    const afterBurnSupply = await tokenContract.totalSupply();
    expect(afterBurnSupply).to.equal(BigInt("999990000000000000000000")); // 999,990 tokens remaining
  });



  it("Should fail when user tries to burn more tokens than they have", async function () {
    const userTokenContract = new Contract(
      await tokenContract.getAddress(),
      tokenContract.interface,
      user
    );
    const burnAmount = hre.ethers.parseEther("999"); // Try to burn 100 tokens
    try {
      await userTokenContract.burn(burnAmount);
      expect.fail("Expected burn to revert, but it didn't");
    } catch (error) {
      if (error instanceof Error) {
        expect(error.message).to.include("execution reverted");
      } else {
        expect.fail("Expected an Error object, but got something else");
      }
    }
  });
});
