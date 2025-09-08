import { useState, useEffect, useRef } from 'react';
import { useGame } from '../context/GameContext';
import { useLanguage } from '../context/LanguageContext';
import { FaPaw, FaFire, FaStar, FaCoins } from 'react-icons/fa';

// Confete premium com partículas coloridas e formas variadas
function Confetti({ active }) {
  const canvasRef = useRef();
  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const W = canvas.width = 300;
    const H = canvas.height = 300;
    
    // Cores premium para confete
    const colors = [
      '#1db954', // verde
      '#ffb700', // dourado
      '#00d4ff', // azul
      '#ff007a', // rosa
      '#6c47ff', // roxo
      '#ffe066', // amarelo
      '#34eb7a', // verde claro
      '#f39c12', // laranja
    ];
    
    // Mais partículas e tamanhos variados
    let confs = Array.from({ length: 80 }, () => ({
      x: Math.random() * W,
      y: Math.random() * H / 2,
      r: Math.random() * 10 + 3, // Tamanhos variados
      d: Math.random() * 40 + 10,
      color: colors[Math.floor(Math.random() * colors.length)],
      tilt: Math.random() * 10 - 5,
      opacity: Math.random() * 0.3 + 0.7, // Opacidade variada
      shape: Math.random() > 0.3 ? 'circle' : Math.random() > 0.5 ? 'square' : 'star', // Formas variadas
      speedY: Math.random() * 2 + 1,
      speedX: Math.random() * 2 - 1,
      speedTilt: Math.random() * 0.1 - 0.05,
      glitter: Math.random() > 0.7 // Alguns com brilho
    }));
    
    let angle = 0;
    let frame = 0;
    
    function draw() {
      ctx.clearRect(0, 0, W, H);
      angle += 0.02;
      
      for (let i = 0; i < confs.length; i++) {
        let c = confs[i];
        ctx.globalAlpha = c.opacity;
        ctx.fillStyle = c.color;
        
        if (c.shape === 'circle') {
          ctx.beginPath();
          ctx.arc(c.x, c.y, c.r, 0, 2 * Math.PI);
          ctx.fill();
          
          // Adicionar brilho em alguns confetes
          if (c.glitter && Math.random() > 0.7) {
            ctx.globalAlpha = Math.random() * 0.3 + 0.1;
            ctx.fillStyle = "#fff";
            ctx.beginPath();
            ctx.arc(c.x, c.y, c.r * 1.5, 0, 2 * Math.PI);
            ctx.fill();
          }
        } else if (c.shape === 'square') {
          ctx.save();
          ctx.translate(c.x, c.y);
          ctx.rotate(angle * c.tilt);
          ctx.fillRect(-c.r, -c.r, c.r * 2, c.r * 2);
          
          // Adicionar borda em alguns quadrados
          if (c.glitter) {
            ctx.strokeStyle = "#ffffff";
            ctx.lineWidth = 1;
            ctx.globalAlpha = Math.random() * 0.5 + 0.2;
            ctx.strokeRect(-c.r, -c.r, c.r * 2, c.r * 2);
          }
          
          ctx.restore();
        } else if (c.shape === 'star') {
          ctx.save();
          ctx.translate(c.x, c.y);
          ctx.rotate(angle * c.tilt);
          drawStar(ctx, 0, 0, 5, c.r, c.r / 2);
          ctx.fill();
          
          // Adicionar glow em algumas estrelas
          if (c.glitter) {
            ctx.shadowColor = c.color;
            ctx.shadowBlur = 10;
            ctx.globalAlpha = 0.3;
            drawStar(ctx, 0, 0, 5, c.r * 1.2, c.r / 1.8);
            ctx.fill();
            ctx.shadowBlur = 0;
          }
          
          ctx.restore();
        }
        
        // Movimento mais natural com aceleração
        c.y += c.speedY + Math.sin(angle + c.d) * 0.5;
        c.x += c.speedX + Math.cos(angle) * 0.5;
        c.tilt += c.speedTilt;
        
        // Desaceleração gradual
        c.speedY *= 0.99;
        
        // Resetar partículas que saem da tela
        if (c.y > H) {
          c.x = Math.random() * W;
          c.y = -10;
          c.speedY = Math.random() * 2 + 1;
        }
      }
      
      frame++;
      // Duração mais longa para o confete
      if (frame < 180) requestAnimationFrame(draw);
      else ctx.clearRect(0, 0, W, H);
    }
    
    // Função para desenhar estrela
    function drawStar(ctx, cx, cy, spikes, outerRadius, innerRadius) {
      let rot = Math.PI / 2 * 3;
      let x = cx;
      let y = cy;
      let step = Math.PI / spikes;

      ctx.beginPath();
      for(let i = 0; i < spikes; i++) {
        x = cx + Math.cos(rot) * outerRadius;
        y = cy + Math.sin(rot) * outerRadius;
        ctx.lineTo(x, y);
        rot += step;

        x = cx + Math.cos(rot) * innerRadius;
        y = cy + Math.sin(rot) * innerRadius;
        ctx.lineTo(x, y);
        rot += step;
      }
      ctx.closePath();
    }
    
    draw();
  }, [active]);
  
  return (
    <canvas
      ref={canvasRef}
      width={300}
      height={300}
      style={{ 
        position: 'absolute', 
        left: -20, 
        top: -20, 
        pointerEvents: 'none', 
        zIndex: 5, 
        display: active ? 'block' : 'none' 
      }}
    />
  );
}

