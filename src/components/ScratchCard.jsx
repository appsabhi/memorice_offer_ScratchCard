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
    // 1. Solid base color
    ctx.fillStyle = '#FBED1D'; 
    ctx.fillRect(0, 0, width, height);

    // 2. Darker inner circle
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) * 0.35;
    
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fillStyle = '#E5D81A'; // Slightly darker yellow for inner circle
    ctx.fill();

    // 3. Draw Gift Box (like the reference image)
    ctx.save();
    ctx.translate(centerX, centerY);
    // Gift box is upright

    // Apply drop shadow for the box
    ctx.shadowColor = 'rgba(0, 0, 0, 0.15)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetY = 5;

    // Box body (White)
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(-22, -10, 44, 38);
    
    // Disable shadow for inner elements
    ctx.shadowColor = 'transparent';

    // Ribbon vertical (Yellow)
    ctx.fillStyle = '#FFC107'; 
    ctx.fillRect(-5, -10, 10, 38);
    
    // Box lid shadow (small gray line under lid)
    ctx.fillStyle = 'rgba(0,0,0,0.06)';
    ctx.fillRect(-22, -10, 44, 4);
    
    // Re-enable shadow for the lid
    ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
    ctx.shadowBlur = 6;
    ctx.shadowOffsetY = 3;

    // Box lid (White)
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(-26, -22, 52, 12);
    
    ctx.shadowColor = 'transparent';

    // Ribbon on lid
    ctx.fillStyle = '#FFC107'; 
    ctx.fillRect(-5, -22, 10, 12);
    
    // Bow (Yellow)
    ctx.lineWidth = 3.5;
    ctx.strokeStyle = '#FFC107';
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    // Left loop
    ctx.beginPath();
    ctx.ellipse(-10, -28, 9, 5, -15 * Math.PI / 180, 0, Math.PI * 2);
    ctx.stroke();
    
    // Right loop
    ctx.beginPath();
    ctx.ellipse(10, -28, 9, 5, 15 * Math.PI / 180, 0, Math.PI * 2);
    ctx.stroke();
    
    // Center knot
    ctx.fillStyle = '#FFC107';
    ctx.beginPath();
    ctx.arc(0, -25, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    // 4. Draw Text on Scratch Area
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '800 24px Fredoka, sans-serif';

    const textLines = ['SCRATCH &', 'WIN'];
    const startY = height * 0.82; // Move to the bottom section
    
    textLines.forEach((line, index) => {
      const y = startY + (index * 26);
      
      // Main text color
      ctx.fillStyle = '#23A2FF'; 
      ctx.fillText(line, centerX, y);
    });
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
