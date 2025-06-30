import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Monitor, MessageSquare, Layers, MousePointer, Eye, Settings, Minimize2, Maximize2 } from 'lucide-react';
import { FloatingChatWidget } from './FloatingChatWidget';

interface InteractiveScreenShareProps {
  stream: MediaStream | null;
  onFrameCapture?: (imageData: string) => void;
  onQuerySubmit?: (query: string) => void;
  currentScreenData?: string | null;
}

export const InteractiveScreenShare: React.FC<InteractiveScreenShareProps> = ({
  stream,
  onFrameCapture,
  onQuerySubmit,
  currentScreenData
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [showChatWidget, setShowChatWidget] = useState(true);
  const [interactionMode, setInteractionMode] = useState<'passthrough' | 'capture' | 'hybrid'>('passthrough');
  const [isCapturing, setIsCapturing] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [clickEvents, setClickEvents] = useState<Array<{ x: number, y: number, timestamp: number }>>([]);
  const [autoAnalysisEnabled, setAutoAnalysisEnabled] = useState(true);
  const [analysisInterval, setAnalysisInterval] = useState<NodeJS.Timeout | null>(null);

  // Initialize screen sharing
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      videoRef.current.play();
      
      if (autoAnalysisEnabled) {
        startAutoAnalysis();
      }
    }

    return () => {
      if (analysisInterval) {
        clearInterval(analysisInterval);
      }
    };
  }, [stream, autoAnalysisEnabled]);

  const startAutoAnalysis = useCallback(() => {
    setTimeout(() => {
      captureAndAnalyze('I can see your screen now. Let me analyze what\'s currently displayed and provide intelligent guidance.');
    }, 2000);

    const interval = setInterval(() => {
      if (autoAnalysisEnabled) {
        captureAndAnalyze('Let me check for any changes on your screen and provide updated guidance.');
      }
    }, 15000);

    setAnalysisInterval(interval);
  }, [autoAnalysisEnabled]);

  const captureAndAnalyze = useCallback(async (message?: string) => {
    if (!videoRef.current || !canvasRef.current || !onFrameCapture || !onQuerySubmit) return;

    setIsCapturing(true);
    
    try {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      ctx.drawImage(videoRef.current, 0, 0);
      
      const imageData = canvas.toDataURL('image/jpeg', 0.8);
      
      onFrameCapture(imageData);
      
      if (message) {
        onQuerySubmit(message);
      }
    } catch (error) {
      console.error('Error capturing and analyzing frame:', error);
    } finally {
      setTimeout(() => setIsCapturing(false), 1500);
    }
  }, [onFrameCapture, onQuerySubmit]);

  const toggleInteractionMode = useCallback(() => {
    const modes: Array<'passthrough' | 'capture' | 'hybrid'> = ['passthrough', 'capture', 'hybrid'];
    const currentIndex = modes.indexOf(interactionMode);
    const nextMode = modes[(currentIndex + 1) % modes.length];
    setInteractionMode(nextMode);
  }, [interactionMode]);

  const handleKeyPress = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Tab' && e.ctrlKey) {
      e.preventDefault();
      toggleInteractionMode();
    }
    if (e.key === 'c' && e.ctrlKey && e.shiftKey) {
      e.preventDefault();
      captureAndAnalyze('Manual screen capture requested. Please analyze the current state.');
    }
    if (e.key === 't' && e.ctrlKey) {
      e.preventDefault();
      setShowChatWidget(!showChatWidget);
    }
  }, [toggleInteractionMode, captureAndAnalyze, showChatWidget]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  if (!stream) {
    return (
      <div className="h-screen bg-black flex items-center justify-center">
        <div className="text-center text-white">
          <Monitor className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <h2 className="text-2xl font-bold mb-2">No Screen Share Active</h2>
          <p className="text-gray-400">Start screen sharing to enable interactive mode</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-screen bg-black overflow-hidden">
      {/* Hidden canvas for frame capture */}
      <canvas
        ref={canvasRef}
        className="hidden"
      />

      {/* Main video display - CRITICAL: This is the background that must remain interactive */}
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        autoPlay
        muted
        playsInline
        style={{
          pointerEvents: 'auto' // Ensure video/background is always interactive
        }}
      />

      {/* Control panel - positioned to not interfere with background */}
      <div className="absolute top-4 right-4 flex gap-2 z-30">
        <button
          onClick={toggleInteractionMode}
          className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-all duration-300 flex items-center gap-2 shadow-lg backdrop-blur-sm"
          title="Toggle interaction mode (Ctrl+Tab)"
        >
          <Layers className="w-4 h-4" />
          {interactionMode}
        </button>

        <button
          onClick={() => setAutoAnalysisEnabled(!autoAnalysisEnabled)}
          className={`px-4 py-2 rounded-lg transition-all duration-300 flex items-center gap-2 shadow-lg backdrop-blur-sm ${
            autoAnalysisEnabled 
              ? 'bg-green-600/80 hover:bg-green-600 text-white' 
              : 'bg-gray-600/80 hover:bg-gray-600 text-white'
          }`}
        >
          <Eye className="w-4 h-4" />
          Auto Analysis
        </button>

        <button
          onClick={() => captureAndAnalyze('Manual analysis requested')}
          disabled={isCapturing}
          className="px-4 py-2 bg-blue-600/80 hover:bg-blue-600 text-white rounded-lg transition-all duration-300 flex items-center gap-2 shadow-lg backdrop-blur-sm disabled:opacity-50"
          title="Manual capture (Ctrl+Shift+C)"
        >
          <Monitor className="w-4 h-4" />
          Capture
        </button>

        <button
          onClick={() => setShowChatWidget(!showChatWidget)}
          className={`px-4 py-2 rounded-lg transition-all duration-300 flex items-center gap-2 shadow-lg backdrop-blur-sm ${
            showChatWidget 
              ? 'bg-blue-600/80 hover:bg-blue-600 text-white' 
              : 'bg-white/20 hover:bg-white/30 text-white'
          }`}
          title="Toggle chat widget (Ctrl+T)"
        >
          <MessageSquare className="w-4 h-4" />
          Chat
        </button>
      </div>

      {/* Status indicators */}
      <div className="absolute top-4 left-4 space-y-2 z-30">
        <div className={`flex items-center gap-2 px-3 py-2 rounded-lg shadow-lg backdrop-blur-sm ${
          interactionMode === 'passthrough' ? 'bg-green-600/80' :
          interactionMode === 'capture' ? 'bg-blue-600/80' :
          'bg-purple-600/80'
        } text-white`}>
          <Layers className="w-4 h-4" />
          <span className="text-sm font-medium capitalize">{interactionMode} Mode</span>
        </div>

        {isCapturing && (
          <div className="flex items-center gap-2 px-3 py-2 bg-orange-600/80 text-white rounded-lg shadow-lg backdrop-blur-sm">
            <Eye className="w-4 h-4 animate-pulse" />
            <span className="text-sm font-medium">Analyzing...</span>
          </div>
        )}
      </div>

      {/* Keyboard shortcuts help */}
      <div className="absolute bottom-4 left-4 bg-black/60 text-white p-3 rounded-lg backdrop-blur-sm text-xs z-30">
        <div className="font-medium mb-1">Interactive Controls:</div>
        <div>Ctrl+Tab: Switch interaction mode</div>
        <div>Ctrl+Shift+C: Manual capture</div>
        <div>Ctrl+T: Toggle chat widget</div>
        <div className="mt-1 text-green-300">
          Current: <strong>{interactionMode}</strong> - Background fully interactive
        </div>
      </div>

      {/* Floating chat widget - CRITICAL: This floats above everything */}
      <FloatingChatWidget
        isVisible={showChatWidget}
        onClose={() => setShowChatWidget(false)}
        currentScreenData={currentScreenData}
        onQuerySubmit={onQuerySubmit}
      />
    </div>
  );
};