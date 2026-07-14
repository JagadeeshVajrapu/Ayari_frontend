'use client';

import { memo } from 'react';
import { motion } from 'framer-motion';
import { Wifi, WifiOff, Loader2 } from 'lucide-react';
import type { SocketConnectionStatus } from '@/features/tracking/types/socket.types';
import { cn } from '@/lib/utils';

interface ConnectionStatusBadgeProps {
  status: SocketConnectionStatus;
  className?: string;
}

const STATUS_CONFIG: Record<
  SocketConnectionStatus,
  { label: string; className: string; icon: 'wifi' | 'wifi-off' | 'loader' }
> = {
  connected: {
    label: 'Live tracking',
    className: 'border-green-500/30 bg-green-500/10 text-green-700 dark:text-green-400',
    icon: 'wifi',
  },
  connecting: {
    label: 'Connecting…',
    className: 'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400',
    icon: 'loader',
  },
  reconnecting: {
    label: 'Reconnecting…',
    className: 'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400',
    icon: 'loader',
  },
  disconnected: {
    label: 'Offline',
    className: 'border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-400',
    icon: 'wifi-off',
  },
  error: {
    label: 'Connection error',
    className: 'border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-400',
    icon: 'wifi-off',
  },
};

export const ConnectionStatusBadge = memo(function ConnectionStatusBadge({
  status,
  className,
}: ConnectionStatusBadgeProps) {
  const config = STATUS_CONFIG[status];

  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium',
        config.className,
        className,
      )}
    >
      {config.icon === 'loader' ? (
        <Loader2 className="h-3 w-3 animate-spin" />
      ) : config.icon === 'wifi' ? (
        <motion.span
          animate={{ opacity: [1, 0.5, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Wifi className="h-3 w-3" />
        </motion.span>
      ) : (
        <WifiOff className="h-3 w-3" />
      )}
      {config.label}
    </motion.span>
  );
});
