// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "forge-std/Script.sol";
import "forge-std/console.sol";
import "../src/CrowdfundFactory.sol";
import "../src/CrowdfundingCampaign.sol";

contract DeployFactoryAndCreateCampaign is Script {
    function run() external {
        vm.startBroadcast();

        // Deploy the CrowdfundingFactory contract
        CrowdfundingFactory factory = new CrowdfundingFactory();

        // Log the factory's address
        console.log("CrowdfundingFactory deployed at: %s", address(factory));

        // Define the funding goal for the new campaign
        uint256 fundingGoalInWei = 0.01 ether;

        // Use the factory to create a new CrowdfundingCampaign
        factory.createCampaign(fundingGoalInWei);

        // Not sure how to get the address of the new campaign
        // TODO: Log the address of the new campaign

        vm.stopBroadcast();
    }
}
