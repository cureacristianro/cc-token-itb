pragma solidity ^0.8.0;

import "forge-std/Script.sol";
import "../src/CC.sol";

contract DeployCC is Script {
    function run() external {
        // This will get whichever private key is provided from Foundry's CLI
        vm.startBroadcast();
        
        // Deploy the contract
        CC cc  = new CC();
        
        vm.stopBroadcast();
    }
}
