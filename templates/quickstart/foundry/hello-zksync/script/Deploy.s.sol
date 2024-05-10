// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "forge-std/Script.sol";
import "../src/Crowdfund.sol";

contract DeployCrowdfundContract is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("WALLET_PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        uint256 fundingGoalInWei = 0.02 ether;
        new CrowdfundingCampaign(fundingGoalInWei);

        vm.stopBroadcast();
    }
}
