// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

contract V2_UUPSCrowdfundingCampaign is
    Initializable,
    UUPSUpgradeable,
    OwnableUpgradeable
{
    uint256 private fundingGoal;
    uint256 private totalFundsRaised;
    mapping(address => uint256) private contributions;

    // In V2 we add a deadline for the campaign
    uint256 public deadline;
    // We add a flag to check if the V2 contract has been initialized
    bool private initializedV2;

    event ContributionReceived(address contributor, uint256 amount);
    event GoalReached(uint256 totalFundsRaised);

    // The original initialize function remains unchanged
    function initialize(uint256 _fundingGoal) public initializer {
        fundingGoal = _fundingGoal;
    }

    // The upgrade initialization function for V2
    function initializeV2(uint256 _duration) public onlyOwner {
        require(!initializedV2, "V2 already initialized");

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
    // that contributions are only accepted within the deadline
    function contribute() public payable withinDeadline {
        require(msg.value > 0, "Contribution must be greater than 0");
        contributions[msg.sender] += msg.value;
        totalFundsRaised += msg.value;

        emit ContributionReceived(msg.sender, msg.value);

        if (totalFundsRaised >= fundingGoal) {
            emit GoalReached(totalFundsRaised);
        }
    }

    // We override the _authorizeUpgrade of the UUPSUpgradeable contract
    // to ensure that only the owner can upgrade the contract
    function _authorizeUpgrade(
        address newImplementation
    ) internal override onlyOwner {}

    // We add a new function to extend the deadline
    // only by the owner of the campaign
    function extendDeadline(uint256 _newDuration) public onlyOwner {
        deadline = block.timestamp + _newDuration;
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
}
