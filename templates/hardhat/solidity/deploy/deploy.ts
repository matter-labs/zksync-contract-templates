import { deployContract } from "./utils";
import { deployProxyContract } from "./proxy_utils";

/**
 * Deploy a contract, optionally through a proxy.
 * 
 * @param {boolean} useProxy - Whether to deploy through a proxy.
 */
export default async function deploy(useProxy = false) {
  const contractArtifactName = "Greeter";
  const constructorArguments = ["Hi there!"];

  if (useProxy) {
    console.log("Deploying through a proxy...");
    await deployProxyContract(contractArtifactName, constructorArguments);
  } else {
    console.log("Deploying directly...");
    await deployContract(contractArtifactName, constructorArguments);
  }

  console.log(`${contractArtifactName} deployed successfully.`);
}

