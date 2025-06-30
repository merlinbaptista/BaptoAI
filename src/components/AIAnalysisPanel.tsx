import React from 'react';
import { Brain, Target, Lightbulb, Loader2, Zap, AlertCircle, RefreshCw } from 'lucide-react';
import { AIAnalysis } from '../types';

interface AIAnalysisPanelProps {
  analysis: AIAnalysis | null;
  isAnalyzing: boolean;
  error?: string | null;
  onExecuteAction?: () => void;
  onRetry?: () => void;
}

export const AIAnalysisPanel: React.FC<AIAnalysisPanelProps> = ({
  analysis,
  isAnalyzing,
  error,
  onExecuteAction,
  onRetry
}) => {
  return (
    <div className="glass-effect-bw rounded-xl p-6 shadow-lg animate-fade-in border border-white/10">
      <div className="flex items-center gap-3 mb-6">
        <Brain className="w-5 h-5 text-white" />
        <h2 className="text-lg font-semibold text-white">AI Screen Analysis</h2>
        {isAnalyzing && <Loader2 className="w-4 h-4 text-white animate-spin" />}
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
              Try Again
            </button>
          )}
        </div>
      ) : isAnalyzing ? (
        <div className="space-y-4">
          <div className="animate-pulse">
            <div className="h-4 bg-white/20 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-white/20 rounded w-1/2"></div>
          </div>
          <div className="text-center py-8">
            <Loader2 className="w-8 h-8 text-white animate-spin mx-auto mb-3" />
            <p className="text-gray-400">AI is analyzing your screen...</p>
            <p className="text-gray-500 text-sm mt-1">This may take a few seconds</p>
          </div>
        </div>
      ) : analysis ? (
        <div className="space-y-6 animate-slide-in-up">
          {/* Current Task */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Target className="w-4 h-4 text-white" />
              <h3 className="font-medium text-white">Current Task</h3>
            </div>
            <p className="text-gray-300 bg-white/5 p-3 rounded-lg border border-white/10">
              {analysis.currentTask}
            </p>
          </div>

          {/* AI Guidance */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb className="w-4 h-4 text-white" />
              <h3 className="font-medium text-white">AI Guidance</h3>
            </div>
            <div className="space-y-3">
              {analysis.suggestions.map((suggestion, index) => (
                <div key={index} className="bg-white/5 p-4 rounded-lg border border-white/10 animate-slide-in-left" style={{ animationDelay: `${index * 0.1}s` }}>
                  <div className="text-gray-300 whitespace-pre-wrap leading-relaxed">
                    {suggestion}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Next Action */}
          {analysis.nextAction && (
            <div className="animate-slide-in-up">
              <div className="flex items-center gap-2 mb-3">
                <Zap className="w-4 h-4 text-white" />
                <h3 className="font-medium text-white">Next Step</h3>
              </div>
              <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                <p className="text-gray-300 mb-3">{analysis.nextAction.description}</p>
                {onExecuteAction && (
                  <button
                    onClick={onExecuteAction}
                    className="w-full px-4 py-2 bg-white hover:bg-gray-100 text-black rounded-lg transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:scale-105 animate-button-glow"
                  >
                    <Zap className="w-4 h-4" />
                    Continue Analysis
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500 animate-fade-in">
          <Brain className="w-12 h-12 mx-auto mb-3 opacity-50 animate-float" />
          <p className="mb-2">Ready for AI-powered screen analysis</p>
          <p className="text-sm text-gray-600">Capture a screen frame to get intelligent step-by-step guidance</p>
        </div>
      )}
    </div>
  );
};