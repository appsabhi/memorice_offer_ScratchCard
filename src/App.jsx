import React, { useState } from 'react';
import ScratchCard from './components/ScratchCard';
import ClaimForm from './components/ClaimForm';
import './index.css';

import memoiceLogo from './assets/png/memoice_logo.png';
import campaignCallImg from './assets/png/memorice_hilite_campaign_call.png';

const SESSION_KEY = 'memorice_campaign_session';
const INSTAGRAM_URL = "https://www.instagram.com/memoricecream/";

const campaignConfig = {
  campaignTitle: "SCRATCH & WIN!",
  campaignSubtitle: "Scratch the popsicle and reveal your surprise!",
  offers: [
    "YOU GOT A FREE ICE CANDY",
    "FREE ICE for ₹20 ",
    "FREE ICE for ₹30 ",
    "FREE ICE for ₹40 ",
    "FREE ICE for ₹100 ",
    "FREE ICE for ₹500 "
  ]
};

const getInitialSession = () => {
  const stored = localStorage.getItem(SESSION_KEY);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      return parsed;
    } catch (e) {
      console.error("Failed to parse session", e);
    }
  }
  const sessionStartedAt = Date.now();
  const newSession = {
    sessionId: Math.random().toString(36).substring(2, 15),
    status: 'CLAIM_FORM', 
    selectedOffer: campaignConfig.offers[Math.floor(Math.random() * campaignConfig.offers.length)],
    scratchCompleted: false,
    sessionStartedAt,
  };
  localStorage.setItem(SESSION_KEY, JSON.stringify(newSession));
  return newSession;
};

// Popper effect when scratched (Premium Celebration)
const Popper = React.memo(() => {
  return (
    <div className="popper-container">
      {[...Array(60)].map((_, i) => {
        const side = Math.random() > 0.5 ? 'left' : 'right';
        const shape = Math.random() > 0.7 ? 'star' : (Math.random() > 0.3 ? 'circle' : 'square');
        const style = {
          left: side === 'left' ? '-5vw' : '105vw',
          bottom: '15vh',
          animation: `pop${side === 'left' ? 'Right' : 'Left'} 1.8s cubic-bezier(0.25, 1, 0.5, 1) forwards`,
          backgroundColor: ['#165F99', '#4CC7EC', '#FFE600', '#FF6B9E', '#FFFFFF'][Math.floor(Math.random() * 5)],
          '--tx': `${(Math.random() * 60 + 20) * (side === 'left' ? 1 : -1)}vw`,
          '--ty': `-${Math.random() * 90 + 10}vh`,
          animationDelay: `${Math.random() * 0.15}s`,
          transform: `scale(${0.5 + Math.random()})`
        };
        return <div key={i} className={`popper-piece ${shape}`} style={style} />;
      })}
    </div>
  );
});

// Fun animated popsicles for the background
const FallingPopsicles = React.memo(() => {
  return (
    <div className="sprinkles-container">
      {[...Array(15)].map((_, i) => {
        const style = {
          left: `${Math.random() * 100}vw`,
          animationDuration: `${12 + Math.random() * 18}s`,
          animationDelay: `-${Math.random() * 15}s`,
          transform: `rotate(${Math.random() * 60 - 30}deg) scale(${0.5 + Math.random() * 1})`
        };
        const color = ['#FFB6C1', '#4CC7EC', '#FFE600', '#FF9999'][Math.floor(Math.random() * 4)];
        
        return (
          <div key={i} className="falling-popsicle" style={style}>
            <div className="popsicle-top" style={{ backgroundColor: color }}></div>
            <div className="popsicle-bottom"></div>
          </div>
        );
      })}
    </div>
  );
});

