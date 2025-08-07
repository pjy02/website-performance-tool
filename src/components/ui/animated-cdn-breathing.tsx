'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useDeviceType } from '@/lib/animation-utils';
import { CheckCircle, AlertCircle, XCircle, Shield, Zap } from 'lucide-react';

interface AnimatedCDNBreathingProps {
  isThroughCDN: boolean;
  provider?: string;
  confidence?: 'high' | 'medium' | 'low';
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showProvider?: boolean;
  showConfidence?: boolean;
}

export const AnimatedCDNBreathing: React.FC<AnimatedCDNBreathingProps> = ({
  isThroughCDN,
  provider,
  confidence,
  className,
  size = 'md',
  showProvider = true,
  showConfidence = true,
}) => {
  const deviceType = useDeviceType();

  // 根据设备类型调整动画参数
  const getAnimationParams = () => {
    switch (deviceType) {
      case 'mobile':
        return {
          scale: [1, 1.05, 1],
          opacity: [0.8, 1, 0.8],
          duration: 2,
          glowIntensity: 6
        };
      case 'tablet':
        return {
          scale: [1, 1.08, 1],
          opacity: [0.75, 1, 0.75],
          duration: 2.2,
          glowIntensity: 8
        };
      default: // desktop
        return {
          scale: [1, 1.1, 1],
          opacity: [0.7, 1, 0.7],
          duration: 2.5,
          glowIntensity: 10
        };
    }
  };

  const { scale, opacity, duration, glowIntensity } = getAnimationParams();

  // 获取状态配置
  const getStatusConfig = () => {
    if (!isThroughCDN) {
      return {
        icon: AlertCircle,
        color: 'text-orange-500',
        bgColor: 'bg-orange-500',
        borderColor: 'border-orange-200',
        glowColor: 'rgba(251, 146, 60, 0.3)',
        statusText: '直连',
        statusColor: 'text-orange-600'
      };
    }

    if (confidence === 'high') {
      return {
        icon: CheckCircle,
        color: 'text-green-500',
        bgColor: 'bg-green-500',
        borderColor: 'border-green-200',
        glowColor: 'rgba(34, 197, 94, 0.4)',
        statusText: provider ? `CDN (${provider})` : 'CDN',
        statusColor: 'text-green-600'
      };
    }

    if (confidence === 'medium') {
      return {
        icon: Shield,
        color: 'text-blue-500',
        bgColor: 'bg-blue-500',
        borderColor: 'border-blue-200',
        glowColor: 'rgba(59, 130, 246, 0.3)',
        statusText: provider ? `CDN (${provider})` : 'CDN',
        statusColor: 'text-blue-600'
      };
    }

    return {
      icon: AlertCircle,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500',
      borderColor: 'border-yellow-200',
      glowColor: 'rgba(245, 158, 11, 0.3)',
      statusText: provider ? `CDN (${provider})` : 'CDN',
      statusColor: 'text-yellow-600'
    };
  };

  // 获取尺寸配置
  const getSizeConfig = () => {
    switch (size) {
      case 'sm':
        return {
          iconSize: 'h-4 w-4',
          textSize: 'text-xs',
          padding: 'px-2 py-1',
          glowSize: 'h-6 w-6'
        };
      case 'lg':
        return {
          iconSize: 'h-6 w-6',
          textSize: 'text-base',
          padding: 'px-4 py-2',
          glowSize: 'h-10 w-10'
        };
      default: // md
        return {
          iconSize: 'h-5 w-5',
          textSize: 'text-sm',
          padding: 'px-3 py-1.5',
          glowSize: 'h-8 w-8'
        };
    }
  };

  const config = getStatusConfig();
  const sizeConfig = getSizeConfig();
  const IconComponent = config.icon;

  // 获取置信度文本
  const getConfidenceText = () => {
    if (!confidence) return '';
    switch (confidence) {
      case 'high': return '高置信度';
      case 'medium': return '中等置信度';
      case 'low': return '低置信度';
      default: return '';
    }
  };

  // 获取置信度颜色
  const getConfidenceColor = () => {
    switch (confidence) {
      case 'high': return 'text-green-600';
      case 'medium': return 'text-blue-600';
      case 'low': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  // 呼吸灯动画
  const breathingAnimation = {
    scale,
    opacity,
  };

  // 光晕动画
  const glowAnimation = {
    scale: [1, 1.2, 1],
    opacity: [0, 0.4, 0],
  };

  return (
    <div className={cn('flex items-center gap-3', className)}>
      {/* 主要状态指示器 */}
      <motion.div
        className="relative inline-flex items-center gap-2"
        animate={breathingAnimation}
        transition={{
          duration,
          repeat: Infinity,
          ease: 'easeInOut',
          times: [0, 0.5, 1]
        }}
      >
        {/* 光晕效果 */}
        <motion.div
          className={cn(
            'absolute inset-0 rounded-full blur-md',
            `bg-${config.color.split('-')[1]}-500`
          )}
          animate={glowAnimation}
          transition={{
            duration: duration * 1.1,
            repeat: Infinity,
            ease: 'easeInOut',
            times: [0, 0.5, 1]
          }}
          style={{
            boxShadow: `0 0 ${glowIntensity}px ${config.glowColor}`
          }}
        />
        
        {/* 状态指示器背景 */}
        <motion.div
          className={cn(
            'relative flex items-center justify-center rounded-full border',
            sizeConfig.padding,
            config.borderColor,
            'bg-white dark:bg-gray-800'
          )}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <IconComponent className={cn(sizeConfig.iconSize, config.color)} />
        </motion.div>
        
        {/* 状态文本 */}
        {showProvider && (
          <motion.span
            className={cn(sizeConfig.textSize, 'font-medium', config.statusColor)}
            initial={{ opacity: 0, x: -5 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1, duration: 0.3 }}
          >
            {config.statusText}
          </motion.span>
        )}
      </motion.div>

      {/* 置信度指示器 */}
      {showConfidence && confidence && (
        <motion.div
          className="flex items-center gap-1"
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.3 }}
        >
          <Zap className={cn('h-3 w-3', getConfidenceColor())} />
          <span className={cn('text-xs', getConfidenceColor())}>
            {getConfidenceText()}
          </span>
        </motion.div>
      )}

      {/* CDN强度指示器 */}
      {isThroughCDN && (
        <motion.div
          className="flex items-center gap-1"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.3 }}
        >
          <div className="flex gap-0.5">
            {[1, 2, 3].map((level) => (
              <motion.div
                key={level}
                className={cn(
                  'w-1 h-3 rounded-full',
                  confidence === 'high' || (confidence === 'medium' && level <= 2) || (confidence === 'low' && level === 1)
                    ? 'bg-green-500'
                    : 'bg-gray-300'
                )}
                animate={{
                  opacity: confidence === 'high' || (confidence === 'medium' && level <= 2) || (confidence === 'low' && level === 1)
                    ? [0.5, 1, 0.5]
                    : 0.3,
                  scaleY: confidence === 'high' || (confidence === 'medium' && level <= 2) || (confidence === 'low' && level === 1)
                    ? [0.9, 1.1, 0.9]
                    : 1
                }}
                transition={{
                  duration: duration * 0.7,
                  repeat: Infinity,
                  delay: level * 0.15,
                  ease: 'easeInOut',
                  times: [0, 0.5, 1]
                }}
              />
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};