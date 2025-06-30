import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Brain, Camera, Pause, Play, Settings, Zap, Eye, AlertCircle } from 'lucide-react';
import { chatGPTService } from '../services/chatgpt';
import { useVoice } from '../hooks/useVoice';

interface AutoScreenAnalyzerProps {
  stream: MediaStream | null;
  isActive: boolean;
  onAnalysisResult?: (analysis: string) => void;
  analysisInterval?: number; // in seconds
}

export const AutoScreenAnalyzer: React.FC<AutoScreenAnalyzerProps> = ({
  stream,
  isActive,
  onAnalysisResult,
  analysisInterval = 10
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [analysisCount, setAnalysisCount] = useState(0);
  const [lastAnalysis, setLastAnalysis] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [settings, setSettings] = useState({
    interval: analysisInterval,
    autoSpeak: true,
    detailedAnalysis: true
  });

  const { speak, isSpeaking } = useVoice();

  // Initialize video stream
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      videoRef.current.play();
    }
  }, [stream]);

  // Auto-analysis loop
  useEffect(() => {
    if (isActive && !isPaused && stream && videoRef.current) {
      startAutoAnalysis();
    } else {
      stopAutoAnalysis();
    }

    return () => stopAutoAnalysis();
  }, [isActive, isPaused, stream, settings.interval]);

  const captureScreenFrame = useCallback(async (): Promise<string | null> => {
    if (!videoRef.current || !canvasRef.current) return null;

    try {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return null;

      // Set canvas dimensions to match video
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;

      // Draw current video frame to canvas
      ctx.drawImage(videoRef.current, 0, 0);

      // Convert to base64 image data
      return canvas.toDataURL('image/jpeg', 0.8);
    } catch (error) {
      console.error('Error capturing screen frame:', error);
      return null;
    }
  }, []);

  const analyzeCurrentScreen = useCallback(async () => {
    if (isAnalyzing) return;

    setIsAnalyzing(true);
    setError(null);

    try {
      const imageData = await captureScreenFrame();
      if (!imageData) {
        throw new Error('Failed to capture screen frame');
      }

      console.log('🤖 Starting automatic ChatGPT screen analysis...');

      // Create context-aware prompt based on analysis count
      let analysisPrompt = '';
      if (analysisCount === 0) {
        analysisPrompt = 'I can see your screen now. Let me analyze what\'s currently displayed and provide helpful guidance on what you can do next.';
      } else {
        analysisPrompt = `This is analysis #${analysisCount + 1}. Let me check what\'s changed on your screen and provide updated guidance. Focus on any new elements, changes, or opportunities for the next steps.`;
      }

      if (settings.detailedAnalysis) {
        analysisPrompt += ' Please provide detailed, step-by-step guidance and identify specific UI elements I can interact with.';
      }

      // Get enhanced analysis from ChatGPT
      const analysis = await chatGPTService.analyzeScreenWithVision(
        imageData,
        analysisPrompt
      );

      setLastAnalysis(analysis);
      setAnalysisCount(prev => prev + 1);

      // Notify parent component
      onAnalysisResult?.(analysis);

      // Speak the analysis if enabled
      if (settings.autoSpeak && !isSpeaking) {
        // Create a shorter version for speech
        const speechText = analysis.length > 200 
          ? analysis.substring(0, 200) + '... Check the chat for full details.'
          : analysis;
        speak(speechText);
      }

      console.log('✅ Automatic screen analysis completed');

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Analysis failed';
      setError(errorMessage);
      console.error('❌ Automatic screen analysis error:', error);
    } finally {
      setIsAnalyzing(false);
    }
  }, [captureScreenFrame, isAnalyzing, analysisCount, settings, onAnalysisResult, speak, isSpeaking]);

  const startAutoAnalysis = useCallback(() => {
    if (intervalRef.current) return;

    // Initial analysis after 3 seconds
    setTimeout(() => {
      if (isActive && !isPaused) {
        analyzeCurrentScreen();
      }
    }, 3000);

    // Set up recurring analysis
    intervalRef.current = setInterval(() => {
      if (isActive && !isPaused) {
        analyzeCurrentScreen();
      }
    }, settings.interval * 1000);

    console.log(`🔄 Auto-analysis started with ${settings.interval}s interval`);
  }, [analyzeCurrentScreen, isActive, isPaused, settings.interval]);

  const stopAutoAnalysis = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
      console.log('⏹️ Auto-analysis stopped');
    }
  }, []);

  const togglePause = () => {
    setIsPaused(!isPaused);
  };

  const manualAnalysis = () => {
    if (!isAnalyzing) {
      analyzeCurrentScreen();
    }
  };

  if (!isActive || !stream) {
    return null;
  }

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
      {/* Hidden video and canvas elements */}
      <video
        ref={videoRef}
        className="hidden"
        autoPlay
        muted
        playsInline
      />
      <canvas ref={canvasRef} className="hidden" />

      {/* Control Panel */}
      <div className="bg-black/90 backdrop-blur-sm rounded-lg p-4 shadow-lg border border-white/20 min-w-96">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Brain className={`w-5 h-5 ${isAnalyzing ? 'text-blue-400 animate-pulse' : 'text-white'}`} />
              <span className="text-white font-medium">ChatGPT Auto-Analysis</span>
            </div>
            {isAnalyzing && (
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-ping" />
                <span className="text-blue-300 text-sm">Analyzing...</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={manualAnalysis}
              disabled={isAnalyzing}
              className="p-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-lg transition-all duration-300 disabled:opacity-50"
              title="Manual analysis"
            >
              <Camera className="w-4 h-4" />
            </button>

            <button
              onClick={togglePause}
              className={`p-2 rounded-lg transition-all duration-300 ${
                isPaused 
                  ? 'bg-green-600/20 hover:bg-green-600/30 text-green-400' 
                  : 'bg-yellow-600/20 hover:bg-yellow-600/30 text-yellow-400'
              }`}
              title={isPaused ? 'Resume auto-analysis' : 'Pause auto-analysis'}
            >
              {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Status Information */}
        <div className="grid grid-cols-3 gap-4 mb-3">
          <div className="text-center">
            <div className="text-lg font-bold text-white">{analysisCount}</div>
            <div className="text-xs text-gray-400">Analyses</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-white">{settings.interval}s</div>
            <div className="text-xs text-gray-400">Interval</div>
          </div>
          <div className="text-center">
            <div className={`text-lg font-bold ${isPaused ? 'text-yellow-400' : 'text-green-400'}`}>
              {isPaused ? 'Paused' : 'Active'}
            </div>
            <div className="text-xs text-gray-400">Status</div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="flex items-center gap-2 p-2 bg-red-900/20 border border-red-500/30 rounded-lg mb-3">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <span className="text-red-300 text-sm">{error}</span>
          </div>
        )}

        {/* Settings */}
        <div className="border-t border-white/20 pt-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-300">Auto-speak results</span>
            <button
              onClick={() => setSettings(prev => ({ ...prev, autoSpeak: !prev.autoSpeak }))}
              className={`w-10 h-5 rounded-full transition-all duration-300 ${
                settings.autoSpeak ? 'bg-blue-600' : 'bg-gray-600'
              }`}
            >
              <div className={`w-4 h-4 bg-white rounded-full transition-all duration-300 ${
                settings.autoSpeak ? 'translate-x-5' : 'translate-x-0.5'
              }`} />
            </button>
          </div>

          <div className="flex items-center justify-between text-sm mt-2">
            <span className="text-gray-300">Detailed analysis</span>
            <button
              onClick={() => setSettings(prev => ({ ...prev, detailedAnalysis: !prev.detailedAnalysis }))}
              className={`w-10 h-5 rounded-full transition-all duration-300 ${
                settings.detailedAnalysis ? 'bg-blue-600' : 'bg-gray-600'
              }`}
            >
              <div className={`w-4 h-4 bg-white rounded-full transition-all duration-300 ${
                settings.detailedAnalysis ? 'translate-x-5' : 'translate-x-0.5'
              }`} />
            </button>
          </div>

          <div className="flex items-center justify-between text-sm mt-2">
            <span className="text-gray-300">Interval (seconds)</span>
            <select
              value={settings.interval}
              onChange={(e) => setSettings(prev => ({ ...prev, interval: Number(e.target.value) }))}
              className="bg-gray-700 text-white text-xs rounded px-2 py-1 border border-gray-600"
            >
              <option value={5}>5s</option>
              <option value={10}>10s</option>
              <option value={15}>15s</option>
              <option value={30}>30s</option>
              <option value={60}>60s</option>
            </select>
          </div>
        </div>

        {/* Last Analysis Preview */}
        {lastAnalysis && (
          <div className="border-t border-white/20 pt-3 mt-3">
            <div className="text-xs text-gray-400 mb-1">Latest Analysis:</div>
            <div className="text-sm text-gray-300 max-h-20 overflow-y-auto custom-scrollbar">
              {lastAnalysis.length > 150 
                ? lastAnalysis.substring(0, 150) + '...' 
                : lastAnalysis}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};