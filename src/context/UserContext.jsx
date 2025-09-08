import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import supabaseApiService from '../services/SupabaseApiService';
import authService from '../services/AuthService';

const UserContext = createContext();

// Função para validar endereço ETH
const isValidEthAddress = (address) => {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
};

// Função para validar email
const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

// Função para gerar ID único
const generateUserId = () => {
  return 'user_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
};

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  // Carregar dados do usuário do localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem('nutriaTap_user');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
        setIsLoggedIn(true);
      } catch (error) {
        console.error('Erro ao carregar dados do usuário:', error);
        localStorage.removeItem('nutriaTap_user');
      }
    }
    setLoading(false);
  }, []);

  // Salvar dados do usuário no localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem('nutriaTap_user', JSON.stringify(user));
    }
  }, [user]);

  // Registrar novo usuário
  const registerUser = (userData) => {
    return new Promise((resolve, reject) => {
      // Validações
      if (!userData.username || userData.username.trim().length < 3) {
        reject(new Error('Username deve ter pelo menos 3 caracteres'));
        return;
      }

      if (!userData.email || !isValidEmail(userData.email)) {
        reject(new Error('Email inválido'));
        return;
      }

      if (!userData.wallet || !isValidEthAddress(userData.wallet)) {
        reject(new Error('Endereço de wallet ETH inválido (deve começar com 0x e ter 40 caracteres)'));
        return;
      }

      // Verificar se username já existe (simulação)
      const existingUsers = JSON.parse(localStorage.getItem('nutriaTap_users') || '[]');
      const usernameExists = existingUsers.some(u => u.username.toLowerCase() === userData.username.toLowerCase());
      
      if (usernameExists) {
        reject(new Error('Username já está em uso'));
        return;
      }

      // Criar novo usuário
      const newUser = {
        id: generateUserId(),
        username: userData.username.trim(),
        email: userData.email.toLowerCase().trim(),
        wallet: userData.wallet.toLowerCase(),
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        stats: {
          totalCoins: 0,
          totalClicks: 0,
          maxStreak: 0,
          level: 1,
          achievements: 0,
          prestigeLevel: 0
        }
      };

      // Salvar usuário
      existingUsers.push(newUser);
      localStorage.setItem('nutriaTap_users', JSON.stringify(existingUsers));
      
      setUser(newUser);
      setIsLoggedIn(true);
      resolve(newUser);
    });
  };

  // Fazer login
  const loginUser = (username) => {
    return new Promise((resolve, reject) => {
      const existingUsers = JSON.parse(localStorage.getItem('nutriaTap_users') || '[]');
      const foundUser = existingUsers.find(u => u.username.toLowerCase() === username.toLowerCase());
      
      if (!foundUser) {
        reject(new Error('Usuário não encontrado'));
        return;
      }

      // Atualizar último login
      foundUser.lastLogin = new Date().toISOString();
      const updatedUsers = existingUsers.map(u => 
        u.id === foundUser.id ? foundUser : u
      );
      localStorage.setItem('nutriaTap_users', JSON.stringify(updatedUsers));

      setUser(foundUser);
      setIsLoggedIn(true);
      resolve(foundUser);
    });
  };

  // Fazer logout
  const logoutUser = () => {
    setUser(null);
    setIsLoggedIn(false);
    localStorage.removeItem('nutriaTap_user');
  };

  // Atualizar dados do usuário
  const updateUser = (updates) => {
    if (!user) return;

    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);

    // Atualizar na lista de usuários
    const existingUsers = JSON.parse(localStorage.getItem('nutriaTap_users') || '[]');
    const updatedUsers = existingUsers.map(u => 
      u.id === user.id ? updatedUser : u
    );
    localStorage.setItem('nutriaTap_users', JSON.stringify(updatedUsers));
  };

  // Atualizar estatísticas do usuário
  const updateUserStats = useCallback(async (stats) => {
    if (!user) return;

    try {
      // Atualizar no Supabase
      await supabaseApiService.updateUserStats(user.id, stats);
      
      // Atualizar localmente
      const updatedUser = {
        ...user,
        stats: { ...user.stats, ...stats }
      };
      setUser(updatedUser);

      // Atualizar na lista de usuários
      const existingUsers = JSON.parse(localStorage.getItem('nutriaTap_users') || '[]');
      const updatedUsers = existingUsers.map(u => 
        u.id === user.id ? updatedUser : u
      );
      localStorage.setItem('nutriaTap_users', JSON.stringify(updatedUsers));
    } catch (error) {
      console.error('Erro ao atualizar estatísticas:', error);
      // Fallback para localStorage se Supabase falhar
      const updatedUser = {
        ...user,
        stats: { ...user.stats, ...stats }
      };
      setUser(updatedUser);
      localStorage.setItem('nutriaTap_users', JSON.stringify([updatedUser]));
    }
  }, [user]);

  // Obter ranking de usuários
  const getRanking = (sortBy = 'totalCoins', limit = 50) => {
    const existingUsers = JSON.parse(localStorage.getItem('nutriaTap_users') || '[]');
    
    return existingUsers
      .sort((a, b) => {
        switch (sortBy) {
          case 'totalCoins':
            return b.stats.totalCoins - a.stats.totalCoins;
          case 'level':
            return b.stats.level - a.stats.level;
          case 'totalClicks':
            return b.stats.totalClicks - a.stats.totalClicks;
          case 'maxStreak':
            return b.stats.maxStreak - a.stats.maxStreak;
          case 'prestigeLevel':
            return b.stats.prestigeLevel - a.stats.prestigeLevel;
          default:
            return b.stats.totalCoins - a.stats.totalCoins;
        }
      })
      .slice(0, limit)
      .map((user, index) => ({
        ...user,
        rank: index + 1
      }));
  };

  // Obter posição do usuário atual no ranking
  const getUserRank = (sortBy = 'totalCoins') => {
    if (!user) return null;

    const ranking = getRanking(sortBy);
    const userRank = ranking.find(u => u.id === user.id);
    
    return userRank ? userRank.rank : null;
  };

  const value = {
    user,
    isLoggedIn,
    loading,
    registerUser,
    loginUser,
    logoutUser,
    updateUser,
    updateUserStats,
    getRanking,
    getUserRank,
    isValidEthAddress,
    isValidEmail
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
