import { useRef, useState, useEffect } from 'react';
import { FaCoins, FaArrowUp, FaLock, FaBolt, FaCarrot } from 'react-icons/fa';
import { useGame } from '../context/GameContext';
import './UpgradesCarousel.css';

const UPGRADE_CARDS = [
  {
    key: 'clickUpgrade',
    title: 'Melhorar Alimentação',
    desc: 'Aumenta pNTR por clique.',
    icon: <FaCarrot color="#ffb347" size={38} />, // Cenoura
    color: 'linear-gradient(135deg, #2e2a23 0%, #a86e3c 100%)',
    stats: [
      { label: 'Valor atual', value: (state) => `+${state.upgrades.clickUpgrade.value} pNTR` },
      { label: 'Próximo nível', value: (state) => `+${state.upgrades.clickUpgrade.value + 1} pNTR` }
    ]
  },
  {
    key: 'autoClick',
    title: 'Alimentação Automática',
    desc: 'Ganha pNTR automaticamente.',
    icon: <FaBolt color="#ffe066" size={38} />, // Relógio/raio
    color: 'linear-gradient(135deg, #2e2a23 0%, #6c47ff 100%)',
    soon: true,
    stats: [
      { label: 'Valor atual', value: () => '0 pNTR/s' },
      { label: 'Próximo nível', value: () => '+1 pNTR/s' }
    ]
  },
  {
    key: 'multiplier',
    title: 'Multiplicador',
    desc: 'Multiplica todos os ganhos.',
    icon: <FaArrowUp color="#6c47ff" size={38} />, // Seta
    color: 'linear-gradient(135deg, #2e2a23 0%, #f39c12 100%)',
    soon: true,
    stats: [
      { label: 'Valor atual', value: () => 'x1' },
      { label: 'Próximo nível', value: () => 'x1.5' }
    ]
  },
];

// Efeito de partículas na compra
const PurchaseEffect = ({ active, onComplete }) => {
  const canvasRef = useRef();
  
  useEffect(() => {
    if (!active) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    const particles = [];
    const colors = ['#ffe066', '#ffb700', '#f39c12', '#1db954'];
    
    // Criar partículas
    for (let i = 0; i < 50; i++) {
      particles.push({
        x: width / 2,
        y: height / 2,
        size: Math.random() * 8 + 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        speedX: (Math.random() - 0.5) * 8,
        speedY: (Math.random() - 0.5) * 8,
        rotation: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 10,
        opacity: 1
      });
    }
    
    let frame = 0;
    
    function animate() {
      ctx.clearRect(0, 0, width, height);
      
      particles.forEach(p => {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = p.color;
        
        // Desenhar formas variadas
        if (Math.random() > 0.5) {
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        } else {
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          ctx.fill();
        }
        
        ctx.restore();
        
        // Atualizar posição
        p.x += p.speedX;
        p.y += p.speedY;
        p.rotation += p.rotSpeed;
        p.opacity -= 0.02;
        
        // Desacelerar
        p.speedX *= 0.98;
        p.speedY *= 0.98;
      });
      
      frame++;
      
      if (frame < 60) {
        requestAnimationFrame(animate);
      } else {
        if (onComplete) onComplete();
      }
    }
    
    animate();
  }, [active, onComplete]);
  
  return (
    <canvas 
      ref={canvasRef} 
      width={300} 
      height={300} 
      className="purchase-effect-canvas"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 10,
        display: active ? 'block' : 'none'
      }}
    />
  );
};

