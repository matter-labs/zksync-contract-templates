// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Test, console} from "forge-std/Test.sol";
import {Greeter} from "../src/Greeter.sol";

contract GreeterTest is Test {
  Greeter _greeter;

  function setUp() public {
    string memory initialGreeting = "Hello world!";
    _greeter = new Greeter(initialGreeting);
  }

    function testInitialGreeting() public view {
        string memory greeting = _greeter.greet();
        assertEq(greeting, "Hello world!");
    }
}
