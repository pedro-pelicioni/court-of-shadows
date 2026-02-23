"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.respond = exports.declareCard = exports.playCardFaceDown = exports.drawCard = void 0;
const types_1 = require("./types");
const matchState_1 = require("./matchState");
// Transition Helpers
const advanceTurn = (match) => {
    match.phase = types_1.TurnPhase.DRAW;
    match.turnPlayerId = match.turnPlayerId === match.host.playerId ? match.guest.playerId : match.host.playerId;
    match.currentAction = undefined;
    match.pendingResponseFrom = undefined;
    // Clear Expose status at end of turn (simplification for MVP)
    match.host.statuses.exposed = false;
    match.guest.statuses.exposed = false;
    // Clear Wards on the incoming player's turn (ward lasts 'until their next turn')
    const incoming = (0, matchState_1.getPlayerState)(match, match.turnPlayerId);
    if (incoming)
        incoming.statuses.ward = false;
    (0, matchState_1.addLog)(match, `Turn passed. It is now Player ${incoming?.walletAddress.slice(0, 4)}'s turn.`);
};
const checkWinCondition = (match) => {
    if (match.host.influence <= 0 && match.guest.influence <= 0)
        return 'tie';
    if (match.host.influence <= 0)
        return match.guest.playerId;
    if (match.guest.influence <= 0)
        return match.host.playerId;
    return null;
};
// Player Actions
const drawCard = (match, playerId) => {
    if (match.phase !== types_1.TurnPhase.DRAW || match.turnPlayerId !== playerId)
        throw new Error("Not your turn to draw");
    const player = (0, matchState_1.getPlayerState)(match, playerId);
    if (!player)
        throw new Error("Player not found");
    if (match.deck.length === 0) {
        // Reshuffle discard pile
        match.deck = [...match.discardPile].sort(() => Math.random() - 0.5);
        match.discardPile = [];
        (0, matchState_1.addLog)(match, `Deck reshuffled.`);
    }
    const drawn = match.deck.pop();
    if (drawn) {
        player.hand.push(drawn);
        (0, matchState_1.addLog)(match, `Player ${player.walletAddress.slice(0, 4)} drew a card.`);
        match.phase = types_1.TurnPhase.PLAY_FACE_DOWN;
    }
};
exports.drawCard = drawCard;
const playCardFaceDown = (match, playerId, cardId) => {
    if (match.phase !== types_1.TurnPhase.PLAY_FACE_DOWN || match.turnPlayerId !== playerId)
        throw new Error("Not your turn to play");
    const player = (0, matchState_1.getPlayerState)(match, playerId);
    if (!player)
        throw new Error("Player not found");
    // Allow them to play a card from Hand or Slots
    let playedCard;
    // Hand check
    const handIdx = player.hand.findIndex((c) => c.id === cardId);
    if (handIdx !== -1) {
        playedCard = player.hand.splice(handIdx, 1)[0];
    }
    else if (player.slots.L?.id === cardId) {
        playedCard = player.slots.L;
        player.slots.L = null;
    }
    else if (player.slots.R?.id === cardId) {
        playedCard = player.slots.R;
        player.slots.R = null;
    }
    if (!playedCard)
        throw new Error("Card not found in your possession");
    // Put card in current action state face down
    match.currentAction = { playedCardFaceDown: playedCard };
    (0, matchState_1.addLog)(match, `Player ${player.walletAddress.slice(0, 4)} played a card face down.`);
    // Now if their slots are empty because they played from a slot, they must refill from hand.
    // Game rule: slots must be full. Hand must be empty at end of turn.
    if (!player.slots.L && player.hand.length > 0)
        player.slots.L = player.hand.pop();
    if (!player.slots.R && player.hand.length > 0)
        player.slots.R = player.hand.pop();
    match.phase = types_1.TurnPhase.DECLARE_CARD;
};
exports.playCardFaceDown = playCardFaceDown;
const declareCard = (match, playerId, declaredClass, targetSlot, targetGuess) => {
    if (match.phase !== types_1.TurnPhase.DECLARE_CARD || match.turnPlayerId !== playerId)
        throw new Error("Not your turn to declare");
    if (!match.currentAction)
        throw new Error("No card played");
    const player = (0, matchState_1.getPlayerState)(match, playerId);
    const opponent = (0, matchState_1.getOpponentState)(match, playerId);
    match.currentAction.declaredClass = declaredClass;
    match.currentAction.targetSlot = targetSlot;
    match.currentAction.targetGuess = targetGuess;
    (0, matchState_1.addLog)(match, `Player declares ${declaredClass}.`);
    match.phase = types_1.TurnPhase.RESPONSE_WINDOW;
    match.pendingResponseFrom = opponent?.playerId;
};
exports.declareCard = declareCard;
const respond = (match, playerId, response) => {
    if (match.phase !== types_1.TurnPhase.RESPONSE_WINDOW || match.pendingResponseFrom !== playerId)
        throw new Error("Not your turn to respond");
    const player = (0, matchState_1.getPlayerState)(match, playerId);
    const turnPlayer = (0, matchState_1.getPlayerState)(match, match.turnPlayerId);
    const action = match.currentAction;
    (0, matchState_1.addLog)(match, `Opponent responded with ${response.toUpperCase()}.`);
    if (response === 'accept') {
        // Resolve without penalty
        resolveEffect(match);
    }
    else if (response === 'challenge') {
        // Check if turnPlayer lied
        const lied = action.playedCardFaceDown?.class !== action.declaredClass;
        if (lied) {
            (0, matchState_1.addLog)(match, `Challenge SUCCESS! Attacker lied (was ${action.playedCardFaceDown?.class}). Attacker loses 1 influence.`);
            turnPlayer.influence -= 1;
            match.discardPile.push(action.playedCardFaceDown); // Cancel effect, discard
            endTurnCleanup(match);
        }
        else {
            (0, matchState_1.addLog)(match, `Challenge FAILED! Attacker told the truth. Challenger loses 1 influence.`);
            player.influence -= 1;
            resolveEffect(match); // Resolve the valid effect
        }
    }
    else if (response === 'counter') {
        // Simplified MVP counter logic: Cancel effect, both discard
        (0, matchState_1.addLog)(match, `Opponent countered the action.`);
        match.discardPile.push(action.playedCardFaceDown);
        endTurnCleanup(match);
    }
};
exports.respond = respond;
function resolveEffect(match) {
    match.phase = types_1.TurnPhase.RESOLVE_EFFECT;
    const action = match.currentAction;
    const turnPlayer = (0, matchState_1.getPlayerState)(match, match.turnPlayerId);
    const opponent = (0, matchState_1.getOpponentState)(match, match.turnPlayerId);
    const cClass = action.declaredClass;
    (0, matchState_1.addLog)(match, `Resolving ${cClass} effect...`);
    if (cClass === types_1.CardClass.KNIGHT) {
        const oppSlot = action.targetSlot ? opponent?.slots[action.targetSlot] : null;
        if (oppSlot && oppSlot.class === action.targetGuess && !opponent?.statuses.ward) {
            (0, matchState_1.addLog)(match, `Knight SUCCESS! Guessed ${action.targetGuess}. Opponent loses 1 influence.`);
            opponent.influence -= 1;
        }
        else {
            (0, matchState_1.addLog)(match, `Knight FAILED.`);
        }
    }
    else if (cClass === types_1.CardClass.BARON) {
        const oppCard = action.targetSlot ? opponent?.slots[action.targetSlot] : null;
        const myCard = action.targetGuess === 'L' ? turnPlayer?.slots.L : turnPlayer?.slots.R;
        if (oppCard && myCard) {
            if (myCard.rank > oppCard.rank) {
                (0, matchState_1.addLog)(match, `Baron duel won! (Rank ${myCard.rank} vs ${oppCard.rank}). Opponent loses 1 influence.`);
                opponent.influence -= 1;
            }
            else if (myCard.rank < oppCard.rank) {
                (0, matchState_1.addLog)(match, `Baron duel lost! (Rank ${myCard.rank} vs ${oppCard.rank}). You lose 1 influence.`);
                turnPlayer.influence -= 1;
            }
            else {
                (0, matchState_1.addLog)(match, `Baron duel tied!`);
            }
        }
    }
    else if (cClass === types_1.CardClass.BISHOP) {
        (0, matchState_1.addLog)(match, `Bishop effect! You gain Ward (immune to next targeted effect).`);
        turnPlayer.statuses.ward = true;
    }
    else if (cClass === types_1.CardClass.COUNTESS) {
        (0, matchState_1.addLog)(match, `Countess effect! Forcing opponent to discard a random hand card.`);
        if (opponent && opponent.hand.length > 0 && !opponent.statuses.ward) {
            const randIdx = Math.floor(Math.random() * opponent.hand.length);
            const discarded = opponent.hand.splice(randIdx, 1)[0];
            match.discardPile.push(discarded);
            (0, matchState_1.addLog)(match, `Opponent lost a hand card due to Countess.`);
        }
        else {
            (0, matchState_1.addLog)(match, opponent?.statuses.ward ? `Opponent is Warded!` : `Opponent has no cards in hand.`);
        }
    }
    else if (cClass === types_1.CardClass.DUKE) {
        (0, matchState_1.addLog)(match, `Duke effect! You gain 1 influence.`);
        turnPlayer.influence += 1;
    }
    else if (cClass === types_1.CardClass.HERALD) {
        const oppSlot = action.targetSlot ? opponent?.slots[action.targetSlot] : null;
        if (oppSlot && !opponent?.statuses.ward) {
            opponent.statuses.marked = true;
            (0, matchState_1.addLog)(match, `Herald effect! Opponent's slot is marked.`);
        }
        else {
            (0, matchState_1.addLog)(match, `Herald failed or opponent Warded.`);
        }
    }
    else if (cClass === types_1.CardClass.ASSASSIN) {
        const oppSlot = action.targetSlot ? opponent?.slots[action.targetSlot] : null;
        if (oppSlot && action.targetSlot && !opponent?.statuses.ward) {
            (0, matchState_1.addLog)(match, `Assassin effect! Destroyed opponent's ${action.targetSlot} slot card.`);
            match.discardPile.push(oppSlot);
            opponent.slots[action.targetSlot] = null;
        }
        else {
            (0, matchState_1.addLog)(match, `Assassin failed or opponent Warded.`);
        }
    }
    else if (cClass === types_1.CardClass.KING) {
        const oppHasKing = opponent?.slots.L?.class === types_1.CardClass.KING || opponent?.slots.R?.class === types_1.CardClass.KING;
        if (oppHasKing && !opponent?.statuses.ward) {
            (0, matchState_1.addLog)(match, `King effect! Opponent also holds a King. TIE game exposed.`);
            turnPlayer.statuses.exposed = true;
            opponent.statuses.exposed = true;
            turnPlayer.influence = 0;
            opponent.influence = 0;
        }
        else {
            (0, matchState_1.addLog)(match, `King effect! Opponent loses 2 influence.`);
            opponent.influence -= 2;
        }
    }
    // Discard played card
    match.discardPile.push(action.playedCardFaceDown);
    endTurnCleanup(match);
}
function endTurnCleanup(match) {
    const winner = checkWinCondition(match);
    if (winner) {
        (0, matchState_1.addLog)(match, winner === 'tie' ? "Match ended in a tie!" : `Player ${winner} has won the match!`);
        // Halt phase
        match.phase = types_1.TurnPhase.DRAW;
        match.pendingResponseFrom = undefined;
        return;
    }
    advanceTurn(match);
}
