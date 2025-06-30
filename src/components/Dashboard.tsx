import React, { useState } from 'react';
import { Shield, Zap, LogOut, User, Settings, Layout, Maximize2, Minimize2, Monitor, Sparkles, Target } from 'lucide-react';
import { ScreenCapture } from './ScreenCapture';
import { InteractiveScreenShare } from './InteractiveScreenShare';
import { ScreenInteractionManager } from './ScreenInteractionManager';
import { EnhancedAnalysisPanel } from './EnhancedAnalysisPanel';
import { GuidanceSystem } from './GuidanceSystem';
import { StepByStepGuidance } from './StepByStepGuidance';
import { StatusBar } from './StatusBar';
import { useEnhancedAnalysis } from '../hooks/useEnhancedAnalysis';
import { useVoice } from '../hooks/useVoice';
import { User as UserType } from '../types';

interface DashboardProps {
  user: UserType;
  onSignOut: () => void;
}

type LayoutMode = 'default' | 'split-horizontal' | 'split-vertical' | 'interactive-share';
type ChatPosition = 'left' | 'right' | 'top' | 'bottom';

export const Dashboard: React.FC<DashboardProps> = ({ user, onSignOut }) => {
  const [currentQuery, setCurrentQuery] = useState<string>('');
  const [currentScreenData, setCurrentScreenData] = useState<string | null>(null);
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  const [stepByStepMode, setStepByStepMode] = useState(false);
  const [userGoal, setUserGoal] = useState<string>('');
  const [interactionTracking, setInteractionTracking] = useState(false);
  const { 
    analysis, 
    isAnalyzing, 
    error, 
    ocrText, 
    uiElements, 
    analyzeScreen, 
    clearError,
    startMouseTracking,
    stopMouseTracking
  } = useEnhancedAnalysis();
  const { isSpeaking, isListening, speak } = useVoice();
  const [isCapturing, setIsCapturing] = useState(false);
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('split-horizontal');
  const [chatPosition, setChatPosition] = useState<ChatPosition>('right');
  const [splitRatio, setSplitRatio] = useState(50);
  const [isResizing, setIsResizing] = useState(false);

  // Start mouse tracking when component mounts
  React.useEffect(() => {
    startMouseTracking();
    return () => stopMouseTracking();
  }, [startMouseTracking, stopMouseTracking]);

  const handleFrameCapture = async (imageData: string) => {
    if (imageData) {
      setCurrentScreenData(imageData);
      setIsCapturing(true);
      
      // Auto-analyze if there's a current query, otherwise just store the frame
      if (currentQuery && !stepByStepMode) {
        await analyzeScreen(imageData, currentQuery);
      }
      
      setIsCapturing(false);
    }
  };

  const handleQuerySubmit = (query: string) => {
    setCurrentQuery(query);
    
    // Check if this is a request for step-by-step guidance
    if (query.toLowerCase().includes('step by step') || 
        query.toLowerCase().includes('guide me through') ||
        query.toLowerCase().includes('walk me through')) {
      setUserGoal(query);
      setStepByStepMode(true);
      speak("Starting step-by-step guidance mode with ChatGPT 4o-mini. I'll analyze your screen and break down the task into sequential steps.");
    } else if (currentScreenData) {
      // Regular analysis
      analyzeScreen(currentScreenData, query);
    }
  };

  const handleExecuteAction = () => {
    if (analysis?.nextAction) {
      speak(`Executing action with ChatGPT 4o-mini: ${analysis.nextAction.description}`);
      setTimeout(() => {
        speak("Action completed successfully! Capture a new frame to continue with enhanced ChatGPT analysis.");
      }, 1500);
    }
  };

  const handleRetryAnalysis = () => {
    clearError();
    if (currentScreenData) {
      analyzeScreen(currentScreenData, currentQuery);
    }
  };

  const handleInteractiveScreenShare = () => {
    setLayoutMode('interactive-share');
    setInteractionTracking(true);
  };

  const handleStreamReady = (stream: MediaStream) => {
    setScreenStream(stream);
    if (layoutMode !== 'interactive-share') {
      setLayoutMode('interactive-share');
    }
  };

  const handleStepByStepComplete = () => {
    setStepByStepMode(false);
    setUserGoal('');
    speak("Congratulations! You've completed all the steps successfully with ChatGPT 4o-mini guidance. Great job!");
  };

  const handleInteractionCapture = (interactionData: any) => {
    // Process interaction data for enhanced analysis
    console.log('Interaction captured:', interactionData);
    
    // Trigger analysis on significant interactions
    if (interactionData.type === 'click' && currentScreenData) {
      setTimeout(() => {
        analyzeScreen(currentScreenData, `I noticed you clicked at position (${interactionData.position.x}, ${interactionData.position.y}). Let me analyze what happened and provide guidance.`);
      }, 1000);
    }
  };

  const toggleLayoutMode = () => {
    if (layoutMode === 'default') {
      setLayoutMode('split-horizontal');
    } else if (layoutMode === 'split-horizontal') {
      setLayoutMode('split-vertical');
    } else if (layoutMode === 'split-vertical') {
      setLayoutMode('default');
    }
    // Don't cycle through interactive-share mode via this button
  };

  const exitInteractiveMode = () => {
    setLayoutMode('split-horizontal');
    setScreenStream(null);
    setInteractionTracking(false);
  };

  const toggleChatPosition = () => {
    if (layoutMode === 'split-horizontal') {
      setChatPosition(chatPosition === 'left' ? 'right' : 'left');
    } else if (layoutMode === 'split-vertical') {
      setChatPosition(chatPosition === 'top' ? 'bottom' : 'top');
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsResizing(true);
    e.preventDefault();
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isResizing) return;
    
    const container = document.getElementById('main-container');
    if (!container) return;
    
    const rect = container.getBoundingClientRect();
    
    if (layoutMode === 'split-horizontal') {
      const newRatio = ((e.clientX - rect.left) / rect.width) * 100;
      setSplitRatio(Math.max(20, Math.min(80, newRatio)));
    } else if (layoutMode === 'split-vertical') {
      const newRatio = ((e.clientY - rect.top) / rect.height) * 100;
      setSplitRatio(Math.max(20, Math.min(80, newRatio)));
    }
  };

  const handleMouseUp = () => {
    setIsResizing(false);
  };

  React.useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isResizing, layoutMode]);

  // Interactive screen share mode - full screen with interaction tracking
  if (layoutMode === 'interactive-share') {
    return (
      <ScreenInteractionManager
        isActive={interactionTracking}
        onInteractionCapture={handleInteractionCapture}
      >
        <div className="h-screen bg-black">
          <InteractiveScreenShare
            stream={screenStream}
            onFrameCapture={handleFrameCapture}
            onQuerySubmit={handleQuerySubmit}
            currentScreenData={currentScreenData}
          />
          
          {/* Exit interactive mode button */}
          <button
            onClick={exitInteractiveMode}
            className="fixed top-4 left-4 z-50 px-4 py-2 bg-red-600/80 hover:bg-red-600 text-white rounded-lg transition-all duration-300 flex items-center gap-2 shadow-lg backdrop-blur-sm"
          >
            <Monitor className="w-4 h-4" />
            Exit Interactive Mode
          </button>
        </div>
      </ScreenInteractionManager>
    );
  }

  const renderSplitLayout = () => {
    const screenCapturePanel = (
      <div className="h-full flex flex-col split-panel">
        <div className="flex-1">
          <ScreenCapture 
            onFrameCapture={handleFrameCapture}
            onStreamReady={handleStreamReady}
            onScreenShareStart={handleInteractiveScreenShare}
          />
        </div>
        <div className="mt-4 flex-shrink-0">
          {stepByStepMode ? (
            <StepByStepGuidance
              currentScreenData={currentScreenData}
              onScreenCapture={() => handleFrameCapture(currentScreenData || '')}
              userGoal={userGoal}
              isActive={stepByStepMode}
              onComplete={handleStepByStepComplete}
            />
          ) : (
            <EnhancedAnalysisPanel
              analysis={analysis}
              isAnalyzing={isAnalyzing}
              error={error}
              ocrText={ocrText}
              uiElements={uiElements}
              onExecuteAction={handleExecuteAction}
              onRetry={handleRetryAnalysis}
            />
          )}
        </div>
      </div>
    );

    const chatPanel = (
      <div className="h-full split-panel">
        <GuidanceSystem 
          onQuerySubmit={handleQuerySubmit}
          isCompact={true}
          currentScreenData={currentScreenData}
        />
      </div>
    );

    if (layoutMode === 'split-horizontal') {
      const leftPanel = chatPosition === 'left' ? chatPanel : screenCapturePanel;
      const rightPanel = chatPosition === 'left' ? screenCapturePanel : chatPanel;
      
      return (
        <div id="main-container" className="flex h-full relative">
          <div 
            className="overflow-hidden transition-all duration-300"
            style={{ width: `${chatPosition === 'left' ? splitRatio : 100 - splitRatio}%` }}
          >
            {leftPanel}
          </div>
          
          <div
            className="w-1 bg-white/20 hover:bg-white/40 cursor-col-resize transition-colors duration-200 relative group"
            onMouseDown={handleMouseDown}
          >
            <div className="absolute inset-y-0 -left-1 -right-1 group-hover:bg-white/10" />
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3 h-8 bg-white/30 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          
          <div 
            className="overflow-hidden transition-all duration-300"
            style={{ width: `${chatPosition === 'left' ? 100 - splitRatio : splitRatio}%` }}
          >
            {rightPanel}
          </div>
        </div>
      );
    } else if (layoutMode === 'split-vertical') {
      const topPanel = chatPosition === 'top' ? chatPanel : screenCapturePanel;
      const bottomPanel = chatPosition === 'top' ? screenCapturePanel : chatPanel;
      
      return (
        <div id="main-container" className="flex flex-col h-full relative">
          <div 
            className="overflow-hidden transition-all duration-300"
            style={{ height: `${chatPosition === 'top' ? splitRatio : 100 - splitRatio}%` }}
          >
            {topPanel}
          </div>
          
          <div
            className="h-1 bg-white/20 hover:bg-white/40 cursor-row-resize transition-colors duration-200 relative group"
            onMouseDown={handleMouseDown}
          >
            <div className="absolute inset-x-0 -top-1 -bottom-1 group-hover:bg-white/10" />
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-3 bg-white/30 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          
          <div 
            className="overflow-hidden transition-all duration-300"
            style={{ height: `${chatPosition === 'top' ? 100 - splitRatio : splitRatio}%` }}
          >
            {bottomPanel}
          </div>
        </div>
      );
    }
  };

  const renderDefaultLayout = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
      <div className="lg:col-span-2 animate-slide-in-left">
        <ScreenCapture 
          onFrameCapture={handleFrameCapture}
          onStreamReady={handleStreamReady}
          onScreenShareStart={handleInteractiveScreenShare}
        />
      </div>
      
      <div className="animate-slide-in-right">
        {stepByStepMode ? (
          <StepByStepGuidance
            currentScreenData={currentScreenData}
            onScreenCapture={() => handleFrameCapture(currentScreenData || '')}
            userGoal={userGoal}
            isActive={stepByStepMode}
            onComplete={handleStepByStepComplete}
          />
        ) : (
          <EnhancedAnalysisPanel
            analysis={analysis}
            isAnalyzing={isAnalyzing}
            error={error}
            ocrText={ocrText}
            uiElements={uiElements}
            onExecuteAction={handleExecuteAction}
            onRetry={handleRetryAnalysis}
          />
        )}
      </div>
      
      <div className="lg:col-span-3 h-96 animate-slide-in-up">
        <GuidanceSystem 
          onQuerySubmit={handleQuerySubmit}
          currentScreenData={currentScreenData}
        />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Header */}
      <header className="bg-white/5 backdrop-blur-sm border-b border-white/10 p-4 shadow-sm flex-shrink-0">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3 animate-slide-in-left">
            <div className="relative animate-logo-glow">
              <img 
                src="/Untitled design (7).png" 
                alt="Bapto AI Logo"
                className="w-12 h-12 object-contain rounded-xl shadow-lg"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-white animate-text-glow">Bapto AI</h1>
                <div className="flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-blue-600/20 to-cyan-600/20 border border-blue-500/30 rounded-full">
                  <Sparkles className="w-3 h-3 text-blue-400" />
                  <span className="text-xs text-blue-300 font-medium">ChatGPT 4o-mini</span>
                </div>
                {stepByStepMode && (
                  <div className="flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-blue-600/20 to-cyan-600/20 border border-blue-500/30 rounded-full">
                    <Target className="w-3 h-3 text-blue-400" />
                    <span className="text-xs text-blue-300 font-medium">Step-by-Step</span>
                  </div>
                )}
                {interactionTracking && (
                  <div className="flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-full">
                    <Target className="w-3 h-3 text-purple-400" />
                    <span className="text-xs text-purple-300 font-medium">Interactive</span>
                  </div>
                )}
              </div>
              <p className="text-sm text-gray-400">Enhanced multimodal AI-powered screen guidance with real-time interaction</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 animate-slide-in-right">
            {/* Layout Controls */}
            <div className="flex items-center gap-2 px-3 py-1 bg-blue-900/20 border border-blue-500/30 rounded-full">
              <button
                onClick={toggleLayoutMode}
                className="p-1 hover:bg-white/10 rounded transition-colors"
                title="Toggle layout mode"
              >
                <Layout className="w-4 h-4 text-blue-400" />
              </button>
              {layoutMode !== 'default' && layoutMode !== 'interactive-share' && (
                <button
                  onClick={toggleChatPosition}
                  className="p-1 hover:bg-white/10 rounded transition-colors"
                  title="Switch chat position"
                >
                  {layoutMode === 'split-horizontal' ? (
                    chatPosition === 'left' ? <Minimize2 className="w-4 h-4 text-blue-400" /> : <Maximize2 className="w-4 h-4 text-blue-400" />
                  ) : (
                    chatPosition === 'top' ? <Minimize2 className="w-4 h-4 text-blue-400" /> : <Maximize2 className="w-4 h-4 text-blue-400" />
                  )}
                </button>
              )}
              <span className="text-sm text-blue-300 capitalize">
                {layoutMode === 'default' ? 'Standard' : 
                 layoutMode === 'interactive-share' ? 'Interactive' :
                 layoutMode.replace('-', ' ')}
              </span>
            </div>

            <div className="flex items-center gap-2 px-3 py-1 bg-green-900/20 border border-green-500/30 rounded-full">
              <Shield className="w-4 h-4 text-green-400" />
              <span className="text-sm text-green-300">Secure</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-blue-900/20 to-cyan-900/20 border border-blue-500/30 rounded-full">
              <Sparkles className="w-4 h-4 text-blue-400" />
              <span className="text-sm text-blue-300">ChatGPT 4o-mini</span>
            </div>
            
            {/* User Menu */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full">
                <div className="w-6 h-6 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-bold">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm text-white">{user.name}</span>
              </div>
              
              <div className="flex gap-2">
                <button className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all duration-300 hover:scale-105">
                  <Settings className="w-4 h-4 text-white" />
                </button>
                <button 
                  onClick={onSignOut}
                  className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all duration-300 hover:scale-105"
                >
                  <LogOut className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto p-6 w-full overflow-hidden">
        <div className="h-full">
          {layoutMode === 'default' ? renderDefaultLayout() : renderSplitLayout()}
        </div>
      </main>

      {/* Status Bar */}
      <StatusBar
        isCapturing={isCapturing}
        isAnalyzing={isAnalyzing}
        isListening={isListening}
        isSpeaking={isSpeaking}
      />
    </div>
  );
};