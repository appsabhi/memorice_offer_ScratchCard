import React, { useRef, useEffect, useState } from 'react';

import memoiceLogo from '../assets/png/memoice_logo.png';
import campaignCallImg from '../assets/png/memorice_hilite_campaign_call.png';

const ScratchCard = ({ onReveal, offer }) => {
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
    if (!canvas) return;
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
    // 1. Silver metallic foil base
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#e2e8f0');
    gradient.addColorStop(0.3, '#cbd5e1');
    gradient.addColorStop(0.5, '#94a3b8');
    gradient.addColorStop(0.7, '#cbd5e1');
    gradient.addColorStop(1, '#64748b');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    
    // 2. Diagonal foil pattern (watermark/stripes)
    ctx.save();
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    for (let i = -width; i < width * 2; i += 25) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i + height, height);
      ctx.stroke();
    }
    
    // Cross diagonal
    ctx.strokeStyle = 'rgba(0,0,0,0.04)';
    for (let i = -width; i < width * 2; i += 25) {
      ctx.beginPath();
      ctx.moveTo(i, height);
      ctx.lineTo(i + height, 0);
      ctx.stroke();
    }
    ctx.restore();

    // 3. Dense noise for foil texture
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    for(let i=0; i<4000; i++) {
      ctx.fillRect(Math.random() * width, Math.random() * height, 1.2, 1.2);
    }
    ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
    for(let i=0; i<4000; i++) {
      ctx.fillRect(Math.random() * width, Math.random() * height, 1.5, 1.5);
    }

    // 4. Scratch Area Border (Dashed)
    ctx.strokeStyle = 'rgba(71, 85, 105, 0.7)';
    ctx.lineWidth = 3;
    ctx.setLineDash([8, 8]);
    ctx.strokeRect(15, 15, width - 30, height - 30);
    ctx.setLineDash([]); // Reset
    
    // 5. Instruction text
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    const drawText = (text, y, fontSize, fontWeight = '800', isAccent = false) => {
      ctx.font = `${fontWeight} ${fontSize}px Outfit, sans-serif`;
      
      // Foil shadow effect
      ctx.fillStyle = 'rgba(255,255,255, 0.8)';
      ctx.fillText(text, width / 2 + 1.5, y + 1.5);
      
      ctx.fillStyle = 'rgba(0,0,0, 0.5)';
      ctx.fillText(text, width / 2 - 1, y - 1);
      
      // Main color
      ctx.fillStyle = isAccent ? '#1e293b' : '#334155';
      ctx.fillText(text, width / 2, y);
    };

    drawText('✨', height * 0.28, 36);
    drawText('SCRATCH HERE', height * 0.45, 30, '900', true);
    drawText('TO REVEAL', height * 0.58, 20, '700');
    drawText('YOUR SURPRISE', height * 0.70, 20, '700');
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
          
          <div className="success-icon bounce" style={{ fontSize: '4rem', marginBottom: '5px' }}>🎉</div>
          <h2 style={{ color: 'var(--primary-blue)', fontSize: '1.8rem', marginBottom: '10px', fontWeight: '700' }}>YAY! YOU GOT IT!</h2>
          
          <div className="success-reward-card" style={{ transform: 'scale(0.9)', transformOrigin: 'top center', marginBottom: '0' }}>
            <span className="reward-label">🍦 YOUR REWARD</span>
            <div className="reward-offer">{offer}</div>
          </div>
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
