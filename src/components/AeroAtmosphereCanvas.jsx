import { useEffect, useRef } from 'react';
import { AERO_THEME_MAP } from '../data/aeroThemes';

export default function AeroAtmosphereCanvas({ theme = 'eco' }) {
  const canvasRef = useRef(null);
  const themeRef = useRef(theme);

  useEffect(() => {
    themeRef.current = theme;
  }, [theme]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const ctx = canvas.getContext('2d');
    if (!ctx) return undefined;

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    let animationId = 0;
    let width = 0;
    let height = 0;
    let bubbles = [];
    let bokehOrbs = [];
    let ripples = [];
    let pointer = { x: -9999, y: -9999 };
    let time = 0;

    const createSceneParticles = () => {
      const bubbleCount = Math.min(34, Math.max(16, Math.floor((width * height) / 42000)));
      bubbles = Array.from({ length: bubbleCount }, (_, idx) => {
        const radius = 8 + Math.pow(Math.random(), 1.6) * 34;
        return {
          x: Math.random() * width,
          y: Math.random() * height,
          r: radius,
          speedY: 0.18 + (1 - radius / 44) * 0.42 + Math.random() * 0.18,
          swayAmp: 0.25 + Math.random() * 0.55,
          swayFreq: 0.008 + Math.random() * 0.012,
          phase: Math.random() * Math.PI * 2 + idx,
          alpha: 0.28 + Math.random() * 0.42,
        };
      });

      const bokehCount = Math.min(12, Math.max(6, Math.floor(width / 150)));
      bokehOrbs = Array.from({ length: bokehCount }, () => ({
        x: Math.random() * width,
        y: Math.random() * height * 0.68,
        r: 42 + Math.random() * 96,
        alpha: 0.14 + Math.random() * 0.2,
        drift: (Math.random() - 0.5) * 0.08,
        phase: Math.random() * Math.PI * 2,
      }));
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      createSceneParticles();
    };

    const onPointerMove = (e) => {
      pointer.x = e.clientX;
      pointer.y = e.clientY;
    };

    const onPointerDown = (e) => {
      if (prefersReducedMotion) return;
      ripples.push({
        x: e.clientX,
        y: e.clientY,
        r: 6,
        maxR: 72,
        alpha: 0.5,
      });
      if (ripples.length > 8) ripples.shift();
    };

    const drawRibbon = (baseY, amplitude, freq, phaseOffset, thickness, color) => {
      ctx.save();
      ctx.beginPath();
      const step = Math.max(24, width / 26);

      ctx.moveTo(-40, baseY);
      for (let x = 0; x <= width + 40; x += step) {
        const wave =
          Math.sin(x * freq + time * 0.012 + phaseOffset) * amplitude +
          Math.cos(x * freq * 0.55 - time * 0.008) * (amplitude * 0.45);
        ctx.lineTo(x, baseY + wave);
      }
      for (let x = width + 40; x >= -40; x -= step) {
        const wave =
          Math.sin(x * freq + time * 0.012 + phaseOffset + 0.65) * (amplitude * 0.85) +
          thickness;
        ctx.lineTo(x, baseY + wave);
      }
      ctx.closePath();

      const grad = ctx.createLinearGradient(0, baseY - amplitude, 0, baseY + thickness + amplitude);
      grad.addColorStop(0, color);
      grad.addColorStop(0.55, 'rgba(255, 255, 255, 0.24)');
      grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = grad;
      ctx.fill();
      ctx.restore();
    };

    const drawBubble = (b, palette) => {
      const grad = ctx.createRadialGradient(
        b.x - b.r * 0.34,
        b.y - b.r * 0.34,
        b.r * 0.06,
        b.x,
        b.y,
        b.r
      );
      grad.addColorStop(0, 'rgba(255, 255, 255, 0.72)');
      grad.addColorStop(0.28, palette.bubbleTint);
      grad.addColorStop(0.76, 'rgba(255, 255, 255, 0.06)');
      grad.addColorStop(0.92, palette.bubbleBounce);
      grad.addColorStop(1, palette.bubbleRim);

      ctx.save();
      ctx.globalAlpha = b.alpha;
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();

      ctx.lineWidth = Math.max(0.85, b.r * 0.045);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.72)';
      ctx.stroke();

      // Crisp upper-left glass specular highlight
      ctx.beginPath();
      ctx.ellipse(
        b.x - b.r * 0.34,
        b.y - b.r * 0.36,
        b.r * 0.28,
        b.r * 0.14,
        -Math.PI / 4,
        0,
        Math.PI * 2
      );
      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.fill();

      // Tiny lower-right secondary caustic glint
      ctx.beginPath();
      ctx.arc(b.x + b.r * 0.36, b.y + b.r * 0.38, Math.max(1.2, b.r * 0.08), 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
      ctx.fill();
      ctx.restore();
    };

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      const palette = (AERO_THEME_MAP[themeRef.current] || AERO_THEME_MAP.eco).canvas;

      if (!prefersReducedMotion) {
        time += 1;
      }

      // 1. Soft sunlit sky bokeh
      for (const orb of bokehOrbs) {
        if (!prefersReducedMotion) {
          orb.x += orb.drift;
          if (orb.x < -orb.r) orb.x = width + orb.r;
          if (orb.x > width + orb.r) orb.x = -orb.r;
        }
        const yPulse = orb.y + Math.sin(time * 0.01 + orb.phase) * 6;
        const grad = ctx.createRadialGradient(orb.x, yPulse, 0, orb.x, yPulse, orb.r);
        grad.addColorStop(0, palette.bokeh);
        grad.addColorStop(0.6, 'rgba(255, 255, 255, 0.09)');
        grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(orb.x, yPulse, orb.r, 0, Math.PI * 2);
        ctx.fill();
      }

      // 2. Flowing Vista/XMB-inspired caustic aurora ribbons
      drawRibbon(height * 0.24, 34, 0.0032, 0.2, 68, palette.aurora1);
      drawRibbon(height * 0.44, 42, 0.0025, 2.1, 88, palette.aurora3);
      drawRibbon(height * 0.72, 30, 0.0036, 4.0, 74, palette.aurora2);

      // 3. Buoyant glossy bubbles
      for (const b of bubbles) {
        if (!prefersReducedMotion) {
          b.y -= b.speedY;
          b.x += Math.sin(time * b.swayFreq + b.phase) * b.swayAmp;

          const dx = b.x - pointer.x;
          const dy = b.y - pointer.y;
          const dist = Math.hypot(dx, dy);
          if (dist > 0 && dist < 130) {
            const push = ((130 - dist) / 130) * 1.1;
            b.x += (dx / dist) * push;
            b.y += (dy / dist) * push * 0.5;
          }

          if (b.y < -b.r * 2) {
            b.y = height + b.r * 2;
            b.x = Math.random() * width;
          }
          if (b.x < -b.r * 2) b.x = width + b.r * 2;
          if (b.x > width + b.r * 2) b.x = -b.r * 2;
        }
        drawBubble(b, palette);
      }

      // 4. Water click ripples
      for (let i = ripples.length - 1; i >= 0; i -= 1) {
        const rp = ripples[i];
        rp.r += 2.3;
        rp.alpha *= 0.94;
        if (rp.alpha < 0.02 || rp.r > rp.maxR) {
          ripples.splice(i, 1);
          continue;
        }
        ctx.save();
        ctx.beginPath();
        ctx.arc(rp.x, rp.y, rp.r, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255, 255, 255, ${rp.alpha})`;
        ctx.lineWidth = 1.6;
        ctx.stroke();

        if (rp.r > 12) {
          ctx.beginPath();
          ctx.arc(rp.x, rp.y, rp.r * 0.62, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(180, 248, 255, ${rp.alpha * 0.7})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
        ctx.restore();
      }

      if (!prefersReducedMotion) {
        animationId = window.requestAnimationFrame(render);
      }
    };

    resize();
    render();

    window.addEventListener('resize', resize);
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerdown', onPointerDown, { passive: true });
    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerdown', onPointerDown);
      if (animationId) window.cancelAnimationFrame(animationId);
    };
  }, []);

  return <canvas ref={canvasRef} className="aero-atmosphere-canvas" aria-hidden="true" />;
}
