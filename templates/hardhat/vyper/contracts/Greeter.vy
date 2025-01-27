# @version ^0.4.0
# SPDX-License-Identifier: MIT
# Greeter smart contract in Vyper 0.4.0 or higher

# State Variables
greeting: public(String[256])  # Stores the greeting message, max 256 characters

@deploy
def __init__(_greeting: String[256]):
    """
    @notice Constructor to initialize the contract with a greeting message.
    @param _greeting The initial greeting message to store.
    """
    self.greeting = _greeting

@external
def set_greeting(_new_greeting: String[256]):
    """
    @notice Updates the greeting message.
    @param _new_greeting The new greeting message to store.
    """
    self.greeting = _new_greeting
