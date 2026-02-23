"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOpponentState = exports.getPlayerState = exports.addLog = exports.getMatch = exports.initializeMatch = void 0;
const types_1 = require("./types");
const deckService_1 = require("./deckService");
const activeMatches = new Map();
const initializeMatch = (roomId, hostId, hostWallet, guestId, guestWallet) => {
    const deck = (0, deckService_1.createDeck)();
    // Players start with 3 influence
    const createInitialPlayer = (id, wallet) => ({
        playerId: id,
        walletAddress: wallet,
        influence: 3,
        slots: { L: null, R: null },
        hand: [],
        statuses: { ward: false, marked: false, exposed: false }
    });
    const host = createInitialPlayer(hostId, hostWallet);
    const guest = createInitialPlayer(guestId, guestWallet);
    // Initial draw: 2 cards to slots L/R for each player
    host.slots.L = deck.pop();
    host.slots.R = deck.pop();
    guest.slots.L = deck.pop();
    guest.slots.R = deck.pop();
    const match = {
        roomId,
        phase: types_1.TurnPhase.DRAW,
        turnPlayerId: hostId, // Host starts MVP
        host,
        guest,
        deck,
        discardPile: [],
        logs: ['Match started.'],
    };
    activeMatches.set(roomId, match);
    return match;
};
exports.initializeMatch = initializeMatch;
const getMatch = (roomId) => {
    return activeMatches.get(roomId);
};
exports.getMatch = getMatch;
const addLog = (match, message) => {
    match.logs.push(message);
    if (match.logs.length > 50)
        match.logs.shift(); // Keep logs bounded
};
exports.addLog = addLog;
const getPlayerState = (match, playerId) => {
    if (match.host.playerId === playerId)
        return match.host;
    if (match.guest.playerId === playerId)
        return match.guest;
    return undefined;
};
exports.getPlayerState = getPlayerState;
const getOpponentState = (match, playerId) => {
    if (match.host.playerId === playerId)
        return match.guest;
    if (match.guest.playerId === playerId)
        return match.host;
    return undefined;
};
exports.getOpponentState = getOpponentState;
