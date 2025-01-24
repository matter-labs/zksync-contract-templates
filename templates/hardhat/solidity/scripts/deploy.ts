// Script that deploys a given contract to a network
async function main() {
  const CONTRACT_NAME = 'Greeter';
  const ARGS = ['Hi there!'];
  console.log(`Deploying ${CONTRACT_NAME} contract to ${hre.network.name}`);
  const contract = await hre.ethers.deployContract(CONTRACT_NAME, ARGS, {});
  await contract.waitForDeployment();
  const contractAddress = await contract.getAddress();
  console.log(`${CONTRACT_NAME} deployed to ${contractAddress}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
