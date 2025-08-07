'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface AnimatedListProps {
  items: React.ReactNode[];
  className?: string;
  itemClassName?: string;
  animationType?: 'stagger' | 'cascade' | 'wave' | 'fade';
  staggerDelay?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
  initialDelay?: number;
  removeAnimation?: boolean;
}

interface AnimatedListItemProps {
  children: React.ReactNode;
  className?: string;
  index: number;
  animationType?: 'stagger' | 'cascade' | 'wave' | 'fade';
  staggerDelay?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
  initialDelay?: number;
}

const AnimatedListItem: React.FC<AnimatedListItemProps> = ({
  children,
  className,
  index,
  animationType = 'stagger',
  staggerDelay = 0.1,
  direction = 'up',
  initialDelay = 0,
}) => {
  const getVariants = () => {
    const delay = initialDelay + (index * staggerDelay);
    
    switch (animationType) {
      case 'cascade':
        return {
          initial: { 
            opacity: 0, 
            y: direction === 'up' || direction === 'down' ? (direction === 'up' ? 30 : -30) : 0,
            x: direction === 'left' || direction === 'right' ? (direction === 'left' ? 30 : -30) : 0,
            scale: 0.8
          },
          animate: { 
            opacity: 1, 
            y: 0, 
            x: 0, 
            scale: 1,
            transition: {
              duration: 0.5,
              delay,
              ease: 'easeOut'
            }
          },
          exit: { 
            opacity: 0, 
            scale: 0.8,
            transition: { duration: 0.3 }
          }
        };
      
      case 'wave':
        return {
          initial: { 
            opacity: 0,
            y: direction === 'up' || direction === 'down' ? (direction === 'up' ? 50 : -50) : 0,
            x: direction === 'left' || direction === 'right' ? (direction === 'left' ? 50 : -50) : 0,
            rotateX: direction === 'up' || direction === 'down' ? (direction === 'up' ? -90 : 90) : 0,
            rotateY: direction === 'left' || direction === 'right' ? (direction === 'left' ? -90 : 90) : 0,
          },
          animate: { 
            opacity: 1, 
            y: 0, 
            x: 0, 
            rotateX: 0,
            rotateY: 0,
            transition: {
              duration: 0.6,
              delay,
              ease: 'easeOut'
            }
          },
          exit: { 
            opacity: 0,
            y: direction === 'up' ? -50 : 50,
            x: direction === 'left' ? -50 : 50,
            transition: { duration: 0.4 }
          }
        };
      
      case 'fade':
        return {
          initial: { opacity: 0 },
          animate: { 
            opacity: 1,
            transition: {
              duration: 0.4,
              delay,
              ease: 'easeInOut'
            }
          },
          exit: { 
            opacity: 0,
            transition: { duration: 0.3 }
          }
        };
      
      case 'stagger':
      default:
        return {
          initial: { 
            opacity: 0, 
            y: direction === 'up' || direction === 'down' ? (direction === 'up' ? 20 : -20) : 0,
            x: direction === 'left' || direction === 'right' ? (direction === 'left' ? 20 : -20) : 0
          },
          animate: { 
            opacity: 1, 
            y: 0, 
            x: 0,
            transition: {
              duration: 0.3,
              delay,
              ease: 'easeOut'
            }
          },
          exit: { 
            opacity: 0,
            y: direction === 'up' ? -20 : 20,
            x: direction === 'left' ? -20 : 20,
            transition: { duration: 0.2 }
          }
        };
    }
  };

  const variants = getVariants();

  return (
    <motion.div
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
      className={cn('w-full', className)}
      layout
    >
      {children}
    </motion.div>
  );
};

export const AnimatedList: React.FC<AnimatedListProps> = ({
  items,
  className,
  itemClassName,
  animationType = 'stagger',
  staggerDelay = 0.1,
  direction = 'up',
  initialDelay = 0,
  removeAnimation = true,
}) => {
  const listVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
      },
    },
  };

  return (
    <motion.div
      className={cn('space-y-2', className)}
      variants={animationType === 'stagger' ? listVariants : undefined}
      initial="hidden"
      animate="show"
    >
      <AnimatePresence mode="popLayout">
        {items.map((item, index) => (
          <AnimatedListItem
            key={index}
            index={index}
            className={itemClassName}
            animationType={animationType}
            staggerDelay={staggerDelay}
            direction={direction}
            initialDelay={initialDelay}
          >
            {item}
          </AnimatedListItem>
        ))}
      </AnimatePresence>
    </motion.div>
  );
};

// 便捷的历史记录列表组件
interface AnimatedHistoryItem {
  id: string;
  timestamp: string;
  domain: string;
  totalTime: number;
  statusCode: number;
  isThroughCDN: boolean;
  cdnProvider?: string;
  dnsResolutionTime: number;
  serverSoftware: string;
}

interface AnimatedHistoryListProps {
  items: AnimatedHistoryItem[];
  className?: string;
  itemClassName?: string;
  onItemClick?: (item: AnimatedHistoryItem) => void;
  maxItems?: number;
}

export const AnimatedHistoryList: React.FC<AnimatedHistoryListProps> = ({
  items,
  className,
  itemClassName,
  onItemClick,
  maxItems = 10,
}) => {
  const formatTime = (time: number) => {
    return `${time.toFixed(2)}ms`;
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('zh-CN');
  };

  const getStatusColor = (statusCode: number) => {
    if (statusCode >= 200 && statusCode < 300) return 'text-green-600';
    if (statusCode >= 300 && statusCode < 400) return 'text-yellow-600';
    if (statusCode >= 400 && statusCode < 500) return 'text-orange-600';
    return 'text-red-600';
  };

  const displayItems = items.slice(0, maxItems);

  return (
    <AnimatedList
      items={displayItems.map((item) => (
        <motion.div
          key={item.id}
          className={cn(
            'p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors',
            itemClassName
          )}
          onClick={() => onItemClick?.(item)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-sm">{item.domain}</span>
                <span className={cn('text-xs font-mono', getStatusColor(item.statusCode))}>
                  {item.statusCode}
                </span>
                {item.isThroughCDN && (
                  <span className="text-xs bg-blue-100 text-blue-700 px-1 py-0.5 rounded">
                    CDN
                  </span>
                )}
              </div>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span>总时间: {formatTime(item.totalTime)}</span>
                <span>DNS: {formatTime(item.dnsResolutionTime)}</span>
                <span>{formatTimestamp(item.timestamp)}</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-muted-foreground">
                {item.cdnProvider || '直连'}
              </div>
            </div>
          </div>
        </motion.div>
      ))}
      className={cn('max-h-96 overflow-y-auto', className)}
      animationType="cascade"
      staggerDelay={0.05}
      direction="down"
    />
  );
};