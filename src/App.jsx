import { useState, useEffect } from 'react';
import './App.css';
import './styles/AuthStyles.css';
import DashboardManager from './components/DashboardManager';
import { GameProvider } from './context/GameContext';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { AuthProvider } from './context/AuthContext';

const LoadingScreen = ({ loadingProgress, loadingText }) => {
  return (
    <div className="loading-screen">
      <div className="loading-content">
        <div className="loading-logo">
          <img 
            src="./src/assets/nutria-image.png" 
            alt="Nutria Tap Logo" 
            className="loading-image"
          />
          <div className="loading-glow"></div>
        </div>
        
        <h1 className="loading-title">Nutria Tap</h1>
        
        <div className="loading-bar-container">
          <div 
            className="loading-bar"
            style={{ width: `${loadingProgress}%` }}
          ></div>
        </div>
        
        <div className="loading-text">{loadingText}</div>
        
        <div className="loading-particles"></div>
      </div>
    </div>
  );
};

const AppContent = () => {
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingText, setLoadingText] = useState(t('starting'));

  // Efeito de carregamento premium com simulação de progresso
  useEffect(() => {
    // Simulação de carregamento de recursos com progresso
    const loadingTexts = [
      t('starting'),
      t('loadingResources'),
      t('preparingNutria'),
      t('almostThere'),
      t('ready')
    ];
    
    // Simular progresso de carregamento
    const progressInterval = setInterval(() => {
      setLoadingProgress(prev => {
        const newProgress = prev + Math.random() * 15;
        
        // Atualizar texto baseado no progresso
        if (newProgress > 85) setLoadingText(loadingTexts[4]);
        else if (newProgress > 65) setLoadingText(loadingTexts[3]);
        else if (newProgress > 40) setLoadingText(loadingTexts[2]);
        else if (newProgress > 10) setLoadingText(loadingTexts[1]);
        
        return Math.min(newProgress, 100);
      });
    }, 400);
    
    // Finalizar carregamento
    const loadingTimer = setTimeout(() => {
      clearInterval(progressInterval);
      setLoadingProgress(100);
      setLoadingText(t('ready'));
      
      // Pequeno atraso para mostrar "Pronto!" antes de iniciar o jogo
      setTimeout(() => {
      setIsLoading(false);
      }, 300);
    }, 2000);
    
    return () => {
      clearTimeout(loadingTimer);
      clearInterval(progressInterval);
    };
  }, [t]);

  return (
    <div className="app-container">
      {isLoading ? (
        <LoadingScreen loadingProgress={loadingProgress} loadingText={loadingText} />
      ) : (
        <GameProvider>
          <DashboardManager />
        </GameProvider>
      )}
    </div>
  );
};

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <GameProvider>
          <AppContent />
        </GameProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;
