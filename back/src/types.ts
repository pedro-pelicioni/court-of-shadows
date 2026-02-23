export enum TurnPhase {
    DRAW = "draw",
    PLAY_FACE_DOWN = "play_face_down",
    DECLARE_CARD = "declare_card",
    RESPONSE_WINDOW = "response_window",
    RESOLVE_EFFECT = "resolve_effect",
}

export enum CardClass {
    KNIGHT = "knight",
    HERALD = "herald",
    BARON = "baron",
    BISHOP = "bishop",
    COUNTESS = "countess",
    DUKE = "duke",
    ASSASSIN = "assassin",
    KING = "king",
}

export type SlotPosition = 'L' | 'R';

export interface Card {
    id: string; // Unique instance ID
    class: CardClass;
    rank: number;
}

export interface PlayerState {
    playerId: string; // Socket ID
    walletAddress: string;
    influence: number;
    slots: {
        L: Card | null;
        R: Card | null;
    };
    hand: Card[]; // Extra cards drawn during turn
    statuses: {
        ward: boolean;    // Protected by Bishop
        marked: boolean;  // Marked by Herald
        exposed: boolean; // King Tie
    };
}

export interface MatchState {
    roomId: string;
    phase: TurnPhase;
    turnPlayerId: string;
    host: PlayerState;
    guest: PlayerState;
    deck: Card[];
    discardPile: Card[];
    logs: string[];
    // Temporary state for current turn resolution
    currentAction?: {
        playedCardFaceDown?: Card;
        declaredClass?: CardClass;
        targetSlot?: SlotPosition;     // Slot targeted on opponent
        targetGuess?: CardClass | string; // If knight guesses, or herald declares range
    };
    pendingResponseFrom?: string; // Player ID who needs to respond (Accept/Challenge/Counter)
}

export type ActionType = 'accept' | 'challenge' | 'counter';