const UpgradesCarousel = () => {
  const { gameState, buyClickUpgrade } = useGame();
  const [selected, setSelected] = useState(0);
  const [purchaseEffect, setPurchaseEffect] = useState(false);
  const [cardRotations, setCardRotations] = useState({});
  const carouselRef = useRef();
  const cardsRef = useRef([]);
  
  // Inicializar refs para cada card
  useEffect(() => {
    cardsRef.current = cardsRef.current.slice(0, UPGRADE_CARDS.length);
  }, []);

  // Navegação
  const scrollTo = idx => {
    setSelected(idx);
    const el = carouselRef.current;
    if (el) {
      const card = el.children[idx];
      if (card) card.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
  };

  // Efeito 3D ao passar o mouse
  const handleMouseMove = (e, idx) => {
    const card = cardsRef.current[idx];
    if (!card) return;
    
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateY = ((x - centerX) / centerX) * 10; // -10 a 10 graus
    const rotateX = ((centerY - y) / centerY) * 10; // -10 a 10 graus
    
    setCardRotations(prev => ({
      ...prev,
      [idx]: { rotateX, rotateY }
    }));
  };
  
  // Reset da rotação ao sair do card
  const handleMouseLeave = (idx) => {
    setCardRotations(prev => ({
      ...prev,
      [idx]: { rotateX: 0, rotateY: 0 }
    }));
  };
  
  // Compra com efeito
  const handleBuy = (e, idx) => {
    e.stopPropagation();
    setPurchaseEffect(true);
    buyClickUpgrade();
    
    // Remover efeito após animação
    setTimeout(() => {
      setPurchaseEffect(false);
    }, 1000);
  };

  // Verificar se tem moedas suficientes
  const canAfford = (card) => {
    if (card.soon) return false;
    const upgrade = gameState.upgrades[card.key];
    return gameState.coins >= upgrade.cost;
  };

  return (
    <div className="upgrades-carousel-wrapper">
      <button className="carousel-arrow left" onClick={() => scrollTo(Math.max(0, selected - 1))} disabled={selected === 0}>&lt;</button>
      <div className="upgrades-carousel" ref={carouselRef} style={{ gridTemplateColumns: `repeat(${UPGRADE_CARDS.length}, minmax(240px, 1fr))` }}>
        {UPGRADE_CARDS.map((card, idx) => {
          const isSelected = idx === selected;
          const upgrade = gameState.upgrades[card.key] || {};
          const isAffordable = canAfford(card);
          const rotation = cardRotations[idx] || { rotateX: 0, rotateY: 0 };
          
          return (
            <div
              key={card.key}
              ref={el => cardsRef.current[idx] = el}
              className={`upgrade-card${isSelected ? ' selected' : ''}${card.soon ? ' disabled' : ''}${isAffordable ? ' affordable' : ''}`}
              style={{ 
                background: card.color, 
                transform: isSelected ? 
                  `scale(1.05) rotateX(${rotation.rotateX}deg) rotateY(${rotation.rotateY}deg)` : 
                  `scale(1) rotateX(${rotation.rotateX}deg) rotateY(${rotation.rotateY}deg)`,
                transition: 'transform 0.2s ease-out'
              }}
              onClick={() => !card.soon && setSelected(idx)}
              onMouseMove={(e) => handleMouseMove(e, idx)}
              onMouseLeave={() => handleMouseLeave(idx)}
            >
              <div className="upgrade-illustration">{card.icon}</div>
              <div className="upgrade-title">{card.title}</div>
              <div className="upgrade-desc">{card.desc}</div>
              
              {!card.soon && (
                <div className="upgrade-stats">
                  {card.stats.map((stat, i) => (
                    <div key={i} className="upgrade-stat">
                      <span className="stat-label">{stat.label}:</span>
                      <span className="stat-value">{stat.value(gameState)}</span>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="upgrade-footer">
                {card.soon ? (
                  <div className="soon-container">
                    <FaLock className="soon-icon" /> <span className="soon">Em breve</span>
                  </div>
                ) : (
                  <>
                    <span className={`upgrade-price${isAffordable ? ' can-afford' : ''}`}>
                      <FaCoins className="coin-icon" /> <span>{upgrade.cost}</span>
                    </span>
                    <span className="upgrade-level">
                      Nível {upgrade.level}
                    </span>
                  </>
                )}
              </div>
              
              {!card.soon && (
                <button 
                  className={`upgrade-buy${isAffordable ? ' can-afford' : ''}`} 
                  onClick={(e) => handleBuy(e, idx)}
                  disabled={!isAffordable}
                >
                  Comprar
                </button>
              )}
              
              {/* Efeito de partículas na compra */}
              <div className="purchase-effect-container">
                <PurchaseEffect active={isSelected && purchaseEffect} onComplete={() => setPurchaseEffect(false)} />
              </div>
            </div>
          );
        })}
      </div>
      <button className="carousel-arrow right" onClick={() => scrollTo(Math.min(UPGRADE_CARDS.length - 1, selected + 1))} disabled={selected === UPGRADE_CARDS.length - 1}>&gt;</button>
      <div className="carousel-indicators">
        {UPGRADE_CARDS.map((_, idx) => (
          <span key={idx} className={idx === selected ? 'active' : ''} onClick={() => scrollTo(idx)} />
        ))}
      </div>
    </div>
  );
};

export default UpgradesCarousel; 