"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.shuffle = exports.createDeck = void 0;
const types_1 = require("./types");
const crypto_1 = require("crypto");
// Based on game_plan.yaml
const CardDefinitions = [
    { class: types_1.CardClass.KNIGHT, rank: 1, count: 2 },
    { class: types_1.CardClass.HERALD, rank: 2, count: 2 },
    { class: types_1.CardClass.BARON, rank: 3, count: 2 },
    { class: types_1.CardClass.BISHOP, rank: 4, count: 2 },
    { class: types_1.CardClass.COUNTESS, rank: 5, count: 2 },
    { class: types_1.CardClass.DUKE, rank: 6, count: 2 },
    { class: types_1.CardClass.ASSASSIN, rank: 7, count: 2 },
    { class: types_1.CardClass.KING, rank: 8, count: 1 },
];
const createDeck = () => {
    const deck = [];
    for (const def of CardDefinitions) {
        for (let i = 0; i < def.count; i++) {
            deck.push({
                id: (0, crypto_1.randomUUID)(),
                class: def.class,
                rank: def.rank,
            });
        }
    }
    return (0, exports.shuffle)(deck);
};
exports.createDeck = createDeck;
const shuffle = (array) => {
    const newArr = [...array];
    for (let i = newArr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
    }
    return newArr;
};
exports.shuffle = shuffle;
