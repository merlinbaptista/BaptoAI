import React, { useState } from 'react';
import { 
  ArrowRight, 
  Monitor, 
  Brain, 
  MessageSquare, 
  Zap, 
  CheckCircle, 
  Play,
  Shield,
  Sparkles,
  Mic,
  Volume2
} from 'lucide-react';
import { User } from '../types';
import { BoltBadge } from './BoltBadge';

interface GettingStartedProps {
  user: User;
  onComplete: (updatedUser?: User) => void;
}

export const GettingStarted: React.FC<GettingStartedProps> = ({ user, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const steps = [
    {
      id: 0,
      title: 'Welcome to Bapto AI',
      description: 'Your intelligent companion powered by ChatGPT 4o-mini',
      icon: Sparkles,
      content: (
        <div className="space-y-6 animate-fade-in">
          <div className="text-center">
            <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4 animate-logo-glow border border-white/20">
              <img 
                src="/Untitled design (7).png" 
                alt="Bapto AI Logo"
                className="w-16 h-16 rounded-xl shadow-lg border-2 border-white/20"
              />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2 animate-text-glow">Welcome, {user.name}!</h3>
            <p className="text-gray-400">
              Let's get you set up with your Bapto AI assistant powered by ChatGPT 4o-mini. This quick tour will show you 
              how to make the most of your intelligent screen companion with advanced multimodal AI.
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="glass-effect-bw rounded-lg p-4 text-center animate-slide-in-left hover:scale-105 hover:bg-white/10 transition-all duration-300 group">
              <Sparkles className="w-8 h-8 text-purple-400 mx-auto mb-2 group-hover:animate-pulse" />
              <h4 className="font-semibold text-white">ChatGPT Vision</h4>
              <p className="text-sm text-gray-400">Advanced multimodal AI</p>
            </div>
            <div className="glass-effect-bw rounded-lg p-4 text-center animate-slide-in-right hover:scale-105 hover:bg-white/10 transition-all duration-300 group">
              <MessageSquare className="w-8 h-8 text-white mx-auto mb-2 group-hover:animate-bounce" />
              <h4 className="font-semibold text-white">Natural Chat</h4>
              <p className="text-sm text-gray-400">Conversational guidance</p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 1,
      title: 'Screen Sharing Setup',
      description: 'Learn how to share your screen for ChatGPT analysis',
      icon: Monitor,
      content: (
        <div className="space-y-6 animate-fade-in">
          <div className="glass-effect-bw rounded-lg p-6 border border-white/10">
            <div className="flex items-center gap-3 mb-4">
              <Monitor className="w-6 h-6 text-white" />
              <h4 className="text-lg font-semibold text-white">Screen Capture</h4>
            </div>
            <p className="text-gray-400 mb-4">
              ChatGPT 4o-mini needs to see your screen to provide intelligent guidance. When you click 
              "Start Capture", your browser will ask for permission to share your screen.
            </p>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3 animate-slide-in-up" style={{ animationDelay: '0.1s' }}>
                <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center text-black text-sm font-bold">1</div>
                <span className="text-gray-300">Click "Start Capture" in the Screen Capture panel</span>
              </div>
              <div className="flex items-center gap-3 animate-slide-in-up" style={{ animationDelay: '0.2s' }}>
                <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center text-black text-sm font-bold">2</div>
                <span className="text-gray-300">Choose which screen or window to share</span>
              </div>
              <div className="flex items-center gap-3 animate-slide-in-up" style={{ animationDelay: '0.3s' }}>
                <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center text-black text-sm font-bold">3</div>
                <span className="text-gray-300">Click "Analyze with ChatGPT" to let AI see your screen</span>
              </div>
            </div>
          </div>
          
          <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4 animate-slide-in-up">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-green-400" />
              <span className="text-green-300 font-medium">Privacy First</span>
            </div>
            <p className="text-green-400 text-sm mt-1">
              Your screen data is processed by ChatGPT 4o-mini and never stored permanently.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 2,
      title: 'ChatGPT 4o-mini Analysis',
      description: 'Understand how advanced AI analyzes and guides you',
      icon: Brain,
      content: (
        <div className="space-y-6 animate-fade-in">
          <div className="glass-effect-bw rounded-lg p-6 border border-white/10">
            <div className="flex items-center gap-3 mb-4">
              <Sparkles className="w-6 h-6 text-purple-400" />
              <h4 className="text-lg font-semibold text-white">ChatGPT 4o-mini Intelligence</h4>
            </div>
            <p className="text-gray-400 mb-4">
              Once you share your screen, ChatGPT 4o-mini will analyze what's visible with advanced 
              multimodal AI and provide contextual guidance based on your goals.
            </p>
            
            <div className="space-y-4">
              <div className="bg-white/5 rounded-lg p-4 animate-slide-in-up hover:bg-white/10 transition-all duration-300 group" style={{ animationDelay: '0.1s' }}>
                <h5 className="font-medium text-white mb-2 group-hover:animate-pulse">Advanced Vision</h5>
                <p className="text-sm text-gray-400">
                  ChatGPT identifies buttons, forms, links, and interactive elements with exceptional accuracy
                </p>
              </div>
              
              <div className="bg-white/5 rounded-lg p-4 animate-slide-in-up hover:bg-white/10 transition-all duration-300 group" style={{ animationDelay: '0.2s' }}>
                <h5 className="font-medium text-white mb-2 group-hover:animate-pulse">Enhanced OCR</h5>
                <p className="text-sm text-gray-400">
                  Perfect text extraction and understanding in multiple languages
                </p>
              </div>
              
              <div className="bg-white/5 rounded-lg p-4 animate-slide-in-up hover:bg-white/10 transition-all duration-300 group" style={{ animationDelay: '0.3s' }}>
                <h5 className="font-medium text-white mb-2 group-hover:animate-pulse">Step-by-Step Guidance</h5>
                <p className="text-sm text-gray-400">
                  Intelligent sequential instructions that wait for completion before proceeding
                </p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 3,
      title: 'Voice & Chat Interface',
      description: 'Interact naturally with your ChatGPT-powered assistant',
      icon: MessageSquare,
      content: (
        <div className="space-y-6 animate-fade-in">
          <div className="glass-effect-bw rounded-lg p-6 border border-white/10">
            <div className="flex items-center gap-3 mb-4">
              <MessageSquare className="w-6 h-6 text-white" />
              <h4 className="text-lg font-semibold text-white">Natural Interaction</h4>
            </div>
            <p className="text-gray-400 mb-4">
              Communicate with your ChatGPT 4o-mini powered assistant using natural language, 
              either by typing or speaking your requests.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white/5 rounded-lg p-4 animate-slide-in-left hover:bg-white/10 transition-all duration-300 group">
                <div className="flex items-center gap-2 mb-2">
                  <Mic className="w-5 h-5 text-white group-hover:animate-pulse" />
                  <h5 className="font-medium text-white">Voice Input</h5>
                </div>
                <p className="text-sm text-gray-400">
                  Click the microphone button to speak your requests naturally
                </p>
              </div>
              
              <div className="bg-white/5 rounded-lg p-4 animate-slide-in-right hover:bg-white/10 transition-all duration-300 group">
                <div className="flex items-center gap-2 mb-2">
                  <Volume2 className="w-5 h-5 text-white group-hover:animate-bounce" />
                  <h5 className="font-medium text-white">Voice Output</h5>
                </div>
                <p className="text-sm text-gray-400">
                  ChatGPT responses can be spoken aloud for hands-free guidance
                </p>
              </div>
            </div>
            
            <div className="mt-4 bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4 animate-slide-in-up">
              <h5 className="font-medium text-yellow-300 mb-2">Example Requests</h5>
              <div className="space-y-1 text-sm text-yellow-400">
                <p>• "Guide me step by step through creating a new account"</p>
                <p>• "Help me fill out this form step by step"</p>
                <p>• "Walk me through editing this image step by step"</p>
              </div>
            </div>
          </div>
        </div>
      )
    }
  ];

  const handleNext = () => {
    if (!completedSteps.includes(currentStep)) {
      setCompletedSteps([...completedSteps, currentStep]);
    }
    
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Complete onboarding without avatar changes
      onComplete();
    }
  };

  const handleStepClick = (stepIndex: number) => {
    if (stepIndex <= currentStep || completedSteps.includes(stepIndex)) {
      setCurrentStep(stepIndex);
    }
  };

  const currentStepData = steps[currentStep];
  const Icon = currentStepData.icon;

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/5 rounded-full mix-blend-screen filter blur-xl animate-float"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/3 rounded-full mix-blend-screen filter blur-xl animate-float" style={{ animationDelay: '1s' }}></div>
        
        {/* Animated particles */}
        <div className="absolute top-20 left-20 w-2 h-2 bg-white/20 rounded-full animate-ping" style={{ animationDelay: '0s' }}></div>
        <div className="absolute top-40 right-32 w-1 h-1 bg-white/30 rounded-full animate-ping" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-32 left-1/3 w-1.5 h-1.5 bg-white/25 rounded-full animate-ping" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="w-full max-w-4xl mx-auto relative">
        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8 animate-slide-in-up">
          <div className="flex items-center space-x-4">
            {steps.map((step, index) => (
              <React.Fragment key={step.id}>
                <button
                  onClick={() => handleStepClick(index)}
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                    index === currentStep
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg scale-110 animate-logo-glow'
                      : completedSteps.includes(index)
                      ? 'bg-white text-black cursor-pointer hover:scale-105'
                      : index < currentStep
                      ? 'bg-white/50 text-white cursor-pointer hover:scale-105'
                      : 'bg-white/20 text-gray-400'
                  }`}
                >
                  {completedSteps.includes(index) ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <span className="text-sm font-bold">{index + 1}</span>
                  )}
                </button>
                {index < steps.length - 1 && (
                  <div className={`w-12 h-0.5 transition-colors duration-300 ${
                    index < currentStep || completedSteps.includes(index)
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500'
                      : 'bg-white/20'
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="glass-effect-bw rounded-2xl p-8 shadow-2xl animate-slide-in-up border border-white/10">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-logo-glow border border-purple-500/30">
              <Icon className="w-8 h-8 text-purple-400" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-2 animate-text-glow">{currentStepData.title}</h2>
            <p className="text-gray-400">{currentStepData.description}</p>
          </div>

          <div className="mb-8">
            {currentStepData.content}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Step {currentStep + 1} of {steps.length}
            </div>
            
            <div className="flex gap-3">
              {currentStep > 0 && (
                <button
                  onClick={() => setCurrentStep(currentStep - 1)}
                  className="px-6 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-all duration-300 hover:scale-105"
                >
                  Previous
                </button>
              )}
              
              <button
                onClick={handleNext}
                className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl hover:scale-105 animate-button-glow"
              >
                {currentStep === steps.length - 1 ? (
                  <>
                    <Play className="w-4 h-4" />
                    Get Started
                  </>
                ) : (
                  <>
                    Next
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Skip Option */}
        <div className="text-center mt-6">
          <button
            onClick={() => onComplete()}
            className="text-gray-500 hover:text-gray-300 transition-colors text-sm hover:underline"
          >
            Skip tutorial and go to dashboard
          </button>
        </div>
      </div>

      {/* Bolt.new Badge */}
      <BoltBadge position="bottom-right" variant="dark" size="sm" />
    </div>
  );
};