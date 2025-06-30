import React from 'react';
import { Wifi, Brain, Mic, Volume2, Cpu, Activity } from 'lucide-react';

interface StatusBarProps {
  isCapturing: boolean;
  isAnalyzing: boolean;
  isListening: boolean;
  isSpeaking: boolean;
}

export const StatusBar: React.FC<StatusBarProps> = ({
  isCapturing,
  isAnalyzing,
  isListening,
  isSpeaking
}) => {
  return (
    <div className="bg-white/5 backdrop-blur-sm border-t border-white/10 p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Wifi className={`w-4 h-4 transition-colors duration-300 ${isCapturing ? 'text-green-400' : 'text-gray-500'}`} />
            <span className={`text-sm transition-colors duration-300 ${isCapturing ? 'text-green-300' : 'text-gray-500'}`}>
              {isCapturing ? 'Connected' : 'Disconnected'}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <Brain className={`w-4 h-4 transition-colors duration-300 ${isAnalyzing ? 'text-purple-400 animate-pulse' : 'text-gray-500'}`} />
            <span className={`text-sm transition-colors duration-300 ${isAnalyzing ? 'text-purple-300' : 'text-gray-500'}`}>
              {isAnalyzing ? 'Analyzing' : 'Idle'}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <Mic className={`w-4 h-4 transition-colors duration-300 ${isListening ? 'text-red-400 animate-pulse' : 'text-gray-500'}`} />
            <span className={`text-sm transition-colors duration-300 ${isListening ? 'text-red-300' : 'text-gray-500'}`}>
              {isListening ? 'Listening' : 'Microphone'}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <Volume2 className={`w-4 h-4 transition-colors duration-300 ${isSpeaking ? 'text-blue-400 animate-pulse' : 'text-gray-500'}`} />
            <span className={`text-sm transition-colors duration-300 ${isSpeaking ? 'text-blue-300' : 'text-gray-500'}`}>
              {isSpeaking ? 'Speaking' : 'Audio'}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-green-400" />
            <span className="text-sm text-gray-400">System Active</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-blue-400" />
            <span className="text-sm text-gray-400">AI Ready</span>
          </div>
        </div>
      </div>
    </div>
  );
};