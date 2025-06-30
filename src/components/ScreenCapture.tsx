import React, { useEffect } from 'react';
import { Monitor, Play, Square, AlertCircle, ExternalLink, TestTube, Sparkles, Layers } from 'lucide-react';
import { useScreenCapture } from '../hooks/useScreenCapture';

interface ScreenCaptureProps {
  onFrameCapture?: (imageData: string) => void;
  onStreamReady?: (stream: MediaStream) => void;
  onScreenShareStart?: () => void;
}

export const ScreenCapture: React.FC<ScreenCaptureProps> = ({ 
  onFrameCapture, 
  onStreamReady,
  onScreenShareStart 
}) => {
  const { isCapturing, error, videoRef, startCapture, stopCapture, captureFrame, stream } = useScreenCapture();

  const handleStartCapture = async () => {
    console.log('🎬 Starting screen capture...');
    const captureStream = await startCapture();
    if (captureStream && onStreamReady) {
      console.log('✅ Screen capture stream ready');
      onStreamReady(captureStream);
    }
  };

  const handleCaptureFrame = async () => {
    console.log('📸 Capturing frame for enhanced AI analysis...');
    const frame = await captureFrame();
    if (frame) {
      console.log('✅ Frame captured, sending to enhanced analysis pipeline...');
      onFrameCapture?.(frame);
    } else {
      console.error('❌ Failed to capture frame');
    }
  };

  const handleInteractiveMode = () => {
    console.log('🖥️ Switching to interactive screen share mode...');
    if (onScreenShareStart) {
      onScreenShareStart();
    }
  };

  return (
    <div className="glass-effect-bw rounded-xl p-6 shadow-lg animate-fade-in border border-white/10">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Monitor className="w-5 h-5 text-white" />
          <div>
            <h2 className="text-lg font-semibold text-white">Enhanced Screen Capture</h2>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-gray-400">ChatGPT 4o-mini:</span>
                <span className="text-green-400">✅ Ready</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-400">Interactive Mode:</span>
                <span className="text-blue-400">✅ Available</span>
              </div>
            </div>
          </div>
          {isCapturing && (
            <div className="flex items-center gap-2 animate-slide-in-left">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-ping" />
              <span className="text-sm text-red-400">Live</span>
            </div>
          )}
        </div>
        
        <div className="flex gap-2">
          {!isCapturing ? (
            <>
              <button
                onClick={handleStartCapture}
                className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-100 text-black rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 animate-button-glow"
              >
                <Play className="w-4 h-4" />
                Start Capture
              </button>
              
              <button
                onClick={handleInteractiveMode}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
              >
                <Layers className="w-4 h-4" />
                Interactive Mode
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleCaptureFrame}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
              >
                🤖 ChatGPT Analysis
              </button>
              <button
                onClick={handleInteractiveMode}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
              >
                <Layers className="w-4 h-4" />
                Interactive
              </button>
              <button
                onClick={stopCapture}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
              >
                <Square className="w-4 h-4" />
                Stop
              </button>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 mb-4 p-3 bg-red-900/20 border border-red-500/30 rounded-lg animate-slide-in-up">
          <AlertCircle className="w-4 h-4 text-red-400" />
          <span className="text-red-300 text-sm">{error}</span>
        </div>
      )}

      <div className="flex items-center gap-2 mb-4 p-3 bg-green-900/20 border border-green-500/30 rounded-lg animate-slide-in-up">
        <Sparkles className="w-4 h-4 text-green-400" />
        <span className="text-green-300 text-sm">
          🤖 Enhanced AI pipeline ready! ChatGPT 4o-mini for maximum accuracy and real-time interaction support.
        </span>
      </div>

      <div className="relative bg-gray-900 rounded-lg overflow-hidden shadow-inner border border-white/10" style={{ minHeight: '300px' }}>
        {isCapturing ? (
          <video
            ref={videoRef}
            className="w-full h-full object-contain animate-fade-in"
            autoPlay
            muted
            playsInline
          />
        ) : (
          <div className="flex items-center justify-center h-64 text-gray-500 animate-fade-in">
            <div className="text-center">
              <Monitor className="w-12 h-12 mx-auto mb-3 opacity-50 animate-float" />
              <p className="mb-2">Ready for Enhanced AI Screen Analysis</p>
              <div className="space-y-2 text-sm">
                <p><strong>Start Capture:</strong> Preview and analyze in this window</p>
                <p><strong>Interactive Mode:</strong> Full-screen with real-time interaction tracking</p>
                <div className="flex items-center justify-center gap-4 mt-4">
                  <div className="flex items-center gap-1 text-blue-400">
                    <Sparkles className="w-3 h-3" />
                    <span className="text-xs">ChatGPT 4o-mini</span>
                  </div>
                  <div className="flex items-center gap-1 text-purple-400">
                    <Layers className="w-3 h-3" />
                    <span className="text-xs">Interactive Layer</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};