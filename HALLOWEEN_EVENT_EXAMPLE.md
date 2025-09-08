# 🎃 EXEMPLO COMPLETO: EVENTO DE HALLOWEEN

## 📋 IMPLEMENTAÇÃO PASSO A PASSO

### 1. **ADICIONAR EVENTO NO GAMECONTEXT**

```javascript
// src/context/GameContext.jsx
const getActiveEvent = () => {
  const today = new Date();
  const events = [
    // ... eventos existentes ...
    {
      id: 'halloween2024',
      name: 'Halloween Nutria',
      start: new Date('2024-10-25'),
      end: new Date('2024-11-02'),
      color: '#FF8C00',
      icon: '🎃',
      description: 'Evento especial de Halloween com abóboras e recompensas assustadoras!'
    }
  ];
  
  return events.find(ev => today >= ev.start && today <= ev.end) || null;
};
```

### 2. **ADICIONAR CONQUISTAS DE HALLOWEEN**

```javascript
// src/context/GameContext.jsx
const getAchievements = (t) => [
  // ... conquistas existentes ...
  
  // Conquistas de Halloween
  { 
    id: 'conquista_halloween', 
    name: t('conquista_halloween'), 
    desc: t('participateHalloween'), 
    category: 'events', 
    eventId: 'halloween2024' 
  },
  { 
    id: 'pumpkin_collector', 
    name: t('pumpkinCollector'), 
    desc: t('collect100Pumpkins'), 
    category: 'events', 
    eventId: 'halloween2024' 
  },
  { 
    id: 'spooky_streak', 
    name: t('spookyStreak'), 
    desc: t('makeSpookyStreak'), 
    category: 'events', 
    eventId: 'halloween2024' 
  }
];
```

### 3. **ADICIONAR BADGES DE HALLOWEEN**

```javascript
// src/components/NutriaGame.jsx
const getBadges = (t) => [
  // ... badges existentes ...
  
  // Badges de Halloween
  { 
    id: 'badge_halloween', 
    name: t('halloween'), 
    desc: t('participateHalloween'), 
    category: 'eventos', 
    eventId: 'halloween2024', 
    unlock: (state, isEventActive) => isEventActive('halloween2024') 
  },
  { 
    id: 'pumpkin_master', 
    name: t('pumpkinMaster'), 
    desc: t('collect50Pumpkins'), 
    category: 'eventos', 
    eventId: 'halloween2024', 
    unlock: (state, isEventActive) => isEventActive('halloween2024') && (state.pumpkins || 0) >= 50 
  },
  { 
    id: 'ghost_hunter', 
    name: t('ghostHunter'), 
    desc: t('huntGhosts'), 
    category: 'eventos', 
    eventId: 'halloween2024', 
    unlock: (state, isEventActive) => isEventActive('halloween2024') && (state.ghostsHunted || 0) >= 10 
  }
];
```

### 4. **ADICIONAR TRADUÇÕES COMPLETAS**

```javascript
// src/context/LanguageContext.jsx

// PORTUGUÊS
pt: {
  // ... traduções existentes ...
  
  // Halloween Event
  halloween: 'Halloween',
  conquista_halloween: 'Conquista Halloween',
  pumpkinCollector: 'Colecionador de Abóboras',
  spookyStreak: 'Streak Assombrado',
  pumpkinMaster: 'Mestre das Abóboras',
  ghostHunter: 'Caçador de Fantasmas',
  
  // Descriptions
  participateHalloween: 'Desbloqueie durante o Halloween Nutria!',
  collect100Pumpkins: 'Colete 100 abóboras!',
  makeSpookyStreak: 'Faça um streak de 20 durante o Halloween!',
  collect50Pumpkins: 'Colete 50 abóboras!',
  huntGhosts: 'Cace 10 fantasmas!',
  
  // Event Items
  halloweenNutria: 'Nutria Halloween',
  spookyNutria: 'Uma nutria assombrada e misteriosa',
  pumpkinSkin: 'Skin de Abóbora',
  ghostSkin: 'Skin de Fantasma',
  
  // Event Missions
  collectPumpkinsMission: 'Colete 50 abóboras para ganhar recompensas especiais',
  huntGhostsMission: 'Cace 10 fantasmas para desbloquear skin especial',
  spookyStreakMission: 'Faça um streak de 20 durante o Halloween',
  
  // Event Rewards
  pumpkinReward: 'Recompensa de Abóbora',
  ghostReward: 'Recompensa de Fantasma',
  halloweenReward: 'Recompensa de Halloween'
},

// INGLÊS
en: {
  // ... existing translations ...
  
  // Halloween Event
  halloween: 'Halloween',
  conquista_halloween: 'Halloween Achievement',
  pumpkinCollector: 'Pumpkin Collector',
  spookyStreak: 'Spooky Streak',
  pumpkinMaster: 'Pumpkin Master',
  ghostHunter: 'Ghost Hunter',
  
  // Descriptions
  participateHalloween: 'Unlock during Nutria Halloween!',
  collect100Pumpkins: 'Collect 100 pumpkins!',
  makeSpookyStreak: 'Make a streak of 20 during Halloween!',
  collect50Pumpkins: 'Collect 50 pumpkins!',
  huntGhosts: 'Hunt 10 ghosts!',
  
  // Event Items
  halloweenNutria: 'Halloween Nutria',
  spookyNutria: 'A haunted and mysterious nutria',
  pumpkinSkin: 'Pumpkin Skin',
  ghostSkin: 'Ghost Skin',
  
  // Event Missions
  collectPumpkinsMission: 'Collect 50 pumpkins to earn special rewards',
  huntGhostsMission: 'Hunt 10 ghosts to unlock special skin',
  spookyStreakMission: 'Make a streak of 20 during Halloween',
  
  // Event Rewards
  pumpkinReward: 'Pumpkin Reward',
  ghostReward: 'Ghost Reward',
  halloweenReward: 'Halloween Reward'
}
```

