---
title: "Next CTF 2025 - Silent Flag"
date: 2025-12-13
excerpt: "A writeup for Silent Flag challenge, exploring on using the foundry tool & utilizing python script to bruteforce XOR Encryption Key"
category: [CTF, Blockchain]
tags: [NextCTF, XOR Encryption, Foundry Tool, Solidity]
---

## Problem Set

> A smart contract emitted an event containing unknown data. Recover the original value.

## Key Lesson

- Solidity/Ethereum ABI
- Events in Solididy
- Foundry (cast)
- XOR Encryption

## Solution

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

```
Key 0x37: nexus{X0R_4BI_D3C0D1NG_2025}
```

## Flag

```
nexus{X0R_4BI_D3C0D1NG_2025}
```