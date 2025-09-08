import { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

// Traduções
const translations = {
  pt: {
    // Header
    game: 'Jogo',
    dashboard: 'Dashboard',
    stats: 'Status',
    achievements: 'Conquistas',
    rewards: 'Recompensas',
    more: 'Mais',
    
    // Authentication
    login: 'Entrar',
    register: 'Criar Conta',
    logout: 'Sair',
    email: 'Email',
    password: 'Senha',
    confirmPassword: 'Confirmar Senha',
    username: 'Nome de Usuário',
    wallet: 'Carteira ETH',
    signIn: 'Entrar',
    signUp: 'Criar Conta',
    signOut: 'Sair',
    profile: 'Perfil do Usuário',
    userProfile: 'Perfil do Usuário',
    editProfile: 'Editar Perfil',
    saveProfile: 'Salvar Perfil',
    cancel: 'Cancelar',
    loading: 'Carregando...',
    success: 'Sucesso',
    error: 'Erro',
    required: 'Obrigatório',
    invalidEmail: 'Email inválido',
    passwordTooShort: 'Senha muito curta',
    passwordsDoNotMatch: 'Senhas não coincidem',
    usernameRequired: 'Nome de usuário obrigatório',
    walletRequired: 'Carteira ETH obrigatória',
    invalidWallet: 'Formato de carteira inválido',
    userCreated: 'Usuário criado com sucesso!',
    loginSuccess: 'Login realizado com sucesso!',
    logoutSuccess: 'Logout realizado com sucesso!',
    profileUpdated: 'Perfil atualizado com sucesso!',
    alreadyHaveAccount: 'Já tem uma conta? Faça login',
    newToGame: 'Novo no jogo? Registre-se',
    minimumCharacters: 'Mínimo 6 caracteres',
    confirmPasswordAgain: 'Digite a senha novamente',
    displayName: 'Nome de Exibição',
    walletAddress: 'Endereço da Carteira ETH',
    alreadyHaveAccountButton: 'Já tenho conta',
    createAccountButton: 'Criar conta',
    
    // Ranking
    ranking: 'Ranking',
    yourPosition: 'Sua Posição',
    topPlayers: 'Top Jogadores',
    position: 'Posição',
    username: 'Nome de Usuário',
    totalCoins: 'Moedas Totais',
    totalClicks: 'Total de Cliques',
    maxStreak: 'Maior Streak',
    prestigeLevel: 'Nível Prestígio',
    sortBy: 'Ordenar por',
    rankingUpdated: 'Ranking atualizado em tempo real',
    totalPlayers: 'Total de Jogadores',
    noRankingData: 'Nenhum jogador encontrado',
    you: 'Você',
    
    // Game Stats
    gameStats: 'Estatísticas',
    totalCoins: 'Moedas Totais',
    level: 'Nível',
    totalClicks: 'Total de Cliques',
    maxStreak: 'Maior Streak',
    achievements: 'Conquistas',
    prestigeLevel: 'Nível Prestígio',
    yourPosition: 'Sua Posição',
    levelRanking: 'Ranking de Nível',
    logout: 'Sair',
    
    // Game
    clickToFeed: 'Clique para alimentar a nutria!',
    coins: 'Moedas',
    level: 'Nível',
    experience: 'Experiência',
    streak: 'Sequência',
    clickValue: 'Valor do Clique',
    
    // Upgrades
    upgrades: 'Melhorias',
    clickUpgrade: 'Melhorar Clique',
    autoClicker: 'Auto-Clicker',
    multiplier: 'Multiplicador',
    prestige: 'Prestígio',
    buy: 'Comprar',
    cost: 'Custo',
    value: 'Valor',
    interval: 'Intervalo',
    duration: 'Duração',
    active: 'Ativo',
    inactive: 'Inativo',
    activate: 'Ativar',
    deactivate: 'Desativar',
    pointsPerClick: 'Pontos Por Clique',
    pointsPerSecond: 'Pontos Por Segundo',
    levelLabel: 'Nível',
    valueLabel: 'Valor',
    nextLabel: 'Próximo',
    intervalLabel: 'Intervalo',
    statusLabel: 'Status',
    
    // Prestige
    prestigeReset: 'Reset Prestigioso',
    prestigeDescription: 'Reseta progresso por multiplicadores permanentes.',
    prestigeLevel: 'Nível Prestígio',
    currentMultiplier: 'Multiplicador Atual',
    prestigePoints: 'Pontos Prestígio',
    doPrestige: 'FAZER PRESTÍGIO',
    prestigeSuccess: 'Prestígio realizado! Multiplicadores aplicados!',
    
    // Daily Rewards
    dailyRewards: 'Recompensas Diárias',
    dailyRewardsTitle: 'Recompensas Diárias',
    nextIn: 'Próxima em',
    claim: 'Reivindicar',
    claimed: 'Reivindicado',
    claimReward: 'Resgatar Recompensa',
    nextReward: 'Próxima em: {time}',
    
    // Sistema de Recompensas Aprimorado
    daily: 'Diária',
    weekly: 'Semanal',
    monthly: 'Mensal',
    loginStreak: 'Login',
    weeklyRewardsTitle: 'Recompensas Semanais',
    monthlyRewardsTitle: 'Recompensas Mensais',
    loginRewardsTitle: 'Recompensas de Login',
    weeklyRewardDesc: 'Recompensa especial a cada 7 dias',
    monthlyRewardDesc: 'Recompensa especial a cada 30 dias',
    claimWeeklyReward: 'Resgatar Semanal',
    claimMonthlyReward: 'Resgatar Mensal',
    day: 'Dia',
    claimed: 'Resgatado',
    next: 'Próximo',
    locked: 'Bloqueado',
    loginProgress: 'Progresso: {current}/4 ciclos',
    
    // Active Bonuses
    activeBonuses: 'Bônus Ativos',
    timeRemaining: 'Tempo Restante',
    bonus: 'Bônus',
    
    // Dashboard
    playerStats: 'Estatísticas do Jogador',
    levelProgress: 'Progresso do Nível',
    activeUpgrades: 'Melhorias Ativas',
    autoClickerInfo: 'Auto-Clicker',
    clickUpgradeInfo: 'Melhoria de Clique',
    
    // Settings
    settings: 'Configurações',
    theme: 'Tema',
    language: 'Idioma',
    dark: 'Escuro',
    light: 'Claro',
    portuguese: 'Português',
    english: 'English',
    resetProgress: 'Resetar Progresso',
    confirmReset: 'Confirmar Reset',
    cancel: 'Cancelar',
    
    // More Options
    moreOptions: 'Mais Opções',
    badges: 'Emblemas',
    skins: 'Aparências',
    titles: 'Títulos',
    missions: 'Missões',
    airdrop: 'Airdrop',
    ranking: 'Ranking',
    referrals: 'Referências',
    minigames: 'Minijogos',
    return: 'Voltar',
    help: 'Ajuda',
    
    // Collectibles
    collectibles: 'Colecionáveis',
    pets: 'Pets',
    rarity: 'Raridade',
    common: 'Comum',
    rare: 'Raro',
    epic: 'Épico',
    legendary: 'Lendário',
    
    // Dynamic Events
    events: 'Eventos',
    activeEvents: 'Eventos Ativos',
    upcomingEvents: 'Próximos Eventos',
    eventRewards: 'Recompensas do Evento',
    
    // Eventos Iniciais
    firstSkin: 'Primeira Skin',
    unlockSkin: 'Desbloqueie uma skin!',
    airdrop100: 'Airdrop 100',
    reach100Airdrop: 'Alcance 100 pontos de airdrop!',
    outOfEvent: 'Fora do evento',
    locked: 'Bloqueada',
    
    // Guild System
    guild: 'Guilda',
    guildInfo: 'Informações da Guilda',
    members: 'Membros',
    challenges: 'Desafios',
    benefits: 'Benefícios',
    joinGuild: 'Entrar na Guilda',
    createGuild: 'Criar Guilda',
    
    // Notifications
    notification: 'Notificação',
    success: 'Sucesso',
    error: 'Erro',
    info: 'Informação',
    
    // Time
    hours: 'h',
    minutes: 'm',
    seconds: 's',
    days: 'dias',
    
    // Currency
    pntr: 'pNTR',
    
    // Common Actions
    loading: 'Carregando...',
    save: 'Salvar',
    close: 'Fechar',
    back: 'Voltar',
    next: 'Próximo',
    previous: 'Anterior',
    confirm: 'Confirmar',
    yes: 'Sim',
    no: 'Não',
    ok: 'OK',
    
    // Tutorial
    welcomeTitle: 'Bem-vindo ao Nutria Tap! 🦫',
    welcomeContent: 'Alimente sua nutria clicando no círculo para ganhar pNTR e subir de nível!',
    earnCoinsTitle: 'Ganhe Moedas! 💰',
    earnCoinsContent: 'Cada clique gera pNTR. Quanto mais você clica, mais moedas ganha!',
    buyUpgradesTitle: 'Compre Upgrades! ⚡',
    buyUpgradesContent: 'Use suas moedas para comprar upgrades e aumentar seus ganhos!',
    prestigeSystemTitle: 'Sistema de Prestígio! ⭐',
    prestigeSystemContent: 'Quando tiver muitas moedas, faça prestígio para ganhar multiplicadores permanentes!',
    dailyRewardsTitle: 'Recompensas Diárias! 🎁',
    dailyRewardsContent: 'Volte todos os dias para resgatar recompensas e manter seu streak!',
    dailyRewardsDesc: 'Volte todos os dias para manter seu streak!',
    weeklyRewardsDesc: 'Recompensa especial a cada 7 dias',
    monthlyRewardsDesc: 'Recompensa especial a cada 30 dias',
    monthlyRewardsPremium: 'Recompensa mensal premium para jogadores dedicados!',
    streakCurrent: 'Streak Atual',
    nextRewardIn: 'Próxima recompensa em:',
    progressCycle: 'Progresso do Ciclo',
    cycles: 'ciclos',
    multiplier: 'Multiplicador',
    perWeek: 'por semana',
    perMonth: 'por mês',
    loginRewardsDesc: 'Recompensas especiais por manter o login',
    skip: 'Pular',
    start: 'Começar',
    
    // Premium Themes
    premiumThemes: 'Temas Premium',
    neon: 'Neon',
    aquatic: 'Aquático',
    space: 'Espacial',
    
    // Event
    event: 'Evento',
    eventExclusive: 'Exclusiva de evento',
    closeEvent: 'Fechar',
    
    // Settings Modal
    settingsLabel: 'Configurações',
    
    // Referral System
    referral: 'Sistema de Referência',
    referralCode: 'Código de Referência',
    enterReferralCode: 'Insira o código de referência',
    copyCode: 'Copiar Código',
    addReferral: 'Adicionar Referência',
    addReferralCode: 'Adicionar Código de Amigo',
    myReferrals: 'Meus Referidos',
    totalReferrals: 'Total de Referidos',
    chooseUniqueName: 'Escolha um nome único',
    enterEmail: 'Digite seu email',
    
    // Stats
    levelReached: 'Nível {level} Alcançado!',
    continueProgress: 'Continue progredindo!',
    streakFire: 'Você está em chamas!',
    prestigeMultiplier: '{multiplier}x multiplicador!',
    nextLevelIn: 'Próximo nível em: {exp} XP',
    click: 'Clique',
    statistics: 'Estatísticas',
    totalClicks: 'Total de Cliques:',
    maxStreak: 'Maior Streak:',
    airdropPoints: 'Pontos Airdrop:',
    
    // Level Up
    levelUp: 'Nível Up!',
    nextLevel: 'Próximo nível:',
    clickStats: 'Estatísticas de Cliques',
    totalClicksLabel: 'Total de Cliques',
    coinsPerClick: 'Moedas por Clique',
    maxStreakLabel: 'Maior Streak',
    
    // Character Stats
    characterStats: 'Estatísticas do Personagem',
    strength: 'Força',
    agility: 'Agilidade',
    defense: 'Defesa',
    charisma: 'Carisma',
    economy: 'Economia',
    totalCoins: 'Moedas Totais',
    howToGainXP: 'Como ganhar XP?',
    clickForXP: 'Cada clique na Nutria gera 1 ponto de experiência!',
    levelUpStats: 'Ao subir de nível, seus atributos aumentam automaticamente.',
    
    // Skins
    classicNutria: 'Nutria Clássica',
    classicNutriaDesc: 'Sua nutria fiel e confiável',
    goldenNutria: 'Nutria Dourada',
    goldenNutriaDesc: 'Uma nutria rara e brilhante',
    rainbowNutria: 'Nutria Arco-íris',
    rainbowNutriaDesc: 'A nutria mais colorida de todas',
    cosmicNutria: 'Nutria Cósmica',
    cosmicNutriaDesc: 'Uma nutria das estrelas',
    reachLevel: 'Alcance nível {level}',
    happiness: 'Felicidade',
    energy: 'Energia',
    
    // Game Interface
    feedNutria: 'Alimente a Nutria!',
    streakDays: 'Streak: {streak} dias',
    
    // Achievements
    achievementsTitle: 'Conquistas',
    unlocked: 'Desbloqueadas:',
    
    // More Menu
    moreOptions: 'Mais opções',
    
    // Skins Screen
    skinsComingSoon: 'Em breve: desbloqueie aparências exclusivas para sua Nutria!',
    available: 'Disponível!',
    eventEnded: 'Fora do evento',
    
    // Help
    helpTip1: 'Clique em <b>Alimente a Nutria!</b> para ganhar pontos e XP.',
    helpTip2: 'Junte pontos para comprar upgrades e evoluir sua Nutria.',
    helpTip3: 'Suba de nível para desbloquear novas aparências.',
    helpTip4: 'Convide amigos usando seu código de referência.',
    helpTip5: 'Em breve: conquiste <b>badges</b> e veja seu progresso!',
    moreOptionsSoon: 'Mais opções em breve!',
    
    // Game Stats
    value: 'Valor:',
    
    // Upgrade Stats
    levelLabel: 'Nível:',
    valueLabel: 'Valor:',
    nextLabel: 'Próximo:',
    multiplierLabel: 'Multiplicador:',
    durationLabel: 'Duração:',
    intervalLabel: 'Intervalo:',
    statusLabel: 'Status:',
    insufficientCoins: 'Coins insuficientes',
    
    // Player Titles
    beginner: 'Iniciante',
    
    // Achievement Categories
    wealth: 'Riqueza',
    progress: 'Progresso',
    
    // Achievement Descriptions
    make5QuickClicks: 'Faça 5 cliques seguidos rápidos!',
    make10QuickClicks: 'Faça 10 cliques seguidos rápidos!',
    make25QuickClicks: 'Faça 25 cliques seguidos rápidos!',
    
    // Settings Modal
    appearance: 'Aparência',
    about: 'Sobre',
    customization: 'Personalização',
    circleColor: 'Cor do Círculo',
    borderStyle: 'Estilo de Borda',
    
    // Loading Screen
    starting: 'Iniciando...',
    loadingResources: 'Carregando recursos...',
    preparingNutria: 'Preparando a Nutria...',
    almostThere: 'Quase lá...',
    ready: 'Pronto!',
    
    // Titles Screen
    equipped: 'Equipado',
    locked: 'Bloqueado',
    startJourney: 'Comece sua jornada!',
    makeStreak10: 'Faça um streak de 10!',
    play7Days: 'Jogue por 7 dias diferentes!',
    top3Ranking: 'Fique entre os 3 primeiros do ranking!',
    participateChristmas: 'Participe do evento de Natal!',
    veteran: 'Veterano',
    christmas: 'Natalino',
    equip: 'Equipar',
    
    // Missions
    daily: 'Diárias',
    weekly: 'Semanais',
    rewardClaimed: 'Recompensa de {reward} pNTR resgatada!',
    rewardReceived: 'Recompensa Resgatada!',
    completed: 'Concluída!',
    noMissions: 'Nenhuma missão nesta categoria.',
    
    // Mini Games
    miniGames: 'Minijogos',
    minigamesTitle: 'Minijogos',
    minigamesComingSoon: 'Em breve: jogos exclusivos para ganhar pontos extras!',
    minigamesDescription: 'Jogos divertidos para desbloquear recompensas especiais',
    
    // Achievement Categories
    daily: 'Diárias',
    weekly: 'Semanais',
    achievementCategories: 'Categorias de Conquistas',
    progressAchievements: 'Conquistas de Progresso',
    
    // Achievement Names
    streak5: 'Streak 5',
    streak10: 'Streak 10',
    streak25: 'Streak 25',
    coins100: '100 Moedas',
    coins1000: '1000 Moedas',
    coins5000: '5000 Moedas',
    firstUpgrade: 'Primeiro Upgrade',
    upgrade5: 'Upgrade x5',
    level5: 'Nível 5',
    level10: 'Nível 10',
    firstReferral: 'Primeiro Referido',
    firstSkin: 'Primeira Skin',
    airdrop100: 'Airdrop 100',
    day7: '7 Dias Ativo',
    conquista_natal: 'Conquista Natalina',
    conquista_carnaval: 'Conquista Foliã',
    
    // Achievement Descriptions
    make5QuickClicks: 'Faça 5 cliques seguidos rápidos!',
    make10QuickClicks: 'Faça 10 cliques seguidos rápidos!',
    make25QuickClicks: 'Faça 25 cliques seguidos rápidos!',
    collect100Coins: 'Junte 100 moedas!',
    collect1000Coins: 'Junte 1000 moedas!',
    collect5000Coins: 'Junte 5000 moedas!',
    buyFirstUpgrade: 'Compre seu primeiro upgrade!',
    buy5Upgrades: 'Compre 5 upgrades!',
    reachLevel5: 'Chegue ao nível 5!',
    reachLevel10: 'Chegue ao nível 10!',
    bringFriend: 'Traga seu primeiro amigo!',
    unlockSkin: 'Desbloqueie uma skin!',
    reach100Airdrop: 'Alcance 100 pontos de airdrop!',
    play7Days: 'Jogue por 7 dias diferentes!',
    participateNatal: 'Desbloqueie durante o evento de Natal!',
    participateCarnaval: 'Desbloqueie durante o Carnaval Nutria!',
    
    // Badge Categories
    progresso: 'Progresso',
    riqueza: 'Riqueza',
    social: 'Social',
    eventos: 'Eventos',
    skins: 'Skins',
    
    // Badge Names
    beginner: 'Iniciante',
    level5: 'Nível 5',
    level10: 'Nível 10',
    streaker: 'Streaker',
    streak25: 'Streak 25',
    rich: 'Rico',
    coins5000: '5000 Moedas',
    upgrader: 'Upgrader',
    referrer: 'Referenciador',
    skinner: 'Skinner',
    airdropper: 'Airdropper',
    veteran: 'Veterano',
    natalino: 'Natalino',
    foliao: 'Folião',
    
    // Badge Descriptions
    startJourney: 'Comece sua jornada!',
    reachLevel5: 'Chegue ao nível 5!',
    reachLevel10: 'Chegue ao nível 10!',
    makeStreak10: 'Faça um streak de 10!',
    makeStreak25: 'Faça um streak de 25!',
    collect1000Coins: 'Junte 1000 moedas!',
    collect5000Coins: 'Junte 5000 moedas!',
    buy5Upgrades: 'Compre 5 upgrades!',
    bringFriend: 'Traga seu primeiro amigo!',
    unlockSkin: 'Desbloqueie uma skin!',
    reach100Airdrop: 'Alcance 100 pontos de airdrop!',
    play7Days: 'Jogue por 7 dias diferentes!',
    participateNatal: 'Participe do evento de Natal!',
    participateCarnaval: 'Participe do Carnaval Nutria!',
    
    // Mission Names
    feedNutria50: 'Alimente a Nutria 50 vezes',
    conquer1Badge: 'Conquiste 1 badge',
    make100Streaks: 'Faça 100 streaks',
    
    // Airdrop
    airdropTitle: 'Airdrop Nutria',
    airdropSubtitle: 'Colete pontos através de diferentes atividades e resgate recompensas especiais',
    howScoringWorks: 'Como funciona a pontuação?',
    airdropScore: 'Pontuação do airdrop:',
    details: 'Detalhamento:',
    nextAchievement: 'Próxima conquista:',
    clicks: 'Cliques:',
    level: 'Nível:',
    achievements: 'Conquistas:',
    upgrades: 'Upgrades:',
    maxStreak: 'Maior streak:',
    activeDays: 'Dias ativos:',
    points: 'pts',
    
    // Referral
    referralSystem: 'Sistema de Referência',
    inviteFriends: 'Convide amigos e ganhe recompensas especiais!',
    yourReferralCode: 'Seu Código de Referência',
    shareCode: 'Compartilhe este código com seus amigos!',
    addReferralCode: 'Adicionar Código de Amigo',
    enterReferralCode: 'Insira o código de referência',
    addReferral: 'Adicionar Referência',
    yourReferrals: 'Seus Referidos',
    noReferralsYet: 'Você ainda não tem referidos.',
    
    // Mini Games
    nutriaTarget: 'Nutria Target',
    nutriaTargetDesc: 'Acertar alvos para ganhar pontos extras',
    nutriaPuzzle: 'Nutria Puzzle',
    nutriaPuzzleDesc: 'Resolva quebra-cabeças para desbloquear recompensas',
    nutriaRunner: 'Nutria Runner',
    nutriaRunnerDesc: 'Corra e colete moedas no estilo endless runner',
    comingSoon: 'Em Breve',
    
    // Titles
    titles: 'Títulos',
    equipped: 'Equipado',
    locked: 'Bloqueado',
    equip: 'Equipar',
    top3Ranking: 'Fique entre os 3 primeiros do ranking!',
    participateChristmas: 'Participe do evento de Natal!',
    christmas: 'Natalino',
    
    // Ranking
    global: 'Global',
    groups: 'Grupos',
    yourPosition: 'Sua posição:',
    position: 'º',
    
    // Stats
    statistics: 'Estatísticas',
    totalClicks: 'Total de Cliques:',
    maxStreak: 'Maior Streak:',
    airdropPoints: 'Pontos Airdrop:',
    level: 'Nível:',
    totalCoins: 'Moedas Totais:',
    achievements: 'Conquistas:',
    prestigeLevel: 'Nível Prestígio:',
    levelRanking: 'Ranking de Nível:',
    pointsPerClick: 'Pontos Por Clique',
    streakAchievements: 'Conquistas de Streak',
    wealthAchievements: 'Conquistas de Riqueza',
    socialAchievements: 'Conquistas Sociais',
    
    // Status Messages
    noBadgesInCategory: 'Nenhuma badge nesta categoria ainda.',
    noAchievementsInCategory: 'Nenhuma conquista nesta categoria ainda.',
    inProgress: 'Em progresso',
    
    // Airdrop Rules
    clickPointsRule: '0,5 ponto por clique',
    levelPointsRule: '+10 pontos por nível alcançado',
    achievementPointsRule: '+7 pontos por conquista desbloqueada',
    upgradePointsRule: '+3 pontos por upgrade comprado',
    streakPointsRule: '+5 pontos a cada streak de 10',
    dailyPointsRule: '+10 pontos por dia ativo',
    
    // Badge Names
    level5: 'Nível 5',
    level10: 'Nível 10',
    streak25: 'Streak 25',
    rich: 'Rico',
    coins5000: '5000 moedas',
    upgrader: 'Upgrader',
    referrer: 'Referenciador',
    skinner: 'Fashion',
    airdropper: 'Airdropper',
    natalino: 'Natalino',
    foliao: 'Folião',
    
    // Badge Categories
    progress: 'Progresso',
    streak: 'Streak',
    wealth: 'Riqueza',
    social: 'Social',
    skins: 'Aparências',
    events: 'Eventos',
    
    // Badge Descriptions
    collect100Coins: 'Junte 100 moedas!',
    buyFirstUpgrade: 'Compre seu primeiro upgrade!',
    make25QuickClicks: 'Faça 25 cliques seguidos rápidos!',
    startJourney: 'Comece sua jornada!',
    reachLevel5: 'Alcance o nível 5!',
    reachLevel10: 'Alcance o nível 10!',
    makeStreak10: 'Faça streak de 10 dias!',
    makeStreak25: 'Faça streak de 25 dias!',
    play7Days: 'Jogue por 7 dias!',
    participateNatal: 'Participe do evento de Natal!',
    participateCarnaval: 'Participe do Carnaval!',
    
    // Color Names
    green: 'Verde',
    orange: 'Laranja',
    blue: 'Azul',
    purple: 'Roxo',
    pink: 'Rosa',
    yellow: 'Amarelo',
    white: 'Branco',
    
    // Border Styles
    pulse: 'Pulsante',
    glow: 'Brilhante',
    gradient: 'Gradiente',
    static: 'Estática',
    
    // Background Styles
    default: 'Padrão',
    gradient1: 'Gradiente Verde-Laranja',
    gradient2: 'Gradiente Azul-Roxo',
    gradient3: 'Gradiente Ciano-Rosa',
    
    // Effects
    none: 'Sem efeito',
    shine: 'Brilho',
    particles: 'Partículas',
    
    // Event Exclusive
    eventExclusive: 'Exclusiva de evento',
    
    // User System
    userAccount: 'Conta do Usuário',
    userProfile: 'Perfil do Usuário',
    enterUsername: 'Digite seu nome de usuário',
    enterEmail: 'Digite seu email',
    walletHelp: 'Endereço ETH válido (ex: 0x1234...)',
    edit: 'Editar',
    yourRank: 'Sua Posição',
    levelRank: 'Ranking de Nível',
    rank: 'Posição',
    noRankingData: 'Nenhum dado de ranking disponível',
    you: 'Você',
    rankingUpdated: 'Ranking atualizado em tempo real',
    totalPlayers: 'Total de Jogadores'
  },

  en: {
    // Header
    game: 'Game',
    dashboard: 'Dashboard',
    stats: 'Stats',
    achievements: 'Achievements',
    rewards: 'Rewards',
    more: 'More',
    
    // Authentication
    login: 'Login',
    register: 'Create Account',
    logout: 'Logout',
    email: 'Email',
    password: 'Password',
    confirmPassword: 'Confirm Password',
    username: 'Username',
    wallet: 'ETH Wallet',
    signIn: 'Sign In',
    signUp: 'Sign Up',
    signOut: 'Sign Out',
    profile: 'User Profile',
    userProfile: 'User Profile',
    editProfile: 'Edit Profile',
    saveProfile: 'Save Profile',
    cancel: 'Cancel',
    loading: 'Loading...',
    success: 'Success',
    error: 'Error',
    required: 'Required',
    invalidEmail: 'Invalid email',
    passwordTooShort: 'Password too short',
    passwordsDoNotMatch: 'Passwords do not match',
    usernameRequired: 'Username required',
    walletRequired: 'ETH wallet required',
    invalidWallet: 'Invalid wallet format',
    userCreated: 'User created successfully!',
    loginSuccess: 'Login successful!',
    logoutSuccess: 'Logout successful!',
    profileUpdated: 'Profile updated successfully!',
    alreadyHaveAccount: 'Already have an account? Sign in',
    newToGame: 'New to the game? Register',
    minimumCharacters: 'Minimum 6 characters',
    confirmPasswordAgain: 'Type password again',
    displayName: 'Display Name',
    walletAddress: 'ETH Wallet Address',
    alreadyHaveAccountButton: 'I already have an account',
    createAccountButton: 'Create account',
    
    // Ranking
    ranking: 'Ranking',
    yourPosition: 'Your Position',
    topPlayers: 'Top Players',
    position: 'Position',
    username: 'Username',
    totalCoins: 'Total Coins',
    totalClicks: 'Total Clicks',
    maxStreak: 'Max Streak',
    prestigeLevel: 'Prestige Level',
    sortBy: 'Sort by',
    rankingUpdated: 'Ranking updated in real time',
    totalPlayers: 'Total Players',
    noRankingData: 'No players found',
    you: 'You',
    
    // Game Stats
    gameStats: 'Statistics',
    totalCoins: 'Total Coins',
    level: 'Level',
    totalClicks: 'Total Clicks',
    maxStreak: 'Max Streak',
    achievements: 'Achievements',
    prestigeLevel: 'Prestige Level',
    yourPosition: 'Your Position',
    levelRanking: 'Level Ranking',
    logout: 'Logout',
    
    // Game
    clickToFeed: 'Click to feed the nutria!',
    coins: 'Coins',
    level: 'Level',
    experience: 'Experience',
    streak: 'Streak',
    clickValue: 'Click Value',
    
    // Upgrades
    upgrades: 'Upgrades',
    clickUpgrade: 'Click Upgrade',
    autoClicker: 'Auto-Clicker',
    multiplier: 'Multiplier',
    prestige: 'Prestige',
    buy: 'Buy',
    cost: 'Cost',
    value: 'Value',
    interval: 'Interval',
    duration: 'Duration',
    active: 'Active',
    inactive: 'Inactive',
    activate: 'Activate',
    deactivate: 'Deactivate',
    pointsPerClick: 'Points Per Click',
    pointsPerSecond: 'Points Per Second',
    levelLabel: 'Level',
    valueLabel: 'Value',
    nextLabel: 'Next',
    intervalLabel: 'Interval',
    statusLabel: 'Status',
    
    // Prestige
    prestigeReset: 'Prestigious Reset',
    prestigeDescription: 'Resets progress for permanent multipliers.',
    prestigeLevel: 'Prestige Level',
    currentMultiplier: 'Current Multiplier',
    prestigePoints: 'Prestige Points',
    doPrestige: 'DO PRESTIGE',
    prestigeSuccess: 'Prestige completed! Multipliers applied!',
    
    // Daily Rewards
    dailyRewards: 'Daily Rewards',
    dailyRewardsTitle: 'Daily Rewards',
    nextIn: 'Next in',
    claim: 'Claim',
    claimed: 'Claimed',
    claimReward: 'Claim Reward',
    nextReward: 'Next in: {time}',
    
    // Enhanced Rewards System
    daily: 'Daily',
    weekly: 'Weekly',
    monthly: 'Monthly',
    loginStreak: 'Login',
    weeklyRewardsTitle: 'Weekly Rewards',
    monthlyRewardsTitle: 'Monthly Rewards',
    loginRewardsTitle: 'Login Rewards',
    weeklyRewardDesc: 'Special reward every 7 days',
    monthlyRewardDesc: 'Special reward every 30 days',
    claimWeeklyReward: 'Claim Weekly',
    claimMonthlyReward: 'Claim Monthly',
    day: 'Day',
    claimed: 'Claimed',
    next: 'Next',
    locked: 'Locked',
    loginProgress: 'Progress: {current}/4 cycles',
    
    // Active Bonuses
    activeBonuses: 'Active Bonuses',
    timeRemaining: 'Time Remaining',
    bonus: 'Bonus',
    
    // Dashboard
    playerStats: 'Player Stats',
    levelProgress: 'Level Progress',
    activeUpgrades: 'Active Upgrades',
    autoClickerInfo: 'Auto-Clicker',
    clickUpgradeInfo: 'Click Upgrade',
    
    // Settings
    settings: 'Settings',
    theme: 'Theme',
    language: 'Language',
    dark: 'Dark',
    light: 'Light',
    portuguese: 'Português',
    english: 'English',
    resetProgress: 'Reset Progress',
    confirmReset: 'Confirm Reset',
    cancel: 'Cancel',
    
    // More Options
    moreOptions: 'More Options',
    badges: 'Badges',
    skins: 'Skins',
    titles: 'Titles',
    missions: 'Missions',
    airdrop: 'Airdrop',
    ranking: 'Ranking',
    referrals: 'Referrals',
    minigames: 'Mini-games',
    return: 'Return',
    help: 'Help',
    
    // Collectibles
    collectibles: 'Collectibles',
    pets: 'Pets',
    rarity: 'Rarity',
    common: 'Common',
    rare: 'Rare',
    epic: 'Epic',
    legendary: 'Legendary',
    
    // Dynamic Events
    events: 'Events',
    activeEvents: 'Active Events',
    upcomingEvents: 'Upcoming Events',
    eventRewards: 'Event Rewards',
    
    // Initial Events
    firstSkin: 'First Skin',
    unlockSkin: 'Unlock a skin!',
    airdrop100: 'Airdrop 100',
    reach100Airdrop: 'Reach 100 airdrop points!',
    outOfEvent: 'Out of event',
    locked: 'Locked',
    
    // Guild System
    guild: 'Guild',
    guildInfo: 'Guild Info',
    members: 'Members',
    challenges: 'Challenges',
    benefits: 'Benefits',
    joinGuild: 'Join Guild',
    createGuild: 'Create Guild',
    
    // Notifications
    notification: 'Notification',
    success: 'Success',
    error: 'Error',
    info: 'Info',
    
    // Time
    hours: 'h',
    minutes: 'm',
    seconds: 's',
    days: 'days',
    
    // Currency
    pntr: 'pNTR',
    
    // Common Actions
    loading: 'Loading...',
    save: 'Save',
    close: 'Close',
    back: 'Back',
    next: 'Next',
    previous: 'Previous',
    confirm: 'Confirm',
    yes: 'Yes',
    no: 'No',
    ok: 'OK',
    
    // Tutorial
    welcomeTitle: 'Welcome to Nutria Tap! 🦫',
    welcomeContent: 'Feed your nutria by clicking the circle to earn pNTR and level up!',
    earnCoinsTitle: 'Earn Coins! 💰',
    earnCoinsContent: 'Each click generates pNTR. The more you click, the more coins you earn!',
    buyUpgradesTitle: 'Buy Upgrades! ⚡',
    buyUpgradesContent: 'Use your coins to buy upgrades and increase your earnings!',
    prestigeSystemTitle: 'Prestige System! ⭐',
    prestigeSystemContent: 'When you have many coins, do prestige to gain permanent multipliers!',
    dailyRewardsTitle: 'Daily Rewards! 🎁',
    dailyRewardsContent: 'Come back every day to claim rewards and maintain your streak!',
    dailyRewardsDesc: 'Come back every day to maintain your streak!',
    weeklyRewardsDesc: 'Special reward every 7 days',
    monthlyRewardsDesc: 'Special reward every 30 days',
    monthlyRewardsPremium: 'Premium monthly reward for dedicated players!',
    streakCurrent: 'Current Streak',
    nextRewardIn: 'Next reward in:',
    progressCycle: 'Cycle Progress',
    cycles: 'cycles',
    multiplier: 'Multiplier',
    perWeek: 'per week',
    perMonth: 'per month',
    loginRewardsDesc: 'Special rewards for maintaining login',
    skip: 'Skip',
    start: 'Start',
    
    // Premium Themes
    premiumThemes: 'Premium Themes',
    neon: 'Neon',
    aquatic: 'Aquatic',
    space: 'Space',
    
    // Event
    event: 'Event',
    eventExclusive: 'Event exclusive',
    closeEvent: 'Close',
    
    // Settings Modal
    settingsLabel: 'Settings',
    
    // Referral System
    referral: 'Referral System',
    referralCode: 'Referral Code',
    enterReferralCode: 'Enter referral code',
    copyCode: 'Copy Code',
    addReferral: 'Add Referral',
    addReferralCode: 'Add Friend Code',
    myReferrals: 'My Referrals',
    totalReferrals: 'Total Referrals',
    chooseUniqueName: 'Choose a unique name',
    enterEmail: 'Enter your email',
    
    // Stats
    levelReached: 'Level {level} Reached!',
    continueProgress: 'Keep progressing!',
    streakFire: 'You are on fire!',
    prestigeMultiplier: '{multiplier}x multiplier!',
    nextLevelIn: 'Next level in: {exp} XP',
    click: 'Click',
    statistics: 'Statistics',
    totalClicks: 'Total Clicks:',
    maxStreak: 'Max Streak:',
    airdropPoints: 'Airdrop Points:',
    
    // Level Up
    levelUp: 'Level Up!',
    nextLevel: 'Next level:',
    clickStats: 'Click Statistics',
    totalClicksLabel: 'Total Clicks',
    coinsPerClick: 'Coins per Click',
    maxStreakLabel: 'Max Streak',
    
    // Character Stats
    characterStats: 'Character Stats',
    strength: 'Strength',
    agility: 'Agility',
    defense: 'Defense',
    charisma: 'Charisma',
    economy: 'Economy',
    totalCoins: 'Total Coins',
    howToGainXP: 'How to gain XP?',
    clickForXP: 'Each click on the Nutria generates 1 experience point!',
    levelUpStats: 'When you level up, your attributes increase automatically.',
    
    // Skins
    classicNutria: 'Classic Nutria',
    classicNutriaDesc: 'Your faithful and reliable nutria',
    goldenNutria: 'Golden Nutria',
    goldenNutriaDesc: 'A rare and shiny nutria',
    rainbowNutria: 'Rainbow Nutria',
    rainbowNutriaDesc: 'The most colorful nutria of all',
    cosmicNutria: 'Cosmic Nutria',
    cosmicNutriaDesc: 'A nutria from the stars',
    reachLevel: 'Reach level {level}',
    happiness: 'Happiness',
    energy: 'Energy',
    
    // Game Interface
    feedNutria: 'Feed the Nutria!',
    streakDays: 'Streak: {streak} days',
    
    // Achievements
    achievementsTitle: 'Achievements',
    unlocked: 'Unlocked:',
    
    // More Menu
    moreOptions: 'More options',
    
    // Skins Screen
    skinsComingSoon: 'Coming soon: unlock exclusive appearances for your Nutria!',
    available: 'Available!',
    eventEnded: 'Event ended',
    
    // Help
    helpTip1: 'Click <b>Feed the Nutria!</b> to earn points and XP.',
    helpTip2: 'Collect points to buy upgrades and evolve your Nutria.',
    helpTip3: 'Level up to unlock new appearances.',
    helpTip4: 'Invite friends using your referral code.',
    helpTip5: 'Coming soon: earn <b>badges</b> and see your progress!',
    moreOptionsSoon: 'More options coming soon!',
    
    // Game Stats
    value: 'Value:',
    
    // Upgrade Stats
    levelLabel: 'Level:',
    valueLabel: 'Value:',
    nextLabel: 'Next:',
    multiplierLabel: 'Multiplier:',
    durationLabel: 'Duration:',
    intervalLabel: 'Interval:',
    statusLabel: 'Status:',
    insufficientCoins: 'Insufficient coins',
    
    // Player Titles
    beginner: 'Beginner',
    
    // Achievement Categories
    wealth: 'Wealth',
    progress: 'Progress',
    
    // Achievement Descriptions
    make5QuickClicks: 'Make 5 quick consecutive clicks!',
    make10QuickClicks: 'Make 10 quick consecutive clicks!',
    make25QuickClicks: 'Make 25 quick consecutive clicks!',
    
    // Settings Modal
    appearance: 'Appearance',
    about: 'About',
    customization: 'Customization',
    circleColor: 'Circle Color',
    borderStyle: 'Border Style',
    
    // Loading Screen
    starting: 'Starting...',
    loadingResources: 'Loading resources...',
    preparingNutria: 'Preparing the Nutria...',
    almostThere: 'Almost there...',
    ready: 'Ready!',
    
    // Titles Screen
    equipped: 'Equipped',
    locked: 'Locked',
    startJourney: 'Start your journey!',
    makeStreak10: 'Make a streak of 10!',
    play7Days: 'Play for 7 different days!',
    top3Ranking: 'Be among the top 3 in the ranking!',
    participateChristmas: 'Participate in the Christmas event!',
    veteran: 'Veteran',
    christmas: 'Christmas',
    equip: 'Equip',
    
    // Missions
    daily: 'Daily',
    weekly: 'Weekly',
    rewardClaimed: 'Reward of {reward} pNTR claimed!',
    rewardReceived: 'Reward Claimed!',
    completed: 'Completed!',
    noMissions: 'No missions in this category.',
    
    // Mini Games
    miniGames: 'Mini-games',
    minigamesTitle: 'Mini-games',
    minigamesComingSoon: 'Coming soon: exclusive games to earn extra points!',
    minigamesDescription: 'Fun games to unlock special rewards',
    
    // Achievement Categories
    daily: 'Daily',
    weekly: 'Weekly',
    achievementCategories: 'Achievement Categories',
    progressAchievements: 'Progress Achievements',
    streakAchievements: 'Streak Achievements',
    wealthAchievements: 'Wealth Achievements',
    socialAchievements: 'Social Achievements',
    
    // Achievement Names
    streak5: 'Streak 5',
    streak10: 'Streak 10',
    streak25: 'Streak 25',
    coins100: '100 Coins',
    coins1000: '1000 Coins',
    coins5000: '5000 Coins',
    firstUpgrade: 'First Upgrade',
    upgrade5: 'Upgrade x5',
    level5: 'Level 5',
    level10: 'Level 10',
    firstReferral: 'First Referral',
    firstSkin: 'First Skin',
    airdrop100: 'Airdrop 100',
    day7: '7 Active Days',
    conquista_natal: 'Christmas Achievement',
    conquista_carnaval: 'Carnival Achievement',
    
    // Achievement Descriptions
    make5QuickClicks: 'Make 5 quick consecutive clicks!',
    make10QuickClicks: 'Make 10 quick consecutive clicks!',
    make25QuickClicks: 'Make 25 quick consecutive clicks!',
    collect100Coins: 'Collect 100 coins!',
    collect1000Coins: 'Collect 1000 coins!',
    collect5000Coins: 'Collect 5000 coins!',
    buyFirstUpgrade: 'Buy your first upgrade!',
    buy5Upgrades: 'Buy 5 upgrades!',
    reachLevel5: 'Reach level 5!',
    reachLevel10: 'Reach level 10!',
    bringFriend: 'Bring your first friend!',
    unlockSkin: 'Unlock a skin!',
    reach100Airdrop: 'Reach 100 airdrop points!',
    play7Days: 'Play for 7 different days!',
    participateNatal: 'Unlock during Christmas event!',
    participateCarnaval: 'Unlock during Nutria Carnival!',
    
    // Badge Names
    level5: 'Level 5',
    level10: 'Level 10',
    streak25: 'Streak 25',
    rich: 'Rich',
    coins5000: '5000 coins',
    upgrader: 'Upgrader',
    referrer: 'Referrer',
    skinner: 'Fashion',
    airdropper: 'Airdropper',
    natalino: 'Christmas',
    foliao: 'Carnival',
    
    // Mission Names
    feedNutria50: 'Feed the Nutria 50 times',
    conquer1Badge: 'Conquer 1 badge',
    make100Streaks: 'Make 100 streaks',
    
    // Airdrop
    airdropTitle: 'Nutria Airdrop',
    airdropSubtitle: 'Collect points through different activities and claim special rewards',
    howScoringWorks: 'How does scoring work?',
    airdropScore: 'Airdrop score:',
    details: 'Details:',
    nextAchievement: 'Next achievement:',
    clicks: 'Clicks:',
    level: 'Level:',
    achievements: 'Achievements:',
    upgrades: 'Upgrades:',
    maxStreak: 'Max streak:',
    activeDays: 'Active days:',
    points: 'pts',
    
    // Referral
    referralSystem: 'Referral System',
    inviteFriends: 'Invite friends and earn special rewards!',
    yourReferralCode: 'Your Referral Code',
    shareCode: 'Share this code with your friends!',
    addReferralCode: 'Add Friend Code',
    enterReferralCode: 'Enter referral code',
    addReferral: 'Add Referral',
    yourReferrals: 'Your Referrals',
    noReferralsYet: 'You don\'t have referrals yet.',
    
    // Mini Games
    nutriaTarget: 'Nutria Target',
    nutriaTargetDesc: 'Hit targets to earn extra points',
    nutriaPuzzle: 'Nutria Puzzle',
    nutriaPuzzleDesc: 'Solve puzzles to unlock rewards',
    nutriaRunner: 'Nutria Runner',
    nutriaRunnerDesc: 'Run and collect coins in endless runner style',
    comingSoon: 'Coming Soon',
    
    // Titles
    titles: 'Titles',
    equipped: 'Equipped',
    locked: 'Locked',
    equip: 'Equip',
    top3Ranking: 'Be among the top 3 in the ranking!',
    participateChristmas: 'Participate in the Christmas event!',
    christmas: 'Christmas',
    
    // Ranking
    global: 'Global',
    groups: 'Groups',
    yourPosition: 'Your position:',
    position: 'th',
    
    // Stats
    statistics: 'Statistics',
    totalClicks: 'Total Clicks:',
    maxStreak: 'Max Streak:',
    airdropPoints: 'Airdrop Points:',
    level: 'Level:',
    totalCoins: 'Total Coins:',
    achievements: 'Achievements:',
    prestigeLevel: 'Prestige Level:',
    levelRanking: 'Level Ranking:',
    pointsPerClick: 'Points Per Click',
    
    // Status Messages
    noBadgesInCategory: 'No badges in this category yet.',
    noAchievementsInCategory: 'No achievements in this category yet.',
    inProgress: 'In Progress',
    
    // Airdrop Rules
    clickPointsRule: '0.5 points per click',
    levelPointsRule: '+10 points per level reached',
    achievementPointsRule: '+7 points per achievement unlocked',
    upgradePointsRule: '+3 points per upgrade purchased',
    streakPointsRule: '+5 points for every streak of 10',
    dailyPointsRule: '+10 points per active day',
    
    // Badge Categories
    progress: 'Progress',
    streak: 'Streak',
    wealth: 'Wealth',
    social: 'Social',
    skins: 'Skins',
    events: 'Events',
    
    // Badge Descriptions
    collect100Coins: 'Collect 100 coins!',
    buyFirstUpgrade: 'Buy your first upgrade!',
    make25QuickClicks: 'Make 25 quick consecutive clicks!',
    startJourney: 'Start your journey!',
    reachLevel5: 'Reach level 5!',
    reachLevel10: 'Reach level 10!',
    makeStreak10: 'Make 10 day streak!',
    makeStreak25: 'Make 25 day streak!',
    play7Days: 'Play for 7 days!',
    participateNatal: 'Participate in Christmas event!',
    participateCarnaval: 'Participate in Carnival!',
    
    // Color Names
    green: 'Green',
    orange: 'Orange',
    blue: 'Blue',
    purple: 'Purple',
    pink: 'Pink',
    yellow: 'Yellow',
    white: 'White',
    
    // Border Styles
    pulse: 'Pulsating',
    glow: 'Shiny',
    gradient: 'Gradient',
    static: 'Static',
    
    // Background Styles
    default: 'Default',
    gradient1: 'Green-Orange Gradient',
    gradient2: 'Blue-Purple Gradient',
    gradient3: 'Cyan-Pink Gradient',
    
    // Effects
    none: 'No effect',
    shine: 'Glow',
    particles: 'Particles',
    
    // Event Exclusive
    eventExclusive: 'Event Exclusive',
    
    // User System
    userAccount: 'User Account',
    userProfile: 'User Profile',
    enterUsername: 'Enter your username',
    enterEmail: 'Enter your email',
    walletHelp: 'Valid ETH address (ex: 0x1234...)',
    edit: 'Edit',
    yourRank: 'Your Rank',
    levelRank: 'Level Rank',
    rank: 'Rank',
    noRankingData: 'No ranking data available',
    you: 'You',
    rankingUpdated: 'Ranking updated in real time',
    totalPlayers: 'Total Players'
  }
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('nutriaTap_language') || 'pt';
  });

  useEffect(() => {
    localStorage.setItem('nutriaTap_language', language);
  }, [language]);

  const changeLanguage = (newLanguage) => {
    setLanguage(newLanguage);
  };

  const t = (key, params = {}) => {
    let translation = translations[language]?.[key] || key;
    
    // Replace parameters
    Object.keys(params).forEach(param => {
      translation = translation.replace(`{${param}}`, params[param]);
    });
    
    return translation;
  };

  const value = {
    language,
    changeLanguage,
    t
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};