pragma solidity ^0.8.0;

import "forge-std/Script.sol";
import "../src/CC.sol";

contract MintCCScript is Script {
    function run() external {
        vm.startBroadcast();
        CC cc = CC(0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266);
        cc.mint(msg.sender, 100 * 10**18);
        vm.stopBroadcast();
    }
}
