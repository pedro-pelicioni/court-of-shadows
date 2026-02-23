#!/usr/bin/env bash
# Crown & Shadows - ZK Build Script
#
# Prerequisites:
#   - nargo  (Noir toolchain)  https://noir-lang.org/docs/getting_started/installation/
#   - bb     (Barretenberg)    https://github.com/AztecProtocol/aztec-packages/tree/master/barretenberg
#
# Usage:
#   chmod +x blockchain/scripts/build_zk.sh
#   blockchain/scripts/build_zk.sh

set -euo pipefail

CIRCUITS_DIR="$(cd "$(dirname "$0")/../circuits" && pwd)"
SCRIPTS_DIR="$(cd "$(dirname "$0")" && pwd)"

echo ""
echo "======================================"
echo " Crown & Shadows :: ZK Build Pipeline"
echo "======================================"
echo ""

# ── Step 1: Compile the Noir circuit ─────────────────────────────────────────
echo "[1/4] Compiling Noir circuit..."
cd "$CIRCUITS_DIR"
nargo compile
echo "      ✓  Compiled → target/crown_shadows_circuits.json"

# ── Step 2: Generate the Verification Key ────────────────────────────────────
echo "[2/4] Generating Verification Key (UltraHonk)..."
bb write_vk \
  -b ./target/crown_shadows_circuits.json \
  -o ./target/vk \
  --scheme ultra_honk
echo "      ✓  VK written to → target/vk"

# ── Step 3: Execute the circuit (creates witness) ────────────────────────────
# Default Prover.toml with placeholder values; update with real game values.
echo "[3/4] Executing circuit (generating witness)..."
nargo execute
echo "      ✓  Witness written to → target/witness.gz"

# ── Step 4: Generate the Proof ───────────────────────────────────────────────
echo "[4/4] Generating proof (UltraHonk)..."
bb prove \
  -b ./target/crown_shadows_circuits.json \
  -w ./target/witness.gz \
  -o ./target/proof \
  --scheme ultra_honk
echo "      ✓  Proof written to → target/proof"

echo ""
echo "======================================"
echo " Build complete!"
echo ""
echo " ▶  Deploy the contract with:"
echo "    blockchain/scripts/deploy.sh"
echo ""
echo " ▶  Verify proof on-chain with:"
echo "    blockchain/scripts/verify_on_chain.sh"
echo "======================================"
