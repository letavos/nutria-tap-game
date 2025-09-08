import { useEffect, useRef, useState } from 'react';

const ParticleSystem = ({ active, type = 'default', intensity = 1 }) => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const particlesRef = useRef([]);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateDimensions = () => {
      if (canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        setDimensions({ width: rect.width, height: rect.height });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  useEffect(() => {
    if (!active || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const { width, height } = dimensions;

    if (width === 0 || height === 0) return;

    canvas.width = width;
    canvas.height = height;

    // Configurações baseadas no tipo
    const configs = {
      default: {
        count: Math.floor(20 * intensity),
        colors: ['#1db954', '#ffb700', '#00d4ff', '#6c47ff'],
        sizes: [2, 4, 6],
        speed: 1,
        life: 60
      },
      celebration: {
        count: Math.floor(50 * intensity),
        colors: ['#ffb700', '#ff007a', '#6c47ff', '#1db954', '#00d4ff'],
        sizes: [3, 6, 9],
        speed: 2,
        life: 90
      },
      prestige: {
        count: Math.floor(30 * intensity),
        colors: ['#6c47ff', '#ff007a', '#ffb700'],
        sizes: [4, 8, 12],
        speed: 1.5,
        life: 120
      },
      levelup: {
        count: Math.floor(40 * intensity),
        colors: ['#1db954', '#34eb7a', '#ffb700'],
        sizes: [2, 5, 8],
        speed: 1.8,
        life: 100
      }
    };

    const config = configs[type] || configs.default;

    // Criar partículas
    const createParticle = () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * config.speed * 2,
      vy: (Math.random() - 0.5) * config.speed * 2,
      size: config.sizes[Math.floor(Math.random() * config.sizes.length)],
      color: config.colors[Math.floor(Math.random() * config.colors.length)],
      life: config.life,
      maxLife: config.life,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.2
    });

    // Inicializar partículas
    particlesRef.current = Array.from({ length: config.count }, createParticle);

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      particlesRef.current = particlesRef.current.filter(particle => {
        // Atualizar posição
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.rotation += particle.rotationSpeed;
        particle.life--;

        // Aplicar gravidade e resistência
        particle.vy += 0.02;
        particle.vx *= 0.99;
        particle.vy *= 0.99;

        // Calcular opacidade baseada na vida
        const alpha = particle.life / particle.maxLife;

        // Desenhar partícula
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.translate(particle.x, particle.y);
        ctx.rotate(particle.rotation);
        
        // Efeitos especiais baseados no tipo
        if (type === 'celebration') {
          // Estrelas para celebração
          drawStar(ctx, 0, 0, 5, particle.size, particle.size / 2, particle.color);
        } else if (type === 'prestige') {
          // Círculos com glow para prestígio
          ctx.shadowColor = particle.color;
          ctx.shadowBlur = 10;
          ctx.fillStyle = particle.color;
          ctx.beginPath();
          ctx.arc(0, 0, particle.size, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Círculos normais
          ctx.fillStyle = particle.color;
          ctx.beginPath();
          ctx.arc(0, 0, particle.size, 0, Math.PI * 2);
          ctx.fill();
        }
        
        ctx.restore();

        // Remover partículas que saíram da tela ou morreram
        return particle.life > 0 && 
               particle.x > -50 && particle.x < width + 50 &&
               particle.y > -50 && particle.y < height + 50;
      });

      // Adicionar novas partículas se necessário
      if (particlesRef.current.length < config.count * 0.8) {
        particlesRef.current.push(createParticle());
      }

      if (particlesRef.current.length > 0) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [active, type, intensity, dimensions]);

  const drawStar = (ctx, cx, cy, spikes, outerRadius, innerRadius, color) => {
    let rot = Math.PI / 2 * 3;
    let x = cx;
    let y = cy;
    const step = Math.PI / spikes;

    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(cx, cy - outerRadius);
    
    for (let i = 0; i < spikes; i++) {
      x = cx + Math.cos(rot) * outerRadius;
      y = cy + Math.sin(rot) * outerRadius;
      ctx.lineTo(x, y);
      rot += step;

      x = cx + Math.cos(rot) * innerRadius;
      y = cy + Math.sin(rot) * innerRadius;
      ctx.lineTo(x, y);
      rot += step;
    }
    
    ctx.lineTo(cx, cy - outerRadius);
    ctx.closePath();
    ctx.fill();
  };

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 1
      }}
    />
  );
};

export default ParticleSystem;
