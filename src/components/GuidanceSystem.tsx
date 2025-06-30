import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, Bot, User, Mic, MicOff, Volume2, VolumeX, Minimize2, Maximize2, Camera, AlertTriangle, Sparkles } from 'lucide-react';
import { useVoice } from '../hooks/useVoice';
import { chatGPTService } from '../services/chatgpt';

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

interface GuidanceSystemProps {
  onQuerySubmit?: (query: string) => void;
  isCompact?: boolean;
  onScreenCapture?: () => void;
  currentScreenData?: string | null;
}

export const GuidanceSystem: React.FC<GuidanceSystemProps> = ({ 
  onQuerySubmit, 
  isCompact = false,
  onScreenCapture,
  currentScreenData
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      content: "Hi! I'm your enhanced Cord AI assistant powered by ChatGPT 4o-mini with advanced multimodal capabilities. I can analyze your screen with exceptional detail, extract text with high accuracy, and provide precise step-by-step guidance.\n\n🤖 **Enhanced Features:**\n• **ChatGPT 4o-mini Vision** - Advanced visual understanding\n• **High-Accuracy OCR** - Perfect text extraction\n• **UI Element Detection** - Precise element targeting\n• **Multi-language Support** - Global accessibility\n• **Context-Aware Guidance** - Smart workflow understanding\n\nShare your screen and tell me what you'd like to accomplish:\n• \"Help me create a poster in Canva\"\n• \"Guide me through setting up my email\"\n• \"Show me how to edit this document\"\n• \"Find all the buttons on this page\"",
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const {
    isSupported,
    isSpeaking,
    isListening,
    transcript,
    settings,
    setSettings,
    speak,
    startListening,
    stopListening,
    clearTranscript
  } = useVoice();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isProcessing) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    onQuerySubmit?.(inputValue);
    setIsProcessing(true);

    try {
      let aiResponse: string;

      // If we have current screen data and the user is asking for screen analysis
      if (currentScreenData && (
        inputValue.toLowerCase().includes('screen') ||
        inputValue.toLowerCase().includes('see') ||
        inputValue.toLowerCase().includes('analyze') ||
        inputValue.toLowerCase().includes('help') ||
        inputValue.toLowerCase().includes('guide') ||
        inputValue.toLowerCase().includes('find') ||
        inputValue.toLowerCase().includes('detect')
      )) {
        // Use enhanced analysis with ChatGPT 4o-mini, OCR and UI detection
        const ocrText = await chatGPTService.extractOCRText(currentScreenData);
        aiResponse = await chatGPTService.analyzeScreenWithVision(currentScreenData, inputValue, ocrText);
      } else {
        // Continue conversation without screen analysis
        const conversationHistory = messages.map(msg => ({
          role: msg.type === 'user' ? 'user' as const : 'assistant' as const,
          content: msg.content
        }));
        
        aiResponse = await chatGPTService.continueConversation(conversationHistory, inputValue);
      }

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: aiResponse,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
      
      if (settings.enabled) {
        speak(aiResponse);
      }
    } catch (error) {
      let errorMessage = 'I apologize, but I encountered an error processing your request with ChatGPT 4o-mini. Please try again or capture a new screen frame for analysis.';
      
      if (error instanceof Error) {
        if (error.message.includes('quota') || error.message.includes('limit')) {
          errorMessage = 'I\'ve reached the API usage limit for ChatGPT 4o-mini. Please try again in a few moments or check your API quota.';
        } else if (error.message.includes('safety')) {
          errorMessage = 'The content was filtered by ChatGPT\'s safety systems. Please try rephrasing your request.';
        }
      }

      const aiErrorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: errorMessage,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiErrorMessage]);
    } finally {
      setIsProcessing(false);
    }

    setInputValue('');
  };

  const handleScreenAnalysis = async () => {
    if (!currentScreenData) {
      const message: Message = {
        id: Date.now().toString(),
        type: 'ai',
        content: 'Please capture your screen first so I can analyze what you\'re working on with ChatGPT 4o-mini\'s advanced vision capabilities and enhanced OCR.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, message]);
      return;
    }

    setIsProcessing(true);
    
    try {
      // Get OCR text first with ChatGPT
      const ocrText = await chatGPTService.extractOCRText(currentScreenData);
      
      const aiResponse = await chatGPTService.analyzeScreenWithVision(
        currentScreenData, 
        'Please analyze my current screen with ChatGPT 4o-mini\'s advanced vision, enhanced OCR, and UI detection. Provide detailed step-by-step guidance for what I should do next.',
        ocrText
      );

      const aiMessage: Message = {
        id: Date.now().toString(),
        type: 'ai',
        content: aiResponse,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
      
      if (settings.enabled) {
        speak(aiResponse);
      }
    } catch (error) {
      let errorMessage = 'I encountered an error analyzing your screen with ChatGPT 4o-mini. Please try capturing a new frame.';
      
      if (error instanceof Error) {
        if (error.message.includes('quota') || error.message.includes('limit')) {
          errorMessage = 'Analysis failed due to API usage limits. Please try again in a few moments.';
        }
      }

      const aiErrorMessage: Message = {
        id: Date.now().toString(),
        type: 'ai',
        content: errorMessage,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiErrorMessage]);
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleVoiceInput = () => {
    if (isListening) {
      stopListening();
      if (transcript) {
        setInputValue(transcript);
        clearTranscript();
      }
    } else {
      startListening();
    }
  };

  const toggleVoiceOutput = () => {
    setSettings(prev => ({ ...prev, enabled: !prev.enabled }));
  };

  if (isMinimized) {
    return (
      <div className="glass-effect-bw rounded-xl p-4 shadow-lg animate-fade-in border border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-400" />
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-lg font-semibold text-white">ChatGPT 4o-mini AI Chat</h2>
            {messages.length > 1 && (
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-ping" />
            )}
          </div>
          <button
            onClick={() => setIsMinimized(false)}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <Maximize2 className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header - only show if not compact */}
      {!isCompact && (
        <div className="flex items-center justify-between mb-4 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-400 animate-pulse" />
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">ChatGPT 4o-mini AI Chat</h2>
              <p className="text-xs text-blue-300">Enhanced multimodal analysis</p>
            </div>
            {(isSpeaking || isProcessing) && (
              <div className="flex items-center gap-1">
                <div className="w-1 h-3 bg-blue-400 rounded-full animate-pulse" />
                <div className="w-1 h-2 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '0.1s' }} />
                <div className="w-1 h-4 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {currentScreenData && (
              <button
                onClick={handleScreenAnalysis}
                disabled={isProcessing}
                className="p-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-lg transition-all duration-300 hover:scale-105 disabled:opacity-50"
                title="ChatGPT 4o-mini enhanced screen analysis"
              >
                <Camera className="w-4 h-4" />
              </button>
            )}
            
            {isSupported && (
              <button
                onClick={toggleVoiceOutput}
                className={`p-2 rounded-lg transition-all duration-300 hover:scale-105 ${
                  settings.enabled 
                    ? 'bg-white text-black shadow-lg' 
                    : 'bg-white/20 text-white'
                }`}
                title="Toggle voice output"
              >
                {settings.enabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>
            )}
            
            {isCompact && (
              <button
                onClick={() => setIsMinimized(true)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                title="Minimize chat"
              >
                <Minimize2 className="w-4 h-4 text-white" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Messages - with enhanced scrollbar */}
      <div className="flex-1 overflow-hidden min-h-0">
        <div className="h-full overflow-y-auto custom-scrollbar space-y-4 pr-2">
          {messages.map((message, index) => (
            <div
              key={message.id}
              className={`flex gap-3 animate-slide-in-up ${message.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg ${
                message.type === 'ai' ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white' : 'bg-blue-600 text-white'
              }`}>
                {message.type === 'ai' ? <Sparkles className="w-4 h-4" /> : <User className="w-4 h-4" />}
              </div>
              <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 ${
                message.type === 'user' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gradient-to-r from-gray-800/90 to-gray-700/90 text-white border border-blue-500/20 backdrop-blur-sm'
              }`}>
                <div className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</div>
                <span className="text-xs opacity-70 mt-2 block">
                  {message.timestamp.toLocaleTimeString()}
                </span>
              </div>
            </div>
          ))}
          
          {(isSpeaking || isProcessing) && (
            <div className="flex items-center gap-2 text-white text-sm animate-pulse">
              {isProcessing ? (
                <>
                  <Sparkles className="w-4 h-4 text-blue-400" />
                  <span>ChatGPT 4o-mini is analyzing...</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-4 h-4" />
                  <span>AI is speaking...</span>
                </>
              )}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input - enhanced styling */}
      <div className="flex-shrink-0 mt-4">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <div className="flex-1 relative">
            <input
              type="text"
              value={isListening ? transcript : inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={isListening ? "Listening..." : "Ask ChatGPT 4o-mini anything or request enhanced screen analysis..."}
              className="w-full px-4 py-3 bg-gray-800/80 border border-blue-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all hover:bg-gray-800/90 backdrop-blur-sm"
              disabled={isProcessing}
            />
            {isListening && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-ping" />
              </div>
            )}
          </div>
          
          {isSupported && (
            <button
              type="button"
              onClick={toggleVoiceInput}
              disabled={isProcessing}
              className={`p-3 rounded-lg transition-all duration-300 hover:scale-105 shadow-lg disabled:opacity-50 ${
                isListening 
                  ? 'bg-red-500 hover:bg-red-600 text-white' 
                  : 'bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm'
              }`}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
          )}
          
          <button
            type="submit"
            disabled={(!inputValue.trim() && !transcript) || isProcessing}
            className="p-3 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 disabled:hover:scale-100 animate-button-glow"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
        
        <div className="mt-2 text-xs text-gray-400 text-center">
          🤖 Powered by ChatGPT 4o-mini • Enhanced OCR • UI Detection • Multimodal Analysis
        </div>
      </div>
    </div>
  );
};