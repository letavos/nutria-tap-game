import { useState, useEffect } from 'react';

const SmoothTransitions = ({ children, currentTab, direction = 'slide' }) => {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [displayChildren, setDisplayChildren] = useState(children);
  const [transitionDirection, setTransitionDirection] = useState('in');

  useEffect(() => {
    if (children !== displayChildren) {
      setIsTransitioning(true);
      setTransitionDirection('out');
      
      const timer = setTimeout(() => {
        setDisplayChildren(children);
        setTransitionDirection('in');
        
        const timer2 = setTimeout(() => {
          setIsTransitioning(false);
        }, 100);
        
        return () => clearTimeout(timer2);
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [children, displayChildren]);

  const getTransitionClass = () => {
    if (!isTransitioning) return '';
    
    const baseClass = 'smooth-transition';
    const directionClass = direction === 'fade' ? 'fade' : 'slide';
    const stateClass = transitionDirection;
    
    return `${baseClass} ${directionClass} ${stateClass}`;
  };

  return (
    <div className={getTransitionClass()}>
      {displayChildren}
    </div>
  );
};

export default SmoothTransitions;
