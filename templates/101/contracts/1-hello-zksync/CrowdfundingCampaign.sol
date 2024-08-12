// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract CrowdfundingCampaign {
    address public owner;
    uint256 private fundingGoal;
    uint256 private totalFundsRaised;
    mapping(address => uint256) private contributions;

    event ContributionReceived(address contributor, uint256 amount);
    event GoalReached(uint256 totalFundsRaised);

    constructor(uint256 _fundingGoal) {
        owner = msg.sender;
        fundingGoal = _fundingGoal;
    }

    function contribute() public payable {
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
}