// Componente de efeito de brilho para o clique
function ClickEffect({ active, position }) {
  const [effects, setEffects] = useState([]);
  
  useEffect(() => {
    if (!active || !position) return;
    
    const newEffect = {
      id: Date.now(),
      x: position.x,
      y: position.y,
      type: Math.random() > 0.7 ? 'star' : 'ripple' // Variação entre ripple e star
    };
    
    setEffects(prev => [...prev, newEffect]);
    
    // Remover efeito após animação
    const timer = setTimeout(() => {
      setEffects(prev => prev.filter(e => e.id !== newEffect.id));
    }, 700);
    
    return () => clearTimeout(timer);
  }, [active, position]);
  
  return (
    <>
      {effects.map(effect => (
        effect.type === 'ripple' ? (
        <div
          key={effect.id}
          className="click-ripple"
          style={{
            left: effect.x,
            top: effect.y,
          }}
        />
        ) : (
          <div
            key={effect.id}
            className="click-star"
            style={{
              left: effect.x,
              top: effect.y,
            }}
          />
        )
      ))}
    </>
  );
}

// Componente de moeda flutuante
function FloatingCoin({ active, position }) {
  const [coins, setCoins] = useState([]);
  
  useEffect(() => {
    if (!active || !position) return;
    
    // Criar 1-3 moedas aleatórias
    const count = Math.floor(Math.random() * 3) + 1;
    const newCoins = Array.from({ length: count }, () => ({
      id: Date.now() + Math.random(),
      x: position.x + (Math.random() * 40 - 20),
      y: position.y,
      size: Math.random() * 10 + 15,
      rotation: Math.random() * 360,
      rotSpeed: Math.random() * 10 - 5
    }));
    
    setCoins(prev => [...prev, ...newCoins]);
    
    // Remover moedas após animação
    const timer = setTimeout(() => {
      setCoins(prev => prev.filter(c => !newCoins.some(nc => nc.id === c.id)));
    }, 1200);
    
    return () => clearTimeout(timer);
  }, [active, position]);
  
  return (
    <>
      {coins.map(coin => (
        <div
          key={coin.id}
          className="floating-coin"
          style={{
            left: coin.x,
            top: coin.y,
            width: coin.size,
            height: coin.size,
            transform: `rotate(${coin.rotation}deg)`,
          }}
        >
          <FaCoins color="#ffe066" />
        </div>
      ))}
    </>
  );
}

