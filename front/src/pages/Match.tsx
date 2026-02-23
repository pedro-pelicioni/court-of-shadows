import { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useWalletStore } from '../store/useWalletStore';
import { useMatchStore, TurnPhase, CardClass } from '../store/useMatchStore';
import type { SlotPosition } from '../store/useMatchStore';
import { socket } from '../lib/socket';
import CardDisplay from '../components/CardDisplay';

function InfluencePips({ value, side }: { value: number; side: 'mine' | 'opponent' }) {
    const MAX = 5;
    return (
        <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
            {Array.from({ length: MAX }).map((_, i) => (
                <span key={i} className={`influence-pip ${i < value ? `filled ${side}` : 'empty'}`} />
            ))}
        </div>
    );
}

export default function Match() {
    const navigate = useNavigate();
    const location = useLocation();
    const { address, isHydrated } = useWalletStore();
    const { match, setMatch } = useMatchStore();
    // roomId comes from WaitingRoom navigation state, or falls back to match.roomId if already set
    const roomId = (location.state as any)?.roomId ?? match?.roomId;
    const reconnectedRef = useRef(false);

    // Form state for declaring a card
    const [declareClass, setDeclareClass] = useState<CardClass | ''>('');
    const [targetSlot, setTargetSlot] = useState<SlotPosition | ''>('');
    const [targetGuess, setTargetGuess] = useState<CardClass | ''>('');

    useEffect(() => {
        if (isHydrated && !address) { navigate('/'); return; }
        if (!address) return;
        // On mount, ask the server to re-send the current match state
        if (roomId && !reconnectedRef.current) {
            reconnectedRef.current = true;
            socket.emit('room:reconnect', { roomId, walletAddress: address });
        }

        const onState = (s: any) => setMatch(s);
        const onError = (err: string) => { console.error(err); alert(`Error: ${err}`); };
        const onEnded = () => navigate('/result');

        socket.on('match:state', onState);
        socket.on('match:error', onError);
        socket.on('match:ended', onEnded);
        return () => {
            socket.off('match:state', onState);
            socket.off('match:error', onError);
            socket.off('match:ended', onEnded);
        };
    }, [address, navigate, setMatch, roomId]);

    if (!isHydrated || !match) return (
        <div className="loading-screen">
            <p className="loading-title animate-pulse">Loading match…</p>
        </div>
    );

    const handleDraw = () => socket.emit('match:draw', { roomId: match.roomId });
    const handlePlay = (cardId: string) => socket.emit('match:play_card_face_down', { roomId: match.roomId, cardId });
    const handleDeclare = () => {
        if (!declareClass) return alert('Select a class to declare');
        socket.emit('match:declare_card', {
            roomId: match.roomId,
            declaredClass: declareClass,
            targetSlot: targetSlot || undefined,
            targetGuess: targetGuess || undefined
        });
        setDeclareClass(''); setTargetSlot(''); setTargetGuess('');
    };
    const handleResp = (r: string) => socket.emit('match:respond', { roomId: match.roomId, response: r });

    return (
        <div className="match-layout">
            {/* Backgrounds */}
            <div className="match-bg" style={{ backgroundImage: 'url(/background.png)' }} />
            <div className="match-overlay" />
            <div className="match-table-img">
                <img src="/table.png" alt="table" />
            </div>

            {/* ── Opponent HUD ─────────────────────────────── */}
            <div className="hud-bar">
                <div className="hud-player">
                    <div className="hud-avatar">🗡</div>
                    <div className="hud-info">
                        <p className="hud-label">Opponent</p>
                        <p className="hud-addr">{match.opponent.wallet.slice(0, 6)}…{match.opponent.wallet.slice(-4)}</p>
                    </div>
                    <div style={{ display: 'flex', gap: '4px', marginLeft: '8px' }}>
                        {match.opponent.statuses.ward && <span className="badge badge-ward">Ward</span>}
                        {match.opponent.statuses.marked && <span className="badge badge-marked">Marked</span>}
                    </div>
                </div>

                <div className="influence-display">
                    <InfluencePips value={match.opponent.influence} side="opponent" />
                    <span className="influence-value opponent" style={{ marginLeft: '8px' }}>{match.opponent.influence}</span>
                </div>

                {/* Opponent slots (face-down) */}
                <div className="hud-slots">
                    {['L', 'R'].map(slot => (
                        <div key={slot} className="slot-container">
                            <p className="slot-label">Slot {slot}</p>
                            <div className={`board-card face-down ${match.opponent.slotsCount > (slot === 'L' ? 0 : 1) ? '' : 'empty'}`}>
                                {match.opponent.slotsCount > (slot === 'L' ? 0 : 1)
                                    ? <span style={{ fontSize: '24px', opacity: 0.3 }}>⚜</span>
                                    : <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.2)' }}>Empty</span>
                                }
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── Centre: logs + action panel ──────────────── */}
            <div className="match-center">
                <div className="match-log">
                    {match.logs.map((log: string, i: number) => <p key={i}>{log}</p>)}
                </div>

                <div className="action-panel">
                    <p className="action-phase">Phase: {match.phase.replace(/_/g, ' ')}</p>
                    <p className={`action-turn ${match.isYourTurn ? 'mine' : 'opponent'}`}>
                        {match.isYourTurn ? '⚔ Your Turn' : "Opponent's Turn"}
                    </p>

                    <div className="action-buttons">
                        {match.isYourTurn && match.phase === TurnPhase.DRAW && (
                            <button className="btn btn-gold" onClick={handleDraw}>Draw Card</button>
                        )}

                        {match.isYourTurn && match.phase === TurnPhase.PLAY_FACE_DOWN && (
                            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px' }}>Select a card from your hand below</p>
                        )}

                        {match.isYourTurn && match.phase === TurnPhase.DECLARE_CARD && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%', alignItems: 'center' }}>
                                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px' }}>Declare the card you played:</p>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <select className="input" style={{ width: 'auto', padding: '8px 12px' }} value={declareClass} onChange={e => setDeclareClass(e.target.value as CardClass)}>
                                        <option value="" disabled>-- Class --</option>
                                        {Object.values(CardClass).map(c => <option key={c} value={c}>{c.toUpperCase()}</option>)}
                                    </select>
                                    <select className="input" style={{ width: 'auto', padding: '8px 12px' }} value={targetSlot} onChange={e => setTargetSlot(e.target.value as SlotPosition)}>
                                        <option value="">-- Target Slot (Optional) --</option>
                                        <option value="L">Left (L)</option>
                                        <option value="R">Right (R)</option>
                                    </select>
                                </div>
                                {declareClass === CardClass.KNIGHT && (
                                    <select className="input" style={{ width: 'auto', padding: '8px 12px', marginTop: '4px' }} value={targetGuess} onChange={e => setTargetGuess(e.target.value as CardClass)}>
                                        <option value="" disabled>-- Guess Class --</option>
                                        {Object.values(CardClass).map(c => <option key={c} value={c}>{c.toUpperCase()}</option>)}
                                    </select>
                                )}
                                <button className="btn btn-gold btn-sm" style={{ marginTop: '8px' }} onClick={handleDeclare}>Declare Action</button>
                            </div>
                        )}

                        {match.pendingResponseFromYou && match.phase === TurnPhase.RESPONSE_WINDOW && (
                            <>
                                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px', width: '100%', textAlign: 'center', marginBottom: '8px' }}>
                                    Opponent declared <strong style={{ color: '#c8973a' }}>{match.currentAction?.declaredClass?.toUpperCase()}</strong>
                                </p>
                                <button className="btn btn-success btn-sm" onClick={() => handleResp('accept')}>Accept</button>
                                <button className="btn btn-danger btn-sm" onClick={() => handleResp('challenge')}>Challenge</button>
                                <button className="btn btn-sm" style={{ background: 'rgba(139,92,246,0.25)', border: '1px solid rgba(139,92,246,0.4)', color: '#c4b5fd' }} onClick={() => handleResp('counter')}>Counter</button>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Player HUD + slots ────────────────────────── */}
            <div className="hud-bar" style={{ borderTop: '1px solid rgba(255,255,255,0.07)', borderBottom: 'none' }}>
                {/* Player slots */}
                <div className="hud-slots">
                    {(['L', 'R'] as const).map(slot => (
                        <div key={slot} className="slot-container">
                            <p className="slot-label">Slot {slot}</p>
                            {match.you.slots[slot]
                                ? <CardDisplay
                                    card={match.you.slots[slot]!}
                                    isPlayable={match.isYourTurn && match.phase === TurnPhase.PLAY_FACE_DOWN}
                                    onPlay={handlePlay}
                                    compact
                                />
                                : <div className="board-card empty"><span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.2)' }}>Empty</span></div>
                            }
                        </div>
                    ))}
                </div>

                <div className="influence-display">
                    <span className="influence-value mine" style={{ marginRight: '8px' }}>{match.you.influence}</span>
                    <InfluencePips value={match.you.influence} side="mine" />
                </div>

                <div className="hud-player" style={{ flexDirection: 'row-reverse' }}>
                    <div className="hud-avatar">👑</div>
                    <div className="hud-info" style={{ textAlign: 'right' }}>
                        <p className="hud-label">You</p>
                        <p className="hud-addr">{match.you.wallet.slice(0, 6)}…{match.you.wallet.slice(-4)}</p>
                    </div>
                    <div style={{ display: 'flex', gap: '4px', marginRight: '8px' }}>
                        {match.you.statuses.ward && <span className="badge badge-ward">Ward</span>}
                        {match.you.statuses.marked && <span className="badge badge-marked">Marked</span>}
                    </div>
                </div>
            </div>

            {/* ── Hand ─────────────────────────────────────── */}
            <div className="hand-zone">
                {match.you.hand.length === 0
                    ? <p className="hand-empty">Hand empty — draw a card</p>
                    : match.you.hand.map((card: any) => (
                        <CardDisplay
                            key={card.id}
                            card={card}
                            isPlayable={match.isYourTurn && match.phase === TurnPhase.PLAY_FACE_DOWN}
                            onPlay={handlePlay}
                        />
                    ))
                }
            </div>
        </div>
    );
}
