# 🎉 GUIA COMPLETO DO SISTEMA DE EVENTOS ESPECIAIS

## 📋 COMO ADICIONAR UM NOVO EVENTO ESPECIAL

### 1. **DEFINIR O EVENTO NO GAMECONTEXT**

Adicione o evento em `src/context/GameContext.jsx`:

```javascript
// Adicione na função getActiveEvent()
const getActiveEvent = () => {
  const today = new Date();
  const events = [
    {
      id: 'natal2024',
      name: 'Natal Nutria',
      start: new Date('2024-12-20'),
      end: new Date('2024-12-31'),
      color: '#FF6B6B',
      icon: '🎄'
    },
    {
      id: 'carnaval2025',
      name: 'Carnaval Nutria',
      start: new Date('2025-02-15'),
      end: new Date('2025-02-25'),
      color: '#FFD700',
      icon: '🎭'
    },
    // NOVO EVENTO - EXEMPLO
    {
      id: 'halloween2024',
      name: 'Halloween Nutria',
      start: new Date('2024-10-25'),
      end: new Date('2024-11-02'),
      color: '#FF8C00',
      icon: '🎃'
    }
  ];
  
  return events.find(ev => today >= ev.start && today <= ev.end) || null;
};
```

### 2. **ADICIONAR CONQUISTAS DO EVENTO**

Em `src/context/GameContext.jsx`, adicione conquistas específicas do evento:

```javascript
const getAchievements = (t) => [
  // ... conquistas existentes ...
  
  // Conquistas do Halloween
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
  }
];
```

### 3. **ADICIONAR BADGES DO EVENTO**

Em `src/components/NutriaGame.jsx`, adicione badges específicas:

```javascript
const getBadges = (t) => [
  // ... badges existentes ...
  
  // Badges do Halloween
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
    unlock: (state, isEventActive) => isEventActive('halloween2024') && state.pumpkins >= 50 
  }
];
```

### 4. **ADICIONAR TRADUÇÕES**

Em `src/context/LanguageContext.jsx`, adicione as traduções:

**Português:**
```javascript
// Achievement Names
conquista_halloween: 'Conquista Halloween',
pumpkinCollector: 'Colecionador de Abóboras',

// Achievement Descriptions
participateHalloween: 'Desbloqueie durante o Halloween Nutria!',
collect100Pumpkins: 'Colete 100 abóboras!',

// Badge Names
halloween: 'Halloween',
pumpkinMaster: 'Mestre das Abóboras',

// Badge Descriptions
collect50Pumpkins: 'Colete 50 abóboras!',
```

**Inglês:**
```javascript
// Achievement Names
conquista_halloween: 'Halloween Achievement',
pumpkinCollector: 'Pumpkin Collector',

// Achievement Descriptions
participateHalloween: 'Unlock during Nutria Halloween!',
collect100Pumpkins: 'Collect 100 pumpkins!',

// Badge Names
halloween: 'Halloween',
pumpkinMaster: 'Pumpkin Master',

// Badge Descriptions
collect50Pumpkins: 'Collect 50 pumpkins!',
```

### 5. **ADICIONAR LÓGICA DE EVENTO ESPECÍFICA**

Se o evento tiver mecânicas especiais, adicione em `src/context/GameContext.jsx`:

```javascript
// Exemplo: Sistema de abóboras para Halloween
const updateAchievements = (state) => {
  const unlocked = new Set(state.achievements || []);
  
  // ... lógica existente ...
  
  // Event achievements
  if (isEventActive('halloween2024')) {
    unlocked.add('conquista_halloween');
    if (state.pumpkins >= 100) unlocked.add('pumpkin_collector');
  }
  
  return Array.from(unlocked);
};
```

### 6. **ADICIONAR ITENS ESPECIAIS (OPCIONAL)**

Se o evento tiver itens especiais, adicione em `src/components/NutriaGame.jsx`:

```javascript
// Exemplo: Skins de Halloween
const SKINS = [
  // ... skins existentes ...
  {
    id: 'nutria_halloween',
    name: t('halloweenNutria'),
    desc: t('spookyNutria'),
    unlocked: false,
    eventId: 'halloween2024'
  }
];
```

### 7. **ADICIONAR MISSÕES ESPECIAIS (OPCIONAL)**

Para missões específicas do evento:

```javascript
const getEventMissions = (eventId, t) => {
  const missions = {
    halloween2024: [
      { 
        id: 'collect_pumpkins', 
        desc: t('collectPumpkinsMission'), 
        goal: 50, 
        reward: 100 
      }
    ]
  };
  
  return missions[eventId] || [];
};
```

## 🎨 PERSONALIZAÇÃO VISUAL

### 1. **CORES E TEMAS**
- Adicione cores específicas do evento
- Crie temas especiais
- Adicione efeitos visuais únicos

### 2. **ÍCONES E EMOJIS**
- Use ícones temáticos
- Adicione emojis especiais
- Crie animações únicas

### 3. **SONS E EFEITOS**
- Adicione sons temáticos
- Crie efeitos especiais
- Implemente animações únicas

## 📅 CRONOGRAMA DE EVENTOS

### **Eventos Anuais Sugeridos:**
- **Janeiro**: Ano Novo (1-7)
- **Fevereiro**: Carnaval (15-25)
- **Março**: Páscoa (varia)
- **Abril**: Dia da Terra (20-30)
- **Maio**: Primavera (1-15)
- **Junho**: São João (20-30)
- **Julho**: Férias de Verão (1-31)
- **Agosto**: Festival de Verão (15-25)
- **Setembro**: Volta às Aulas (1-15)
- **Outubro**: Halloween (25-31)
- **Novembro**: Ação de Graças (20-30)
- **Dezembro**: Natal (20-31)

## 🔧 CONFIGURAÇÃO RÁPIDA

### **Para adicionar um evento rapidamente:**

1. **Copie o template abaixo:**
```javascript
{
  id: 'seu_evento_id',
  name: 'Nome do Evento',
  start: new Date('YYYY-MM-DD'),
  end: new Date('YYYY-MM-DD'),
  color: '#COR_HEX',
  icon: '🎉'
}
```

2. **Adicione conquistas:**
```javascript
{ 
  id: 'conquista_seu_evento', 
  name: t('nomeConquista'), 
  desc: t('descricaoConquista'), 
  category: 'events', 
  eventId: 'seu_evento_id' 
}
```

3. **Adicione traduções:**
```javascript
// PT
nomeConquista: 'Nome da Conquista',
descricaoConquista: 'Descrição da conquista!',

// EN
nomeConquista: 'Achievement Name',
descricaoConquista: 'Achievement description!',
```

## ✅ CHECKLIST DE IMPLEMENTAÇÃO

- [ ] Evento definido em `getActiveEvent()`
- [ ] Conquistas adicionadas em `getAchievements()`
- [ ] Badges adicionadas em `getBadges()`
- [ ] Traduções em português adicionadas
- [ ] Traduções em inglês adicionadas
- [ ] Lógica específica implementada (se necessário)
- [ ] Itens especiais adicionados (se necessário)
- [ ] Missões especiais criadas (se necessário)
- [ ] Testes realizados
- [ ] Documentação atualizada

## 🚀 EXEMPLO COMPLETO: EVENTO DE HALLOWEEN

Veja o arquivo `HALLOWEEN_EVENT_EXAMPLE.md` para um exemplo completo de implementação.

---

**💡 DICA:** Sempre teste os eventos em ambiente de desenvolvimento antes de publicar!
