import { create } from 'zustand';

export const TurnPhase = {
    DRAW: "draw",
    PLAY_FACE_DOWN: "play_face_down",
    DECLARE_CARD: "declare_card",
    RESPONSE_WINDOW: "response_window",
    RESOLVE_EFFECT: "resolve_effect",
} as const;

export type TurnPhase = typeof TurnPhase[keyof typeof TurnPhase];

export const CardClass = {
    KNIGHT: "knight",
    BISHOP: "bishop",
    BARON: "baron",
    DUKE: "duke",
    HERALD: "herald",
    COUNTESS: "countess",
    ASSASSIN: "assassin",
    KING: "king",
} as const;

export type CardClass = typeof CardClass[keyof typeof CardClass];

export type SlotPosition = 'L' | 'R';

export interface CardState {
    id: string;
    class: string;
    rank: number;
}

export interface ClientPlayerState {
    wallet: string;
    influence: number;
    slots: { L: CardState | null, R: CardState | null };
    hand: CardState[];
    statuses: { ward: boolean, marked: boolean, exposed: boolean };
}

export interface ClientOpponentState {
    wallet: string;
    influence: number;
    statuses: { ward: boolean, marked: boolean, exposed: boolean };
    slotsCount: number;
    handCount: number;
}

export interface MatchState {
    roomId: string;
    phase: TurnPhase;
    turnPlayerId: string;
    isYourTurn: boolean;
    pendingResponseFromYou: boolean;
    logs: string[];
    you: ClientPlayerState;
    opponent: ClientOpponentState;
    currentAction?: {
        declaredClass?: string;
        targetSlot?: SlotPosition;
    };
}

interface MatchStoreState {
    match: MatchState | null;
    setMatch: (match: MatchState) => void;
    clearMatch: () => void;
}

export const useMatchStore = create<MatchStoreState>((set) => ({
    match: null,
    setMatch: (match) => set({ match }),
    clearMatch: () => set({ match: null }),
}));
