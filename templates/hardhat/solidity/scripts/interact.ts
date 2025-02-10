// Script that interacts with a Greeter contract
import { ethers } from 'hardhat';

// Address of the contract to interact with
const CONTRACT_ADDRESS = "";
if (!CONTRACT_ADDRESS) throw "⛔️ Provide address of the contract to interact with!";

async function main() {
  console.log(`Running script to interact with contract ${CONTRACT_ADDRESS}`);

  // Get the first signer
  const [signer] = await ethers.getSigners();
  
  // Get the contract factory and deploy
  const Greeter = await ethers.getContractFactory("Greeter");
  const greeterContract = Greeter.connect(signer).attach(CONTRACT_ADDRESS);

  // Run contract read function
  const response = await greeterContract.greet();
  console.log(`Current message is: ${response}`);

  // Run contract write function
  const transaction = await greeterContract.setGreeting("Hello people!");
  console.log(`Transaction hash of setting new message: ${transaction.hash}`);

  // Wait until transaction is processed
  await transaction.wait();

  // Read message after transaction
  console.log(`The message now is: ${await greeterContract.greet()}`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
