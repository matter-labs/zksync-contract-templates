// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

// The UUPSCrowdfundingCampaign contract is an upgradeable version of the CrowdfundingCampaign contract
// It uses the UUPS upgrade pattern and inherits from Initializable, UUPSUpgradeable, and OwnableUpgradeable
contract UUPSCrowdfundingCampaign is
    Initializable,
    UUPSUpgradeable,
    OwnableUpgradeable
{
    uint256 private fundingGoal;
    uint256 private totalFundsRaised;
    mapping(address => uint256) private contributions;

    event ContributionReceived(address contributor, uint256 amount);
    event GoalReached(uint256 totalFundsRaised);

    // The `initialize` function replaces the constructor in upgradeable contracts
    function initialize(uint256 _fundingGoal) public initializer {
        __Ownable_init(); // Initialize ownership to the deployer
        __UUPSUpgradeable_init(); // Initialize UUPS upgradeability

        fundingGoal = _fundingGoal;
    }

    // Ensure that only the owner can upgrade the contract
    function _authorizeUpgrade(
        address newImplementation
    ) internal override onlyOwner {}

    function contribute() public payable {
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
}
