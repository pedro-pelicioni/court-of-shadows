import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMatchStore } from '../store/useMatchStore';
import { useWalletStore } from '../store/useWalletStore';

export default function MatchResult() {
    const navigate = useNavigate();
    const { match, clearMatch } = useMatchStore();
    const { address } = useWalletStore();

    useEffect(() => { if (!address) navigate('/'); }, [address, navigate]);

    if (!match) { navigate('/lobby'); return null; }

    const lastLog = match.logs[match.logs.length - 1] ?? '';
    const isTie = lastLog.toLowerCase().includes('tie');
    const isWin = !isTie && (lastLog.includes(match.you.wallet.slice(0, 4)) || lastLog.toLowerCase().includes('won'));

    const outcome = isTie ? 'tie' : isWin ? 'victory' : 'defeat';
    const emoji = { tie: '⚖️', victory: '👑', defeat: '💀' }[outcome];
    const tagline = { tie: 'The court is split — no victor emerges.', victory: 'You have seized the Crown!', defeat: 'You have fallen to the Shadows.' }[outcome];

    const handleAgain = () => { clearMatch(); navigate('/lobby'); };
    const handleMenu = () => { clearMatch(); navigate('/'); };

    return (
        <div className="page">
            <div className="page-bg" style={{ backgroundImage: 'url(/background.png)' }} />
            <div className="page-overlay" style={{ backdropFilter: 'blur(20px)' }} />

            <div className="page-content fade-in">
                <div className="glass result-card">
                    <div className="result-emoji">{emoji}</div>
                    <p className={`result-outcome font-display ${outcome}`}>{outcome.toUpperCase()}</p>
                    <p className="result-tagline">{tagline}</p>

                    <div className="result-scores">
                        <div className="result-score-side">
                            <p className="result-score-label">You</p>
                            <p className="result-score-value mine">♦ {match.you.influence}</p>
                        </div>
                        <div className="divider" />
                        <div className="result-score-side">
                            <p className="result-score-label">Opponent</p>
                            <p className="result-score-value opp">♦ {match.opponent.influence}</p>
                        </div>
                    </div>

                    <div className="result-actions">
                        <button className="btn btn-gold" onClick={handleAgain}>Play Again</button>
                        <button className="btn btn-outline btn-sm" onClick={handleMenu}>Main Menu</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
