import { useNavigate } from 'react-router-dom';

export default function HowToPlay() {
    const navigate = useNavigate();

    return (
        <div className="page">
            <div className="page-bg" style={{ backgroundImage: 'url(/home.png)' }} />
            <div className="page-overlay" />

            <div className="page-content fade-in">
                <div className="glass how-to-play-card">
                    <button className="btn btn-sm how-to-back" onClick={() => navigate(-1)}>← Back</button>

                    <h1 className="font-display" style={{ color: '#c8973a', fontSize: '28px', marginBottom: '4px', textAlign: 'center' }}>HOW TO PLAY</h1>
                    <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '12px', textAlign: 'center', marginBottom: '24px', letterSpacing: '0.1em' }}>MASTER THE COURT IN 5 MINUTES</p>

                    {/* ── Objective ── */}
                    <section className="htp-section">
                        <h2 className="htp-heading">🎯 Objective</h2>
                        <p className="htp-text">
                            Reduce your opponent's <strong>Influence</strong> from <strong>3 to 0</strong> to win.
                            Each player starts with 2 face-down cards in their <em>Slots</em> (Left & Right).
                            You don't know what your opponent has — and they don't know yours.
                        </p>
                    </section>

                    {/* ── Turn Flow ── */}
                    <section className="htp-section">
                        <h2 className="htp-heading">⚔ Your Turn (4 Phases)</h2>
                        <div className="htp-steps">
                            <div className="htp-step">
                                <span className="htp-step-num">1</span>
                                <div>
                                    <strong>Draw</strong>
                                    <p>Click "Draw Card" to pull a card from the deck into your hand.</p>
                                </div>
                            </div>
                            <div className="htp-step">
                                <span className="htp-step-num">2</span>
                                <div>
                                    <strong>Play Face-Down</strong>
                                    <p>Click any card in your hand or slots to play it face-down. Your opponent cannot see it.</p>
                                </div>
                            </div>
                            <div className="htp-step">
                                <span className="htp-step-num">3</span>
                                <div>
                                    <strong>Declare</strong>
                                    <p>Choose a card class to announce. <em>You can lie!</em> Pick any class — you don't have to tell the truth. This is the core bluffing mechanic. Some classes require a target slot (L/R).</p>
                                </div>
                            </div>
                            <div className="htp-step">
                                <span className="htp-step-num">4</span>
                                <div>
                                    <strong>Resolution</strong>
                                    <p>Your opponent responds: <strong>Accept</strong> (effect activates), <strong>Challenge</strong> (calls your bluff), or <strong>Counter</strong> (cancels your action).</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* ── Challenging ── */}
                    <section className="htp-section">
                        <h2 className="htp-heading">🧠 The Challenge Mechanic</h2>
                        <p className="htp-text">
                            When you <strong>Challenge</strong>, the game checks if the attacker lied about their card:
                        </p>
                        <ul className="htp-list">
                            <li><strong>Attacker lied →</strong> Attacker loses 1 Influence. Card is discarded. Effect is cancelled.</li>
                            <li><strong>Attacker was honest →</strong> <em>You</em> (the challenger) lose 1 Influence, and the effect resolves normally.</li>
                        </ul>
                        <p className="htp-text" style={{ marginTop: '8px', color: 'rgba(255,255,255,0.35)', fontStyle: 'italic' }}>
                            💡 The Knight card uses Zero-Knowledge proofs to verify guesses without revealing hidden card identities.
                        </p>
                    </section>

                    {/* ── Card Table ── */}
                    <section className="htp-section">
                        <h2 className="htp-heading">🃏 Card Classes</h2>
                        <div className="htp-card-table">
                            <div className="htp-card-row htp-card-header">
                                <span>Card</span><span>Rank</span><span>Effect</span>
                            </div>
                            <div className="htp-card-row">
                                <span className="htp-card-name">Knight</span><span>1</span><span>Guess an opponent's slot card. Correct = −1 Influence.</span>
                            </div>
                            <div className="htp-card-row">
                                <span className="htp-card-name">Herald</span><span>2</span><span>Mark an opponent's slot (reveals info).</span>
                            </div>
                            <div className="htp-card-row">
                                <span className="htp-card-name">Baron</span><span>3</span><span>Rank duel vs opponent's slot. Higher rank wins, loser −1 Influence.</span>
                            </div>
                            <div className="htp-card-row">
                                <span className="htp-card-name">Bishop</span><span>4</span><span>Gain Ward — immune to next targeted effect.</span>
                            </div>
                            <div className="htp-card-row">
                                <span className="htp-card-name">Countess</span><span>5</span><span>Opponent discards a random hand card.</span>
                            </div>
                            <div className="htp-card-row">
                                <span className="htp-card-name">Duke</span><span>6</span><span>Gain +1 Influence. Great for bluffing!</span>
                            </div>
                            <div className="htp-card-row">
                                <span className="htp-card-name">Assassin</span><span>7</span><span>Destroy an opponent's slot card instantly.</span>
                            </div>
                            <div className="htp-card-row">
                                <span className="htp-card-name">King</span><span>8</span><span>Opponent −2 Influence. Tie if both hold a King.</span>
                            </div>
                        </div>
                    </section>

                    {/* ── Tips ── */}
                    <section className="htp-section">
                        <h2 className="htp-heading">💡 Pro Tips</h2>
                        <ul className="htp-list">
                            <li><strong>Bluff wisely.</strong> Declaring a Duke when you have a Knight can bait out a challenge and waste your opponent's turn.</li>
                            <li><strong>Track discards.</strong> The game log shows which cards have been played. Use it to deduce what's left.</li>
                            <li><strong>Ward is your shield.</strong> Use Bishop before risky turns to block Assassin and Knight effects.</li>
                            <li><strong>The King is double-edged.</strong> If your opponent also holds a King, both players are exposed and eliminated.</li>
                        </ul>
                    </section>

                    <div style={{ textAlign: 'center', marginTop: '24px' }}>
                        <button className="btn btn-gold btn-wide" onClick={() => navigate('/')}>
                            Ready to Play →
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
