import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWalletStore } from '../store/useWalletStore';
import { socket } from '../lib/socket';

export default function Lobby() {
    const navigate = useNavigate();
    const { address, isHydrated, disconnect } = useWalletStore();
    const [roomIdInput, setRoomIdInput] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isHydrated && !address) navigate('/');
    }, [isHydrated, address, navigate]);

    if (!isHydrated || !address) return (
        <div className="loading-screen">
            <p className="loading-title animate-pulse">Loading…</p>
        </div>
    );

    const handleCreate = () => {
        setLoading(true);
        socket.emit('room:create', { walletAddress: address }, (res: any) => {
            setLoading(false);
            if (res?.success) navigate(`/waiting/${res.roomId}`);
            else alert(res?.error ?? 'Failed to create room');
        });
    };

    const handleJoin = () => {
        const id = roomIdInput.trim().toUpperCase();
        if (!id) return;
        setLoading(true);
        socket.emit('room:join', { roomId: id, walletAddress: address }, (res: any) => {
            setLoading(false);
            if (res?.success) navigate(`/waiting/${id}`);
            else alert(res?.error ?? 'Failed to join room');
        });
    };

    const handleLogout = async () => {
        await disconnect();
        navigate('/');
    };

    return (
        <div className="page">
            <div className="page-bg" style={{ backgroundImage: 'url(/background.png)' }} />
            <div className="page-overlay" />

            <div className="page-content fade-in">
                <div className="glass lobby-container">
                    <div className="lobby-header">
                        <h1 className="lobby-title font-display">⚜ The Court</h1>
                        <p className="lobby-addr">
                            {address.slice(0, 8)}…{address.slice(-6)}
                        </p>
                    </div>

                    <div className="lobby-section">
                        <p className="lobby-section-title">Host a Match</p>
                        <button
                            className="btn btn-gold btn-wide"
                            onClick={handleCreate}
                            disabled={loading}
                        >
                            {loading ? 'Creating…' : '+ Create Room'}
                        </button>
                    </div>

                    <div className="lobby-or">— or —</div>

                    <div className="lobby-section">
                        <p className="lobby-section-title">Join a Match</p>
                        <div className="lobby-input-row">
                            <input
                                className="input"
                                placeholder="Enter Room Code"
                                value={roomIdInput}
                                onChange={e => setRoomIdInput(e.target.value.toUpperCase())}
                                maxLength={8}
                                onKeyDown={e => e.key === 'Enter' && handleJoin()}
                            />
                            <button
                                className="btn btn-outline"
                                onClick={handleJoin}
                                disabled={loading || !roomIdInput.trim()}
                                style={{ flexShrink: 0 }}
                            >
                                Join →
                            </button>
                        </div>
                    </div>

                    <div className="lobby-section" style={{ marginTop: '8px' }}>
                        <button
                            className="btn btn-outline btn-wide"
                            onClick={handleLogout}
                            style={{ opacity: 0.6, fontSize: '11px', letterSpacing: '0.12em' }}
                        >
                            ↩ Disconnect Wallet
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