function App() {
  const [session, setSession] = useState(getInitialSession);
  const [showPopper, setShowPopper] = useState(false);
  const [showDevConfirm, setShowDevConfirm] = useState(false);

  const updateSession = (updates) => {
    setSession(prev => {
      const next = { ...prev, ...updates };
      localStorage.setItem(SESSION_KEY, JSON.stringify(next));
      return next;
    });
  };

  // (Popper and FallingPopsicles moved outside App)

  return (
    <>
      <div className="bg-decorations" />
      
      <div className="app-container">
        <header className="header" style={{ paddingBottom: '15px' }}>
          <img src={memoiceLogo} alt="Memorice Cream" className="logo" />
        </header>

        <div className="campaign-top-wrapper" style={{ marginBottom: '25px' }}>
          <img src={campaignCallImg} alt="Campaign Offer" className="campaign-call-img-top" />
        </div>

        <main className='main-sec'>
          {session.status === 'CLAIM_FORM' && (
            <ClaimForm 
              offer={session.selectedOffer}
              onClaim={() => updateSession({ status: 'ACTIVE_SESSION' })} 
              onAlreadyClaimed={() => updateSession({ status: 'ALREADY_CLAIMED' })}
            />
          )}

          {session.status === 'ACTIVE_SESSION' && (
            <div className="campaign-layout">

              <ScratchCard 
                onReveal={() => {
                  updateSession({ scratchCompleted: true, status: 'REWARD_CLAIMED' });
                  setShowPopper(true);
                  setTimeout(() => setShowPopper(false), 3000);
                }} 
                offer={session.selectedOffer}
              />
            </div>
          )}

          {showPopper && (session.status === 'ACTIVE_SESSION' || session.status === 'REWARD_CLAIMED') && (
            <Popper />
          )}

          {session.status === 'REWARD_CLAIMED' && (
            <div className="success-state">
              <div className="success-decorations">
                <div className="dec-dot pink"></div>
                <div className="dec-dot cyan"></div>
                <div className="dec-star yellow">✨</div>
              </div>
              
              <div className="success-icon bounce">🎉</div>
              <h2>YAY! YOU GOT IT!</h2>
              {/* <p className="subtitle">Your Memorice treat is on its way!</p> */}
              
              <div className="success-reward-card">
                <span className="reward-label">🍦 YOUR REWARD</span>
                <div className="reward-offer">{session.selectedOffer}</div>
              </div>

              <a 
                href={INSTAGRAM_URL} 
                target="_blank" 
                rel="noopener noreferrer" 
                style={{ 
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
                  color: 'white', textDecoration: 'none', padding: '14px 28px',
                  borderRadius: '100px', fontWeight: '700', fontSize: '1.15rem',
                  marginBottom: '16px', boxShadow: '0 6px 20px rgba(220, 39, 67, 0.3)',
                  transition: 'transform 0.2s ease'
                }}
              >
                📸 FOLLOW OUR INSTAGRAM
              </a>

              {/* <p className="next-steps-text" style={{ 
                fontSize: '1.1rem', color: '#64748b', lineHeight: '1.5', 
                marginBottom: '25px', padding: '0 10px', fontWeight: '500'
              }}>
                Take a screenshot of your reward to claim your offer! 🍦
              </p> */}

            </div>
          )}

          {session.status === 'ALREADY_CLAIMED' && (
            <div className="success-state">
              <div className="success-icon bounce" style={{ fontSize: '4rem' }}>🍦</div>
              <h2>ALREADY CLAIMED</h2>
              <p className="subtitle" style={{ fontSize: '1.1rem' }}>Looks like you've already claimed your Memorice offer.</p>
            </div>
          )}
        </main>
      </div>

      {/* DEVELOPMENT ONLY RESET BUTTON */}
      {import.meta.env.DEV && (
        <div style={{ position: 'fixed', bottom: '10px', right: '10px', zIndex: 9999 }}>
          <button 
            onClick={() => setShowDevConfirm(true)}
            style={{
              background: 'rgba(0, 0, 0, 0.6)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', 
              padding: '6px 12px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer',
              fontFamily: 'monospace', fontWeight: 'bold'
            }}
          >
            🔄 DEV RESET
          </button>

          {showDevConfirm && (
            <div style={{
              position: 'absolute', bottom: '35px', right: '0', background: '#ffffff', 
              color: '#333333', padding: '15px', borderRadius: '8px', 
              boxShadow: '0 10px 25px rgba(0,0,0,0.5)', width: '220px',
              fontFamily: 'sans-serif'
            }}>
              <p style={{ margin: '0 0 15px 0', fontSize: '14px', fontWeight: 'bold', textAlign: 'center' }}>Reset this test session?</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px' }}>
                <button 
                  onClick={() => setShowDevConfirm(false)}
                  style={{ flex: 1, background: '#e2e8f0', color: '#475569', border: 'none', padding: '8px 0', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}
                >
                  CANCEL
                </button>
                <button 
                  onClick={() => {
                    localStorage.removeItem(SESSION_KEY);
                    window.location.reload();
                  }}
                  style={{ flex: 1, background: '#ef4444', color: '#ffffff', border: 'none', padding: '8px 0', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}
                >
                  RESET
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}

export default App;
