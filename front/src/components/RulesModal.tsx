import { useState } from 'react';

export default function RulesModal() {
    const [open, setOpen] = useState(false);

    return (
        <>
            {/* Floating trigger button */}
            <button
                className="rules-trigger"
                onClick={() => setOpen(true)}
                title="Game Rules"
            >
                📜
            </button>

            {/* Full-screen modal */}
            {open && (
                <div className="rules-backdrop" onClick={() => setOpen(false)}>
                    <div className="rules-modal" onClick={e => e.stopPropagation()}>
                        <button className="rules-close" onClick={() => setOpen(false)}>✕</button>

                        <h1 className="font-display" style={{ color: '#c8973a', fontSize: '24px', marginBottom: '4px', textAlign: 'center' }}>HOW TO PLAY</h1>
                        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '11px', textAlign: 'center', marginBottom: '20px', letterSpacing: '0.12em' }}>QUICK REFERENCE</p>

                        {/* ── Objective ── */}
                        <section className="htp-section">
                            <h2 className="htp-heading">🎯 Objective</h2>
                            <p className="htp-text">
                                Reduce your opponent's <strong>Influence</strong> from <strong>3 to 0</strong>.
                                Each player has 2 face-down cards in <em>Slots</em> (L & R). You don't know your opponent's cards.
                            </p>
                        </section>

                        {/* ── Turn Flow ── */}
                        <section className="htp-section">
                            <h2 className="htp-heading">⚔ Your Turn</h2>
                            <div className="htp-steps">
                                <div className="htp-step">
                                    <span className="htp-step-num">1</span>
                                    <div><strong>Draw</strong><p>Pull a card from the deck.</p></div>
                                </div>
                                <div className="htp-step">
                                    <span className="htp-step-num">2</span>
                                    <div><strong>Play Face-Down</strong><p>Click a card to play it hidden.</p></div>
                                </div>
                                <div className="htp-step">
                                    <span className="htp-step-num">3</span>
                                    <div><strong>Declare</strong><p>Announce which card you played. <em>You can lie!</em> Pick target slot if needed.</p></div>
                                </div>
                                <div className="htp-step">
                                    <span className="htp-step-num">4</span>
                                    <div><strong>Response</strong><p>Opponent: <strong>Accept</strong>, <strong>Challenge</strong>, or <strong>Counter</strong>.</p></div>
                                </div>
                            </div>
                        </section>

                        {/* ── Challenge ── */}
                        <section className="htp-section">
                            <h2 className="htp-heading">🧠 Challenge</h2>
                            <ul className="htp-list">
                                <li><strong>Lied →</strong> Attacker loses 1 Influence. Effect cancelled.</li>
                                <li><strong>Honest →</strong> Challenger loses 1 Influence. Effect resolves.</li>
                            </ul>
                        </section>

                        {/* ── Card Table ── */}
                        <section className="htp-section">
                            <h2 className="htp-heading">🃏 Cards</h2>
                            <div className="htp-card-table">
                                <div className="htp-card-row htp-card-header">
                                    <span>Card</span><span>Rank</span><span>Effect</span>
                                </div>
                                <div className="htp-card-row">
                                    <span className="htp-card-name">Knight</span><span>1</span><span>Guess opponent's slot card. Correct = −1 Influence.</span>
                                </div>
                                <div className="htp-card-row">
                                    <span className="htp-card-name">Herald</span><span>2</span><span>Mark an opponent's slot.</span>
                                </div>
                                <div className="htp-card-row">
                                    <span className="htp-card-name">Baron</span><span>3</span><span>Rank duel. Higher rank wins, loser −1 Influence.</span>
                                </div>
                                <div className="htp-card-row">
                                    <span className="htp-card-name">Bishop</span><span>4</span><span>Gain Ward (block next targeted effect).</span>
                                </div>
                                <div className="htp-card-row">
                                    <span className="htp-card-name">Countess</span><span>5</span><span>Opponent discards a random hand card.</span>
                                </div>
                                <div className="htp-card-row">
                                    <span className="htp-card-name">Duke</span><span>6</span><span>Gain +1 Influence.</span>
                                </div>
                                <div className="htp-card-row">
                                    <span className="htp-card-name">Assassin</span><span>7</span><span>Destroy an opponent's slot card.</span>
                                </div>
                                <div className="htp-card-row">
                                    <span className="htp-card-name">King</span><span>8</span><span>Opponent −2 Influence. Tie if both hold King.</span>
                                </div>
                            </div>
                        </section>

                        <div style={{ textAlign: 'center', marginTop: '16px' }}>
                            <button className="btn btn-gold btn-sm" onClick={() => setOpen(false)}>Got it!</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
