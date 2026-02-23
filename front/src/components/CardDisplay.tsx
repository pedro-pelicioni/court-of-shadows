import { useState } from 'react';
import type { CardState } from '../store/useMatchStore';

const CARD_EFFECTS: Record<string, string> = {
    knight: 'Choose an opponent slot and guess the card class. If correct, they lose 1 Influence.',
    herald: 'Choose an opponent slot. Mark it — its class becomes visible.',
    baron: 'Choose an opponent slot and your own. Higher rank wins; loser loses 1 Influence.',
    bishop: 'Gain Ward — you are immune to the next targeted effect.',
    countess: 'Force your opponent to discard a random hand card.',
    duke: 'Gain 1 Influence.',
    assassin: 'Destroy a card in an opponent slot — no rank duel required.',
    king: 'Deal 2 Influence damage to your opponent. If both players hold the King, the match ties.',
};

interface CardDisplayProps {
    card: CardState;
    isPlayable?: boolean;
    onPlay?: (id: string) => void;
    compact?: boolean;
}

export default function CardDisplay({ card, isPlayable, onPlay, compact }: CardDisplayProps) {
    const [expanded, setExpanded] = useState(false);
    const src = `/characters/${card.class.toLowerCase()}.png`;
    const effect = CARD_EFFECTS[card.class.toLowerCase()] ?? 'Unknown effect.';

    const handleClick = () => {
        if (isPlayable && onPlay) onPlay(card.id);
        else setExpanded(true);
    };

    const cls = compact ? 'board-card' : 'hand-card';
    const playableClass = isPlayable ? 'playable' : '';

    return (
        <>
            <div className={`${cls} ${playableClass}`} onClick={handleClick}>
                <img src={src} alt={card.class} onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                {compact
                    ? <>
                        <div className="board-card-overlay" />
                        <div className="board-card-info">
                            <p className="board-card-class">{card.class}</p>
                            <p className="board-card-rank">Rank {card.rank}</p>
                        </div>
                    </>
                    : <>
                        <div className="hand-card-overlay" />
                        <div className="hand-card-label">
                            <p className="hand-card-class">{card.class.slice(0, 3).toUpperCase()}</p>
                        </div>
                    </>
                }
            </div>

            {expanded && (
                <div className="card-modal-backdrop" onClick={() => setExpanded(false)}>
                    <div className="card-modal" onClick={e => e.stopPropagation()}>
                        {/* Left: artwork */}
                        <div className="card-modal-art">
                            <img src={src} alt={card.class} onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                            <div className="card-modal-art-overlay" />
                        </div>

                        {/* Right: info */}
                        <div className="card-modal-info">
                            <span className="card-modal-rank-badge">⚔ Rank {card.rank}</span>
                            <p className="card-modal-name font-display">{card.class.toUpperCase()}</p>
                            <div className="card-modal-divider" />
                            <p className="card-modal-effect-label">Card Effect</p>
                            <p className="card-modal-effect">{effect}</p>
                        </div>

                        <button className="card-modal-close" onClick={() => setExpanded(false)}>✕</button>
                    </div>
                </div>
            )}

        </>
    );
}
