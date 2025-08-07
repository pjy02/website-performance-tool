'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, AlertCircle, Info, XCircle } from 'lucide-react';
import { useDeviceType } from '@/lib/animation-utils';

export type MessageType = 'success' | 'error' | 'warning' | 'info';

interface AnimatedMessageProps {
  type: MessageType;
  message: string;
  isVisible: boolean;
  onClose?: () => void;
  autoClose?: boolean;
  autoCloseDelay?: number;
}

export function AnimatedMessage({ 
  type, 
  message, 
  isVisible, 
  onClose, 
  autoClose = false,
  autoCloseDelay = 5000 
}: AnimatedMessageProps) {
  const deviceType = useDeviceType();

  // 根据消息类型获取配置
  const getMessageConfig = () => {
    switch (type) {
      case 'success':
        return {
          icon: CheckCircle,
          variant: 'default' as const,
          iconColor: 'text-green-600',
          bgColor: 'bg-green-50 border-green-200',
          slideFrom: 'right' as const
        };
      case 'error':
        return {
          icon: XCircle,
          variant: 'destructive' as const,
          iconColor: 'text-red-600',
          bgColor: 'bg-red-50 border-red-200',
          slideFrom: 'right' as const
        };
      case 'warning':
        return {
          icon: AlertCircle,
          variant: 'default' as const,
          iconColor: 'text-orange-600',
          bgColor: 'bg-orange-50 border-orange-200',
          slideFrom: 'right' as const
        };
      case 'info':
        return {
          icon: Info,
          variant: 'default' as const,
          iconColor: 'text-blue-600',
          bgColor: 'bg-blue-50 border-blue-200',
          slideFrom: 'right' as const
        };
    }
  };

  // 根据设备类型调整动画参数
  const getAnimationParams = () => {
    switch (deviceType) {
      case 'mobile':
        return {
          initialX: 100,
          duration: 0.3,
          distance: 20
        };
      case 'tablet':
        return {
          initialX: 120,
          duration: 0.35,
          distance: 25
        };
      default: // desktop
        return {
          initialX: 150,
          duration: 0.4,
          distance: 30
        };
    }
  };

  const { initialX, duration, distance } = getAnimationParams();
  const config = getMessageConfig();
  const IconComponent = config.icon;

  // 处理自动关闭
  React.useEffect(() => {
    if (autoClose && isVisible && onClose) {
      const timer = setTimeout(() => {
        onClose();
      }, autoCloseDelay);
      return () => clearTimeout(timer);
    }
  }, [autoClose, isVisible, onClose, autoCloseDelay]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ 
            opacity: 0, 
            x: initialX,
            scale: 0.95
          }}
          animate={{ 
            opacity: 1, 
            x: 0,
            scale: 1
          }}
          exit={{ 
            opacity: 0, 
            x: initialX,
            scale: 0.95,
            transition: { duration: duration * 0.8 }
          }}
          transition={{ 
            duration,
            ease: [0.4, 0, 0.2, 1]
          }}
          className="fixed top-4 right-4 z-50 max-w-sm"
        >
          <Alert className={`${config.bgColor} shadow-lg border backdrop-blur-sm`}>
            <IconComponent className={`h-4 w-4 ${config.iconColor}`} />
            <AlertDescription className="text-sm">
              {message}
            </AlertDescription>
            {onClose && (
              <button
                onClick={onClose}
                className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </Alert>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// 内联消息组件（用于页面内的消息提示）
interface InlineAnimatedMessageProps {
  type: MessageType;
  message: string;
  isVisible: boolean;
}

export function InlineAnimatedMessage({ type, message, isVisible }: InlineAnimatedMessageProps) {
  const deviceType = useDeviceType();

  const getMessageConfig = () => {
    switch (type) {
      case 'success':
        return {
          icon: CheckCircle,
          variant: 'default' as const,
          iconColor: 'text-green-600',
          bgColor: 'bg-green-50 border-green-200'
        };
      case 'error':
        return {
          icon: XCircle,
          variant: 'destructive' as const,
          iconColor: 'text-red-600',
          bgColor: 'bg-red-50 border-red-200'
        };
      case 'warning':
        return {
          icon: AlertCircle,
          variant: 'default' as const,
          iconColor: 'text-orange-600',
          bgColor: 'bg-orange-50 border-orange-200'
        };
      case 'info':
        return {
          icon: Info,
          variant: 'default' as const,
          iconColor: 'text-blue-600',
          bgColor: 'bg-blue-50 border-blue-200'
        };
    }
  };

  const getAnimationParams = () => {
    switch (deviceType) {
      case 'mobile':
        return {
          initialY: -10,
          duration: 0.25
        };
      case 'tablet':
        return {
          initialY: -15,
          duration: 0.3
        };
      default: // desktop
        return {
          initialY: -20,
          duration: 0.35
        };
    }
  };

  const { initialY, duration } = getAnimationParams();
  const config = getMessageConfig();
  const IconComponent = config.icon;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ 
            opacity: 0, 
            y: initialY,
            height: 0
          }}
          animate={{ 
            opacity: 1, 
            y: 0,
            height: 'auto'
          }}
          exit={{ 
            opacity: 0, 
            y: initialY,
            height: 0,
            transition: { duration: duration * 0.8 }
          }}
          transition={{ 
            duration,
            ease: [0.4, 0, 0.2, 1]
          }}
        >
          <Alert className={`${config.bgColor} border`}>
            <IconComponent className={`h-4 w-4 ${config.iconColor}`} />
            <AlertDescription className="text-sm">
              {message}
            </AlertDescription>
          </Alert>
        </motion.div>
      )}
    </AnimatePresence>
  );
}