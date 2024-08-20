// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/proxy/utils/Initializable.sol";

// The BeaconCrowdfundingCampaign contract implements
// the Initializable interface from OpenZeppelin
contract V2_BeaconCrowdfundingCampaign is Initializable {
    address public owner;
    uint256 private fundingGoal;
    uint256 private totalFundsRaised;
    mapping(address => uint256) private contributions;

    // In V2 we add a deadline for the campaign
    uint256 public deadline;
    // We also add a flag to check if the V2 contract has been initialized
    bool private initializedV2;

    event ContributionReceived(address contributor, uint256 amount);
    event GoalReached(uint256 totalFundsRaised);

    // Original initialization function for V1
    function initialize(uint256 _fundingGoal) public initializer {
        owner = msg.sender;
        fundingGoal = _fundingGoal;
    }

    // Additional initialization function for V2
    function initializeV2(uint256 _duration) public {
        require(!initializedV2, "V2 already initialized");
        require(msg.sender == owner, "Only the owner can initialize V2");

        deadline = block.timestamp + _duration;
        initializedV2 = true;
    }

    // Modifier to check if the campaign is still within the deadline
    // A modifier is a function that is executed
    // before the function that uses it
    modifier withinDeadline() {
        require(block.timestamp <= deadline, "Funding period has ended");
        _;
    }

    // We use the `withinDeadline` modifier to ensure
    // that contributions are only accepted within the deadlin
    function contribute() public payable withinDeadline {
        require(msg.value > 0, "Contribution must be greater than 0");
        contributions[msg.sender] += msg.value;
        totalFundsRaised += msg.value;

        emit ContributionReceived(msg.sender, msg.value);

        if (totalFundsRaised >= fundingGoal) {
            emit GoalReached(totalFundsRaised);
        }
    }

    // We add a new function to extend the deadline
    // only by the owner of the campaign
    function extendDeadline(uint256 _newDuration) public {
        require(msg.sender == owner, "Only the owner can extend the deadline");
        deadline = block.timestamp + _newDuration;
    }

    function withdrawFunds() public {
        require(msg.sender == owner, "Only the owner can withdraw funds");
        require(totalFundsRaised >= fundingGoal, "Funding goal not reached");

        uint256 amount = address(this).balance;
        totalFundsRaised = 0;

        (bool success, ) = payable(owner).call{value: amount}("");
        require(success, "Transfer failed.");
    }

    function getTotalFundsRaised() public view returns (uint256) {
        return totalFundsRaised;
    }

    function getFundingGoal() public view returns (uint256) {
        return fundingGoal;
    }
}
