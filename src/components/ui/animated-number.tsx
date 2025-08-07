'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

// 检测用户是否偏好减少动画的hook
const useReducedMotion = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return prefersReducedMotion;
};

// 检测设备类型的hook
const useDeviceType = () => {
  const [deviceType, setDeviceType] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');

  useEffect(() => {
    const updateDeviceType = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setDeviceType('mobile');
      } else if (width < 1024) {
        setDeviceType('tablet');
      } else {
        setDeviceType('desktop');
      }
    };

    updateDeviceType();
    window.addEventListener('resize', updateDeviceType);
    return () => window.removeEventListener('resize', updateDeviceType);
  }, []);

  return deviceType;
};

interface AnimatedNumberProps {
  value: number;
  duration?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
  animationType?: 'count' | 'bounce' | 'slide' | 'fade';
  formatValue?: (value: number) => string;
  respectReducedMotion?: boolean;
}

const AnimatedNumber: React.FC<AnimatedNumberProps> = ({
  value,
  duration = 1000,
  decimals = 0,
  prefix = '',
  suffix = '',
  className,
  animationType = 'count',
  formatValue,
  respectReducedMotion = true,
}) => {
  const [displayValue, setDisplayValue] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const deviceType = useDeviceType();

  // 根据设备类型调整动画参数
  const getResponsiveDuration = () => {
    if (respectReducedMotion && prefersReducedMotion) return 0;
    
    switch (deviceType) {
      case 'mobile':
        return duration * 0.7;
      case 'tablet':
        return duration * 0.85;
      default:
        return duration;
    }
  };

  const responsiveDuration = getResponsiveDuration();

  useEffect(() => {
    setIsAnimating(true);
    
    if (animationType === 'count' && !prefersReducedMotion) {
      // 计数动画
      const startTime = Date.now();
      const startValue = displayValue;
      const endValue = value;
      const difference = endValue - startValue;

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / responsiveDuration, 1);
        
        // 使用缓动函数
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const currentValue = startValue + (difference * easeOutQuart);
        
        setDisplayValue(currentValue);

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          setIsAnimating(false);
        }
      };

      requestAnimationFrame(animate);
    } else {
      // 其他动画类型直接设置最终值
      setDisplayValue(value);
      setTimeout(() => setIsAnimating(false), responsiveDuration);
    }
  }, [value, responsiveDuration, animationType, displayValue, prefersReducedMotion]);

  const formatNumber = (num: number): string => {
    if (formatValue) {
      return formatValue(num);
    }
    return num.toFixed(decimals);
  };

  const getAnimationVariants = () => {
    const adjustedDuration = responsiveDuration / 1000;
    
    if (respectReducedMotion && prefersReducedMotion) {
      return {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
      };
    }

    switch (animationType) {
      case 'bounce':
        return {
          initial: { scale: 0.8, opacity: 0 },
          animate: { 
            scale: 1, 
            opacity: 1,
            transition: {
              type: 'spring',
              stiffness: 300,
              damping: 15
            }
          },
          exit: { scale: 0.8, opacity: 0 }
        };
      
      case 'slide':
        return {
          initial: { y: 20, opacity: 0 },
          animate: { 
            y: 0, 
            opacity: 1,
            transition: {
              duration: adjustedDuration,
              ease: 'easeOut'
            }
          },
          exit: { y: -20, opacity: 0 }
        };
      
      case 'fade':
        return {
          initial: { opacity: 0 },
          animate: { 
            opacity: 1,
            transition: {
              duration: adjustedDuration,
              ease: 'easeInOut'
            }
          },
          exit: { opacity: 0 }
        };
      
      case 'count':
      default:
        return {
          initial: { opacity: 0 },
          animate: { 
            opacity: 1,
            transition: {
              duration: 0.3
            }
          },
          exit: { opacity: 0 }
        };
    }
  };

  const variants = getAnimationVariants();

  return (
    <AnimatePresence mode="wait">
      <motion.span
        key={`${value}-${animationType}`}
        variants={variants}
        initial="initial"
        animate="animate"
        exit="exit"
        className={cn(
          'inline-block font-mono',
          isAnimating && 'text-primary',
          className
        )}
      >
        {prefix}
        {formatNumber(displayValue)}
        {suffix}
      </motion.span>
    </AnimatePresence>
  );
};

// 便捷的时间格式化组件
interface AnimatedTimeProps {
  time: number; // 毫秒
  className?: string;
  animationType?: 'count' | 'bounce' | 'slide' | 'fade';
  showUnit?: boolean;
}

export const AnimatedTime: React.FC<AnimatedTimeProps> = ({
  time,
  className,
  animationType = 'bounce',
  showUnit = true
}) => {
  const formatTime = (value: number): string => {
    return value.toFixed(2);
  };

  return (
    <AnimatedNumber
      value={time}
      decimals={2}
      suffix={showUnit ? 'ms' : ''}
      className={className}
      animationType={animationType}
      formatValue={formatTime}
    />
  );
};

// 便捷的字节格式化组件
interface AnimatedBytesProps {
  bytes: number;
  className?: string;
  animationType?: 'count' | 'bounce' | 'slide' | 'fade';
}

export const AnimatedBytes: React.FC<AnimatedBytesProps> = ({
  bytes,
  className,
  animationType = 'bounce'
}) => {
  const formatBytes = (value: number): string => {
    if (value === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(value) / Math.log(k));
    return parseFloat((value / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <AnimatedNumber
      value={bytes}
      className={className}
      animationType={animationType}
      formatValue={formatBytes}
    />
  );
};

export { AnimatedNumber };