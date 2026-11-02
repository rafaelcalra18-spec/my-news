/**
 * @file src/components/AnimatedMarketProbability.tsx
 * @description Probability Counter Animation Component.
 *
 * Implements User Requirement 6:
 * - "when a market first appears on screen, its percentage counts up from last week's value over 400 ms"
 * - "With reduced motion, show the final values with no animation."
 * - Large type (28 px) per Requirement 3.
 *
 * USE CASES:
 * - Rendering animated percentage count-ups in Today cards and Markets list.
 */

import React, { useState, useEffect } from 'react';
import { useReducedMotion } from 'motion/react';
import { logFunctionCall } from '../utils/logger.ts';

interface AnimatedMarketProbabilityProps {
  currentProbability: number; // 0.0 to 1.0 (e.g. 0.735)
  lastWeekProbability: number; // 0.0 to 1.0 (e.g. 0.585)
  className?: string;
}

export function AnimatedMarketProbability({
  currentProbability,
  lastWeekProbability,
  className = ''
}: AnimatedMarketProbabilityProps): React.ReactElement {
  const shouldReduceMotion = useReducedMotion();

  // If decimal precision was used in formatted string, keep 1 decimal if needed
  const targetVal = currentProbability * 100;
  const startVal = lastWeekProbability * 100;
  const hasDecimal = currentProbability.toString().split('.')[1]?.length > 2;

  const [displayValue, setDisplayValue] = useState<number>(
    shouldReduceMotion ? targetVal : startVal
  );

  logFunctionCall('AnimatedMarketProbability:render', {
    targetVal,
    startVal,
    shouldReduceMotion
  });

  useEffect(() => {
    if (shouldReduceMotion) {
      setDisplayValue(targetVal);
      return;
    }

    const duration = 400; // 400 ms
    const startTime = performance.now();

    let animationFrameId: number;

    const step = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(1, elapsed / duration);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const val = startVal + (targetVal - startVal) * eased;
      setDisplayValue(val);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(step);
      } else {
        setDisplayValue(targetVal);
      }
    };

    animationFrameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animationFrameId);
  }, [targetVal, startVal, shouldReduceMotion]);

  const formatted = hasDecimal
    ? `${displayValue.toFixed(1)}%`
    : `${Math.round(displayValue)}%`;

  return (
    <span className={`text-[28px] font-bold font-mono tracking-tight ${className}`}>
      {formatted}
    </span>
  );
}
