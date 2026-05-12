import { useEffect, useRef } from "react";
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion";

function createParticle(width, height) {
  return {
    x: Math.random() * width,
    y: Math.random() * height,
    vx: (Math.random() - 0.5) * 0.28,
    vy: (Math.random() - 0.5) * 0.28,
    size: Math.random() * 2 + 0.6,
  };
}

export function ParticleBackground() {
  const canvasRef = useRef(null);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return undefined;
    }

    const context = canvas.getContext("2d");
    if (!context) {
      return undefined;
    }

    const pointer = {
      x: -9999,
      y: -9999,
      active: false,
    };

    let animationFrame = 0;
    let width = 0;
    let height = 0;
    let particles = [];

    const setCanvasSize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = width * ratio;
      canvas.height = height * ratio;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      const count = reducedMotion ? 22 : Math.min(70, Math.round((width * height) / 26000));
      particles = Array.from({ length: count }, () => createParticle(width, height));
    };

    const render = () => {
      context.clearRect(0, 0, width, height);

      particles.forEach((particle, index) => {
        particle.x += particle.vx;
        particle.y += particle.vy;

        if (particle.x < -20 || particle.x > width + 20) {
          particle.vx *= -1;
        }

        if (particle.y < -20 || particle.y > height + 20) {
          particle.vy *= -1;
        }

        if (pointer.active && !reducedMotion) {
          const dx = particle.x - pointer.x;
          const dy = particle.y - pointer.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 120) {
            particle.x += (dx / Math.max(distance, 1)) * 1.8;
            particle.y += (dy / Math.max(distance, 1)) * 1.8;
          }
        }

        context.beginPath();
        context.fillStyle = index % 3 === 0 ? "rgba(86, 177, 255, 0.55)" : index % 2 === 0 ? "rgba(255, 255, 255, 0.22)" : "rgba(245, 158, 11, 0.24)";
        context.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        context.fill();
      });

      for (let i = 0; i < particles.length; i += 1) {
        for (let j = i + 1; j < particles.length; j += 1) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 120) {
            context.strokeStyle = `rgba(148, 163, 184, ${0.13 - distance / 1000})`;
            context.lineWidth = 1;
            context.beginPath();
            context.moveTo(particles[i].x, particles[i].y);
            context.lineTo(particles[j].x, particles[j].y);
            context.stroke();
          }
        }
      }

      animationFrame = window.requestAnimationFrame(render);
    };

    const handlePointerMove = (event) => {
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      pointer.active = true;
    };

    const handlePointerLeave = () => {
      pointer.active = false;
      pointer.x = -9999;
      pointer.y = -9999;
    };

    setCanvasSize();
    render();

    window.addEventListener("resize", setCanvasSize);
    window.addEventListener("mousemove", handlePointerMove);
    window.addEventListener("mouseleave", handlePointerLeave);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener("resize", setCanvasSize);
      window.removeEventListener("mousemove", handlePointerMove);
      window.removeEventListener("mouseleave", handlePointerLeave);
    };
  }, [reducedMotion]);

  return <canvas ref={canvasRef} className="pointer-events-none fixed inset-0 z-0 opacity-80" aria-hidden="true" />;
}
