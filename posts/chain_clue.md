---
title: "Next CTF 2025 - Chain Clue"
date: 2025-12-13
excerpt: "A writeup for Chain Clue challenge, exploring blockchain transparency on the Sepolia testnet."
category: [CTF, Blockchain]
tags: [NextCTF, Sepolia, Etherscan]
---

## Problem Set

> Blockchain is fully transparent
> 
> We've made a transaction on the Sepolia testnet. Your flag is hidden somewhere in the transaction data.

| Field | Value |
|-------|-------|
| **Transaction Hash** | `0x1c1e14180c2e5dceefc260208199e23a8c61524dd54bd2e378cee00e14555c14` |
| **Contract Address** | `0xFb67326dAacdD9163c0eeEB9E429D7D4B6c4EBb1` |
| **Network** | Sepolia Testnet |

## Key Lesson

- **Blockchain Fundamentals**
    - How to check transactions on the Sepolia Testnet using Etherscan
    - Understanding that all blockchain data is publicly visible

## Solution

Since the challenge hints at blockchain transparency, let's check the transaction on Etherscan:

**Step 1:** Navigate to [sepolia.etherscan.io](https://sepolia.etherscan.io/tx/0x1c1e14180c2e5dceefc260208199e23a8c61524dd54bd2e378cee00e14555c14)

**Step 2:** Look at the transaction input data or logs

From there, I found the flag hidden in the transaction data.

## Flag

```
nexus{Tr4c3_Th3_Tr4ns4ct10n}
```
