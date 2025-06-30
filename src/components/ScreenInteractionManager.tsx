import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Layers, MousePointer, Target, Zap, Settings } from 'lucide-react';

interface ScreenInteractionManagerProps {
  isActive: boolean;
  onInteractionCapture?: (data: InteractionData) => void;
  children: React.ReactNode;
}

interface InteractionData {
  type: 'click' | 'hover' | 'scroll' | 'key';
  position: { x: number; y: number };
  timestamp: number;
  target?: string;
  value?: string;
}

export const ScreenInteractionManager: React.FC<ScreenInteractionManagerProps> = ({
  isActive,
  onInteractionCapture,
  children
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [interactionHistory, setInteractionHistory] = useState<InteractionData[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [showHeatmap, setShowHeatmap] = useState(false);

  // Track all user interactions
  const captureInteraction = useCallback((data: InteractionData) => {
    setInteractionHistory(prev => [...prev.slice(-50), data]); // Keep last 50 interactions
    onInteractionCapture?.(data);
  }, [onInteractionCapture]);

  // Mouse event handlers
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isActive || !isRecording) return;

    const data: InteractionData = {
      type: 'hover',
      position: { x: e.clientX, y: e.clientY },
      timestamp: Date.now(),
      target: (e.target as HTMLElement)?.tagName?.toLowerCase()
    };
    
    // Throttle hover events
    if (Date.now() - (interactionHistory[interactionHistory.length - 1]?.timestamp || 0) > 100) {
      captureInteraction(data);
    }
  }, [isActive, isRecording, captureInteraction, interactionHistory]);

  const handleClick = useCallback((e: MouseEvent) => {
    if (!isActive) return;

    const data: InteractionData = {
      type: 'click',
      position: { x: e.clientX, y: e.clientY },
      timestamp: Date.now(),
      target: (e.target as HTMLElement)?.tagName?.toLowerCase()
    };
    
    captureInteraction(data);
  }, [isActive, captureInteraction]);

  const handleScroll = useCallback((e: Event) => {
    if (!isActive || !isRecording) return;

    const data: InteractionData = {
      type: 'scroll',
      position: { x: window.scrollX, y: window.scrollY },
      timestamp: Date.now()
    };
    
    captureInteraction(data);
  }, [isActive, isRecording, captureInteraction]);

  const handleKeyPress = useCallback((e: KeyboardEvent) => {
    if (!isActive || !isRecording) return;

    const data: InteractionData = {
      type: 'key',
      position: { x: 0, y: 0 },
      timestamp: Date.now(),
      value: e.key
    };
    
    captureInteraction(data);
  }, [isActive, isRecording, captureInteraction]);

  // Set up event listeners
  useEffect(() => {
    if (!isActive) return;

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('click', handleClick);
    document.addEventListener('scroll', handleScroll);
    document.addEventListener('keydown', handleKeyPress);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('click', handleClick);
      document.removeEventListener('scroll', handleScroll);
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [isActive, handleMouseMove, handleClick, handleScroll, handleKeyPress]);

  // Generate heatmap data
  const getHeatmapData = useCallback(() => {
    const clickData = interactionHistory.filter(item => item.type === 'click');
    const heatmapPoints = clickData.map(click => ({
      x: click.position.x,
      y: click.position.y,
      intensity: 1
    }));

    return heatmapPoints;
  }, [interactionHistory]);

  // Render heatmap overlay
  const renderHeatmap = useCallback(() => {
    if (!showHeatmap) return null;

    const heatmapData = getHeatmapData();
    
    return (
      <div className="absolute inset-0 pointer-events-none z-50">
        {heatmapData.map((point, index) => (
          <div
            key={index}
            className="absolute w-8 h-8 bg-red-500 rounded-full opacity-30 animate-pulse"
            style={{
              left: point.x - 16,
              top: point.y - 16,
              transform: 'scale(0.5)'
            }}
          />
        ))}
      </div>
    );
  }, [showHeatmap, getHeatmapData]);

  if (!isActive) {
    return <>{children}</>;
  }

  return (
    <div ref={containerRef} className="relative w-full h-full">
      {children}
      
      {/* Interaction overlay */}
      <div className="absolute inset-0 pointer-events-none z-40">
        {/* Recent click indicators */}
        {interactionHistory
          .filter(item => item.type === 'click' && Date.now() - item.timestamp < 3000)
          .map((click, index) => (
            <div
              key={`${click.timestamp}-${index}`}
              className="absolute w-6 h-6 border-2 border-blue-400 rounded-full animate-ping"
              style={{
                left: click.position.x - 12,
                top: click.position.y - 12
              }}
            />
          ))}
        
        {/* Heatmap overlay */}
        {renderHeatmap()}
      </div>

      {/* Control panel */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50">
        <div className="flex items-center gap-2 bg-black/80 backdrop-blur-sm rounded-lg p-2">
          <button
            onClick={() => setIsRecording(!isRecording)}
            className={`p-2 rounded-lg transition-all duration-300 ${
              isRecording 
                ? 'bg-red-600 text-white' 
                : 'bg-gray-600 text-gray-300'
            }`}
            title="Toggle interaction recording"
          >
            <Target className="w-4 h-4" />
          </button>

          <button
            onClick={() => setShowHeatmap(!showHeatmap)}
            className={`p-2 rounded-lg transition-all duration-300 ${
              showHeatmap 
                ? 'bg-orange-600 text-white' 
                : 'bg-gray-600 text-gray-300'
            }`}
            title="Toggle interaction heatmap"
          >
            <Zap className="w-4 h-4" />
          </button>

          <div className="px-3 py-1 bg-gray-700 rounded text-white text-xs">
            {interactionHistory.length} interactions
          </div>
        </div>
      </div>
    </div>
  );
};