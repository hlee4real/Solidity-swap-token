// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
contract Token is ERC20{
    constructor(string memory name, string memory symbol) ERC20(name, symbol){
        _mint(msg.sender, 1000000000 * 10**decimals());
    }
    // function mint(address user, uint256 amount) public{
    //     _mint(user, amount);
    // }
}