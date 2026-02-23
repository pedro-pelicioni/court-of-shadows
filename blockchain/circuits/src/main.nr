// Crown & Shadows - ZK Proof Circuit
//
// This circuit proves that a player (the Attacker) has made a valid Knight
// guess: i.e., the card class at the target slot matches the declared guess.
//
// Confidential (private) inputs:
//   - actual_card_class: the true card class stored in the slot (secret)
//   - salt: a random salt committed alongside the card to prevent brute-forcing
//
// Public inputs:
//   - card_commitment: the Pedersen hash of (actual_card_class, salt) — stored on chain
//   - declared_guess: the class the attacker publicly declared
//
// The circuit proves:
//   1. The actual card matches the commitment (the slot holder cannot swap card after guessing).
//   2. The actual card class equals the declared guess.

use dep::std::hash::pedersen_hash;

// Card classes encoded as Field elements (matching the backend enum):
// knight=1, herald=2, baron=3, bishop=4, countess=5, duke=6, assassin=7, king=8
global KNIGHT:   Field = 1;
global HERALD:   Field = 2;
global BARON:    Field = 3;
global BISHOP:   Field = 4;
global COUNTESS: Field = 5;
global DUKE:     Field = 6;
global ASSASSIN: Field = 7;
global KING:     Field = 8;

/// Proves a Knight guess is correct, without revealing the actual card.
fn main(
    actual_card_class: Field,       // private
    salt: Field,                    // private
    card_commitment: pub Field,     // public – Pedersen(actual_card_class, salt)
    declared_guess: pub Field       // public – what the attacker declared
) {
    // 1. Verify the card commitment is authentic.
    let computed_commitment = pedersen_hash([actual_card_class, salt]);
    assert(computed_commitment == card_commitment, "Card commitment mismatch");

    // 2. Verify the guess matches the actual card.
    assert(actual_card_class == declared_guess, "Guess does not match card");

    // 3. Sanity: card class must be valid (1..=8).
    let valid_class = (actual_card_class == KNIGHT)
        | (actual_card_class == HERALD)
        | (actual_card_class == BARON)
        | (actual_card_class == BISHOP)
        | (actual_card_class == COUNTESS)
        | (actual_card_class == DUKE)
        | (actual_card_class == ASSASSIN)
        | (actual_card_class == KING);
    assert(valid_class, "Invalid card class");
}

// ---- Unit tests ----

#[test]
fn test_correct_knight_guess() {
    // Player holds BARON (3) with salt 42, committed; attacker guesses BARON.
    let card_class = BARON;
    let salt: Field = 42;
    let commitment = dep::std::hash::pedersen_hash([card_class, salt]);
    main(card_class, salt, commitment, BARON);
}

#[test(should_fail)]
fn test_wrong_guess_fails() {
    let card_class = BARON;
    let salt: Field = 42;
    let commitment = dep::std::hash::pedersen_hash([card_class, salt]);
    // Attacker wrongly declares KNIGHT – should fail
    main(card_class, salt, commitment, KNIGHT);
}

#[test(should_fail)]
fn test_tampered_commitment_fails() {
    let card_class = BARON;
    let salt: Field = 42;
    // Attacker substitutes a fake commitment for a different card
    let fake_commitment = dep::std::hash::pedersen_hash([KING, salt]);
    main(card_class, salt, fake_commitment, BARON);
}
