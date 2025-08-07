'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface AnimatedContainerProps {
  children: React.ReactNode;
  className?: string;
  animationType?: 'fadeIn' | 'slideUp' | 'slideDown' | 'slideLeft' | 'slideRight' | 'scale' | 'bounce';
  duration?: number;
  delay?: number;
  triggerOnce?: boolean;
  disabled?: boolean;
  respectReducedMotion?: boolean;
}

// 检测用户是否偏好减少动画
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

// 获取设备类型以适配不同屏幕尺寸的动画
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

export const AnimatedContainer: React.FC<AnimatedContainerProps> = ({
  children,
  className,
  animationType = 'fadeIn',
  duration = 0.5,
  delay = 0,
  triggerOnce = true,
  disabled = false,
  respectReducedMotion = true,
}) => {
  const prefersReducedMotion = useReducedMotion();
  const deviceType = useDeviceType();
  const [isVisible, setIsVisible] = useState(!triggerOnce);

  useEffect(() => {
    if (triggerOnce) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, delay * 1000);
      return () => clearTimeout(timer);
    }
  }, [triggerOnce, delay]);

  // 如果用户偏好减少动画且设置了尊重该偏好，则禁用动画
  const shouldDisableAnimation = disabled || (respectReducedMotion && prefersReducedMotion);

  // 根据设备类型调整动画参数
  const getAdjustedDuration = () => {
    if (shouldDisableAnimation) return 0;
    
    switch (deviceType) {
      case 'mobile':
        return duration * 0.8; // 移动端使用更短的动画时间
      case 'tablet':
        return duration * 0.9; // 平板使用稍短的动画时间
      default:
        return duration;
    }
  };

  const getVariants = () => {
    const adjustedDuration = getAdjustedDuration();
    
    if (shouldDisableAnimation) {
      return {
        initial: {},
        animate: {},
        exit: {},
      };
    }

    switch (animationType) {
      case 'fadeIn':
        return {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          exit: { opacity: 0 },
        };

      case 'slideUp':
        return {
          initial: { opacity: 0, y: 50 },
          animate: { opacity: 1, y: 0 },
          exit: { opacity: 0, y: -50 },
        };

      case 'slideDown':
        return {
          initial: { opacity: 0, y: -50 },
          animate: { opacity: 1, y: 0 },
          exit: { opacity: 0, y: 50 },
        };

      case 'slideLeft':
        return {
          initial: { opacity: 0, x: 50 },
          animate: { opacity: 1, x: 0 },
          exit: { opacity: 0, x: -50 },
        };

      case 'slideRight':
        return {
          initial: { opacity: 0, x: -50 },
          animate: { opacity: 1, x: 0 },
          exit: { opacity: 0, x: 50 },
        };

      case 'scale':
        return {
          initial: { opacity: 0, scale: 0.8 },
          animate: { opacity: 1, scale: 1 },
          exit: { opacity: 0, scale: 0.8 },
        };

      case 'bounce':
        return {
          initial: { opacity: 0, scale: 0.3 },
          animate: { 
            opacity: 1, 
            scale: 1,
            transition: {
              type: 'spring',
              stiffness: 300,
              damping: 15,
            }
          },
          exit: { opacity: 0, scale: 0.3 },
        };

      default:
        return {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          exit: { opacity: 0 },
        };
    }
  };

  const variants = getVariants();
  const adjustedDuration = getAdjustedDuration();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        className={cn('w-full', className)}
        variants={variants}
        initial="initial"
        animate={isVisible ? "animate" : "initial"}
        exit="exit"
        transition={{
          duration: adjustedDuration,
          delay: shouldDisableAnimation ? 0 : delay,
          ease: 'easeInOut',
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

// 响应式动画网格组件
interface AnimatedGridProps {
  children: React.ReactNode[];
  className?: string;
  itemClassName?: string;
  columns?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
  };
  gap?: number;
  animationType?: 'stagger' | 'cascade' | 'fade';
  staggerDelay?: number;
}

export const AnimatedGrid: React.FC<AnimatedGridProps> = ({
  children,
  className,
  itemClassName,
  columns = { mobile: 1, tablet: 2, desktop: 3 },
  gap = 4,
  animationType = 'stagger',
  staggerDelay = 0.1,
}) => {
  const deviceType = useDeviceType();
  const prefersReducedMotion = useReducedMotion();

  const getColumnClass = () => {
    if (prefersReducedMotion) return 'grid-cols-1';
    
    switch (deviceType) {
      case 'mobile':
        return `grid-cols-${columns.mobile || 1}`;
      case 'tablet':
        return `grid-cols-${columns.tablet || 2}`;
      default:
        return `grid-cols-${columns.desktop || 3}`;
    }
  };

  return (
    <motion.div
      className={cn(
        'grid',
        getColumnClass(),
        `gap-${gap}`,
        className
      )}
      variants={{
        hidden: { opacity: 0 },
        show: {
          opacity: 1,
          transition: {
            staggerChildren: prefersReducedMotion ? 0 : staggerDelay,
          },
        },
      }}
      initial="hidden"
      animate="show"
    >
      {children.map((child, index) => (
        <motion.div
          key={index}
          className={itemClassName}
          variants={{
            hidden: { 
              opacity: 0, 
              y: animationType === 'cascade' ? 30 : 20,
              scale: animationType === 'cascade' ? 0.8 : 1
            },
            show: { 
              opacity: 1, 
              y: 0, 
              scale: 1,
              transition: {
                duration: prefersReducedMotion ? 0 : 0.5,
                ease: 'easeOut',
              }
            },
          }}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
};