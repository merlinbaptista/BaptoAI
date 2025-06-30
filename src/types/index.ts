export interface ScreenElement {
  id: string;
  type: 'button' | 'input' | 'text' | 'image' | 'link';
  text: string;
  coordinates: { x: number; y: number; width: number; height: number };
  confidence: number;
}

export interface AIAnalysis {
  elements: ScreenElement[];
  currentTask: string;
  suggestions: string[];
  nextAction?: {
    type: 'click' | 'type' | 'wait' | 'scroll';
    target?: ScreenElement;
    value?: string;
    description: string;
  };
  ocrText?: string;
  mouseContext?: {
    currentPosition: { x: number; y: number; timestamp: number } | null;
    recentPath: { x: number; y: number; timestamp: number }[];
    recentClicks: { x: number; y: number; timestamp: number; button: string }[];
    isActive: boolean;
  };
}

export interface GuidanceStep {
  id: string;
  description: string;
  action: string;
  completed: boolean;
  coordinates?: { x: number; y: number };
}

export interface VoiceSettings {
  enabled: boolean;
  voice: string;
  rate: number;
  pitch: number;
  volume: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}