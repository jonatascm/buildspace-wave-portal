// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;

import "hardhat/console.sol";

contract WavePortal {
    uint256 public totalWaves;
    address[] public wavers;
    mapping(address => bool) public hasWave;

    constructor() {
        console.log("Yo yo, I am a contract and I am smart");
    }

    function wave() public {
        totalWaves += 1;
        if(!hasWave[msg.sender]){
            wavers.push(msg.sender);
            hasWave[msg.sender] = true;
        }
        console.log("%s has waved!", msg.sender);
    }

    function getWavers() public view returns(address[] memory){
        return wavers;
    }

    function getTotalWaves() public view returns (uint256) {
        console.log("We have %d total waves!", totalWaves);
        return totalWaves;
    }
}