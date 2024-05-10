// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// Crowdfunding campaign contract
import "./CrowdfundingCampaign.sol";

// Factory contract to create and manage crowdfunding campaigns
contract CrowdfundingFactory {
    CrowdfundingCampaign[] public campaigns;

    event CampaignCreated(address campaignAddress, uint256 fundingGoal);

    function createCampaign(uint256 fundingGoal) public {
        CrowdfundingCampaign newCampaign = new CrowdfundingCampaign(fundingGoal);
        campaigns.push(newCampaign);

        emit CampaignCreated(address(newCampaign), fundingGoal);
    }

    function getCampaigns() public view returns (CrowdfundingCampaign[] memory) {
        return campaigns;
    }
}
