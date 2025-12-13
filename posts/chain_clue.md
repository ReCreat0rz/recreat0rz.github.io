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

**Transaction Hash:** `0x1c1e14180c2e5dceefc260208199e23a8c61524dd54bd2e378cee00e14555c14`

**Contract Address:** `0xFb67326dAacdD9163c0eeEB9E429D7D4B6c4EBb1`

**Network:** Sepolia Testnet

## Key Lesson

- How to check transaction in Sepolia Testnet

## Solution

Lets check the sepolia.etherscan.io

```
https://sepolia.etherscan.io/tx/0x1c1e14180c2e5dceefc260208199e23a8c61524dd54bd2e378cee00e14555c14
```

From there i got the flag

![Etherscan Transaction](/assets/img/posts/chain_clue/etherscan_flag.png)

## Flag

```
nexus{Tr4c3_Th3_Tr4ns4ct10n}
```
