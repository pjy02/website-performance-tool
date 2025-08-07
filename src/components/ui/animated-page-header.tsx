'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { useDeviceType } from '@/lib/animation-utils';

interface AnimatedPageHeaderProps {
  children: ReactNode;
  delay?: number;
  duration?: number;
}

export function AnimatedPageHeader({ 
  children, 
  delay = 0, 
  duration = 0.6 
}: AnimatedPageHeaderProps) {
  const deviceType = useDeviceType();
  
  // 根据设备类型调整动画参数
  const getAnimationParams = () => {
    switch (deviceType) {
      case 'mobile':
        return {
          initialY: 30,
          duration: duration * 0.8,
          delay: delay * 0.8
        };
      case 'tablet':
        return {
          initialY: 40,
          duration: duration * 0.9,
          delay: delay * 0.9
        };
      default: // desktop
        return {
          initialY: 50,
          duration,
          delay
        };
    }
  };

  const { initialY, duration: adjustedDuration, delay: adjustedDelay } = getAnimationParams();

  return (
    <motion.div
      initial={{ 
        opacity: 0, 
        y: initialY 
      }}
      animate={{ 
        opacity: 1, 
        y: 0 
      }}
      transition={{ 
        duration: adjustedDuration,
        delay: adjustedDelay,
        ease: [0.4, 0, 0.2, 1] // 优雅的缓动函数
      }}
    >
      {children}
    </motion.div>
  );
}

interface AnimatedInputSectionProps {
  children: ReactNode;
  delay?: number;
  duration?: number;
}

export function AnimatedInputSection({ 
  children, 
  delay = 0.2, 
  duration = 0.5 
}: AnimatedInputSectionProps) {
  const deviceType = useDeviceType();
  
  // 根据设备类型调整动画参数
  const getAnimationParams = () => {
    switch (deviceType) {
      case 'mobile':
        return {
          initialY: 40,
          initialScale: 0.95,
          duration: duration * 0.8,
          delay: delay * 0.8
        };
      case 'tablet':
        return {
          initialY: 45,
          initialScale: 0.96,
          duration: duration * 0.9,
          delay: delay * 0.9
        };
      default: // desktop
        return {
          initialY: 50,
          initialScale: 0.98,
          duration,
          delay
        };
    }
  };

  const { initialY, initialScale, duration: adjustedDuration, delay: adjustedDelay } = getAnimationParams();

  return (
    <motion.div
      initial={{ 
        opacity: 0, 
        y: initialY,
        scale: initialScale
      }}
      animate={{ 
        opacity: 1, 
        y: 0,
        scale: 1
      }}
      transition={{ 
        duration: adjustedDuration,
        delay: adjustedDelay,
        ease: [0.34, 1.56, 0.64, 1] // 弹性缓动
      }}
    >
      {children}
    </motion.div>
  );
}