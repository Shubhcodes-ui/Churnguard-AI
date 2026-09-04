import React, { useEffect, useState } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';

export const AnimatedCounter = ({ 
  value = 0, 
  prefix = "", 
  suffix = "", 
  decimals = 0,
  duration = 1.2, 
  className = "" 
}) => {
  const [hasMounted, setHasMounted] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handler = (e) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  const numVal = typeof value === 'number' ? value : parseFloat(value) || 0;
  const spring = useSpring(0, { duration: duration * 1000, bounce: 0 });
  
  const display = useTransform(spring, (current) => {
    if (decimals > 0) {
      return current.toLocaleString(undefined, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      });
    }
    return Math.round(current).toLocaleString();
  });

  useEffect(() => {
    setHasMounted(true);
    spring.set(numVal);
  }, [numVal, spring]);

  const formattedStatic = numVal.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  if (!hasMounted || prefersReducedMotion) {
    return (
      <span className={`font-mono tabular-nums ${className}`}>
        {prefix}{formattedStatic}{suffix}
      </span>
    );
  }

  return (
    <span className={`font-mono tabular-nums ${className}`}>
      {prefix}
      <motion.span>{display}</motion.span>
      {suffix}
    </span>
  );
};
