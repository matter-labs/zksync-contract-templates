// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

contract CrowdfundingCampaignV2_UUPS is Initializable, UUPSUpgradeable, OwnableUpgradeable {
    uint256 public fundingGoal;
    uint256 public totalFundsRaised;
    mapping(address => uint256) public contributions;

    uint256 public deadline;

    event ContributionReceived(address contributor, uint256 amount);
    event GoalReached(uint256 totalFundsRaised);

    // Initialization function for V1 remains unchanged
    function initialize(uint256 _fundingGoal) public initializer {
        fundingGoal = _fundingGoal;
    }

    // New initialization function for V2
    function initializeV2(uint256 _duration) public onlyOwner {
        require(deadline == 0, "V2 already initialized");

        deadline = block.timestamp + _duration;
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

    function withdrawFunds() public onlyOwner {
        require(totalFundsRaised >= fundingGoal, "Funding goal not reached");

        uint256 amount = address(this).balance;
        totalFundsRaised = 0;

        (bool success, ) = payable(owner()).call{value: amount}("");
        require(success, "Transfer failed.");
    }

    function getTotalFundsRaised() public view returns (uint256) {
        return totalFundsRaised;
    }

    function getFundingGoal() public view returns (uint256) {
        return fundingGoal;
    }

    function extendDeadline(uint256 _newDuration) public onlyOwner {
        deadline = block.timestamp + _newDuration;
    }    

    // UUPS upgrade authorization function
    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}
}
