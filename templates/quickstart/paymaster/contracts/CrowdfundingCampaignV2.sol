// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/proxy/utils/Initializable.sol";

contract CrowdfundingCampaignV2 is Initializable {
    address public owner;
    uint256 public fundingGoal;
    uint256 public totalFundsRaised;
    mapping(address => uint256) public contributions;

    uint256 public deadline;
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
    
    modifier withinDeadline() {
        require(block.timestamp <= deadline, "Funding period has ended");
        _;
    }

    function contribute() public payable withinDeadline {
        require(msg.value > 0, "Contribution must be greater than 0");
        contributions[msg.sender] += msg.value;
        totalFundsRaised += msg.value;

        emit ContributionReceived(msg.sender, msg.value);

        if (totalFundsRaised >= fundingGoal) {
            emit GoalReached(totalFundsRaised);
        }
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

    function extendDeadline(uint256 _newDuration) public {
        require(msg.sender == owner, "Only the owner can extend the deadline");
        deadline = block.timestamp + _newDuration;
    }    
}
