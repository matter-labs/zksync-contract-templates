// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "forge-std/Test.sol";
import "forge-std/console.sol";
import "../src/CrowdfundingCampaign.sol";

contract CrowdfundingCampaignTest is Test {
    CrowdfundingCampaign campaign;
    event GoalReached(uint256 totalFundsRaised);
    address owner;
    address addr1;
    address addr2;

    function setUp() public {
        owner = address(this);
        
        addr1 = vm.addr(1);
        addr2 = vm.addr(2);

        campaign = new CrowdfundingCampaign(1 ether);
        console.log("CrowdfundingCampaign deployed at: %s", address(campaign));
    }

    function test_RejectZeroContributions() public {
        vm.expectRevert("Contribution must be greater than 0");
        campaign.contribute{value: 0}();
    }

    function test_AggregateContributions() public {
        uint256 initialTotal = campaign.getTotalFundsRaised();

        vm.prank(addr1);
        vm.deal(addr1, 2 ether);
        campaign.contribute{value: 0.5 ether}();

        vm.prank(addr2);
        vm.deal(addr2, 2 ether);
        campaign.contribute{value: 0.3 ether}();

        assertEq(campaign.getTotalFundsRaised(), initialTotal + 0.8 ether);
    }

    function test_EmitGoalReachedWhenFundingGoalMet() public {    
        vm.prank(addr1);
        vm.deal(addr1, 2 ether);
        vm.expectEmit(true, true, false, true);
        emit GoalReached(1 ether);
        campaign.contribute{value: 1 ether}();        
    }
}
