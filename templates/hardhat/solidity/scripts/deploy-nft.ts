// Script that deploys a given contract to a network
async function main() {
  
  const CONTRACT_NAME = 'MyNFT';
  console.log(`Deploying ${CONTRACT_NAME} contract to ${hre.network.name}`);

  const [signer] = await hre.ethers.getSigners();
  if (!signer) {
    throw new Error(
      "⛔️ No signer found in the current network configuration!"
    );
  }
  const name = "My new NFT";
  const symbol = "MYNFT";
  const baseTokenURI = "https://mybaseuri.com/token/";
  const initialOwner = signer.address;

  const contract = await hre.ethers.deployContract(CONTRACT_NAME, [name, symbol, baseTokenURI, initialOwner], {});
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
