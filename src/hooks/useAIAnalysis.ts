import { useState, useCallback } from 'react';
import { AIAnalysis, ScreenElement } from '../types';
import { openAIService } from '../services/openai';

export const useAIAnalysis = () => {
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyzeScreen = useCallback(async (imageData: string, query?: string): Promise<AIAnalysis | null> => {
    setIsAnalyzing(true);
    setError(null);
    
    try {
      // Get AI analysis from OpenAI
      const aiResponse = await openAIService.analyzeScreenWithVision(imageData, query);
      
      // Create analysis object
      const result: AIAnalysis = {
        elements: [], // We'll focus on the AI guidance rather than element detection for now
        currentTask: query || 'Analyzing screen content...',
        suggestions: [aiResponse],
        nextAction: {
          type: 'wait',
          description: 'Follow the AI guidance above, then capture another frame for continued assistance.'
        }
      };

      setAnalysis(result);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to analyze screen';
      setError(errorMessage);
      console.error('Screen analysis error:', err);
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    analysis,
    isAnalyzing,
    error,
    analyzeScreen,
    setAnalysis,
    clearError
  };
};