import React, { useEffect, useState } from 'react';
import { Monitor, Play, Square, AlertCircle, Sparkles, Layers, Brain, Zap } from 'lucide-react';
import { useScreenCapture } from '../hooks/useScreenCapture';
import { AutoScreenAnalyzer } from './AutoScreenAnalyzer';
import { chatGPTService } from '../services/chatgpt';

interface EnhancedScreenCaptureProps {
  onFrameCapture?: (imageData: string) => void;
  onStreamReady?: (stream: MediaStream) => void;
  onScreenShareStart?: () => void;
  onAnalysisResult?: (analysis: string) => void;
}

export const EnhancedScreenCapture: React.FC<EnhancedScreenCaptureProps> = ({ 
  onFrameCapture, 
  onStreamReady,
  onScreenShareStart,
  onAnalysisResult 
}) => {
  const { isCapturing, error, videoRef, startCapture, stopCapture, captureFrame, stream } = useScreenCapture();
  const [autoAnalysisEnabled, setAutoAnalysisEnabled] = useState(true);
  const [apiStatus, setApiStatus] = useState<'checking' | 'connected' | 'error'>('checking');

  // Test ChatGPT API on component mount
  useEffect(() => {
    const testAPI = async () => {
      try {
        const isConnected = await chatGPTService.testConnection();
        setApiStatus(isConnected ? 'connected' : 'error');
      } catch (error) {
        setApiStatus('error');
      }
    };
    testAPI();
  }, []);

  const handleStartCapture = async () => {
    console.log('🎬 Starting enhanced screen capture with auto-analysis...');
    const captureStream = await startCapture();
    if (captureStream && onStreamReady) {
      console.log('✅ Screen capture stream ready, enabling auto-analysis');
      onStreamReady(captureStream);
    }
  };

  const handleCaptureFrame = async () => {
    console.log('📸 Manual frame capture for ChatGPT analysis...');
    const frame = await captureFrame();
    if (frame) {
      console.log('✅ Frame captured, sending to ChatGPT...');
      onFrameCapture?.(frame);
      
      // Also trigger immediate analysis
      try {
        const analysis = await chatGPTService.analyzeScreenWithVision(
          frame,
          'Please analyze this screen capture and provide helpful guidance on what I can do next.'
        );
        onAnalysisResult?.(analysis);
      } catch (error) {
        console.error('Manual analysis failed:', error);
      }
    }
  };

  const handleAnalysisResult = (analysis: string) => {
    console.log('🤖 Auto-analysis result received:', analysis.substring(0, 100) + '...');
    onAnalysisResult?.(analysis);
  };

  return (
    <div className="space-y-4">
      {/* Main Screen Capture Panel */}
      <div className="glass-effect-bw rounded-xl p-6 shadow-lg animate-fade-in border border-white/10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Monitor className="w-5 h-5 text-white" />
            <div>
              <h2 className="text-lg font-semibold text-white">Enhanced Screen Capture</h2>
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-gray-400">ChatGPT API:</span>
                  <span className={`${
                    apiStatus === 'connected' ? 'text-green-400' : 
                    apiStatus === 'error' ? 'text-red-400' : 'text-yellow-400'
                  }`}>
                    {apiStatus === 'connected' ? '✅ Ready' : 
                     apiStatus === 'error' ? '❌ Error' : '🔄 Checking...'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-400">Auto-Analysis:</span>
                  <span className={autoAnalysisEnabled ? 'text-green-400' : 'text-gray-400'}>
                    {autoAnalysisEnabled ? '✅ Enabled' : '⏸️ Disabled'}
                  </span>
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
                  disabled={apiStatus === 'error'}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 disabled:from-gray-600 disabled:to-gray-600 text-white rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 disabled:cursor-not-allowed"
                >
                  <Play className="w-4 h-4" />
                  Start Auto-Analysis
                </button>
                
                <button
                  onClick={onScreenShareStart}
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
                  <Brain className="w-4 h-4 mr-2" />
                  Manual Analysis
                </button>
                
                <button
                  onClick={() => setAutoAnalysisEnabled(!autoAnalysisEnabled)}
                  className={`px-4 py-2 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 ${
                    autoAnalysisEnabled 
                      ? 'bg-green-600 hover:bg-green-700 text-white' 
                      : 'bg-gray-600 hover:bg-gray-700 text-white'
                  }`}
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Auto: {autoAnalysisEnabled ? 'ON' : 'OFF'}
                </button>
                
                <button
                  onClick={onScreenShareStart}
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

        {apiStatus === 'connected' && (
          <div className="flex items-center gap-2 mb-4 p-3 bg-green-900/20 border border-green-500/30 rounded-lg animate-slide-in-up">
            <Sparkles className="w-4 h-4 text-green-400" />
            <span className="text-green-300 text-sm">
              🤖 ChatGPT 4o-mini ready for automatic screen analysis and real-time guidance!
            </span>
          </div>
        )}

        {apiStatus === 'error' && (
          <div className="flex items-center gap-2 mb-4 p-3 bg-red-900/20 border border-red-500/30 rounded-lg animate-slide-in-up">
            <AlertCircle className="w-4 h-4 text-red-400" />
            <span className="text-red-300 text-sm">
              ❌ ChatGPT API connection failed. Please check your API key in the environment variables.
            </span>
          </div>
        )}

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
                <p className="mb-2">Ready for ChatGPT-Powered Screen Analysis</p>
                <div className="space-y-2 text-sm">
                  <p><strong>Auto-Analysis:</strong> Continuous ChatGPT guidance every 10 seconds</p>
                  <p><strong>Manual Analysis:</strong> Instant ChatGPT analysis on demand</p>
                  <p><strong>Interactive Mode:</strong> Full-screen with real-time tracking</p>
                  <div className="flex items-center justify-center gap-4 mt-4">
                    <div className="flex items-center gap-1 text-blue-400">
                      <Sparkles className="w-3 h-3" />
                      <span className="text-xs">ChatGPT 4o-mini</span>
                    </div>
                    <div className="flex items-center gap-1 text-green-400">
                      <Brain className="w-3 h-3" />
                      <span className="text-xs">Auto-Analysis</span>
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

      {/* Auto Screen Analyzer Component */}
      <AutoScreenAnalyzer
        stream={stream}
        isActive={isCapturing && autoAnalysisEnabled && apiStatus === 'connected'}
        onAnalysisResult={handleAnalysisResult}
        analysisInterval={10}
      />
    </div>
  );
};