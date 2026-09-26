import React, { useRef, useEffect, useState } from 'react';

import memoiceLogo from '../assets/png/memoice_logo.png';
import campaignCallImg from '../assets/png/memorice_hilite_campaign_call.png';

const ScratchCard = ({ onReveal, onClaimClick, offer }) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [hasStartedScratching, setHasStartedScratching] = useState(false);

  // Configuration for the scratch off layer
  const scratchRadius = 25; // Size of the scratch brush
  const revealThreshold = 40; // Percentage to reveal before auto-reveal

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    
    // Set proper canvas size based on container
    const resizeCanvas = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        canvas.width = width;
        canvas.height = height;
        
        // Draw the scratch cover
        drawCover(ctx, width, height);
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    return () => window.removeEventListener('resize', resizeCanvas);
  }, []);

  const drawCover = (ctx, width, height) => {
    // 1. Premium silver pearl base coating
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#f8f9fa');
    gradient.addColorStop(0.5, '#e9ecef');
    gradient.addColorStop(1, '#dee2e6');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    
    // 2. Faint shapes (Hint of the prize underneath)
    ctx.save();
    ctx.globalAlpha = 0.06;
    // Faint scattered dots/decorations
    ctx.fillStyle = '#FF6B9E';
    ctx.beginPath(); ctx.arc(width * 0.8, height * 0.2, 15, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#FFE600';
    ctx.beginPath(); ctx.arc(width * 0.2, height * 0.8, 20, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#4CC7EC';
    ctx.beginPath(); ctx.arc(width * 0.85, height * 0.85, 10, 0, Math.PI * 2); ctx.fill();
    ctx.restore();

    // 3. Premium subtle grain/noise for realism
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    for(let i=0; i<1500; i++) {
      ctx.fillRect(Math.random() * width, Math.random() * height, 1.2, 1.2);
    }
    ctx.fillStyle = 'rgba(0,0,0,0.05)';
    for(let i=0; i<1500; i++) {
      ctx.fillRect(Math.random() * width, Math.random() * height, 1.2, 1.2);
    }
    
    // 4. Premium instruction text (Engraved effect)
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    const drawTextWithShadow = (text, y, fontSize, fontWeight = '800') => {
      ctx.font = `${fontWeight} ${fontSize}px Outfit, sans-serif`;
      
      // Bottom highlight
      ctx.fillStyle = 'rgba(255,255,255, 0.9)'; 
      ctx.fillText(text, width / 2, y + 1.5);
      
      // Top inner shadow
      ctx.fillStyle = 'rgba(15, 68, 111, 0.25)'; 
      ctx.fillText(text, width / 2, y - 1);
      
      // Main text color (slate/silver)
      ctx.fillStyle = '#64748b'; 
      ctx.fillText(text, width / 2, y);
    };

    drawTextWithShadow('✨', height * 0.28, 28);
    drawTextWithShadow('SCRATCH', height * 0.45, 24);
    drawTextWithShadow('TO UNLOCK', height * 0.58, 18, '600');
    drawTextWithShadow('YOUR TREAT!', height * 0.71, 24);
  };

  const getPosition = (e, canvas) => {
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const scratch = (e) => {
    if (!isDrawing || revealed) return;
    e.preventDefault(); // Prevent scrolling on mobile

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    const pos = getPosition(e, canvas);

    if (!hasStartedScratching) setHasStartedScratching(true);

    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, scratchRadius, 0, Math.PI * 2);
    ctx.fill();

    checkReveal(ctx, canvas);
  };

  const checkReveal = (ctx, canvas) => {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;
    let transparentPixels = 0;

    // Check every 4th byte (alpha channel)
    for (let i = 3; i < pixels.length; i += 4) {
      if (pixels[i] === 0) {
        transparentPixels++;
      }
    }

    const totalPixels = pixels.length / 4;
    const percentage = (transparentPixels / totalPixels) * 100;

    if (percentage > revealThreshold && !revealed) {
      setRevealed(true);
      // Optional: Clear the rest of the canvas automatically
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      onReveal(); // Trigger the popper in App immediately
    }
  };

  const handleDown = (e) => {
    if (revealed) return;
    setIsDrawing(true);
    // Draw initial dot
    scratch(e);
  };

  const handleUp = () => {
    setIsDrawing(false);
  };

  return (
    <div className="scratch-card-container">
      
      <div className="scratch-card-wrapper" ref={containerRef}>
        <div className="prize-container">
          <div className="prize-decorations">
            <div className="dec-dot pink"></div>
            <div className="dec-dot cyan"></div>
            <div className="dec-star yellow">✨</div>
          </div>
          
          <div className="prize-icon bounce" style={{ fontSize: '4rem', marginBottom: '5px' }}>🎉</div>
          <h2 className="prize-title" style={{ fontSize: '1.8rem', marginBottom: '10px' }}>YOU WON!</h2>
          <div className="winning-offer" style={{ fontSize: '1.15rem', padding: '16px', marginBottom: '20px' }}>{offer}</div>
          
          {revealed && (
            <button 
              onClick={onClaimClick} 
              className="submit-btn yum-btn" 
              style={{ fontSize: '1.1rem', padding: '12px 20px', width: '90%' }}
            >
              🍦 YUM! LET'S GO!
            </button>
          )}
        </div>
        
        {/* Scratch Canvas (Removed completely after reveal) */}
        {!revealed && (
          <canvas
            ref={canvasRef}
            className="scratch-canvas"
            onMouseDown={handleDown}
            onMouseMove={scratch}
            onMouseUp={handleUp}
            onMouseLeave={handleUp}
            onTouchStart={handleDown}
            onTouchMove={scratch}
            onTouchEnd={handleUp}
            onTouchCancel={handleUp}
          />
        )}
        
        {/* Animated Hand Indicator */}
        {!hasStartedScratching && !revealed && (
          <div className="scratch-indicator">
            <span className="hand">👆</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScratchCard;
