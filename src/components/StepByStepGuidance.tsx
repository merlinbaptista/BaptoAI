import React, { useState, useEffect } from 'react';
import { CheckCircle, Circle, ArrowRight, RefreshCw, Eye, Sparkles, AlertCircle, Play, Pause } from 'lucide-react';
import { chatGPTService } from '../services/chatgpt';

interface Step {
  id: string;
  description: string;
  instruction: string;
  completed: boolean;
  verified: boolean;
  targetElement?: string;
  expectedChange?: string;
}

interface StepByStepGuidanceProps {
  currentScreenData: string | null;
  onScreenCapture: () => void;
  userGoal: string;
  isActive: boolean;
  onComplete: () => void;
}

export const StepByStepGuidance: React.FC<StepByStepGuidanceProps> = ({
  currentScreenData,
  onScreenCapture,
  userGoal,
  isActive,
  onComplete
}) => {
  const [steps, setSteps] = useState<Step[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [lastScreenData, setLastScreenData] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState(false);

  // Initialize the step-by-step process
  useEffect(() => {
    if (isActive && currentScreenData && userGoal && !isInitialized) {
      initializeSteps();
    }
  }, [isActive, currentScreenData, userGoal, isInitialized]);

  // Auto-verify step completion when screen changes
  useEffect(() => {
    if (isActive && currentScreenData && lastScreenData && currentScreenData !== lastScreenData && !isPaused) {
      verifyCurrentStep();
    }
    setLastScreenData(currentScreenData);
  }, [currentScreenData, isActive, isPaused]);

  const initializeSteps = async () => {
    if (!currentScreenData) return;

    setIsAnalyzing(true);
    setError(null);

    try {
      const ocrText = await chatGPTService.extractOCRText(currentScreenData);
      
      const prompt = `Analyze this screenshot and create a detailed step-by-step plan to achieve the user's goal: "${userGoal}"

Based on what you see in the image and the OCR text, break down the task into specific, actionable steps. Each step should be:
1. Clear and specific about what element to interact with
2. Describe exactly what the user should click, type, or do
3. Include what change to expect after completing the step
4. Be sequential - each step should build on the previous one

OCR Text: ${ocrText}

Format your response as a JSON array of steps with this structure:
[
  {
    "description": "Brief description of what this step accomplishes",
    "instruction": "Detailed instruction for the user",
    "targetElement": "Specific element to interact with (if applicable)",
    "expectedChange": "What should change on screen after this step"
  }
]

Provide 3-7 steps maximum. Be very specific about UI elements you can see.`;

      const response = await chatGPTService.analyzeScreenWithVision(currentScreenData, prompt, ocrText);
      
      // Try to parse JSON from the response
      let parsedSteps: any[] = [];
      try {
        // Extract JSON from the response if it's wrapped in text
        const jsonMatch = response.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          parsedSteps = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('No JSON found in response');
        }
      } catch (parseError) {
        // If JSON parsing fails, create steps from the text response
        const lines = response.split('\n').filter(line => line.trim());
        parsedSteps = lines.slice(0, 5).map((line, index) => ({
          description: `Step ${index + 1}`,
          instruction: line.replace(/^\d+\.?\s*/, '').trim(),
          targetElement: '',
          expectedChange: 'Screen should update to reflect the action'
        }));
      }

      const formattedSteps: Step[] = parsedSteps.map((step, index) => ({
        id: `step-${index}`,
        description: step.description || `Step ${index + 1}`,
        instruction: step.instruction || step.description || 'Complete this step',
        completed: false,
        verified: false,
        targetElement: step.targetElement || '',
        expectedChange: step.expectedChange || 'Screen should update'
      }));

      setSteps(formattedSteps);
      setCurrentStepIndex(0);
      setIsInitialized(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize steps');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const verifyCurrentStep = async () => {
    if (!currentScreenData || currentStepIndex >= steps.length || steps[currentStepIndex].completed) return;

    setIsVerifying(true);
    setError(null);

    try {
      const currentStep = steps[currentStepIndex];
      const ocrText = await chatGPTService.extractOCRText(currentScreenData);

      const verificationPrompt = `Analyze this screenshot to verify if the following step has been completed:

Step: ${currentStep.instruction}
Expected Change: ${currentStep.expectedChange}
Target Element: ${currentStep.targetElement}

OCR Text: ${ocrText}

Based on what you see in the current screenshot, has this step been successfully completed? 

Respond with either:
- "COMPLETED: [brief explanation of what you see that confirms completion]"
- "NOT_COMPLETED: [brief explanation of what still needs to be done]"

Be specific about what you observe in the image.`;

      const response = await chatGPTService.analyzeScreenWithVision(currentScreenData, verificationPrompt, ocrText);
      
      const isCompleted = response.toLowerCase().includes('completed:') && !response.toLowerCase().includes('not_completed');
      
      if (isCompleted) {
        // Mark current step as completed and move to next
        const updatedSteps = [...steps];
        updatedSteps[currentStepIndex] = {
          ...updatedSteps[currentStepIndex],
          completed: true,
          verified: true
        };
        setSteps(updatedSteps);

        // Move to next step or complete the process
        if (currentStepIndex < steps.length - 1) {
          setCurrentStepIndex(currentStepIndex + 1);
          // Provide guidance for the next step
          provideNextStepGuidance(updatedSteps[currentStepIndex + 1]);
        } else {
          // All steps completed
          onComplete();
        }
      }
    } catch (err) {
      console.error('Step verification error:', err);
    } finally {
      setIsVerifying(false);
    }
  };

  const provideNextStepGuidance = async (nextStep: Step) => {
    if (!currentScreenData) return;

    try {
      const ocrText = await chatGPTService.extractOCRText(currentScreenData);
      
      const guidancePrompt = `The user needs to complete this next step: "${nextStep.instruction}"

Based on the current screenshot and OCR text, provide specific guidance on how to complete this step. Be very specific about:
1. What element to look for
2. Where it's located on the screen
3. What action to take
4. Any visual cues to help find the element

OCR Text: ${ocrText}

Keep the response concise but detailed enough for precise execution.`;

      const guidance = await chatGPTService.analyzeScreenWithVision(currentScreenData, guidancePrompt, ocrText);
      
      // Update the step with enhanced guidance
      const updatedSteps = [...steps];
      updatedSteps[currentStepIndex] = {
        ...updatedSteps[currentStepIndex],
        instruction: `${nextStep.instruction}\n\n💡 Detailed Guidance: ${guidance}`
      };
      setSteps(updatedSteps);
    } catch (err) {
      console.error('Failed to provide next step guidance:', err);
    }
  };

  const manualVerifyStep = () => {
    if (currentStepIndex < steps.length) {
      verifyCurrentStep();
    }
  };

  const resetGuidance = () => {
    setSteps([]);
    setCurrentStepIndex(0);
    setIsInitialized(false);
    setError(null);
    setIsPaused(false);
  };

  const togglePause = () => {
    setIsPaused(!isPaused);
  };

  if (!isActive) return null;

  return (
    <div className="glass-effect-bw rounded-xl p-6 shadow-lg animate-fade-in border border-white/10">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-400 animate-pulse" />
            <ArrowRight className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Step-by-Step Guidance</h2>
            <p className="text-xs text-blue-300">ChatGPT 4o-mini powered sequential guidance</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {isInitialized && (
            <button
              onClick={togglePause}
              className={`p-2 rounded-lg transition-all duration-300 ${
                isPaused ? 'bg-green-600/20 text-green-400' : 'bg-yellow-600/20 text-yellow-400'
              }`}
              title={isPaused ? 'Resume guidance' : 'Pause guidance'}
            >
              {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
            </button>
          )}
          
          <button
            onClick={resetGuidance}
            className="p-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-all duration-300"
            title="Reset guidance"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Goal Display */}
      <div className="mb-6 p-4 bg-gradient-to-r from-blue-900/20 to-cyan-900/20 rounded-lg border border-blue-500/30">
        <h3 className="font-medium text-white mb-2">Goal:</h3>
        <p className="text-blue-200">{userGoal}</p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-900/20 border border-red-500/30 rounded-lg">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400" />
            <span className="text-red-300 text-sm">{error}</span>
          </div>
        </div>
      )}

      {isAnalyzing && !isInitialized && (
        <div className="text-center py-8">
          <Sparkles className="w-8 h-8 text-blue-400 animate-spin mx-auto mb-3" />
          <p className="text-gray-400">ChatGPT is analyzing your screen and creating step-by-step guidance...</p>
        </div>
      )}

      {isPaused && (
        <div className="mb-4 p-3 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
          <div className="flex items-center gap-2">
            <Pause className="w-4 h-4 text-yellow-400" />
            <span className="text-yellow-300 text-sm">Guidance paused. Click play to resume automatic verification.</span>
          </div>
        </div>
      )}

      {/* Steps List */}
      {steps.length > 0 && (
        <div className="space-y-4">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={`p-4 rounded-lg border transition-all duration-300 ${
                index === currentStepIndex
                  ? 'bg-gradient-to-r from-blue-900/30 to-cyan-900/30 border-blue-500/50 shadow-lg'
                  : step.completed
                  ? 'bg-gradient-to-r from-green-900/20 to-emerald-900/20 border-green-500/30'
                  : 'bg-white/5 border-white/20'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-1">
                  {step.completed ? (
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  ) : index === currentStepIndex ? (
                    <div className="w-5 h-5 border-2 border-blue-400 rounded-full animate-pulse" />
                  ) : (
                    <Circle className="w-5 h-5 text-gray-500" />
                  )}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className={`font-medium ${
                      index === currentStepIndex ? 'text-blue-300' : 
                      step.completed ? 'text-green-300' : 'text-gray-300'
                    }`}>
                      {step.description}
                    </h4>
                    {index === currentStepIndex && (
                      <span className="px-2 py-1 bg-blue-600/30 text-blue-300 text-xs rounded-full">
                        Current
                      </span>
                    )}
                  </div>
                  
                  <p className={`text-sm whitespace-pre-wrap leading-relaxed ${
                    index === currentStepIndex ? 'text-blue-100' : 
                    step.completed ? 'text-green-200' : 'text-gray-400'
                  }`}>
                    {step.instruction}
                  </p>
                  
                  {step.targetElement && (
                    <div className="mt-2 text-xs text-blue-300">
                      Target: {step.targetElement}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          
          {/* Progress Bar */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Progress</span>
              <span className="text-sm text-gray-400">
                {steps.filter(s => s.completed).length} / {steps.length} completed
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full transition-all duration-500"
                style={{
                  width: `${(steps.filter(s => s.completed).length / steps.length) * 100}%`
                }}
              />
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex gap-3 mt-6">
            <button
              onClick={manualVerifyStep}
              disabled={isVerifying || currentStepIndex >= steps.length}
              className="flex-1 px-4 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isVerifying ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4" />
                  Check Step Completion
                </>
              )}
            </button>
            
            <button
              onClick={onScreenCapture}
              className="px-4 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 rounded-lg transition-all duration-300"
            >
              Capture Screen
            </button>
          </div>
        </div>
      )}
    </div>
  );
};