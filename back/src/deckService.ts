import { Card, CardClass } from './types';
import { randomUUID } from 'crypto';

// Based on game_plan.yaml
const CardDefinitions = [
    { class: CardClass.KNIGHT, rank: 1, count: 2 },
    { class: CardClass.HERALD, rank: 2, count: 2 },
    { class: CardClass.BARON, rank: 3, count: 2 },
    { class: CardClass.BISHOP, rank: 4, count: 2 },
    { class: CardClass.COUNTESS, rank: 5, count: 2 },
    { class: CardClass.DUKE, rank: 6, count: 2 },
    { class: CardClass.ASSASSIN, rank: 7, count: 2 },
    { class: CardClass.KING, rank: 8, count: 1 },
];

export const createDeck = (): Card[] => {
    const deck: Card[] = [];

    for (const def of CardDefinitions) {
        for (let i = 0; i < def.count; i++) {
            deck.push({
                id: randomUUID(),
                class: def.class,
                rank: def.rank,
            });
        }
    }

    return shuffle(deck);
};

export const shuffle = (array: Card[]): Card[] => {
    const newArr = [...array];
    for (let i = newArr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
    }
    return newArr;
};
