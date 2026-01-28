import { useEffect, useRef } from 'react';

interface ConstellationBackgroundProps {
  nodes: Array<{ x: number; y: number; depth: number }>;
  sparkPosition?: { x: number; y: number };
}

export function ConstellationBackground({ nodes, sparkPosition }: ConstellationBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Draw nebula gradients (radial gradients from center)
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const maxRadius = Math.max(canvas.width, canvas.height) * 0.8;

    // Multiple layered nebula gradients
    const gradients = [
      { radius: maxRadius * 0.4, opacity: 0.03, r: 72, g: 159, b: 227 },
      { radius: maxRadius * 0.6, opacity: 0.02, r: 30, g: 102, b: 245 },
      { radius: maxRadius * 0.8, opacity: 0.015, r: 72, g: 159, b: 227 },
    ];

    gradients.forEach((grad) => {
      const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, grad.radius);
      gradient.addColorStop(0, `rgba(${grad.r}, ${grad.g}, ${grad.b}, ${grad.opacity})`);
      gradient.addColorStop(0.5, `rgba(${grad.r}, ${grad.g}, ${grad.b}, ${grad.opacity * 0.5})`);
      gradient.addColorStop(1, `rgba(${grad.r}, ${grad.g}, ${grad.b}, 0)`);
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    });

    // Add Spark brightness gradient (brighten/warp near Spark position)
    if (sparkPosition) {
      const sparkX = centerX + sparkPosition.x;
      const sparkY = centerY + sparkPosition.y;
      const sparkRadius = 250; // 200-300px radius
      
      // Brightness gradient centered on Spark
      const sparkGradient = ctx.createRadialGradient(sparkX, sparkY, 0, sparkX, sparkY, sparkRadius);
      sparkGradient.addColorStop(0, 'rgba(72, 159, 227, 0.10)'); // Brighten at center (0.08-0.10)
      sparkGradient.addColorStop(0.4, 'rgba(72, 159, 227, 0.06)');
      sparkGradient.addColorStop(0.7, 'rgba(72, 159, 227, 0.03)');
      sparkGradient.addColorStop(1, 'rgba(72, 159, 227, 0)');
      
      ctx.fillStyle = sparkGradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // Draw subtle orbital arcs (faint curved lines)
    if (nodes.length > 1) {
      ctx.strokeStyle = 'rgba(72, 159, 227, 0.08)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 8]);

      // Draw arcs connecting nodes in a subtle way
      nodes.forEach((node, i) => {
        if (i === 0) return; // Skip root
        const nodeX = centerX + node.x;
        const nodeY = centerY + node.y;
        
        // Draw subtle arc from center towards node
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.quadraticCurveTo(
          centerX + (node.x * 0.3),
          centerY + (node.y * 0.3),
          nodeX,
          nodeY
        );
        ctx.stroke();
      });

      ctx.setLineDash([]);
    }

    // Draw directional dust particles (very subtle)
    ctx.fillStyle = 'rgba(72, 159, 227, 0.15)';
    for (let i = 0; i < 30; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      const size = Math.random() * 1.5;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [nodes, sparkPosition]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
      style={{ opacity: 0.4 }}
    />
  );
}

