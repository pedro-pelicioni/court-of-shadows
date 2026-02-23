"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CardClass = exports.TurnPhase = void 0;
var TurnPhase;
(function (TurnPhase) {
    TurnPhase["DRAW"] = "draw";
    TurnPhase["PLAY_FACE_DOWN"] = "play_face_down";
    TurnPhase["DECLARE_CARD"] = "declare_card";
    TurnPhase["RESPONSE_WINDOW"] = "response_window";
    TurnPhase["RESOLVE_EFFECT"] = "resolve_effect";
})(TurnPhase || (exports.TurnPhase = TurnPhase = {}));
var CardClass;
(function (CardClass) {
    CardClass["KNIGHT"] = "knight";
    CardClass["HERALD"] = "herald";
    CardClass["BARON"] = "baron";
    CardClass["BISHOP"] = "bishop";
    CardClass["COUNTESS"] = "countess";
    CardClass["DUKE"] = "duke";
    CardClass["ASSASSIN"] = "assassin";
    CardClass["KING"] = "king";
})(CardClass || (exports.CardClass = CardClass = {}));
