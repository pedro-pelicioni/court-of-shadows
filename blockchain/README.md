# Crown & Shadows — Blockchain

Noir ZK circuits and Soroban smart contract for the Crown & Shadows game.

## Structure

```
blockchain/
├── circuits/
│   ├── Nargo.toml         # Circuit package config
│   ├── Prover.toml        # Private input template (never commit real values)
│   └── src/main.nr        # Noir ZK circuit (Knight proof)
├── contracts/
│   ├── Cargo.toml         # Rust crate wiring ultrahonk_soroban_verifier
│   └── src/lib.rs         # CrownShadowsVerifier Soroban contract
└── scripts/
    ├── build_zk.sh        # Compile → VK → witness → proof
    ├── deploy.sh          # Build WASM → deploy to Testnet with VK
    └── verify_on_chain.sh # Call verify_proof on the deployed contract
```

## ZK Circuit — How It Works

The **Knight** card mechanic lets a player guess an opponent's hidden card class without it being revealed. The circuit proves:

1. The committed card (`commitment = pedersen_hash([card_class, salt])`) is authentic.
2. The attacker's declared guess matches the actual card class.
3. The card class is a valid game value (1–8).

**Private inputs:** `actual_card_class`, `salt`
**Public inputs:** `card_commitment`, `declared_guess`

## Usage

### Prerequisites

```bash
# Install Noir toolchain
curl -L https://raw.githubusercontent.com/noir-lang/noirup/main/install | bash
noirup

# Install Barretenberg
# See: https://github.com/AztecProtocol/aztec-packages/releases
# Download bb for your OS and place it on your PATH

# Install stellar-cli
cargo install stellar-cli --locked
```

### Run Circuit Tests

```bash
cd circuits
nargo test
```

### Full ZK Workflow

```bash
# Step 1: Build the circuit, VK, witness, and proof
blockchain/scripts/build_zk.sh

# Step 2: Deploy the verifier contract to Testnet
blockchain/scripts/deploy.sh

# Step 3: Verify the proof on-chain
blockchain/scripts/verify_on_chain.sh
```

### Updating Prover Inputs

Edit `circuits/Prover.toml` with your game card values before running `build_zk.sh`:

```toml
actual_card_class = "3"   # BARON
salt = "12345678"         # Any large random number
```

## Soroban Contract

`CrownShadowsVerifier` exposes two methods:

| Method | Description |
|--------|-------------|
| `__constructor(vk_bytes)` | Stores the Barretenberg VK on-chain at deploy time |
| `verify_proof(public_inputs, proof_bytes)` | Verifies an UltraHonk proof; returns `Ok(())` on success |
