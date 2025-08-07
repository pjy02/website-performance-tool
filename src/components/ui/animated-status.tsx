'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { CheckCircle, AlertCircle, XCircle, Loader2, Info } from 'lucide-react';

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

export type StatusType = 'success' | 'error' | 'warning' | 'loading' | 'info';

interface AnimatedStatusProps {
  status: StatusType;
  text?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  pulse?: boolean;
  showText?: boolean;
  variant?: 'default' | 'minimal' | 'badge';
  respectReducedMotion?: boolean;
}

const statusConfig = {
  success: {
    icon: CheckCircle,
    color: 'text-green-500',
    bgColor: 'bg-green-500',
    borderColor: 'border-green-500',
    pulseColor: 'rgba(34, 197, 94, 0.3)',
  },
  error: {
    icon: XCircle,
    color: 'text-red-500',
    bgColor: 'bg-red-500',
    borderColor: 'border-red-500',
    pulseColor: 'rgba(239, 68, 68, 0.3)',
  },
  warning: {
    icon: AlertCircle,
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-500',
    borderColor: 'border-yellow-500',
    pulseColor: 'rgba(245, 158, 11, 0.3)',
  },
  loading: {
    icon: Loader2,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500',
    borderColor: 'border-blue-500',
    pulseColor: 'rgba(59, 130, 246, 0.3)',
  },
  info: {
    icon: Info,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500',
    borderColor: 'border-blue-500',
    pulseColor: 'rgba(59, 130, 246, 0.3)',
  },
};

const sizeConfig = {
  sm: { iconSize: 'h-4 w-4', textSize: 'text-xs', padding: 'px-2 py-1' },
  md: { iconSize: 'h-5 w-5', textSize: 'text-sm', padding: 'px-3 py-1.5' },
  lg: { iconSize: 'h-6 w-6', textSize: 'text-base', padding: 'px-4 py-2' },
};

export const AnimatedStatus: React.FC<AnimatedStatusProps> = ({
  status,
  text,
  className,
  size = 'md',
  pulse = false,
  showText = true,
  variant = 'default',
  respectReducedMotion = true,
}) => {
  const config = statusConfig[status];
  const sizeCfg = sizeConfig[size];
  const IconComponent = config.icon;
  const prefersReducedMotion = useReducedMotion();
  const deviceType = useDeviceType();

  // 根据设备类型调整动画参数
  const getResponsiveDuration = () => {
    if (respectReducedMotion && prefersReducedMotion) return 0;
    
    switch (deviceType) {
      case 'mobile':
        return 0.8;
      case 'tablet':
        return 0.9;
      default:
        return 1;
    }
  };

  const responsiveDuration = getResponsiveDuration();

  // 如果用户偏好减少动画且设置了尊重该偏好，则禁用动画
  const shouldDisableAnimation = respectReducedMotion && prefersReducedMotion;

  const pulseAnimation = shouldDisableAnimation ? {} : {
    scale: [1, 1.05, 1],
    opacity: [1, 0.8, 1],
  };

  const loadingAnimation = shouldDisableAnimation ? {} : {
    rotate: 360,
  };

  const renderMinimalVariant = () => (
    <motion.div
      className={cn(
        'inline-flex items-center gap-1.5',
        config.color,
        className
      )}
      animate={status === 'loading' ? loadingAnimation : (pulse && !shouldDisableAnimation) ? pulseAnimation : undefined}
      transition={
        status === 'loading' 
          ? { duration: responsiveDuration, repeat: Infinity, ease: 'linear' }
          : { duration: 2 * responsiveDuration, repeat: Infinity, ease: 'easeInOut' }
      }
    >
      <IconComponent className={cn(sizeCfg.iconSize, status === 'loading' && !shouldDisableAnimation && 'animate-spin')} />
      {showText && text && (
        <span className={cn(sizeCfg.textSize, 'font-medium')}>{text}</span>
      )}
    </motion.div>
  );

  const renderBadgeVariant = () => (
    <motion.div
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border',
        sizeCfg.padding,
        config.borderColor,
        'bg-background',
        className
      )}
      animate={status === 'loading' ? loadingAnimation : (pulse && !shouldDisableAnimation) ? pulseAnimation : undefined}
      transition={
        status === 'loading' 
          ? { duration: responsiveDuration, repeat: Infinity, ease: 'linear' }
          : { duration: 2 * responsiveDuration, repeat: Infinity, ease: 'easeInOut' }
      }
      whileHover={!shouldDisableAnimation ? { scale: 1.05 } : undefined}
      whileTap={!shouldDisableAnimation ? { scale: 0.95 } : undefined}
    >
      <IconComponent className={cn(sizeCfg.iconSize, status === 'loading' && !shouldDisableAnimation && 'animate-spin')} />
      {showText && text && (
        <span className={cn(sizeCfg.textSize, 'font-medium')}>{text}</span>
      )}
    </motion.div>
  );

  const renderDefaultVariant = () => (
    <motion.div
      className={cn(
        'inline-flex items-center gap-2 rounded-lg',
        sizeCfg.padding,
        'bg-muted',
        className
      )}
      animate={status === 'loading' ? loadingAnimation : (pulse && !shouldDisableAnimation) ? pulseAnimation : undefined}
      transition={
        status === 'loading' 
          ? { duration: responsiveDuration, repeat: Infinity, ease: 'linear' }
          : { duration: 2 * responsiveDuration, repeat: Infinity, ease: 'easeInOut' }
      }
      whileHover={!shouldDisableAnimation ? { scale: 1.02 } : undefined}
      whileTap={!shouldDisableAnimation ? { scale: 0.98 } : undefined}
    >
      <motion.div
        className={cn(
          'rounded-full p-1',
          config.bgColor,
          'bg-opacity-10'
        )}
        animate={(pulse && !shouldDisableAnimation) ? pulseAnimation : undefined}
        transition={{ duration: 2 * responsiveDuration, repeat: Infinity, ease: 'easeInOut' }}
      >
        <IconComponent className={cn(sizeCfg.iconSize, config.color, status === 'loading' && !shouldDisableAnimation && 'animate-spin')} />
      </motion.div>
      {showText && text && (
        <motion.span 
          className={cn(sizeCfg.textSize, 'font-medium text-foreground')}
          initial={shouldDisableAnimation ? {} : { opacity: 0, x: -5 }}
          animate={shouldDisableAnimation ? {} : { opacity: 1, x: 0 }}
          transition={shouldDisableAnimation ? {} : { delay: 0.1, duration: 0.3 }}
        >
          {text}
        </motion.span>
      )}
    </motion.div>
  );

  switch (variant) {
    case 'minimal':
      return renderMinimalVariant();
    case 'badge':
      return renderBadgeVariant();
    case 'default':
    default:
      return renderDefaultVariant();
  }
};

