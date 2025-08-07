'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardProps } from '@/components/ui/card';
import { cn } from '@/lib/utils';

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

interface AnimatedCardProps extends CardProps {
  hoverEffect?: 'lift' | 'glow' | 'scale' | 'border' | 'none';
  animationDuration?: number;
  liftHeight?: number;
  glowColor?: string;
  scaleAmount?: number;
  borderColor?: string;
  respectReducedMotion?: boolean;
}

const AnimatedCard = React.forwardRef<HTMLDivElement, AnimatedCardProps>(
  ({ 
    className, 
    children, 
    hoverEffect = 'lift',
    animationDuration = 0.3,
    liftHeight = 8,
    glowColor = 'rgba(59, 130, 246, 0.1)',
    scaleAmount = 1.02,
    borderColor = 'hsl(var(--primary))',
    respectReducedMotion = true,
    ...props 
  }, ref) => {
    
    const deviceType = useDeviceType();
    const prefersReducedMotion = useReducedMotion();
    
    // 根据设备类型调整动画参数
    const getResponsiveParams = () => {
      if (respectReducedMotion && prefersReducedMotion) {
        return {
          duration: 0,
          liftHeight: 0,
          scaleAmount: 1,
          glowIntensity: 0
        };
      }

      switch (deviceType) {
        case 'mobile':
          return {
            duration: animationDuration * 0.7, // 移动端使用更短的动画时间
            liftHeight: liftHeight * 0.6, // 减少悬停高度
            scaleAmount: 1.01, // 减少缩放比例
            glowIntensity: 0.8 // 减少发光强度
          };
        case 'tablet':
          return {
            duration: animationDuration * 0.85, // 平板使用稍短的动画时间
            liftHeight: liftHeight * 0.8, // 适度减少悬停高度
            scaleAmount: 1.015, // 适度减少缩放比例
            glowIntensity: 0.9 // 适度减少发光强度
          };
        default:
          return {
            duration: animationDuration,
            liftHeight: liftHeight,
            scaleAmount: scaleAmount,
            glowIntensity: 1
          };
      }
    };

    const responsiveParams = getResponsiveParams();
    
    // 根据不同的悬停效果生成动画变体
    const getHoverVariants = () => {
      switch (hoverEffect) {
        case 'lift':
          return {
            initial: { 
              y: 0, 
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)' 
            },
            hover: { 
              y: -responsiveParams.liftHeight, 
              boxShadow: `0 ${20 * responsiveParams.glowIntensity}px ${25 * responsiveParams.glowIntensity}px -5px rgba(0, 0, 0, 0.1), 0 ${10 * responsiveParams.glowIntensity}px ${10 * responsiveParams.glowIntensity}px -6px rgba(0, 0, 0, 0.04)`
            },
            tap: { y: -responsiveParams.liftHeight / 2 }
          };
        
        case 'glow':
          return {
            initial: { 
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)' 
            },
            hover: { 
              boxShadow: `0 0 0 1px ${glowColor}, 0 0 ${20 * responsiveParams.glowIntensity}px ${glowColor}`
            },
            tap: { 
              boxShadow: `0 0 0 1px ${glowColor}, 0 0 ${10 * responsiveParams.glowIntensity}px ${glowColor}` 
            }
          };
        
        case 'scale':
          return {
            initial: { scale: 1 },
            hover: { scale: responsiveParams.scaleAmount },
            tap: { scale: responsiveParams.scaleAmount / 2 + 0.5 }
          };
        
        case 'border':
          return {
            initial: { borderColor: 'hsl(var(--border))' },
            hover: { borderColor: borderColor },
            tap: { borderColor: borderColor }
          };
        
        case 'none':
        default:
          return {
            initial: {},
            hover: {},
            tap: {}
          };
      }
    };

    const variants = getHoverVariants();

    // 如果用户偏好减少动画且设置了尊重该偏好，则禁用动画
    const shouldDisableAnimation = respectReducedMotion && prefersReducedMotion;

    return (
      <motion.div
        ref={ref}
        initial="initial"
        whileHover={!shouldDisableAnimation ? "hover" : undefined}
        whileTap={!shouldDisableAnimation ? "tap" : undefined}
        variants={variants}
        transition={{ 
          duration: responsiveParams.duration,
          ease: 'easeInOut'
        }}
        className={cn(
          'rounded-lg border bg-card text-card-foreground shadow-sm',
          className
        )}
      >
        <Card className="border-0 shadow-none bg-transparent" {...props}>
          {children}
        </Card>
      </motion.div>
    );
  }
);

AnimatedCard.displayName = 'AnimatedCard';

export { AnimatedCard };