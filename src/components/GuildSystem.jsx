import { useState, useEffect } from 'react';
import { FaUsers, FaCrown, FaTrophy, FaGift, FaPlus, FaSearch, FaFlag } from 'react-icons/fa';
import { useGame } from '../context/GameContext';

const GuildSystem = () => {
  const { gameState } = useGame();
  const [activeTab, setActiveTab] = useState('my-guild');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [guildData, setGuildData] = useState(null);

  // Simular dados de guild
  useEffect(() => {
    // Simular se o jogador está em uma guild
    const mockGuild = {
      id: 'nutria_legends',
      name: 'Nutria Legends',
      tag: 'NUT',
      level: 15,
      memberCount: 24,
      maxMembers: 30,
      totalContribution: 125000,
      weeklyContribution: 15000,
      rank: 3,
      description: 'A guild mais poderosa do reino das nutrias!',
      leader: 'NutriaMaster',
      officers: ['NutriaPro', 'StreakKing'],
      members: [
        { name: 'NutriaMaster', rank: 'leader', contribution: 25000, level: 45 },
        { name: 'NutriaPro', rank: 'officer', contribution: 20000, level: 42 },
        { name: 'StreakKing', rank: 'officer', contribution: 18000, level: 40 },
        { name: 'ClickMaster', rank: 'member', contribution: 15000, level: 38 },
        { name: 'CoinCollector', rank: 'member', contribution: 12000, level: 35 },
        { name: 'PrestigeLord', rank: 'member', contribution: 10000, level: 33 },
        { name: 'AchievementHunter', rank: 'member', contribution: 8000, level: 30 },
        { name: 'NutriaNewbie', rank: 'member', contribution: 5000, level: 25 }
      ],
      benefits: [
        { name: 'Bônus de Moedas', level: 3, description: '+15% moedas por clique' },
        { name: 'Bônus de XP', level: 2, description: '+10% experiência' },
        { name: 'Bônus de Prestígio', level: 1, description: '+5% pontos de prestígio' }
      ],
      challenges: [
        {
          id: 'weekly_clicks',
          name: 'Desafio Semanal de Cliques',
          description: 'A guild deve fazer 1.000.000 cliques esta semana',
          progress: 750000,
          goal: 1000000,
          reward: 'Bônus de 20% moedas por 3 dias',
          active: true
        },
        {
          id: 'prestige_race',
          name: 'Corrida de Prestígio',
          description: '5 membros devem fazer prestígio esta semana',
          progress: 3,
          goal: 5,
          reward: 'Bônus de 25% pontos de prestígio por 1 semana',
          active: true
        }
      ]
    };

    setGuildData(mockGuild);
  }, []);

  const getRankIcon = (rank) => {
    switch (rank) {
      case 'leader': return <FaCrown />;
      case 'officer': return <FaFlag />;
      default: return <FaUsers />;
    }
  };

  const getRankColor = (rank) => {
    switch (rank) {
      case 'leader': return '#ffb700';
      case 'officer': return '#6c47ff';
      default: return '#1db954';
    }
  };

  const getContributionTier = (contribution) => {
    if (contribution >= 20000) return { tier: 'S', color: '#ffb700' };
    if (contribution >= 15000) return { tier: 'A', color: '#6c47ff' };
    if (contribution >= 10000) return { tier: 'B', color: '#1db954' };
    if (contribution >= 5000) return { tier: 'C', color: '#00d4ff' };
    return { tier: 'D', color: '#9ca3af' };
  };

  if (!guildData) {
    return (
      <div className="guild-system-container">
        <div className="guild-header">
          <h3>Sistema de Guilds</h3>
          <p>Junte-se a uma guild para benefícios exclusivos!</p>
        </div>
        
        <div className="no-guild">
          <FaUsers size={64} />
          <h4>Você não está em uma guild</h4>
          <p>Junte-se a uma guild existente ou crie a sua própria!</p>
          
          <div className="guild-actions">
            <button 
              className="guild-btn primary"
              onClick={() => setShowJoinModal(true)}
            >
              <FaSearch /> Procurar Guilds
            </button>
            <button 
              className="guild-btn secondary"
              onClick={() => setShowCreateModal(true)}
            >
              <FaPlus /> Criar Guild
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="guild-system-container">
      <div className="guild-header">
        <div className="guild-info">
          <h3>{guildData.name} [{guildData.tag}]</h3>
          <p>Nível {guildData.level} • {guildData.members}/{guildData.maxMembers} membros</p>
        </div>
        <div className="guild-rank">
          <FaTrophy />
          <span>#{guildData.rank} no ranking</span>
        </div>
      </div>

      <div className="guild-tabs">
        <button 
          className={`guild-tab${activeTab === 'my-guild' ? ' active' : ''}`}
          onClick={() => setActiveTab('my-guild')}
        >
          <FaUsers /> Minha Guild
        </button>
        <button 
          className={`guild-tab${activeTab === 'challenges' ? ' active' : ''}`}
          onClick={() => setActiveTab('challenges')}
        >
          <FaTrophy /> Desafios
        </button>
        <button 
          className={`guild-tab${activeTab === 'benefits' ? ' active' : ''}`}
          onClick={() => setActiveTab('benefits')}
        >
          <FaGift /> Benefícios
        </button>
      </div>

      {activeTab === 'my-guild' && (
        <div className="guild-content">
          <div className="guild-stats">
            <div className="stat-card">
              <h4>Contribuição Total</h4>
              <span className="stat-value">{guildData.totalContribution.toLocaleString()}</span>
            </div>
            <div className="stat-card">
              <h4>Contribuição Semanal</h4>
              <span className="stat-value">{guildData.weeklyContribution.toLocaleString()}</span>
            </div>
            <div className="stat-card">
              <h4>Nível da Guild</h4>
              <span className="stat-value">{guildData.level}</span>
            </div>
          </div>

          <div className="guild-members">
            <h4>Membros da Guild</h4>
            <div className="members-list">
              {guildData.members.map((member, index) => {
                const tier = getContributionTier(member.contribution);
                return (
                  <div key={index} className="member-card">
                    <div className="member-info">
                      <div className="member-rank" style={{ color: getRankColor(member.rank) }}>
                        {getRankIcon(member.rank)}
                      </div>
                      <div className="member-details">
                        <span className="member-name">{member.name}</span>
                        <span className="member-level">Nível {member.level}</span>
                      </div>
                    </div>
                    <div className="member-contribution">
                      <span className="contribution-amount">{member.contribution.toLocaleString()}</span>
                      <span className="contribution-tier" style={{ color: tier.color }}>
                        {tier.tier}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'challenges' && (
        <div className="guild-content">
          <h4>Desafios da Guild</h4>
          <div className="challenges-list">
            {guildData.challenges.map(challenge => (
              <div key={challenge.id} className="challenge-card">
                <div className="challenge-header">
                  <h5>{challenge.name}</h5>
                  <span className={`challenge-status${challenge.active ? ' active' : ' completed'}`}>
                    {challenge.active ? 'Ativo' : 'Concluído'}
                  </span>
                </div>
                <p className="challenge-description">{challenge.description}</p>
                <div className="challenge-progress">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{ width: `${(challenge.progress / challenge.goal) * 100}%` }}
                    />
                  </div>
                  <span className="progress-text">
                    {challenge.progress.toLocaleString()} / {challenge.goal.toLocaleString()}
                  </span>
                </div>
                <div className="challenge-reward">
                  <FaGift />
                  <span>{challenge.reward}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'benefits' && (
        <div className="guild-content">
          <h4>Benefícios da Guild</h4>
          <div className="benefits-list">
            {guildData.benefits.map((benefit, index) => (
              <div key={index} className="benefit-card">
                <div className="benefit-header">
                  <h5>{benefit.name}</h5>
                  <span className="benefit-level">Nível {benefit.level}</span>
                </div>
                <p className="benefit-description">{benefit.description}</p>
                <div className="benefit-progress">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{ width: `${(benefit.level / 5) * 100}%` }}
                    />
                  </div>
                  <span className="progress-text">
                    Nível {benefit.level} / 5
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default GuildSystem;
