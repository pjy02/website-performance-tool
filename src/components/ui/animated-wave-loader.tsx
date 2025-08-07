'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useDeviceType } from '@/lib/animation-utils';

interface AnimatedWaveLoaderProps {
  isLoading: boolean;
  text?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  color?: 'blue' | 'green' | 'orange' | 'purple';
  waveCount?: number;
}

export const AnimatedWaveLoader: React.FC<AnimatedWaveLoaderProps> = ({
  isLoading,
  text = '正在检测...',
  className,
  size = 'md',
  color = 'blue',
  waveCount = 5,
}) => {
  const deviceType = useDeviceType();

  // 根据设备类型调整动画参数
  const getAnimationParams = () => {
    switch (deviceType) {
      case 'mobile':
        return {
          duration: 0.8,
          delay: 0.1,
          height: 20,
          spacing: 3
        };
      case 'tablet':
        return {
          duration: 0.9,
          delay: 0.12,
          height: 24,
          spacing: 4
        };
      default: // desktop
        return {
          duration: 1,
          delay: 0.15,
          height: 28,
          spacing: 5
        };
    }
  };

  const { duration, delay, height, spacing } = getAnimationParams();

  // 获取颜色配置
  const getColorConfig = () => {
    switch (color) {
      case 'green':
        return {
          primary: 'bg-green-500',
          secondary: 'bg-green-400',
          light: 'bg-green-300',
          text: 'text-green-600'
        };
      case 'orange':
        return {
          primary: 'bg-orange-500',
          secondary: 'bg-orange-400',
          light: 'bg-orange-300',
          text: 'text-orange-600'
        };
      case 'purple':
        return {
          primary: 'bg-purple-500',
          secondary: 'bg-purple-400',
          light: 'bg-purple-300',
          text: 'text-purple-600'
        };
      default: // blue
        return {
          primary: 'bg-blue-500',
          secondary: 'bg-blue-400',
          light: 'bg-blue-300',
          text: 'text-blue-600'
        };
    }
  };

  const colorConfig = getColorConfig();

  // 获取尺寸配置
  const getSizeConfig = () => {
    switch (size) {
      case 'sm':
        return {
          waveWidth: 3,
          text: 'text-xs',
          containerHeight: 32
        };
      case 'lg':
        return {
          waveWidth: 5,
          text: 'text-base',
          containerHeight: 48
        };
      default: // md
        return {
          waveWidth: 4,
          text: 'text-sm',
          containerHeight: 40
        };
    }
  };

  const sizeConfig = getSizeConfig();

  if (!isLoading) return null;

  return (
    <div className={cn('flex flex-col items-center justify-center space-y-3', className)}>
      {/* 波浪动画 */}
      <div 
        className="flex items-end justify-center space-x-1"
        style={{ height: `${sizeConfig.containerHeight}px` }}
      >
        {Array.from({ length: waveCount }, (_, i) => (
          <motion.div
            key={i}
            className={cn(
              'rounded-full',
              i === Math.floor(waveCount / 2) ? colorConfig.primary :
              i === Math.floor(waveCount / 2) - 1 || i === Math.floor(waveCount / 2) + 1 ? colorConfig.secondary :
              colorConfig.light
            )}
            style={{
              width: `${sizeConfig.waveWidth}px`,
              height: `${height * (0.3 + (i % 3) * 0.2)}px`,
            }}
            animate={{
              height: [
                `${height * 0.3}px`,
                `${height * (0.8 + (i % 3) * 0.2)}px`,
                `${height * 0.3}px`
              ],
              opacity: [0.4, 1, 0.4],
            }}
            transition={{
              duration,
              delay: i * delay,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
          />
        ))}
      </div>

      {/* 加载文本 */}
      <motion.div
        className={cn(sizeConfig.text, colorConfig.text, 'font-medium')}
        animate={{ opacity: [0.6, 1, 0.6] }}
        transition={{
          duration: duration * 1.5,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      >
        {text}
      </motion.div>
    </div>
  );
};

// Ping测试专用的波浪加载器
interface AnimatedPingWaveLoaderProps {
  isLoading: boolean;
  locations?: string[];
  currentLocation?: string;
  className?: string;
}

export const AnimatedPingWaveLoader: React.FC<AnimatedPingWaveLoaderProps> = ({
  isLoading,
  locations = [],
  currentLocation,
  className,
}) => {
  const deviceType = useDeviceType();

  const getAnimationParams = () => {
    switch (deviceType) {
      case 'mobile':
        return {
          duration: 1.2,
          delay: 0.08,
          baseHeight: 16,
          maxHeight: 32
        };
      case 'tablet':
        return {
          duration: 1.4,
          delay: 0.1,
          baseHeight: 20,
          maxHeight: 40
        };
      default: // desktop
        return {
          duration: 1.6,
          delay: 0.12,
          baseHeight: 24,
          maxHeight: 48
        };
    }
  };

  const { duration, delay, baseHeight, maxHeight } = getAnimationParams();

  if (!isLoading) return null;

  return (
    <div className={cn('w-full space-y-4', className)}>
      {/* 位置指示器 */}
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-muted-foreground">正在测试全球节点延迟...</span>
        {currentLocation && (
          <motion.span
            className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            key={currentLocation}
          >
            {currentLocation}
          </motion.span>
        )}
      </div>

      {/* 波浪动画 */}
      <div className="flex items-end justify-center space-x-1 h-12">
        {locations.slice(0, 8).map((location, index) => (
          <motion.div
            key={location}
            className="bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-sm"
            style={{
              width: '8px',
              height: `${baseHeight}px`,
            }}
            animate={{
              height: [
                `${baseHeight}px`,
                `${baseHeight + Math.random() * (maxHeight - baseHeight)}px`,
                `${baseHeight}px`
              ],
              opacity: [0.3, 0.9, 0.3],
            }}
            transition={{
              duration: duration + Math.random() * 0.4,
              delay: index * delay,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
          />
        ))}
      </div>

      {/* 节点名称 */}
      <div className="flex justify-between text-xs text-muted-foreground px-1">
        {locations.slice(0, 4).map((location, index) => (
          <motion.span
            key={location}
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{
              duration: duration * 2,
              delay: index * delay * 2,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
          >
            {location.split(' ')[0]}
          </motion.span>
        ))}
      </div>
    </div>
  );
};

// 圆形波浪动画（适用于单个Ping测试）
interface AnimatedCircularWaveProps {
  isLoading: boolean;
  progress?: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const AnimatedCircularWave: React.FC<AnimatedCircularWaveProps> = ({
  isLoading,
  progress = 0,
  size = 'md',
  className,
}) => {
  const deviceType = useDeviceType();

  const getSizeConfig = () => {
    switch (size) {
      case 'sm':
        return {
          size: 32,
          strokeWidth: 2,
          textSize: 'text-xs'
        };
      case 'lg':
        return {
          size: 64,
          strokeWidth: 4,
          textSize: 'text-sm'
        };
      default: // md
        return {
          size: 48,
          strokeWidth: 3,
          textSize: 'text-xs'
        };
    }
  };

  const { size: circleSize, strokeWidth, textSize } = getSizeConfig();
  const radius = (circleSize - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  if (!isLoading) return null;

  return (
    <div className={cn('flex flex-col items-center justify-center', className)}>
      <motion.div
        className="relative"
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
      >
        {/* 背景圆环 */}
        <svg
          width={circleSize}
          height={circleSize}
          className="transform -rotate-90"
        >
          <circle
            cx={circleSize / 2}
            cy={circleSize / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="none"
            className="text-gray-200"
          />
          {/* 进度圆环 */}
          <motion.circle
            cx={circleSize / 2}
            cy={circleSize / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="none"
            className="text-blue-500"
            strokeDasharray={circumference}
            strokeDashoffset={circumference - (progress / 100) * circumference}
            strokeLinecap="round"
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: circumference - (progress / 100) * circumference }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          />
        </svg>
        
        {/* 波浪效果 */}
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-blue-300"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.8, 0, 0.8],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeOut',
          }}
        />
      </motion.div>
      
      {progress > 0 && (
        <motion.span
          className={cn(textSize, 'text-blue-600 font-medium mt-1')}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {Math.round(progress)}%
        </motion.span>
      )}
    </div>
  );
};