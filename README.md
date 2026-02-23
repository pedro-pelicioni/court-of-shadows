# Crown & Shadows

A multiplayer card game of deception and influence, built on the **Stellar blockchain** with **Zero-Knowledge proofs** powered by [Noir](https://noir-lang.org/) and [UltraHonk (Barretenberg)](https://github.com/AztecProtocol/aztec-packages/tree/master/barretenberg).

## Overview

Players compete by playing cards face-down and declaring their effects truthfully — or bluffing. Opponents can **accept**, **challenge**, or **counter** declared effects. The player whose Influence drops to 0 loses. Hidden card identities are protected by Pedersen commitments and proven on-chain via a Soroban smart contract.

## Project Structure

```
court-of-shadows/
├── front/          # React + Vite + TypeScript frontend
├── back/           # Node.js + Fastify + Socket.IO backend
├── blockchain/
│   ├── circuits/   # Noir ZK circuits (main.nr)
│   ├── contracts/  # Soroban smart contract (Rust)
│   └── scripts/    # ZK build / deploy / verify scripts
└── assets/         # Game art (background, table, characters)
```

## Requirements

| Tool | Purpose |
|------|---------|
| Node.js ≥ 20 | Frontend & Backend |
| Rust + `wasm32-unknown-unknown` target | Soroban contract build |
| [nargo](https://noir-lang.org/docs/getting_started/installation/) | Compile Noir circuits |
| [bb (Barretenberg)](https://github.com/AztecProtocol/aztec-packages/releases) | Generate VK and proofs |
| [stellar-cli](https://developers.stellar.org/docs/tools/developer-tools/cli/install-cli) | Deploy and invoke Soroban contracts |

## Quick Start

### 1. Backend

```bash
cd back
npm install
npm run dev
# Starts on http://localhost:3001
```

### 2. Frontend

```bash
cd front
npm install
npm run dev
# Starts on http://localhost:5173
```

### 3. ZK Circuit (requires nargo + bb)

```bash
# Compile, generate VK, execute, and prove
chmod +x blockchain/scripts/build_zk.sh
blockchain/scripts/build_zk.sh
```

### 4. Deploy Soroban Contract (requires stellar-cli + bb VK)

```bash
chmod +x blockchain/scripts/deploy.sh
blockchain/scripts/deploy.sh
```

### 5. Verify Proof On-Chain

```bash
chmod +x blockchain/scripts/verify_on_chain.sh
blockchain/scripts/verify_on_chain.sh
```

## Gameplay

1. **Connect** your Stellar Testnet wallet (Freighter, xBull, etc.) via the Home screen.
2. **Create or join** a room from the Lobby.
3. **Wait** in the Waiting Room for your opponent; the host starts the match.
4. On your turn: **Draw** → **Play face-down** → **Declare** card effect → **Resolve** after your opponent responds.
5. Reduce your opponent's Influence to 0 to win. Or be the last one standing!

## Card Classes

| Class    | Rank | Effect |
|----------|------|--------|
| Knight   | 1 | Guess an opponent slot's class; correct → -1 opponent Influence |
| Herald   | 2 | Mark an opponent slot |
| Baron    | 3 | Rank duel — higher wins, loser loses 1 Influence |
| Bishop   | 4 | Gain Ward (immune to next targeted effect) |
| Countess | 5 | Opponent discards a random hand card |
| Duke     | 6 | Gain 1 Influence |
| Assassin | 7 | Destroy an opponent's slot card without a duel |
| King     | 8 | Opponent loses 2 Influence; ties if both hold the King |

## Zero-Knowledge Proof (Knight)

The Knight mechanic uses a **Pedersen commitment scheme**:

1. The defending player commits to their card: `commitment = pedersen_hash([card_class, salt])`.
2. If guessed correctly, a Noir ZK proof proves `actual_card_class == declared_guess` **without revealing the card_class** directly.
3. The proof is verified on-chain by the `CrownShadowsVerifier` Soroban contract.

## License

MIT
