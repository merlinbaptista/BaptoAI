import React from 'react';
import { Brain, Target, Lightbulb, Loader2, Zap, AlertCircle, RefreshCw, Eye, MousePointer, Type, Sparkles } from 'lucide-react';
import { AIAnalysis } from '../types';

interface EnhancedAnalysisPanelProps {
  analysis: AIAnalysis | null;
  isAnalyzing: boolean;
  error?: string | null;
  ocrText?: string;
  uiElements?: any[];
  onExecuteAction?: () => void;
  onRetry?: () => void;
}

export const EnhancedAnalysisPanel: React.FC<EnhancedAnalysisPanelProps> = ({
  analysis,
  isAnalyzing,
  error,
  ocrText,
  uiElements,
  onExecuteAction,
  onRetry
}) => {
  return (
    <div className="glass-effect-bw rounded-xl p-6 shadow-lg animate-fade-in border border-white/10">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-blue-400 animate-pulse" />
          <Brain className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-white">ChatGPT 4o-mini Analysis</h2>
          <p className="text-xs text-blue-300">Enhanced multimodal AI</p>
        </div>
        {isAnalyzing && <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />}
      </div>

      {error ? (
        <div className="space-y-4">
          <div className="flex items-center gap-2 p-3 bg-red-900/20 border border-red-500/30 rounded-lg animate-slide-in-up">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <span className="text-red-300 text-sm">{error}</span>
          </div>
          {onRetry && (
            <button
              onClick={onRetry}
              className="w-full px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again with ChatGPT
            </button>
          )}
        </div>
      ) : isAnalyzing ? (
        <div className="space-y-4">
          <div className="animate-pulse">
            <div className="h-4 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded w-1/2"></div>
          </div>
          <div className="text-center py-8">
            <div className="relative">
              <Sparkles className="w-8 h-8 text-blue-400 animate-spin mx-auto mb-3" />
              <div className="absolute inset-0 w-8 h-8 mx-auto">
                <div className="w-full h-full border-2 border-blue-400/30 rounded-full animate-ping"></div>
              </div>
            </div>
            <p className="text-gray-400">ChatGPT 4o-mini is analyzing your screen...</p>
            <div className="flex items-center justify-center gap-4 mt-3 text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <Eye className="w-3 h-3" />
                <span>Advanced Vision</span>
              </div>
              <div className="flex items-center gap-1">
                <Type className="w-3 h-3" />
                <span>Enhanced OCR</span>
              </div>
              <div className="flex items-center gap-1">
                <MousePointer className="w-3 h-3" />
                <span>UI Detection</span>
              </div>
            </div>
          </div>
        </div>
      ) : analysis ? (
        <div className="space-y-6 animate-slide-in-up">
          {/* Analysis Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-gradient-to-r from-blue-900/20 to-cyan-900/20 rounded-lg p-3 text-center border border-blue-500/20">
              <div className="text-lg font-bold text-white">{analysis.elements.length}</div>
              <div className="text-xs text-blue-300">UI Elements</div>
            </div>
            <div className="bg-gradient-to-r from-blue-900/20 to-cyan-900/20 rounded-lg p-3 text-center border border-blue-500/20">
              <div className="text-lg font-bold text-white">{ocrText?.split(' ').length || 0}</div>
              <div className="text-xs text-blue-300">Words Found</div>
            </div>
            <div className="bg-gradient-to-r from-blue-900/20 to-cyan-900/20 rounded-lg p-3 text-center border border-blue-500/20">
              <div className="text-lg font-bold text-white">{analysis.mouseContext?.recentClicks.length || 0}</div>
              <div className="text-xs text-blue-300">Recent Clicks</div>
            </div>
          </div>

          {/* Current Task */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Target className="w-4 h-4 text-white" />
              <h3 className="font-medium text-white">Current Task</h3>
            </div>
            <p className="text-gray-300 bg-gradient-to-r from-blue-900/10 to-cyan-900/10 p-3 rounded-lg border border-blue-500/20">
              {analysis.currentTask}
            </p>
          </div>

          {/* AI Guidance */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb className="w-4 h-4 text-white" />
              <h3 className="font-medium text-white">ChatGPT 4o-mini Guidance</h3>
            </div>
            <div className="space-y-3">
              {analysis.suggestions.map((suggestion, index) => (
                <div key={index} className="bg-gradient-to-r from-blue-900/10 to-cyan-900/10 p-4 rounded-lg border border-blue-500/20 animate-slide-in-left" style={{ animationDelay: `${index * 0.1}s` }}>
                  <div className="text-gray-300 whitespace-pre-wrap leading-relaxed">
                    {suggestion}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Detected Elements Summary */}
          {uiElements && uiElements.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <MousePointer className="w-4 h-4 text-white" />
                <h3 className="font-medium text-white">Detected UI Elements</h3>
              </div>
              <div className="bg-gradient-to-r from-blue-900/10 to-cyan-900/10 p-3 rounded-lg border border-blue-500/20 max-h-32 overflow-y-auto">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {Object.entries(
                    uiElements.reduce((acc, element) => {
                      acc[element.class] = (acc[element.class] || 0) + 1;
                      return acc;
                    }, {} as Record<string, number>)
                  ).map(([className, count]) => (
                    <div key={className} className="flex justify-between text-gray-300">
                      <span className="capitalize">{className.replace('-', ' ')}</span>
                      <span className="text-blue-400">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* OCR Text Preview */}
          {ocrText && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Type className="w-4 h-4 text-white" />
                <h3 className="font-medium text-white">ChatGPT OCR Text</h3>
              </div>
              <div className="bg-gradient-to-r from-blue-900/10 to-cyan-900/10 p-3 rounded-lg border border-blue-500/20 max-h-32 overflow-y-auto">
                <p className="text-gray-300 text-sm whitespace-pre-wrap">
                  {ocrText.length > 200 ? `${ocrText.substring(0, 200)}...` : ocrText}
                </p>
              </div>
            </div>
          )}

          {/* Next Action */}
          {analysis.nextAction && (
            <div className="animate-slide-in-up">
              <div className="flex items-center gap-2 mb-3">
                <Zap className="w-4 h-4 text-white" />
                <h3 className="font-medium text-white">Next Step</h3>
              </div>
              <div className="bg-gradient-to-r from-blue-900/10 to-cyan-900/10 p-4 rounded-lg border border-blue-500/20">
                <p className="text-gray-300 mb-3">{analysis.nextAction.description}</p>
                {onExecuteAction && (
                  <button
                    onClick={onExecuteAction}
                    className="w-full px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-lg transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:scale-105 animate-button-glow"
                  >
                    <Zap className="w-4 h-4" />
                    Continue with ChatGPT
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500 animate-fade-in">
          <div className="relative mb-3">
            <Sparkles className="w-12 h-12 mx-auto opacity-50 animate-float text-blue-400" />
            <div className="absolute inset-0 w-12 h-12 mx-auto">
              <div className="w-full h-full border-2 border-blue-400/20 rounded-full animate-ping"></div>
            </div>
          </div>
          <p className="mb-2">Ready for ChatGPT 4o-mini enhanced screen analysis</p>
          <p className="text-sm text-gray-600">Capture a screen frame to get intelligent guidance with advanced multimodal AI</p>
        </div>
      )}
    </div>
  );
};