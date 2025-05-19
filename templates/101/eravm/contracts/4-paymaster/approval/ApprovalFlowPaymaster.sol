// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {IPaymaster, ExecutionResult, PAYMASTER_VALIDATION_SUCCESS_MAGIC} from "@matterlabs/zksync-contracts/contracts/system-contracts/interfaces/IPaymaster.sol";
import {IPaymasterFlow} from "@matterlabs/zksync-contracts/contracts/system-contracts/interfaces/IPaymasterFlow.sol";
import {Transaction} from "@matterlabs/zksync-contracts/contracts/system-contracts/libraries/TransactionHelper.sol";

import "@matterlabs/zksync-contracts/contracts/system-contracts/Constants.sol";

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

import "hardhat/console.sol";

// This smart contract pays the gas fees for accounts
// with balance of a specific ERC20 token.
// It makes use of the approval-based flow paymaster.
contract ApprovalFlowPaymaster is IPaymaster, Ownable {
    uint256 constant PRICE_FOR_PAYING_FEES = 1;

    address public allowedToken;

    event PaymentCovered(address user, uint256 amount);

    // This is a modifier that restricts the access to the bootloader
    // to the formal address of the bootloader.
    // This adds a layer of security to the contract.
    modifier onlyBootloader() {
        require(
            msg.sender == BOOTLOADER_FORMAL_ADDRESS,
            "Only bootloader can call this method"
        );
        _;
    }

    // We set the token we will accept for paying the fees
    constructor(address _allowedToken) Ownable(msg.sender)
     {
        allowedToken = _allowedToken;
    }

    // This function is called by the bootloader
    // to validate whether the transaction
    // can be paid for by the paymaster.
    //
    // It uses the onlyBootloader modifier to ensure that only the bootloader
    // can call this method.
    function validateAndPayForPaymasterTransaction(
        bytes32,
        bytes32,
        Transaction calldata _transaction
    )
        external
        payable
        onlyBootloader
        returns (bytes4 magic, bytes memory context)
    {
        // Default to transaction acceptance
        magic = PAYMASTER_VALIDATION_SUCCESS_MAGIC;
        require(
            _transaction.paymasterInput.length >= 4,
            "The standard paymaster input must be at least 4 bytes long"
        );

        bytes4 paymasterInputSelector = bytes4(
            _transaction.paymasterInput[0:4]
        );
        // Check if it's approval-based flow
        if (paymasterInputSelector == IPaymasterFlow.approvalBased.selector) {
            (address token, uint256 amount, ) = abi.decode(
                _transaction.paymasterInput[4:],
                (address, uint256, bytes)
            );

            // Ensure the token is the allowed one
            require(token == allowedToken, "Invalid token");

            // Check user's allowance
            address userAddress = address(uint160(_transaction.from));
            address paymasterAddress = address(this);
            uint256 providedAllowance = IERC20(token).allowance(
                userAddress,
                paymasterAddress
            );
            require(
                providedAllowance >= PRICE_FOR_PAYING_FEES,
                "Min allowance too low"
            );

            uint256 requiredETH = _transaction.gasLimit *
                _transaction.maxFeePerGas;
            try
                IERC20(token).transferFrom(
                    userAddress,
                    paymasterAddress,
                    amount
                )
            {} catch (bytes memory revertReason) {
                if (revertReason.length <= 4) {
                    revert("Failed to transferFrom from user's account");
                } else {
                    assembly {
                        revert(add(0x20, revertReason), mload(revertReason))
                    }
                }
            }
            (bool success, ) = payable(BOOTLOADER_FORMAL_ADDRESS).call{
                value: requiredETH
            }("");
            require(success, "Failed to transfer tx fee to bootloader.");

            // This uses hardhat console log to print an event.
            // You can see the output in the log of the in-memory-node
            console.log("************************************************");
            console.log("PAYING CONTRIBUTION FOR ADDRESS: ", userAddress);
            console.log("************************************************");
            emit PaymentCovered(userAddress, _transaction.value);
        } else {
            revert("Unsupported paymaster flow");
        }
    }

    // An optional method that can be used to post-process the transaction
    // after it has been executed.
    // It uses the onlyBootloader modifier to ensure that only the bootloader
    // can call this method.
    // This method is not used in this example.
    function postTransaction(
        bytes calldata _context,
        Transaction calldata _transaction,
        bytes32,
        bytes32,
        ExecutionResult _txResult,
        uint256 _maxRefundedGas
    ) external payable override onlyBootloader {}

    function withdraw(address _to) external onlyOwner {
        (bool success, ) = payable(_to).call{value: address(this).balance}("");
        require(success, "Failed to withdraw funds from paymaster.");
    }

    receive() external payable {}
}
