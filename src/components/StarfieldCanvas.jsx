import { useEffect, useRef } from 'react';

export default function StarfieldCanvas() {
  const canvasRef = useRef(null);

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
    let stars = [];

    const createStars = () => {
      const count = Math.min(140, Math.max(55, Math.floor((width * height) / 16000)));
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * 1.15 + 0.35,
        alpha: Math.random() * 0.4 + 0.1,
        speed: Math.random() * 0.14 + 0.03,
        isCrimson: Math.random() < 0.14,
      }));
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      createStars();
    };

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      for (const star of stars) {
        if (!prefersReducedMotion) {
          star.y -= star.speed;
          if (star.y < -4) {
            star.y = height + 4;
            star.x = Math.random() * width;
          }
        }

        ctx.beginPath();
        ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
        ctx.fillStyle = star.isCrimson
          ? `rgba(255, 23, 68, ${star.alpha * 1.15})`
          : `rgba(255, 255, 255, ${star.alpha})`;
        ctx.fill();
      }

      if (!prefersReducedMotion) {
        animationId = window.requestAnimationFrame(render);
      }
    };

    resize();
    render();

    window.addEventListener('resize', resize);
    return () => {
      window.removeEventListener('resize', resize);
      if (animationId) window.cancelAnimationFrame(animationId);
    };
  }, []);

  return <canvas ref={canvasRef} className="starfield-canvas" aria-hidden="true" />;
}
