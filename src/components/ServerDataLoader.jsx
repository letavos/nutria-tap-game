import React from 'react';
import { useGame } from '../context/GameContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

const ServerDataLoader = ({ children }) => {
  const { isLoadingFromServer, isDataLoadedFromServer } = useGame();
  const { isLoggedIn } = useAuth();
  const { t } = useLanguage();

  // Se não estiver logado, mostrar conteúdo normalmente
  if (!isLoggedIn) {
    return children;
  }

  // Se estiver carregando dados do servidor, mostrar loading
  if (isLoadingFromServer) {
    return (
      <div className="server-data-loader">
        <div className="loader-content">
          <div className="loader-spinner"></div>
          <h3>{t('loadingServerData')}</h3>
          <p>{t('loading')}</p>
        </div>
      </div>
    );
  }

  // Se dados foram carregados do servidor ou não está logado, mostrar conteúdo
  return children;
};

export default ServerDataLoader;
