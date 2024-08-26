// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../src/Greeter.sol";

contract DeployGreeter is Script {
    function run() external {
        string memory initialGreeting = "Hi there!";

        vm.startBroadcast();
        Greeter greeter = new Greeter(initialGreeting);
        console.log("Greeter deployed at:", address(greeter));
        vm.stopBroadcast();
    }
}
