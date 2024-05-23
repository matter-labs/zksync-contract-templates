// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "forge-std/Script.sol";
import "../src/Crowdfund.sol";

contract DeployCrowdfundContract is Script {
    function run() external {
        vm.startBroadcast();

        uint256 fundingGoalInWei = 0.02 ether;
        new CrowdfundingCampaign(fundingGoalInWei);

        vm.stopBroadcast();
    }
}
