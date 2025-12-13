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

- **Solidity/Ethereum ABI**
    - Understanding Application Binary Interface structure
    - Events in Solidity (indexed vs non-indexed parameters)
- **Foundry**
    - Using `cast` command to decode ABI data
- **Cryptography**
    - XOR Encryption basics and brute-forcing single-byte keys

## Solution

### Step 1: Analyze the ABI

This is a **Solidity/Ethereum Smart Contract ABI (Application Binary Interface)**, which is used for interacting with smart contracts on EVM-compatible blockchains.

The ABI defines:

| Component | Description |
|-----------|-------------|
| `leak` function | Takes a 32-byte identifier (`bytes32 id`) and triggers the `Stored` event |
| `Stored` event | Emitted when the function is called. `id` is **indexed** (searchable), `data` is **not indexed** |

> **Note:** `nonpayable` state mutability means the function modifies blockchain state but does not accept ETH.

```json
[
  {
    "type": "function",
    "name": "leak",
    "inputs": [{ "name": "id", "type": "bytes32", "internalType": "bytes32" }],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "event",
    "name": "Stored",
    "inputs": [
      { "name": "id", "type": "bytes32", "indexed": true, "internalType": "bytes32" },
      { "name": "data", "type": "bytes", "indexed": false, "internalType": "bytes" }
    ],
    "anonymous": false
  }
]
```

### Step 2: Examine the Data

The `data` file contains the following encoded value:

```
0x0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000001c59524f42444c6f07656803757e68730474077306797068050705024a00000000
```

### Step 3: Decode the ABI

Since this is encoded, let's use the `cast` command to decode the ABI:

```bash
cast decode-abi -i "f(bytes)" 0x0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000001c59524f42444c6f07656803757e68730474077306797068050705024a00000000
```

**Output:**
```
0x59524f42444c6f07656803757e68730474077306797068050705024a
```

> **Flags used:**
> - `f(bytes)` — specifies the return type is bytes
> - `-i` — indicates we're decoding input data

### Step 4: Convert Hex to ASCII

Converting the hex to ASCII using [RapidTables](https://www.rapidtables.com/convert/number/hex-to-ascii.html):

```
59524f42444c6f07656803757e68730474077306797068050705024a
```

**Result** (with `.` for non-printable bytes):
```
YROBDLo.eh.u~hs.t.s.yph...J
```

### Step 5: Identify the Encryption

After analysis, the data appears to use **XOR Encryption** for the following reasons:
- Some ASCII letters are visible
- Non-printable bytes appear where numbers/symbols should be
- XOR doesn't change byte count

### Step 6: Brute-Force the XOR Key

Let's find the XOR key by brute-forcing with Python:

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

> **Note:** `isprintable()` filters out results with non-readable characters, helping find the key that produces **readable English text**.

**Output:**
```
Key 0x37: nexus{X0R_4BI_D3C0D1NG_2025}
```

## Flag

```
nexus{X0R_4BI_D3C0D1NG_2025}
```