const NutriaClicker = () => {
  const { gameState, addCoins, levelUpEffect, customization } = useGame();
  const { t } = useLanguage();
  const [isFeeding, setIsFeeding] = useState(false);
  const [pointAnims, setPointAnims] = useState([]);
  const [shake, setShake] = useState(false);
  const [showStreak, setShowStreak] = useState(false);
  const [entryAnim, setEntryAnim] = useState(true);
  const [clickPosition, setClickPosition] = useState(null);
  const [showClickEffect, setShowClickEffect] = useState(false);
  const [showCoinEffect, setShowCoinEffect] = useState(false);
  const [pulseEffect, setPulseEffect] = useState(false);
  const containerRef = useRef(null);
  
  // Animação de entrada da nutria
  useEffect(() => {
    setEntryAnim(true);
    const t = setTimeout(() => setEntryAnim(false), 900);
    return () => clearTimeout(t);
  }, []);

  // Streak: mostrar/ocultar
  useEffect(() => {
    if ((gameState.streak || 0) >= 2) {
      setShowStreak(true);
      const t = setTimeout(() => setShowStreak(false), 1500);
      return () => clearTimeout(t);
    } else {
      setShowStreak(false);
    }
  }, [gameState.streak]);

  // Shake no botão se streak >= 5
  useEffect(() => {
    if ((gameState.streak || 0) >= 5) {
      setShake(true);
      const t = setTimeout(() => setShake(false), 600);
      return () => clearTimeout(t);
    }
  }, [gameState.streak]);
  
  // Efeito de pulso periódico
  useEffect(() => {
    const interval = setInterval(() => {
      setPulseEffect(true);
      setTimeout(() => setPulseEffect(false), 1000);
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  // Animação de clique aprimorada
  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addCoins();
    setIsFeeding(true);
    setTimeout(() => setIsFeeding(false), 150);
    
    // Calcular posição relativa do clique para o efeito
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      setClickPosition({ x, y });
      setShowClickEffect(true);
      setShowCoinEffect(true);
      setTimeout(() => setShowClickEffect(false), 50);
      setTimeout(() => setShowCoinEffect(false), 50);
    }
    
    // Calcular valor com multiplicadores
    const baseValue = gameState.clickValue || 1;
    const prestigeMultiplier = gameState.prestige?.multipliers?.coins || 1;
    const bonusMultiplier = (gameState.activeBonuses || [])
      .filter(b => b.type === 'multiplier' && Date.now() - b.startTime < b.duration)
      .reduce((acc, b) => acc * b.value, 1);
    
    const totalValue = baseValue * prestigeMultiplier * bonusMultiplier;
    const isCritical = Math.random() < 0.1; // 10% chance de crítico
    const value = isCritical ? totalValue * 2 : totalValue;
    
    setPointAnims((prev) => [
      ...prev,
      {
        id: Date.now(),
        x: Math.random() * 40 - 20, // Variação horizontal maior
        y: Math.random() * 20 - 10,  // Variação vertical maior
        value: isCritical ? `+${Math.floor(value)} CRÍTICO!` : `+${Math.floor(value)}`,
        isCritical
      },
    ]);
  };

  // Remover animações antigas
  useEffect(() => {
    if (pointAnims.length === 0) return;
    const timer = setTimeout(() => {
      setPointAnims((prev) => prev.slice(1));
    }, 1200); // Duração maior para a animação
    return () => clearTimeout(timer);
  }, [pointAnims]);

  // Classes de borda animada
  let borderClass = '';
  if (customization?.borderStyle === 'pulse') borderClass = 'nutria-border-pulse';
  if (customization?.borderStyle === 'glow') borderClass = 'nutria-border-glow';
  if (customization?.borderStyle === 'gradient') borderClass = 'nutria-border-gradient';
  if (customization?.borderStyle === 'static') borderClass = 'nutria-border-static';
  
  // Efeitos visuais
  let effectClass = '';
  if (customization?.effects === 'shine') effectClass = 'nutria-effect-shine';
  if (customization?.effects === 'particles') effectClass = 'nutria-effect-particles';
  
  // Fundo do círculo via CSS var
  const circleBg = 'var(--circle-bg)';

  return (
    <div className="nutria-clicker-wrapper" style={{ position: 'relative', width: 260, margin: '0 auto' }} ref={containerRef}>
      {/* Badge de level fora do círculo, com tooltip premium */}
      <div
        className={`level-badge${levelUpEffect ? ' level-badge-anim' : ''}`}
        data-tooltip={t('level') + ' ' + t('game')}
      >
        {gameState.level || 1}
      </div>
      
      <div 
        className={`nutria-container${levelUpEffect ? ' levelup' : ''}${entryAnim ? ' nutria-entry' : ''}${pulseEffect ? ' nutria-pulse' : ''} ${borderClass} ${effectClass}`.trim()} 
        style={{ background: circleBg }}
        onClick={handleClick}
      >
        <div className="nutria-glow-effect"></div>
        
        <img
          src={gameState.nutriaImage || './src/assets/nutria_1.png'}
          alt="Nutria"
          className={`nutria-img${isFeeding ? ' feeding' : ''}`}
          draggable={false}
          style={{ filter: 'drop-shadow(0 0 24px rgba(255, 224, 102, 0.8))' }}
        />
        
        <Confetti active={levelUpEffect} />
        <ClickEffect active={showClickEffect} position={clickPosition} />
        <FloatingCoin active={showCoinEffect} position={clickPosition} />
        
        {/* Animações de pontos com posições variadas e efeitos especiais */}
        {pointAnims.map((anim) => (
          <span
            key={anim.id}
            className={`point-float${anim.isCritical ? ' point-critical' : ''}`}
            style={{ 
              left: `calc(50% + ${anim.x}px)`, 
              top: `calc(40% + ${anim.y}px)`, 
              transform: 'translate(-50%, -50%)' 
            }}
          >
            {anim.isCritical && <FaStar className="critical-star" />} {anim.value}
          </span>
        ))}
        
        {/* Streak visual aprimorado */}
        {showStreak && (
          <div className={`streak-badge${(gameState.streak || 0) >= 5 ? ' streak-fire' : ''}`}>
            <FaFire style={{ marginRight: 8 }} /> {gameState.streak || 0}x
          </div>
        )}
        
        {/* Efeito de partículas com opção sutil */}
        {customization?.effects === 'particles' && <div className="nutria-particles subtle-particles"></div>}
      </div>
      
      {/* Botão principal com efeitos premium */}
      <button 
        className={`action-button primary${levelUpEffect ? ' btn-bounce' : ''}${shake ? ' btn-shake' : ''}`} 
        onClick={handleClick}
      >
        <FaPaw size={28} style={{ filter: 'drop-shadow(0 0 6px rgba(255, 255, 255, 0.5))' }} /> 
        {t('feedNutria')}
      </button>
    </div>
  );
};

export default NutriaClicker; 