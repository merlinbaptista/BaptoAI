import React, { useRef, useEffect, useState } from 'react';
import { Monitor, Maximize2, Minimize2, Camera, MessageSquare, Brain, Zap, Settings } from 'lucide-react';
import { FloatingChatOverlay } from './FloatingChatOverlay';

interface ScreenShareViewerProps {
  stream: MediaStream | null;
  onFrameCapture?: (imageData: string) => void;
  onQuerySubmit?: (query: string) => void;
  currentScreenData?: string | null;
}

export const ScreenShareViewer: React.FC<ScreenShareViewerProps> = ({
  stream,
  onFrameCapture,
  onQuerySubmit,
  currentScreenData
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showChatOverlay, setShowChatOverlay] = useState(true);
  const [isCapturing, setIsCapturing] = useState(false);
  const [autoAnalysisEnabled, setAutoAnalysisEnabled] = useState(true);
  const [analysisInterval, setAnalysisInterval] = useState<NodeJS.Timeout | null>(null);
  const [lastAnalysisTime, setLastAnalysisTime] = useState<number>(0);
  const [analysisCount, setAnalysisCount] = useState(0);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      videoRef.current.play();
      
      // Start automatic analysis when video is ready
      videoRef.current.onloadeddata = () => {
        if (autoAnalysisEnabled) {
          startAutoAnalysis();
        }
      };
    }

    return () => {
      if (analysisInterval) {
        clearInterval(analysisInterval);
      }
    };
  }, [stream, autoAnalysisEnabled]);

  const startAutoAnalysis = () => {
    console.log('Starting automatic screen analysis...');
    
    // Initial analysis after 3 seconds to let the screen settle
    setTimeout(() => {
      captureAndAnalyze('Welcome! I can see your screen now. Let me analyze what\'s currently displayed and provide enhanced guidance with ChatGPT 4o-mini.');
    }, 3000);

    // Set up periodic analysis every 15 seconds
    const interval = setInterval(() => {
      const now = Date.now();
      // Only analyze if it's been at least 12 seconds since last analysis
      if (now - lastAnalysisTime > 12000) {
        captureAndAnalyze('Let me check what\'s changed on your screen and provide updated guidance with ChatGPT 4o-mini enhanced analysis.');
      }
    }, 15000);

    setAnalysisInterval(interval);
  };

  const stopAutoAnalysis = () => {
    if (analysisInterval) {
      clearInterval(analysisInterval);
      setAnalysisInterval(null);
      console.log('Automatic analysis stopped');
    }
  };

  const captureAndAnalyze = async (message?: string) => {
    if (!videoRef.current || !onFrameCapture || !onQuerySubmit) return;

    setIsCapturing(true);
    setLastAnalysisTime(Date.now());
    setAnalysisCount(prev => prev + 1);
    
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      ctx.drawImage(videoRef.current, 0, 0);
      
      const imageData = canvas.toDataURL('image/jpeg', 0.8);
      
      console.log('Captured frame for analysis #', analysisCount + 1);
      
      // Capture the frame
      onFrameCapture(imageData);
      
      // Submit analysis query
      if (message) {
        onQuerySubmit(message);
      }
    } catch (error) {
      console.error('Error capturing and analyzing frame:', error);
    } finally {
      setTimeout(() => setIsCapturing(false), 2000); // Keep indicator visible for 2 seconds
    }
  };

  const captureFrame = async () => {
    await captureAndAnalyze('Please analyze my current screen with ChatGPT 4o-mini enhanced analysis, then provide detailed step-by-step guidance.');
  };

  const toggleAutoAnalysis = () => {
    setAutoAnalysisEnabled(!autoAnalysisEnabled);
    if (!autoAnalysisEnabled) {
      startAutoAnalysis();
    } else {
      stopAutoAnalysis();
    }
  };

  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      await document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && isFullscreen) {
      setIsFullscreen(false);
    }
    if (e.key === 'c' && e.ctrlKey) {
      e.preventDefault();
      captureFrame();
    }
    if (e.key === 't' && e.ctrlKey) {
      e.preventDefault();
      setShowChatOverlay(!showChatOverlay);
    }
    if (e.key === 'a' && e.ctrlKey) {
      e.preventDefault();
      toggleAutoAnalysis();
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [isFullscreen, showChatOverlay, autoAnalysisEnabled]);

  if (!stream) {
    return (
      <div className="h-screen bg-black flex items-center justify-center">
        <div className="text-center text-white">
          <Monitor className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <h2 className="text-2xl font-bold mb-2">No Screen Share Active</h2>
          <p className="text-gray-400">Start screen sharing to see your display here</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-screen bg-black overflow-hidden">
      {/* Main video display */}
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        autoPlay
        muted
        playsInline
      />

      {/* Control overlay */}
      <div className="absolute top-4 right-4 flex gap-2 z-40">
        <button
          onClick={toggleAutoAnalysis}
          className={`px-4 py-2 rounded-lg transition-all duration-300 flex items-center gap-2 shadow-lg backdrop-blur-sm ${
            autoAnalysisEnabled 
              ? 'bg-green-600/80 hover:bg-green-600 text-white' 
              : 'bg-gray-600/80 hover:bg-gray-600 text-white'
          }`}
          title="Toggle automatic enhanced analysis (Ctrl+A)"
        >
          <Brain className="w-4 h-4" />
          {autoAnalysisEnabled ? 'ChatGPT Auto ON' : 'ChatGPT Auto OFF'}
        </button>

        <button
          onClick={captureFrame}
          disabled={isCapturing}
          className={`px-4 py-2 bg-blue-600/80 hover:bg-blue-600 text-white rounded-lg transition-all duration-300 flex items-center gap-2 shadow-lg backdrop-blur-sm ${
            isCapturing ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'
          }`}
          title="Manual enhanced analysis (Ctrl+C)"
        >
          <Camera className="w-4 h-4" />
          {isCapturing ? 'Analyzing...' : 'ChatGPT Analysis'}
        </button>

        <button
          onClick={() => setShowChatOverlay(!showChatOverlay)}
          className={`px-4 py-2 rounded-lg transition-all duration-300 flex items-center gap-2 shadow-lg backdrop-blur-sm ${
            showChatOverlay 
              ? 'bg-blue-600/80 hover:bg-blue-600 text-white' 
              : 'bg-white/20 hover:bg-white/30 text-white'
          }`}
          title="Toggle chat overlay (Ctrl+T)"
        >
          <MessageSquare className="w-4 h-4" />
          {showChatOverlay ? 'Hide Chat' : 'Show Chat'}
        </button>

        <button
          onClick={toggleFullscreen}
          className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-all duration-300 flex items-center gap-2 shadow-lg backdrop-blur-sm hover:scale-105"
          title="Toggle fullscreen"
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
        </button>
      </div>

      {/* Status indicators */}
      <div className="absolute top-4 left-4 space-y-2">
        {/* Live indicator */}
        <div className="flex items-center gap-2 px-3 py-2 bg-red-600/80 text-white rounded-lg shadow-lg backdrop-blur-sm">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
          <span className="text-sm font-medium">Live Screen Share</span>
        </div>

        {/* Enhanced analysis indicator */}
        {autoAnalysisEnabled && (
          <div className="flex items-center gap-2 px-3 py-2 bg-green-600/80 text-white rounded-lg shadow-lg backdrop-blur-sm animate-slide-in-up">
            <Brain className="w-3 h-3" />
            <span className="text-sm font-medium">ChatGPT Auto Analysis</span>
            <span className="text-xs bg-white/20 px-1 rounded">{analysisCount}</span>
          </div>
        )}

        {/* Analysis in progress indicator */}
        {isCapturing && (
          <div className="flex items-center gap-2 px-3 py-2 bg-blue-600/80 text-white rounded-lg shadow-lg backdrop-blur-sm animate-slide-in-up">
            <Zap className="w-3 h-3 animate-spin" />
            <span className="text-sm font-medium">ChatGPT Analysis...</span>
          </div>
        )}

        {/* API Status indicators */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 px-2 py-1 bg-purple-600/60 text-white rounded text-xs backdrop-blur-sm">
            <div className="w-1.5 h-1.5 bg-green-400 rounded-full" />
            <span>ChatGPT 4o-mini</span>
          </div>
        </div>
      </div>

      {/* Keyboard shortcuts help */}
      <div className="absolute bottom-4 left-4 bg-black/50 text-white p-3 rounded-lg backdrop-blur-sm text-xs">
        <div className="font-medium mb-1">Enhanced Controls:</div>
        <div>Ctrl+C: ChatGPT Analysis</div>
        <div>Ctrl+T: Toggle Chat</div>
        <div>Ctrl+A: Toggle Auto Analysis</div>
        <div>F11: Fullscreen</div>
      </div>

      {/* Welcome message overlay (shows briefly when starting) */}
      {autoAnalysisEnabled && analysisCount === 0 && (
        <div className="absolute bottom-4 right-4 max-w-sm bg-green-900/80 text-green-100 p-4 rounded-lg shadow-lg backdrop-blur-sm animate-slide-in-up">
          <div className="flex items-center gap-2 mb-2">
            <Brain className="w-4 h-4" />
            <span className="font-medium">ChatGPT 4o-mini Analysis Started</span>
          </div>
          <p className="text-sm">
            I'm now automatically analyzing your screen with ChatGPT 4o-mini for enhanced guidance and precise analysis.
          </p>
        </div>
      )}

      {/* Floating chat overlay */}
      <FloatingChatOverlay
        isVisible={showChatOverlay}
        onClose={() => setShowChatOverlay(false)}
        currentScreenData={currentScreenData}
        onQuerySubmit={onQuerySubmit}
      />
    </div>
  );
};