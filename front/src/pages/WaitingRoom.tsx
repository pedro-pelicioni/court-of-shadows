import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useWalletStore } from '../store/useWalletStore';
import { socket } from '../lib/socket';
import RulesModal from '../components/RulesModal';

interface RoomState {
    id: string;
    host: { id: string; walletAddress: string };
    guest?: { id: string; walletAddress: string };
    status: string;
}

export default function WaitingRoom() {
    const { roomId } = useParams<{ roomId: string }>();
    const navigate = useNavigate();
    const { address, isHydrated } = useWalletStore();
    const [room, setRoom] = useState<RoomState | null>(null);

    useEffect(() => {
        if (isHydrated && !address) { navigate('/'); return; }
        if (!address) return;

        socket.emit('room:get', { roomId }, (res: any) => {
            if (res?.success) setRoom(res.room);
        });

        const onUpdate = (r: RoomState) => setRoom(r);
        const onStarted = () => navigate('/match', { state: { roomId } });

        socket.on('room:update', onUpdate);
        socket.on('match:started', onStarted);
        return () => {
            socket.off('room:update', onUpdate);
            socket.off('match:started', onStarted);
        };
    }, [roomId, navigate, address]);

    if (!isHydrated || !address) return (
        <div className="loading-screen">
            <p className="loading-title animate-pulse">Loading…</p>
        </div>
    );

    const isHost = room?.host?.walletAddress === address;
    const hasGuest = !!room?.guest;

    return (
        <div className="page">
            <RulesModal />
            <div className="page-bg" style={{ backgroundImage: 'url(/background.png)' }} />
            <div className="page-overlay" />

            <div className="page-content fade-in">
                <div className="glass waiting-container">
                    <p style={{ fontSize: '10px', letterSpacing: '0.2em', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', marginBottom: '8px' }}>Room Code</p>
                    <div className="waiting-room-id font-display">{roomId}</div>
                    <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', marginBottom: '24px' }}>
                        {isHost ? 'Share this code with your opponent' : 'Waiting for host to start the match'}
                    </p>

                    <div className="waiting-players">
                        {/* Host */}
                        <div className={`player-slot ${room?.host ? 'active' : ''}`}>
                            <div style={{ fontSize: '24px', marginBottom: '8px' }}>👑</div>
                            <p style={{ fontSize: '10px', letterSpacing: '0.12em', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', marginBottom: '4px' }}>Host</p>
                            {room?.host
                                ? <p style={{ fontSize: '11px', fontFamily: 'monospace', color: '#c8973a' }}>
                                    {room.host.walletAddress.slice(0, 6)}…{room.host.walletAddress.slice(-4)}
                                </p>
                                : <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.2)' }}>Waiting…</p>
                            }
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', padding: '0 6px', color: 'rgba(255,255,255,0.15)', fontSize: '20px' }}>⚔</div>

                        {/* Guest */}
                        <div className={`player-slot ${hasGuest ? 'active' : ''}`}>
                            <div style={{ fontSize: '24px', marginBottom: '8px' }}>{hasGuest ? '🗡' : '⌛'}</div>
                            <p style={{ fontSize: '10px', letterSpacing: '0.12em', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', marginBottom: '4px' }}>Challenger</p>
                            {hasGuest
                                ? <p style={{ fontSize: '11px', fontFamily: 'monospace', color: '#60a5fa' }}>
                                    {room!.guest!.walletAddress.slice(0, 6)}…{room!.guest!.walletAddress.slice(-4)}
                                </p>
                                : <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.2)' }}>Waiting…</p>
                            }
                        </div>
                    </div>

                    {isHost ? (
                        <button
                            className="btn btn-gold btn-wide"
                            disabled={!hasGuest}
                            onClick={() => socket.emit('room:start_match', { roomId })}
                        >
                            {hasGuest ? 'Start Match →' : 'Waiting for opponent…'}
                        </button>
                    ) : (
                        <div className="animate-pulse" style={{ fontSize: '13px', color: 'rgba(255,255,255,0.3)', padding: '14px 0' }}>
                            Waiting for host to start…
                        </div>
                    )}

                    <button
                        className="btn btn-outline btn-sm btn-wide"
                        style={{ marginTop: '12px' }}
                        onClick={() => navigate('/lobby')}
                    >
                        ← Leave Room
                    </button>
                </div>
            </div>
        </div>
    );
}