### 5. **ADICIONAR LÓGICA ESPECÍFICA DO EVENTO**

```javascript
// src/context/GameContext.jsx
const updateAchievements = (state) => {
  const unlocked = new Set(state.achievements || []);
  
  // ... lógica existente ...
  
  // Halloween Event Achievements
  if (isEventActive('halloween2024')) {
    unlocked.add('conquista_halloween');
    
    // Pumpkin achievements
    if ((state.pumpkins || 0) >= 100) unlocked.add('pumpkin_collector');
    if ((state.pumpkins || 0) >= 50) unlocked.add('pumpkin_master');
    
    // Spooky streak achievement
    if (state.streak >= 20) unlocked.add('spooky_streak');
    
    // Ghost hunting achievement
    if ((state.ghostsHunted || 0) >= 10) unlocked.add('ghost_hunter');
  }
  
  return Array.from(unlocked);
};
```

### 6. **ADICIONAR ITENS ESPECIAIS DE HALLOWEEN**

```javascript
// src/components/NutriaGame.jsx
const SKINS = [
  // ... skins existentes ...
  {
    id: 'nutria_halloween',
    name: t('halloweenNutria'),
    desc: t('spookyNutria'),
    unlocked: false,
    eventId: 'halloween2024',
    requirement: t('participateHalloween')
  },
  {
    id: 'nutria_pumpkin',
    name: t('pumpkinSkin'),
    desc: t('pumpkinNutriaDesc'),
    unlocked: false,
    eventId: 'halloween2024',
    requirement: t('collect50Pumpkins')
  },
  {
    id: 'nutria_ghost',
    name: t('ghostSkin'),
    desc: t('ghostNutriaDesc'),
    unlocked: false,
    eventId: 'halloween2024',
    requirement: t('hunt10Ghosts')
  }
];
```

### 7. **ADICIONAR MISSÕES ESPECIAIS DE HALLOWEEN**

```javascript
// src/context/GameContext.jsx
const getEventMissions = (eventId, t) => {
  const missions = {
    halloween2024: [
      { 
        id: 'collect_pumpkins', 
        desc: t('collectPumpkinsMission'), 
        goal: 50, 
        reward: 100,
        type: 'event',
        progressKey: 'pumpkins'
      },
      { 
        id: 'hunt_ghosts', 
        desc: t('huntGhostsMission'), 
        goal: 10, 
        reward: 150,
        type: 'event',
        progressKey: 'ghostsHunted'
      },
      { 
        id: 'spooky_streak_mission', 
        desc: t('spookyStreakMission'), 
        goal: 20, 
        reward: 200,
        type: 'event',
        progressKey: 'spookyStreak'
      }
    ]
  };
  
  return missions[eventId] || [];
};
```

### 8. **ADICIONAR EFEITOS VISUAIS ESPECIAIS**

```css
/* src/App.css */
.halloween-event {
  background: linear-gradient(135deg, #FF8C00 0%, #FF4500 100%);
  border: 2px solid #FFD700;
  box-shadow: 0 0 20px rgba(255, 140, 0, 0.5);
}

.halloween-event::before {
  content: '🎃';
  position: absolute;
  top: -10px;
  right: -10px;
  font-size: 2rem;
  animation: float 2s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}

.pumpkin-effect {
  background: radial-gradient(circle, #FF8C00, #FF4500);
  border-radius: 50%;
  animation: pulse 1s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}
```

### 9. **ADICIONAR SONS ESPECIAIS (OPCIONAL)**

```javascript
// src/services/SoundService.js
const halloweenSounds = {
  pumpkinCollect: 'sounds/pumpkin_collect.mp3',
  ghostHunt: 'sounds/ghost_hunt.mp3',
  spookyStreak: 'sounds/spooky_streak.mp3',
  halloweenAchievement: 'sounds/halloween_achievement.mp3'
};
```

### 10. **TESTAR O EVENTO**

```javascript
// Para testar, adicione temporariamente:
const getActiveEvent = () => {
  // Forçar evento ativo para teste
  return {
    id: 'halloween2024',
    name: 'Halloween Nutria',
    start: new Date('2024-10-25'),
    end: new Date('2024-11-02'),
    color: '#FF8C00',
    icon: '🎃'
  };
};
```

## 🎯 RESULTADO FINAL

Com essa implementação, você terá:

- ✅ Evento de Halloween ativo de 25/10 a 02/11
- ✅ 3 conquistas especiais de Halloween
- ✅ 3 badges exclusivas do evento
- ✅ 3 skins temáticas de Halloween
- ✅ 3 missões especiais do evento
- ✅ Traduções completas em PT/EN
- ✅ Efeitos visuais especiais
- ✅ Lógica de desbloqueio automática
- ✅ Sistema de recompensas temático

## 🚀 PRÓXIMOS PASSOS

1. **Implemente o evento** seguindo os passos acima
2. **Teste todas as funcionalidades**
3. **Ajuste datas e recompensas** conforme necessário
4. **Adicione mais eventos** usando este template
5. **Monitore o engajamento** dos jogadores

---

**💡 DICA:** Use este exemplo como base para criar outros eventos temáticos!