// HTTP状态码指示器
interface AnimatedHttpStatusProps {
  statusCode: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showCode?: boolean;
}

export const AnimatedHttpStatus: React.FC<AnimatedHttpStatusProps> = ({
  statusCode,
  className,
  size = 'md',
  showCode = true,
}) => {
  const getStatusType = (code: number): StatusType => {
    if (code >= 200 && code < 300) return 'success';
    if (code >= 300 && code < 400) return 'warning';
    if (code >= 400 && code < 500) return 'error';
    if (code >= 500) return 'error';
    return 'info';
  };

  const getStatusText = (code: number): string => {
    if (code >= 200 && code < 300) return '成功';
    if (code >= 300 && code < 400) return '重定向';
    if (code >= 400 && code < 500) return '客户端错误';
    if (code >= 500) return '服务器错误';
    return '未知';
  };

  return (
    <AnimatedStatus
      status={getStatusType(statusCode)}
      text={showCode ? `${statusCode} ${getStatusText(statusCode)}` : getStatusText(statusCode)}
      className={className}
      size={size}
      pulse={getStatusType(statusCode) === 'error'}
      variant="badge"
    />
  );
};

// CDN状态指示器
interface AnimatedCDNStatusProps {
  isThroughCDN: boolean;
  provider?: string;
  confidence?: 'high' | 'medium' | 'low';
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const AnimatedCDNStatus: React.FC<AnimatedCDNStatusProps> = ({
  isThroughCDN,
  provider,
  confidence,
  className,
  size = 'md',
}) => {
  const getStatusType = (): StatusType => {
    if (!isThroughCDN) return 'warning';
    if (confidence === 'high') return 'success';
    if (confidence === 'medium') return 'info';
    return 'warning';
  };

  const getStatusText = (): string => {
    if (!isThroughCDN) return '直连';
    if (provider) return `CDN (${provider})`;
    return 'CDN';
  };

  const getConfidenceText = (): string => {
    if (!confidence) return '';
    switch (confidence) {
      case 'high': return '高置信度';
      case 'medium': return '中等置信度';
      case 'low': return '低置信度';
      default: return '';
    }
  };

  return (
    <div className="flex items-center gap-2">
      <AnimatedStatus
        status={getStatusType()}
        text={getStatusText()}
        className={className}
        size={size}
        pulse={isThroughCDN && confidence === 'high'}
        variant="badge"
      />
      {confidence && (
        <span className="text-xs text-muted-foreground">
          {getConfidenceText()}
        </span>
      )}
    </div>
  );
};