import { useState, useEffect } from 'react';
import { FaArrowRight, FaArrowLeft, FaTimes, FaGamepad, FaCoins, FaBolt, FaStar } from 'react-icons/fa';
import { useGame } from '../context/GameContext';
import { useLanguage } from '../context/LanguageContext';

const Onboarding = ({ onComplete }) => {
  const { gameState } = useGame();
  const { t } = useLanguage();
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  const steps = [
    {
      title: t('welcomeTitle'),
      content: t('welcomeContent'),
      icon: <FaGamepad />,
      highlight: "nutria-container"
    },
    {
      title: t('earnCoinsTitle'),
      content: t('earnCoinsContent'),
      icon: <FaCoins />,
      highlight: "score"
    },
    {
      title: t('buyUpgradesTitle'),
      content: t('buyUpgradesContent'),
      icon: <FaBolt />,
      highlight: "upgrades-tabs-wrapper"
    },
    {
      title: t('prestigeSystemTitle'),
      content: t('prestigeSystemContent'),
      icon: <FaStar />,
      highlight: "upgrade-buy.special"
    },
    {
      title: t('dailyRewardsTitle'),
      content: t('dailyRewardsContent'),
      icon: <FaCoins />,
      highlight: "daily-rewards-card"
    }
  ];

  useEffect(() => {
    // Verificar se é a primeira vez jogando
    const hasPlayedBefore = localStorage.getItem('nutriaTap_hasPlayedBefore');
    if (!hasPlayedBefore && gameState.totalClicks === 0) {
      setIsVisible(true);
    }
  }, [gameState.totalClicks]);

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeOnboarding();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const completeOnboarding = () => {
    localStorage.setItem('nutriaTap_hasPlayedBefore', 'true');
    setIsVisible(false);
    onComplete?.();
  };

  const skipOnboarding = () => {
    completeOnboarding();
  };

  if (!isVisible) return null;

  const currentStepData = steps[currentStep];

  return (
    <div className="onboarding-overlay">
      <div className="onboarding-modal">
        <div className="onboarding-header">
          <div className="onboarding-icon">
            {currentStepData.icon}
          </div>
          <button 
            className="onboarding-skip"
            onClick={skipOnboarding}
          >
            <FaTimes />
          </button>
        </div>
        
        <div className="onboarding-content">
          <h2 className="onboarding-title">{currentStepData.title}</h2>
          <p className="onboarding-text">{currentStepData.content}</p>
        </div>
        
        <div className="onboarding-progress">
          <div className="progress-dots">
            {steps.map((_, index) => (
              <button
                key={index}
                className={`progress-dot${index === currentStep ? ' active' : ''}`}
                onClick={() => setCurrentStep(index)}
                aria-label={`Ir para passo ${index + 1}`}
              />
            ))}
          </div>
        </div>
        
        <div className="onboarding-actions">
          {currentStep > 0 && (
            <button 
              className="onboarding-btn secondary"
              onClick={prevStep}
            >
              <FaArrowLeft /> {t('previous')}
            </button>
          )}
          
          <button 
            className="onboarding-btn primary"
            onClick={nextStep}
          >
            {currentStep === steps.length - 1 ? t('start') + '!' : t('next')}
            {currentStep < steps.length - 1 && <FaArrowRight />}
          </button>
        </div>
      </div>
      
      {/* Highlight do elemento atual */}
      <div className="onboarding-highlight" data-target={currentStepData.highlight} />
    </div>
  );
};

export default Onboarding;
