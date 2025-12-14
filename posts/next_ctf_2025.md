---
title: "Next CTF 2025"
date: 2025-12-13
excerpt: "Writeups for Next CTF 2025 challenges - Chain Clue, Silent Flag, and Event Horizon, exploring blockchain transparency, smart contract event decoding, and bytecode analysis."
category: [CTF, Blockchain]
tags: [NextCTF, Sepolia, Etherscan, XOR Encryption, Foundry Tool, Solidity, Bytecode Analysis]
---

## Chain Clue

### Problem Set

> Blockchain is fully transparent
> 
> We've made a transaction on the Sepolia testnet. Your flag is hidden somewhere in the transaction data.

**Transaction Hash:** `0x1c1e14180c2e5dceefc260208199e23a8c61524dd54bd2e378cee00e14555c14`

**Contract Address:** `0xFb67326dAacdD9163c0eeEB9E429D7D4B6c4EBb1`

**Network:** Sepolia Testnet

### Solution

Lets check the sepolia.etherscan.io

```
https://sepolia.etherscan.io/tx/0x1c1e14180c2e5dceefc260208199e23a8c61524dd54bd2e378cee00e14555c14
```

From there i got the flag

![Etherscan Transaction](/assets/img/posts/chain_clue/etherscan_flag.png)

### Flag

```
nexus{Tr4c3_Th3_Tr4ns4ct10n}
```

---

## Silent Flag

### Problem Set

> A smart contract emitted an event containing unknown data. Recover the original value.

### Solution

This is a **Solidity/Ethereum Smart Contract ABI (Application Binary Interface)**, which is used for interacting with smart contracts on EVM-compatible blockchains.

The ABI defines:
1. **`leak` function** - Takes a 32-byte identifier (`bytes32 id`) and triggers the `Stored` event. It has no return value.
2. **`Stored` event** - Emitted when the function is called. The `id` parameter is **indexed** (stored in topics, searchable via event filters), while the `data` parameter is **not indexed** (stored in the data field, requires parsing).

**Note:** `nonpayable` state mutability means the function modifies blockchain state but does not accept ETH.

```json
[
  {
    "type": "function",
    "name": "leak",
    "inputs": [
      {
        "name": "id",
        "type": "bytes32",
        "internalType": "bytes32"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "event",
    "name": "Stored",
    "inputs": [
      {
        "name": "id",
        "type": "bytes32",
        "indexed": true,
        "internalType": "bytes32"
      },
      {
        "name": "data",
        "type": "bytes",
        "indexed": false,
        "internalType": "bytes"
      }
    ],
    "anonymous": false
  }
]
```

Lets check the `data` file

This file is responsible for `data` parameter

```
0x0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000001c59524f42444c6f07656803757e68730474077306797068050705024a00000000
```

Since this is encoded, lets use the `cast` command to decode the abi

Notes:
- `f(bytes)` means that the return type is bytes
- `-i` flag means we're decoding input data

```bash
cast decode-abi -i "f(bytes)" 0x0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000001c59524f42444c6f07656803757e68730474077306797068050705024a00000000

0x59524f42444c6f07656803757e68730474077306797068050705024a
```

Lets try to convert this hex into ascii by removing the `0x`

Link: https://www.rapidtables.com/convert/number/hex-to-ascii.html

```
59524f42444c6f07656803757e68730474077306797068050705024a
```

Result (with `.` for non-printable bytes):

```
YROBDLoehu~hstsyphJ
```

![Hex to ASCII Result](/assets/img/posts/silent_flag/hex_to_ascii_result.png)

After further analysis, the `data` is fairly readable, with some of the non-printable character. This assumes that it might use the XOR Encryption for the following reason:
- Some ASCII letters are visible
- Non-printable bytes appear where numbers/symbols should be
- XOR doesn't change byte count

Lets find the XOR key by bruteforcing it using python.

Note:
- `isprintable()` filters out results with non-readable characters
- This helps find the key that produces **readable English text**

```python
#!/usr/bin/env python3

data = bytes.fromhex('59524f42444c6f07656803757e68730474077306797068050705024a')

for key in range(256):
    result = bytes([b ^ key for b in data])
    try:
        text = result.decode('ascii')
        if text.isprintable():
            print(f"Key 0x{key:02x}: {text}")
    except:
        pass
```

Here is the output

![XOR Bruteforce Output](/assets/img/posts/silent_flag/xor_bruteforce_output.png)

```
Key 0x37: nexus{X0R_4BI_D3C0D1NG_2025}
```

### Flag

```
nexus{X0R_4BI_D3C0D1NG_2025}
```

