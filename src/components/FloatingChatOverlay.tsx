import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Move, Minimize2, Maximize2, X, Settings, Brain, Zap } from 'lucide-react';
import { GuidanceSystem } from './GuidanceSystem';

interface FloatingChatOverlayProps {
  isVisible: boolean;
  onClose: () => void;
  currentScreenData?: string | null;
  onQuerySubmit?: (query: string) => void;
}

export const FloatingChatOverlay: React.FC<FloatingChatOverlayProps> = ({
  isVisible,
  onClose,
  currentScreenData,
  onQuerySubmit
}) => {
  const [position, setPosition] = useState({ x: 20, y: 20 });
  const [size, setSize] = useState({ width: 450, height: 650 });
  const [isMinimized, setIsMinimized] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Handle dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget || (e.target as HTMLElement).classList.contains('drag-handle')) {
      setIsDragging(true);
      const rect = overlayRef.current?.getBoundingClientRect();
      if (rect) {
        setDragOffset({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        });
      }
      e.preventDefault();
      e.stopPropagation();
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      const newX = Math.max(0, Math.min(window.innerWidth - size.width, e.clientX - dragOffset.x));
      const newY = Math.max(0, Math.min(window.innerHeight - size.height, e.clientY - dragOffset.y));
      setPosition({ x: newX, y: newY });
    } else if (isResizing) {
      const deltaX = e.clientX - resizeStart.x;
      const deltaY = e.clientY - resizeStart.y;
      
      const newWidth = Math.max(350, Math.min(window.innerWidth - position.x, resizeStart.width + deltaX));
      const newHeight = Math.max(400, Math.min(window.innerHeight - position.y, resizeStart.height + deltaY));
      
      setSize({ width: newWidth, height: newHeight });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
  };

  const handleResizeStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsResizing(true);
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: size.width,
      height: size.height
    });
  };

  useEffect(() => {
    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isResizing, dragOffset, size, resizeStart, position]);

  // Handle window resize
  useEffect(() => {
    const handleWindowResize = () => {
      setPosition(prev => ({
        x: Math.min(prev.x, window.innerWidth - size.width),
        y: Math.min(prev.y, window.innerHeight - size.height)
      }));
    };

    window.addEventListener('resize', handleWindowResize);
    return () => window.removeEventListener('resize', handleWindowResize);
  }, [size]);

  // Monitor for analysis state changes
  useEffect(() => {
    if (currentScreenData) {
      setIsAnalyzing(true);
      // Reset analyzing state after a delay
      const timer = setTimeout(() => setIsAnalyzing(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [currentScreenData]);

  if (!isVisible) return null;

  return (
    <>
      {/* CRITICAL: This backdrop must NOT block pointer events */}
      <div 
        className="fixed inset-0 z-40"
        style={{ 
          pointerEvents: 'none', // This is the key fix - backdrop doesn't block clicks
          backgroundColor: 'transparent' 
        }}
      />

      <div
        ref={overlayRef}
        className={`fixed z-50 transition-all duration-300 ${
          isDragging ? 'cursor-grabbing' : 'cursor-default'
        } ${isMinimized ? 'h-auto' : ''} ${isAnalyzing ? 'ring-2 ring-blue-400/50' : ''}`}
        style={{
          left: position.x,
          top: position.y,
          width: isMinimized ? 'auto' : size.width,
          height: isMinimized ? 'auto' : size.height,
          minWidth: isMinimized ? 'auto' : 350,
          minHeight: isMinimized ? 'auto' : 400,
          maxWidth: '90vw',
          maxHeight: '90vh',
          pointerEvents: 'auto' // Only the chat window itself blocks clicks
        }}
        onMouseDown={handleMouseDown}
      >
        {/* Enhanced glass effect container */}
        <div className="w-full h-full bg-gray-900/95 backdrop-blur-xl rounded-xl shadow-2xl border border-white/30 overflow-hidden">
          {/* Header */}
          <div 
            className="drag-handle flex items-center justify-between p-3 border-b border-white/20 cursor-grab active:cursor-grabbing bg-gray-800/80 backdrop-blur-sm"
            onMouseDown={handleMouseDown}
          >
            <div className="flex items-center gap-2">
              <div className="relative">
                <MessageSquare className="w-4 h-4 text-white" />
                {isAnalyzing && (
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-400 rounded-full animate-ping" />
                )}
              </div>
              <span className="text-sm font-medium text-white">
                Cord AI Assistant
                {isAnalyzing && <span className="text-blue-300 ml-2">(Analyzing...)</span>}
              </span>
            </div>
            
            <div className="flex items-center gap-1">
              {currentScreenData && (
                <div className="flex items-center gap-1 px-2 py-1 bg-green-600/30 border border-green-500/50 rounded text-xs text-green-200">
                  <Brain className="w-3 h-3" />
                  <span>Screen Active</span>
                </div>
              )}
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsMinimized(!isMinimized);
                }}
                className="p-1 hover:bg-white/20 rounded transition-colors"
                title={isMinimized ? 'Maximize' : 'Minimize'}
              >
                {isMinimized ? (
                  <Maximize2 className="w-3 h-3 text-white" />
                ) : (
                  <Minimize2 className="w-3 h-3 text-white" />
                )}
              </button>
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onClose();
                }}
                className="p-1 hover:bg-red-500/30 hover:text-red-300 rounded transition-colors"
                title="Close"
              >
                <X className="w-3 h-3 text-white" />
              </button>
            </div>
          </div>

          {/* Content */}
          {!isMinimized && (
            <div className="flex flex-col" style={{ height: size.height - 60 }}>
              {/* Main chat area with custom scrollbar */}
              <div className="flex-1 overflow-hidden">
                <div className="h-full p-2 overflow-y-auto custom-scrollbar">
                  <GuidanceSystem
                    onQuerySubmit={onQuerySubmit}
                    isCompact={true}
                    currentScreenData={currentScreenData}
                  />
                </div>
              </div>
              
              {/* Status bar */}
              <div className="flex-shrink-0 px-3 py-2 border-t border-white/20 bg-gray-800/60 backdrop-blur-sm">
                <div className="flex items-center justify-between text-xs text-gray-300">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <div className={`w-2 h-2 rounded-full ${currentScreenData ? 'bg-green-400' : 'bg-gray-500'}`} />
                      <span>{currentScreenData ? 'Screen Connected' : 'No Screen Data'}</span>
                    </div>
                    {isAnalyzing && (
                      <div className="flex items-center gap-1 text-blue-400">
                        <Zap className="w-3 h-3 animate-spin" />
                        <span>AI Processing</span>
                      </div>
                    )}
                  </div>
                  <div className="text-gray-400">
                    Enhanced AI • OCR • UI Detection
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Resize handle */}
          {!isMinimized && (
            <div
              className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize opacity-60 hover:opacity-100 transition-opacity group"
              onMouseDown={handleResizeStart}
            >
              <div className="w-full h-full relative">
                {/* Resize grip lines */}
                <div className="absolute bottom-1 right-1 w-3 h-0.5 bg-white/40 group-hover:bg-white/60 transition-colors" />
                <div className="absolute bottom-2 right-1 w-2 h-0.5 bg-white/40 group-hover:bg-white/60 transition-colors" />
                <div className="absolute bottom-3 right-1 w-1 h-0.5 bg-white/40 group-hover:bg-white/60 transition-colors" />
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};