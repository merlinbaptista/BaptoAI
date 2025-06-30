import React from 'react';
import { Zap } from 'lucide-react';

interface BoltBadgeProps {
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  variant?: 'dark' | 'light' | 'gradient';
  size?: 'sm' | 'md' | 'lg';
}

export const BoltBadge: React.FC<BoltBadgeProps> = ({ 
  position = 'bottom-right', 
  variant = 'gradient',
  size = 'md' 
}) => {
  const positionClasses = {
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4'
  };

  const sizeClasses = {
    'sm': 'px-2 py-1 text-xs',
    'md': 'px-3 py-2 text-sm',
    'lg': 'px-4 py-3 text-base'
  };

  const variantClasses = {
    'dark': 'bg-black/80 text-white border-white/20',
    'light': 'bg-white/90 text-black border-black/20',
    'gradient': 'bg-gradient-to-r from-purple-600/90 to-pink-600/90 text-white border-white/20'
  };

  return (
    <a
      href="https://bolt.new"
      target="_blank"
      rel="noopener noreferrer"
      className={`
        fixed z-50 flex items-center gap-2 rounded-lg border backdrop-blur-sm
        transition-all duration-300 hover:scale-105 hover:shadow-lg
        ${positionClasses[position]}
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        animate-fade-in
      `}
      title="Built with Bolt.new"
    >
      <Zap className={`${size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'} animate-pulse`} />
      <span className="font-medium">Built with Bolt.new</span>
    </a>
  );
};