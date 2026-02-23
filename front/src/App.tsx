import { useEffect, useRef, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Lobby from './pages/Lobby';
import WaitingRoom from './pages/WaitingRoom';
import Match from './pages/Match';
import MatchResult from './pages/MatchResult';
import { useWalletStore } from './store/useWalletStore';

function App() {
  const restoreSession = useWalletStore(s => s.restoreSession);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    restoreSession();

    // Start audio on first interaction (browsers block raw autoplay)
    const handleFirstClick = () => {
      if (audioRef.current && audioRef.current.paused) {
        audioRef.current.play().then(() => setIsPlaying(true)).catch(() => { });
      }
      document.removeEventListener('click', handleFirstClick);
    };
    document.addEventListener('click', handleFirstClick);
    return () => document.removeEventListener('click', handleFirstClick);
  }, [restoreSession]);

  const toggleMute = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => { });
    }
  };

  return (
    <Router>
      {/* Global Background Audio */}
      <audio ref={audioRef} src="/soundtrack.mp3" loop />

      {/* Floating Mute/Unmute Button */}
      <button
        onClick={toggleMute}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          zIndex: 9999,
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          background: 'rgba(0, 0, 0, 0.6)',
          border: '1px solid rgba(200, 151, 58, 0.4)',
          color: '#c8973a',
          fontSize: '18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          backdropFilter: 'blur(4px)',
          transition: 'transform 0.2s'
        }}
        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
        title={isPlaying ? 'Mute Music' : 'Play Music'}
      >
        {isPlaying ? '♪' : '🔇'}
      </button>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/lobby" element={<Lobby />} />
        <Route path="/waiting/:roomId" element={<WaitingRoom />} />
        <Route path="/match" element={<Match />} />
        <Route path="/result" element={<MatchResult />} />
      </Routes>
    </Router>
  );
}

export default App;
