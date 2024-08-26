// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Test.sol";
import "../../src/erc20/MyERC20Token.sol";

contract MyERC20TokenTest is Test {
  MyERC20Token _token;
  address _user;

  function setUp() public {
    _token = new MyERC20Token();
    _user = makeAddr("user");
  }

  function testInitialSupply() public view {
        uint256 initialSupply = _token.totalSupply();
        assertEq(initialSupply, 1_000_000 * (10 ** 18));
    }

    function testBurnTokens() public {
        uint256 burnAmount = 10 * 10**18; // 10 tokens
        _token.burn(burnAmount);
        uint256 afterBurnSupply = _token.totalSupply();
        assertEq(afterBurnSupply, 999_990 * (10 ** 18));
    }

    function testTransferTokens() public {
        uint256 transferAmount = 50 * 10**18; // 50 tokens
        _token.transfer(_user, transferAmount);
        uint256 userBalance = _token.balanceOf(_user);
        assertEq(userBalance, transferAmount, "User balance should be 50 tokens");
    }

    function testBurnMoreTokensThanBalance() public {
        uint256 transferAmount = 50 * 10**18; // 50 tokens
        _token.transfer(_user, transferAmount);
        
        vm.prank(_user);
        vm.expectRevert("ERC20: burn amount exceeds balance");
        _token.burn(100 * 10**18);
    }
}
