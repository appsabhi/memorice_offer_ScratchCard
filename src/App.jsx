import React, { useState } from 'react';
import ScratchCard from './components/ScratchCard';
import ClaimForm from './components/ClaimForm';
import './index.css';

import memoiceLogo from './assets/png/memoice_logo.png';
import campaignCallImg from './assets/png/memorice_hilite_campaign_call.png';
const campaignConfig = {
  campaignTitle: "SCRATCH & WIN!",
  campaignSubtitle: "Scratch the popsicle and reveal your surprise!",
  offers: [
    "FREE CANDY",
    "FREE ₹20 WORTH ICE CREAM",
    "FREE ₹30 WORTH ICE CREAM",
    "FREE ₹40 WORTH ICE CREAM",
    "FREE ₹100 WORTH ICE CREAM",
    "FREE ₹500 WORTH ICE CREAM"
  ]
};

function App() {
  const [selectedOffer] = useState(() => campaignConfig.offers[Math.floor(Math.random() * campaignConfig.offers.length)]);
  const [isScratched, setIsScratched] = useState(false);
  const [showPopper, setShowPopper] = useState(false);
  const [isClaimed, setIsClaimed] = useState(false);
  const [showClaimForm, setShowClaimForm] = useState(false);

  // Popper effect when scratched (Premium Celebration)
  const Popper = () => {
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
  };

  // Fun animated popsicles for the background
  const FallingPopsicles = () => {
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
  };

  return (
    <>
      <div className="bg-decorations" />
      
      <div className="app-container">
        <header className="header">
          <img src={memoiceLogo} alt="Memorice Cream" className="logo" />
        </header>

        <main className='main-sec'>
          {!showClaimForm && !isClaimed && (
            <div className="campaign-layout">
              <div className="campaign-top-wrapper">
                <img src={campaignCallImg} alt="Campaign Offer" className="campaign-call-img-top" />
              </div>

              <ScratchCard 
                onReveal={() => {
                  setIsScratched(true);
                  setShowPopper(true);
                  setTimeout(() => setShowPopper(false), 3000);
                }} 
                onClaimClick={() => setShowClaimForm(true)} 
                offer={selectedOffer} 
              />
            </div>
          )}

          {showPopper && !showClaimForm && !isClaimed && (
            <Popper />
          )}

          {showClaimForm && !isClaimed && (
            <ClaimForm onClaim={() => setIsClaimed(true)} />
          )}

          {isClaimed && (
            <div className="success-state">
              <div className="success-icon">🎉</div>
              <h2>Reward Claimed!</h2>
              <p>Your Memorice surprise is ready! Keep an eye on your phone/email.</p>
            </div>
          )}
        </main>
      </div>
    </>
  );
}

export default App;