---

## Event Horizon

### Problem Set

> The Event Horizon rejects standard transactions. Analyze the contract, pierce the void, and synchronize your entropy.

**Connection:**
- **RPC:** `http://4.211.248.144:8545`
- **Chain ID:** `31337`
- **Contract:** `0x5FbDB2315678afecb367f032d93F642f64180aa3`

### Solution

Lets use `cast code` to get contract bytecode

```bash
cast code 0x5FbDB2315678afecb367f032d93F642f64180aa3 --rpc-url http://4.211.248.144:8545 > bytecode.hex
```

Since this challenge didn't provide the solidity code, to understand more about the contract logic, lets try to decompile it using `cast` command or using this link.

Link: https://app.dedaub.com/decompile?md5=c9c717b81e6705593ffae4101c8dc4ae 

```bash
cast disassemble $(cast code 0x5FbDB2315678afecb367f032d93F642f64180aa3 --rpc-url http://4.211.248.144:8545)
```

Here is the output of the decompilation. Since this is too many disassembled codes, i will only highlight the interesting part:

```
SNIPPED

0x45b: PUSH32 0x53796e6365640000000000000000000000000000000000000000000000000000

0x4c3: PUSH32 0x52656a6563746564000000000000000000000000000000000000000000000000

0x52b: PUSH32 0x6e657875737b357430723467335f4d316e316e675f346e645f4734355f4d3435

0x550: PUSH32 0x7433727d00000000000000000000000000000000000000000000000000000000

SNIPPED
```

Lets inspect the hex by converting it to ASCII by removing `0x`

Link: www.rapidtables.com/convert/number/hex-to-ascii.html

```
53796e6365640000000000000000000000000000000000000000000000000000 = Synced

52656a6563746564000000000000000000000000000000000000000000000000 = Rejected

6e657875737b357430723467335f4d316e316e675f346e645f4734355f4d3435 = nexus{5t0r4g3_M1n1ng_4nd_G45_M45

7433727d00000000000000000000000000000000000000000000000000000000 = t3r}
```

With the help of AI, reconstructed solidity code looks like this:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

contract EventHorizon {
    mapping(address => bool) public synced;
    bytes32 private secretHash;

    bytes32 constant MASK =
        0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef;
    bytes32 constant SYNCED =
        0x53796e6365640000000000000000000000000000000000000000000000000000;
    bytes32 constant REJECTED =
        0x52656a6563746564000000000000000000000000000000000000000000000000;
    bytes32 constant FLAG_PART_1 =
        0x6e657875737b357430723467335f4d316e316e675f346e645f4734355f4d3435;
    bytes32 constant FLAG_PART_2 =
        0x7433727d00000000000000000000000000000000000000000000000000000000;

    event Synced(address indexed user);

    function synchronize(bytes calldata entropy, bytes32 secret) external {
        require(!synced[msg.sender], "Synced");

        bool success = false;
        address caller = msg.sender;

        require(secret == secretHash);

        bytes32 accumulator = MASK;

        for (uint256 i = 0; i &lt; entropy.length; i++) {
            uint8 xorResult = uint8(entropy[i]) ^ uint8(accumulator[0]);
            accumulator = keccak256(abi.encodePacked(xorResult));
        }

        require(uint16(uint256(accumulator)) == uint16(uint256(secret)));

        require(gasleft() % 69 == 0);

        success = true;

        require(success, "Rejected");

        synced[caller] = true;

        emit Synced(caller);
    }
}
```

Lets make a python script for this to solve the challenge to extract the flag dynamically:

```python
from web3 import Web3

RPC_URL = "http://4.211.248.144:8545"
CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3"

def extract_strings(bytecode: bytes) -> list:
    strings = []
    current = ""
    for byte in bytecode:
        if 32 &lt;= byte &lt;= 126:
            current += chr(byte)
        else:
            if len(current) >= 4:
                strings.append(current)
            current = ""
    if len(current) >= 4:
        strings.append(current)
    return strings

def main():
    w3 = Web3(Web3.HTTPProvider(RPC_URL))
    bytecode = w3.eth.get_code(CONTRACT_ADDRESS)
    strings = extract_strings(bytecode)
    flag = ''.join(s for s in strings if '{' in s or '}' in s)
    print(f" FLAG: {flag}")

if __name__ == "__main__":
    main()
```

Here is the Result:

```
python3 solve.py
 FLAG: }V[`@Qanexus{5t0r4g3_M1n1ng_4nd_G45_M45_t3r}
```

### Flag

```
nexus{5t0r4g3_M1n1ng_4nd_G45_M45_t3r}
```
