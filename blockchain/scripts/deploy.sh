#!/usr/bin/env bash
# Crown & Shadows - Deploy Soroban Verifier Contract
#
# Prerequisites:
#   - stellar-cli  https://stellar.org/developers/cli
#   - Soroban Rust target: rustup target add wasm32-unknown-unknown
#   - The VK must already be built: blockchain/scripts/build_zk.sh
#
# Usage:
#   chmod +x blockchain/scripts/deploy.sh
#   blockchain/scripts/deploy.sh

set -euo pipefail

CONTRACTS_DIR="$(cd "$(dirname "$0")/../contracts" && pwd)"
CIRCUITS_DIR="$(cd "$(dirname "$0")/../circuits" && pwd)"
VK_FILE="$CIRCUITS_DIR/target/vk"

echo ""
echo "======================================"
echo " Crown & Shadows :: Contract Deploy"
echo "======================================"
echo ""

if [[ ! -f "$VK_FILE" ]]; then
  echo "Error: VK file not found at $VK_FILE"
  echo "Run blockchain/scripts/build_zk.sh first."
  exit 1
fi

# ── Step 1: Build the WASM ────────────────────────────────────────────────────
echo "[1/3] Building Soroban contract (WASM)..."
cd "$CONTRACTS_DIR"
stellar contract build
echo "      ✓  WASM built."

WASM_FILE=$(find "$CONTRACTS_DIR/target/wasm32-unknown-unknown/release" -name "*.wasm" | head -n 1)
echo "      → $WASM_FILE"

# ── Step 2: Deploy to Testnet ─────────────────────────────────────────────────
echo "[2/3] Deploying to Stellar Testnet..."
VK_HEX=$(xxd -p -c 9999 "$VK_FILE" | tr -d '\n')
CONTRACT_ID=$(stellar contract deploy \
  --wasm "$WASM_FILE" \
  --source-account default \
  --network testnet \
  -- \
  --vk_bytes "$VK_HEX")
echo "      ✓  Deployed! Contract ID: $CONTRACT_ID"
echo ""
echo "      Save this Contract ID in your .env or backend config:"
echo "      VITE_VERIFIER_CONTRACT_ID=$CONTRACT_ID"
echo "      VERIFIER_CONTRACT_ID=$CONTRACT_ID"

# ── Step 3: Save Contract ID ─────────────────────────────────────────────────
echo "$CONTRACT_ID" > "$CONTRACTS_DIR/contract_id.txt"
echo "[3/3] Contract ID saved → blockchain/contracts/contract_id.txt"
echo ""
echo "======================================"
echo " Deployment complete!"
echo "======================================"
