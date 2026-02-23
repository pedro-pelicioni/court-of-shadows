"use strict";
/**
 * Crown & Shadows - Card Commitment Helper (Backend)
 *
 * Generates a Pedersen commitment for a card using the same
 * hash scheme as the Noir circuit (`dep::std::hash::pedersen_hash`).
 *
 * This runs on the NODE.JS server using @aztec/bb.js (the Barretenberg WASM binding),
 * which matches the on-circuit Pedersen implementation exactly.
 *
 * Usage:
 *   import { commitCard, verifyCommitment } from './zkHelper';
 *   const { commitment, salt } = await commitCard(CardClassEnum.BARON);
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.encodePublicInputs = exports.commitCard = exports.generateSalt = exports.CardClassField = void 0;
const crypto_1 = require("crypto");
// Card class encoding must match the Noir circuit globals.
exports.CardClassField = {
    knight: 1n,
    herald: 2n,
    baron: 3n,
    bishop: 4n,
    countess: 5n,
    duke: 6n,
    assassin: 7n,
    king: 8n,
};
/**
 * Generates a cryptographically random salt (32 bytes → bigint).
 */
const generateSalt = () => {
    const bytes = (0, crypto_1.randomBytes)(31); // 31 bytes = safe within bn254 field
    return BigInt('0x' + bytes.toString('hex'));
};
exports.generateSalt = generateSalt;
/**
 * Placeholder: real Pedersen hashing requires the @aztec/bb.js WASM.
 * This function returns the serialized inputs so the frontend/backend
 * can delegate to a bb.js worker process.
 *
 * Full integration:
 *   npm install @aztec/bb.js
 *   const { Barretenberg, Fr } = await import('@aztec/bb.js');
 *   const api = await Barretenberg.new();
 *   const hash = await api.pedersenHash([Fr.fromString(classField.toString()), Fr.fromString(salt.toString())], 0);
 *   await api.destroy();
 *
 * For the MVP roadmap the commitment is computed OFF-chain by the player's browser
 * (using the bb.js WASM) and stored server-side.
 */
const commitCard = async (cardClass) => {
    const classField = exports.CardClassField[cardClass.toLowerCase()];
    if (classField === undefined) {
        throw new Error(`Unknown card class: ${cardClass}`);
    }
    const salt = (0, exports.generateSalt)();
    // TODO: Replace with real Pedersen via @aztec/bb.js
    // For now, we return the raw inputs so the caller knows what to hash.
    const placeholder = `pedersen(${classField},${salt})`;
    console.log(`[ZK] Card commitment prepared for class=${cardClass}`);
    return { cardClass, salt, commitment: placeholder };
};
exports.commitCard = commitCard;
/**
 * Serialises public inputs (commitment + declared_guess) into a Buffer
 * in the same byte layout expected by the Soroban contract's verify_proof.
 * Each Field is big-endian 32 bytes.
 */
const encodePublicInputs = (commitment, declaredGuess) => {
    const buf = Buffer.alloc(64);
    const commitmentBuf = Buffer.from(commitment.toString(16).padStart(64, '0'), 'hex');
    const guessBuf = Buffer.from(declaredGuess.toString(16).padStart(64, '0'), 'hex');
    commitmentBuf.copy(buf, 0);
    guessBuf.copy(buf, 32);
    return buf;
};
exports.encodePublicInputs = encodePublicInputs;
