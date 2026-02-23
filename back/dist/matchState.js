"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.serializeMatchStateForClient = exports.getOpponentState = exports.getPlayerState = exports.addLog = exports.getMatch = exports.initializeMatch = exports.activeMatches = void 0;
const types_1 = require("./types");
const deckService_1 = require("./deckService");
exports.activeMatches = new Map();
const initializeMatch = (roomId, hostId, hostWallet, guestId, guestWallet) => {
    const deck = (0, deckService_1.createDeck)();
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
    host.slots.L = deck.pop();
    host.slots.R = deck.pop();
    guest.slots.L = deck.pop();
    guest.slots.R = deck.pop();
    const match = {
        roomId,
        phase: types_1.TurnPhase.DRAW,
        turnPlayerId: hostId,
        host,
        guest,
        deck,
        discardPile: [],
        logs: ['Match started. Waiting for host to draw.'],
    };
    exports.activeMatches.set(roomId, match);
    return match;
};
exports.initializeMatch = initializeMatch;
const getMatch = (roomId) => {
    return exports.activeMatches.get(roomId);
};
exports.getMatch = getMatch;
const addLog = (match, message) => {
    match.logs.push(message);
    if (match.logs.length > 50)
        match.logs.shift();
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
// Projection for the client (hides opponent hand details)
const serializeMatchStateForClient = (match, requesterId) => {
    const isHost = match.host.playerId === requesterId;
    const you = isHost ? match.host : match.guest;
    const opp = isHost ? match.guest : match.host;
    return {
        roomId: match.roomId,
        phase: match.phase,
        turnPlayerId: match.turnPlayerId,
        isYourTurn: match.turnPlayerId === requesterId,
        pendingResponseFromYou: match.pendingResponseFrom === requesterId,
        logs: match.logs,
        you: {
            wallet: you.walletAddress,
            influence: you.influence,
            slots: you.slots,
            hand: you.hand,
            statuses: you.statuses
        },
        opponent: {
            wallet: opp.walletAddress,
            influence: opp.influence,
            statuses: opp.statuses,
            slotsCount: Object.values(opp.slots).filter(s => s !== null).length,
            handCount: opp.hand.length,
            // Hide actual slots logic, just indicate they exist
        },
        currentAction: match.currentAction ? {
            declaredClass: match.currentAction.declaredClass,
            targetSlot: match.currentAction.targetSlot,
        } : null
    };
};
exports.serializeMatchStateForClient = serializeMatchStateForClient;
