import { MatchState, PlayerState, TurnPhase, Card } from './types';
import { createDeck } from './deckService';

const activeMatches = new Map<string, MatchState>();

export const initializeMatch = (roomId: string, hostId: string, hostWallet: string, guestId: string, guestWallet: string): MatchState => {
    const deck = createDeck();

    // Players start with 3 influence
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

    // Initial draw: 2 cards to slots L/R for each player
    host.slots.L = deck.pop()!;
    host.slots.R = deck.pop()!;
    guest.slots.L = deck.pop()!;
    guest.slots.R = deck.pop()!;

    const match: MatchState = {
        roomId,
        phase: TurnPhase.DRAW,
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

export const getMatch = (roomId: string): MatchState | undefined => {
    return activeMatches.get(roomId);
};

export const addLog = (match: MatchState, message: string) => {
    match.logs.push(message);
    if (match.logs.length > 50) match.logs.shift(); // Keep logs bounded
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
