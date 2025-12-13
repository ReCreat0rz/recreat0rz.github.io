---
title: "Next CTF 2025"
date: 2025-12-13
excerpt: "Writeups for Next CTF 2025 challenges - Chain Clue and Silent Flag, exploring blockchain transparency and smart contract event decoding."
category: [CTF, Blockchain]
tags: [NextCTF, Sepolia, Etherscan, XOR Encryption, Foundry Tool, Solidity]
---

## Chain Clue

### Problem Set

> Blockchain is fully transparent
> 
> We've made a transaction on the Sepolia testnet. Your flag is hidden somewhere in the transaction data.

**Transaction Hash:** `0x1c1e14180c2e5dceefc260208199e23a8c61524dd54bd2e378cee00e14555c14`

**Contract Address:** `0xFb67326dAacdD9163c0eeEB9E429D7D4B6c4EBb1`

**Network:** Sepolia Testnet

### Key Lesson

- How to check transaction in Sepolia Testnet

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

### Key Lesson

- Solidity/Ethereum ABI
- Events in Solididy
- Foundry (cast)
- XOR Encryption

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
