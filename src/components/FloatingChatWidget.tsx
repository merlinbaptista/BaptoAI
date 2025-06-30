import React, { useState, useRef, useEffect, useCallback } from 'react';
import { MessageSquare, Move, Minimize2, Maximize2, X, Settings, Brain, Zap, Mic, Send } from 'lucide-react';
import { useVoice } from '../hooks/useVoice';
import { chatGPTService } from '../services/chatgpt';

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

interface FloatingChatWidgetProps {
  isVisible: boolean;
  onClose: () => void;
  currentScreenData?: string | null;
  onQuerySubmit?: (query: string) => void;
}

export const FloatingChatWidget: React.FC<FloatingChatWidgetProps> = ({
  isVisible,
  onClose,
  currentScreenData,
  onQuerySubmit
}) => {
  const [position, setPosition] = useState({ x: 20, y: 20 });
  const [size, setSize] = useState({ width: 380, height: 600 });
  const [isMinimized, setIsMinimized] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      content: "Hi! I'm your floating AI assistant. I can see your screen and help you with any task while you continue working normally in the background. Just ask me anything!",
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  
  const widgetRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { isSupported, isListening, startListening, stopListening, transcript, clearTranscript } = useVoice();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle dragging
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget || (e.target as HTMLElement).classList.contains('drag-handle')) {
      setIsDragging(true);
      const rect = widgetRef.current?.getBoundingClientRect();
      if (rect) {
        setDragOffset({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        });
      }
      e.preventDefault();
      e.stopPropagation();
    }
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isDragging) {
      const newX = Math.max(0, Math.min(window.innerWidth - size.width, e.clientX - dragOffset.x));
      const newY = Math.max(0, Math.min(window.innerHeight - size.height, e.clientY - dragOffset.y));
      setPosition({ x: newX, y: newY });
    } else if (isResizing) {
      const deltaX = e.clientX - resizeStart.x;
      const deltaY = e.clientY - resizeStart.y;
      
      const newWidth = Math.max(320, Math.min(window.innerWidth - position.x, resizeStart.width + deltaX));
      const newHeight = Math.max(400, Math.min(window.innerHeight - position.y, resizeStart.height + deltaY));
      
      setSize({ width: newWidth, height: newHeight });
    }
  }, [isDragging, isResizing, dragOffset, size, resizeStart, position]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setIsResizing(false);
  }, []);

  const handleResizeStart = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsResizing(true);
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: size.width,
      height: size.height
    });
  }, [size]);

  // Set up mouse event listeners
  useEffect(() => {
    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isResizing, handleMouseMove, handleMouseUp]);

  // Handle window resize
  useEffect(() => {
    const handleWindowResize = () => {
      setPosition(prev => ({
        x: Math.min(prev.x, window.innerWidth - size.width),
        y: Math.min(prev.y, window.innerHeight - size.height)
      }));
    };

    window.addEventListener('resize', handleWindowResize);
    return () => window.removeEventListener('resize', handleWindowResize);
  }, [size]);

  // Handle message submission
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

      if (currentScreenData && (
        inputValue.toLowerCase().includes('screen') ||
        inputValue.toLowerCase().includes('see') ||
        inputValue.toLowerCase().includes('analyze') ||
        inputValue.toLowerCase().includes('help') ||
        inputValue.toLowerCase().includes('guide')
      )) {
        const ocrText = await chatGPTService.extractOCRText(currentScreenData);
        aiResponse = await chatGPTService.analyzeScreenWithVision(currentScreenData, inputValue, ocrText);
      } else {
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
    } catch (error) {
      const aiErrorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: 'I apologize, but I encountered an error. Please try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiErrorMessage]);
    } finally {
      setIsProcessing(false);
    }

    setInputValue('');
  };

  // Handle voice input
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

  if (!isVisible) return null;

  return (
    <>
      {/* CRITICAL: Transparent backdrop that doesn't block clicks */}
      <div 
        className="fixed inset-0 z-40"
        style={{ 
          pointerEvents: 'none', // This ensures background remains fully interactive
          backgroundColor: 'transparent' 
        }}
      />

      {/* Floating chat widget */}
      <div
        ref={widgetRef}
        className={`fixed z-50 transition-all duration-300 ${
          isDragging ? 'cursor-grabbing' : 'cursor-default'
        } ${isMinimized ? 'h-auto' : ''}`}
        style={{
          left: position.x,
          top: position.y,
          width: isMinimized ? 'auto' : size.width,
          height: isMinimized ? 'auto' : size.height,
          minWidth: isMinimized ? 'auto' : 320,
          minHeight: isMinimized ? 'auto' : 400,
          maxWidth: '90vw',
          maxHeight: '90vh',
          pointerEvents: 'auto' // Only the widget itself blocks clicks
        }}
        onMouseDown={handleMouseDown}
      >
        {/* Widget container with enhanced glass effect */}
        <div className="w-full h-full bg-gray-900/95 backdrop-blur-xl rounded-xl shadow-2xl border border-white/30 overflow-hidden">
          {/* Header with drag handle */}
          <div 
            className="drag-handle flex items-center justify-between p-3 border-b border-white/20 cursor-grab active:cursor-grabbing bg-gray-800/80 backdrop-blur-sm"
            onMouseDown={handleMouseDown}
          >
            <div className="flex items-center gap-2">
              <div className="relative">
                <Brain className="w-4 h-4 text-blue-400" />
                {isProcessing && (
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-400 rounded-full animate-ping" />
                )}
              </div>
              <span className="text-sm font-medium text-white">
                AI Assistant
                {isProcessing && <span className="text-blue-300 ml-2">(Thinking...)</span>}
              </span>
              <Move className="w-3 h-3 text-gray-400" />
            </div>
            
            <div className="flex items-center gap-1">
              {currentScreenData && (
                <div className="flex items-center gap-1 px-2 py-1 bg-green-600/30 border border-green-500/50 rounded text-xs text-green-200">
                  <Zap className="w-3 h-3" />
                  <span>Screen Active</span>
                </div>
              )}
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsMinimized(!isMinimized);
                }}
                className="p-1 hover:bg-white/20 rounded transition-colors"
                title={isMinimized ? 'Maximize' : 'Minimize'}
              >
                {isMinimized ? (
                  <Maximize2 className="w-3 h-3 text-white" />
                ) : (
                  <Minimize2 className="w-3 h-3 text-white" />
                )}
              </button>
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onClose();
                }}
                className="p-1 hover:bg-red-500/30 hover:text-red-300 rounded transition-colors"
                title="Close"
              >
                <X className="w-3 h-3 text-white" />
              </button>
            </div>
          </div>

          {/* Chat content */}
          {!isMinimized && (
            <div className="flex flex-col" style={{ height: size.height - 60 }}>
              {/* Messages area */}
              <div className="flex-1 overflow-hidden">
                <div className="h-full p-3 overflow-y-auto custom-scrollbar space-y-3">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex gap-2 ${message.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                    >
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                        message.type === 'ai' ? 'bg-blue-600' : 'bg-gray-600'
                      }`}>
                        {message.type === 'ai' ? <Brain className="w-3 h-3 text-white" /> : <MessageSquare className="w-3 h-3 text-white" />}
                      </div>
                      <div className={`max-w-[80%] px-3 py-2 rounded-lg ${
                        message.type === 'user' 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-gray-700 text-white'
                      }`}>
                        <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                        <div className="text-xs opacity-70 mt-1">
                          {message.timestamp.toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {isProcessing && (
                    <div className="flex items-center gap-2 text-blue-400 text-sm">
                      <Brain className="w-4 h-4 animate-pulse" />
                      <span>AI is thinking...</span>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </div>
              
              {/* Input area */}
              <div className="flex-shrink-0 p-3 border-t border-white/20 bg-gray-800/60">
                <form onSubmit={handleSubmit} className="flex gap-2">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={isListening ? transcript : inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder={isListening ? "Listening..." : "Ask me anything..."}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 text-sm"
                      disabled={isProcessing}
                    />
                    {isListening && (
                      <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-ping" />
                      </div>
                    )}
                  </div>
                  
                  {isSupported && (
                    <button
                      type="button"
                      onClick={toggleVoiceInput}
                      disabled={isProcessing}
                      className={`p-2 rounded-lg transition-all duration-300 ${
                        isListening 
                          ? 'bg-red-500 hover:bg-red-600 text-white' 
                          : 'bg-gray-600 hover:bg-gray-500 text-white'
                      }`}
                    >
                      <Mic className="w-4 h-4" />
                    </button>
                  )}
                  
                  <button
                    type="submit"
                    disabled={(!inputValue.trim() && !transcript) || isProcessing}
                    className="p-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-all duration-300"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
                
                <div className="mt-2 text-xs text-gray-400 text-center">
                  🤖 Floating AI Assistant • Drag to move • Resize from corner
                </div>
              </div>
            </div>
          )}

          {/* Resize handle */}
          {!isMinimized && (
            <div
              className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize opacity-60 hover:opacity-100 transition-opacity group"
              onMouseDown={handleResizeStart}
            >
              <div className="w-full h-full relative">
                <div className="absolute bottom-1 right-1 w-3 h-0.5 bg-white/40 group-hover:bg-white/60 transition-colors" />
                <div className="absolute bottom-2 right-1 w-2 h-0.5 bg-white/40 group-hover:bg-white/60 transition-colors" />
                <div className="absolute bottom-3 right-1 w-1 h-0.5 bg-white/40 group-hover:bg-white/60 transition-colors" />
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};