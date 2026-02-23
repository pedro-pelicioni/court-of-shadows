import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWalletStore } from '../store/useWalletStore';

export default function Home() {
    const navigate = useNavigate();
    const { address, isConnecting, isFunded, connect, fundAccount } = useWalletStore();

    useEffect(() => {
        if (address && isFunded) navigate('/lobby');
    }, [address, isFunded, navigate]);

    return (
        <div className="page">
            <div className="page-bg" style={{ backgroundImage: 'url(/home.png)' }} />
            <div className="page-overlay" />

            <div className="page-content fade-in">
                <div className="glass home-card">
                    <p className="home-eyebrow">A Game of Deception</p>
                    <h1 className="home-title font-display">COURT<br />OF<br />SHADOWS</h1>
                    <p className="home-subtitle">Bluff. Challenge. Conquer.</p>

                    {!address ? (
                        <button
                            className="btn btn-gold btn-wide"
                            onClick={connect}
                            disabled={isConnecting}
                        >
                            {isConnecting ? 'Connecting…' : 'Connect Wallet'}
                        </button>
                    ) : (
                        <div>
                            <div className="home-info-card" style={{ marginBottom: '14px' }}>
                                <p style={{ fontSize: '9px', letterSpacing: '0.15em', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', marginBottom: '6px' }}>Connected Wallet</p>
                                <p className="home-address">{address.slice(0, 8)}…{address.slice(-6)}</p>
                            </div>

                            {isFunded === false && (
                                <div className="home-fund-card">
                                    <p style={{ fontSize: '13px', color: '#fca5a5', marginBottom: '12px' }}>This account is not funded on Testnet.</p>
                                    <button
                                        className="btn btn-danger btn-wide btn-sm"
                                        onClick={fundAccount}
                                        disabled={isConnecting}
                                    >
                                        {isConnecting ? 'Funding…' : 'Fund with Friendbot'}
                                    </button>
                                </div>
                            )}

                            {isFunded && (
                                <button
                                    className="btn btn-gold btn-wide"
                                    onClick={() => navigate('/lobby')}
                                >
                                    Enter the Court →
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
