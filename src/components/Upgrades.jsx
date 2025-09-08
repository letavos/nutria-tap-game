import { useRef, useState } from 'react';
import { FaCoins, FaArrowUp, FaLock, FaBolt, FaCarrot } from 'react-icons/fa';
import { useGame } from '../context/GameContext';
import './UpgradesCarousel.css';

const UPGRADE_CARDS = [
  {
    key: 'clickUpgrade',
    title: 'Melhorar Alimentação',
    desc: 'Aumenta pNTR por clique.',
    icon: <FaCarrot color="#f39c12" size={32} />, // Cenoura
    color: 'linear-gradient(135deg, #e7b98a 0%, #f39c12 100%)',
  },
  {
    key: 'autoClick',
    title: 'Alimentação Automática',
    desc: 'Ganha pNTR automaticamente.',
    icon: <FaBolt color="#ffe066" size={32} />, // Relógio/raio
    color: 'linear-gradient(135deg, #e7b98a 0%, #ffe066 100%)',
    soon: true,
  },
  {
    key: 'multiplier',
    title: 'Multiplicador',
    desc: 'Multiplica todos os ganhos.',
    icon: <FaArrowUp color="#6c47ff" size={32} />, // Seta
    color: 'linear-gradient(135deg, #e7b98a 0%, #6c47ff 100%)',
    soon: true,
  },
];

const UpgradesCarousel = () => {
  const { gameState, buyClickUpgrade } = useGame();
  const [selected, setSelected] = useState(0);
  const carouselRef = useRef();

  // Navegação
  const scrollTo = idx => {
    setSelected(idx);
    const el = carouselRef.current;
    if (el) {
      const card = el.children[idx];
      if (card) card.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
  };

  // Responsivo: quantos cards por vez
  const isMobile = window.innerWidth < 700;
  const visibleCards = isMobile ? 1 : 2;

  return (
    <div className="upgrades-carousel-wrapper">
      <button className="carousel-arrow left" onClick={() => scrollTo(Math.max(0, selected - 1))} disabled={selected === 0}>&lt;</button>
      <div className="upgrades-carousel" ref={carouselRef} style={{ gridTemplateColumns: `repeat(${UPGRADE_CARDS.length}, minmax(220px, 1fr))` }}>
        {UPGRADE_CARDS.map((card, idx) => {
          const isSelected = idx === selected;
          const upgrade = gameState.upgrades[card.key] || {};
          return (
            <div
              key={card.key}
              className={`upgrade-card${isSelected ? ' selected' : ''}${card.soon ? ' disabled' : ''}`}
              style={{ background: card.color, transform: isSelected ? 'scale(1.05)' : 'scale(1)' }}
              onClick={() => !card.soon && setSelected(idx)}
            >
              <div className="upgrade-illustration">{card.icon}</div>
              <div className="upgrade-title">{card.title}</div>
              <div className="upgrade-desc">{card.desc}</div>
              <div className="upgrade-footer">
                {card.soon ? (
                  <span className="soon">Em breve</span>
                ) : (
                  <>
                    <span className="upgrade-price"><FaCoins /> {upgrade.cost}</span>
                    <span className="upgrade-level">Nível {upgrade.level}</span>
                    <button className="upgrade-buy" onClick={e => { e.stopPropagation(); buyClickUpgrade(); }}>Comprar</button>
                  </>
                )}
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