import { expect } from 'chai';

import * as hre from "hardhat";

describe('Greeter', function () {
  it("Should return the new greeting once it's changed", async function () {
    // Get contract factory and deploy
    const Greeter = await hre.ethers.getContractFactory("Greeter");
    const greeting = "Hello world!";
    const greeter = await Greeter.deploy(greeting);
    await greeter.waitForDeployment();

    expect(await greeter.greet()).to.eq(greeting);

    const newGreeting = "Hola, mundo!";
    const setGreetingTx = await greeter.setGreeting(newGreeting);
    
    // wait until the transaction is processed
    await setGreetingTx.wait();

    expect(await greeter.greet()).to.equal(newGreeting);
  });
});
