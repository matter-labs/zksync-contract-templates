// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../../src/nft/MyNFT.sol";

contract DeployMyNFT is Script {
    function run() external {
        string memory name = "My new NFT";
        string memory symbol = "MYNFT";
        string memory baseTokenURI = "https://mybaseuri.com/token/";

        vm.startBroadcast();

        MyNFT nft = new MyNFT(name, symbol, baseTokenURI);
        console.log("MyNFT deployed at:", address(nft));

        vm.stopBroadcast();
    }
}
