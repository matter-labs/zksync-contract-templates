import { expect } from 'chai';
import { ethers } from 'hardhat';

describe('Greeter', function () {
  it("Should return the new greeting once it's changed", async function () {
    
    // Get contract factory and deploy
    const Greeter = await ethers.getContractFactory("Greeter");
    const greeting = "Hello world!";
    const greeter = await Greeter.deploy(greeting);

    expect(await greeter.greeting()).to.eq(greeting);

    const newGreeting = "Hola, mundo!";
    const setGreetingTx = await greeter.set_greeting(newGreeting);
    
    // wait until the transaction is processed
    await setGreetingTx.wait();

    expect(await greeter.greeting()).to.equal(newGreeting);
  });
});
