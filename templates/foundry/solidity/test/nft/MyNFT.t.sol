// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Test.sol";
import "../../src/nft/MyNFT.sol";

contract MyNFTTest is Test {
    MyNFT public nft;
    address public recipient;

    function setUp() public {
        recipient = makeAddr("user");
        nft = new MyNFT("MyNFTName", "MNFT", "https://mybaseuri.com/token/");
    }

    function testMintNFT() public {
        nft.mint(recipient);
        assertEq(nft.balanceOf(recipient), 1);
    }

    function testTokenURI() public {
        nft.mint(recipient);
        assertEq(nft.tokenURI(1), "https://mybaseuri.com/token/1");
    }

    function testMultipleMints() public {
        nft.mint(recipient);
        nft.mint(recipient);
        nft.mint(recipient);
        assertEq(nft.balanceOf(recipient), 3);
    }

    function testNonOwnerMint() public {
        vm.prank(recipient);
        vm.expectRevert("Ownable: caller is not the owner");
        nft.mint(recipient);
    }
}
