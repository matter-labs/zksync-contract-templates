// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../../src/erc20/MyERC20Token.sol";

contract DeployMyERC20Token is Script {
    function run() external {
        vm.startBroadcast();

        MyERC20Token token = new MyERC20Token();
        console.log("MyERC20Token deployed at:", address(token));

        vm.stopBroadcast();
    }
}
