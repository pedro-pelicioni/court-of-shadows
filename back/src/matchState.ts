import { MatchState, PlayerState, TurnPhase, Card, CardClass } from './types';
import { createDeck } from './deckService';

export const activeMatches = new Map<string, MatchState>();

export const initializeMatch = (roomId: string, hostId: string, hostWallet: string, guestId: string, guestWallet: string): MatchState => {
    const deck = createDeck();

    const createInitialPlayer = (id: string, wallet: string): PlayerState => ({
        playerId: id,
        walletAddress: wallet,
        influence: 3,
        slots: { L: null, R: null },
        hand: [],
        statuses: { ward: false, marked: false, exposed: false }
    });

    const host = createInitialPlayer(hostId, hostWallet);
    const guest = createInitialPlayer(guestId, guestWallet);

    host.slots.L = deck.pop()!;
    host.slots.R = deck.pop()!;
    guest.slots.L = deck.pop()!;
    guest.slots.R = deck.pop()!;

    const match: MatchState = {
        roomId,
        phase: TurnPhase.DRAW,
        turnPlayerId: hostId,
        host,
        guest,
        deck,
        discardPile: [],
        logs: ['Match started. Waiting for host to draw.'],
    };

    activeMatches.set(roomId, match);
    return match;
};

export const getMatch = (roomId: string): MatchState | undefined => {
    return activeMatches.get(roomId);
};

export const addLog = (match: MatchState, message: string) => {
    match.logs.push(message);
    if (match.logs.length > 50) match.logs.shift();
};

export const getPlayerState = (match: MatchState, playerId: string): PlayerState | undefined => {
    if (match.host.playerId === playerId) return match.host;
    if (match.guest.playerId === playerId) return match.guest;
    return undefined;
};

export const getOpponentState = (match: MatchState, playerId: string): PlayerState | undefined => {
    if (match.host.playerId === playerId) return match.guest;
    if (match.guest.playerId === playerId) return match.host;
    return undefined;
};

// Projection for the client (hides opponent hand details)
export const serializeMatchStateForClient = (match: MatchState, requesterId: string) => {
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
