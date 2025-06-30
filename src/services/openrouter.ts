interface OpenRouterMessage {
  role: 'system' | 'user' | 'assistant';
  content: string | Array<{
    type: 'text' | 'image_url';
    text?: string;
    image_url?: {
      url: string;
      detail?: 'low' | 'high' | 'auto';
    };
  }>;
}

interface OpenRouterResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

class OpenRouterService {
  private apiKey: string;
  private baseURL = 'https://openrouter.ai/api/v1';

  constructor() {
    this.apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
    if (!this.apiKey) {
      console.error('OpenRouter API key not found in environment variables');
      throw new Error('OpenRouter API key not found. Please check your environment configuration.');
    }
  }

  async analyzeScreenWithVision(imageData: string, userQuery?: string, ocrData?: string, uiElements?: any[]): Promise<string> {
    const systemPrompt = `You are Cord AI, an advanced screen guidance assistant. Analyze screenshots and provide precise, step-by-step guidance.

CAPABILITIES:
1. Visual analysis of screenshots
2. OCR text data integration
3. UI element detection data
4. Precise guidance with exact references

APPROACH:
1. Analyze the screenshot visually
2. Use OCR text data for accuracy
3. Reference UI elements for precise instructions
4. Provide specific, actionable steps

OCR TEXT: ${ocrData ? ocrData.substring(0, 200) : 'No OCR data'}
UI ELEMENTS: ${uiElements ? uiElements.length + ' elements detected' : 'No UI elements'}
USER QUERY: ${userQuery || 'Help with screen analysis'}

Provide concise, step-by-step guidance.`;

    const messages: OpenRouterMessage[] = [
      {
        role: 'system',
        content: systemPrompt
      },
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: userQuery || 'Please analyze this screenshot and help me with the next steps.'
          },
          {
            type: 'image_url',
            image_url: {
              url: imageData,
              detail: 'low' // Use low detail to reduce token usage
            }
          }
        ]
      }
    ];

    try {
      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin,
          'X-Title': 'Cord AI Screen Assistant'
        },
        body: JSON.stringify({
          model: 'anthropic/claude-3.5-sonnet',
          messages,
          max_tokens: 400, // Reduced from 1500 to stay within credit limits
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('OpenRouter API error:', response.status, errorText);
        throw new Error(`OpenRouter API error: ${response.status} - ${errorText}`);
      }

      const data: OpenRouterResponse = await response.json();
      return data.choices[0]?.message?.content || 'I apologize, but I couldn\'t analyze the screen. Please try again.';
    } catch (error) {
      console.error('OpenRouter API error:', error);
      if (error instanceof Error) {
        throw new Error(`Failed to analyze screen: ${error.message}`);
      }
      throw new Error('Failed to analyze screen. Please check your connection and try again.');
    }
  }

  async continueConversation(messages: Array<{ role: 'user' | 'assistant'; content: string }>, newMessage: string): Promise<string> {
    const systemPrompt = `You are Cord AI, an intelligent screen guidance assistant. Continue the conversation naturally while providing helpful guidance. Keep responses concise.`;

    // Limit conversation history to last 3 messages to reduce token usage
    const recentMessages = messages.slice(-3);

    const openRouterMessages: OpenRouterMessage[] = [
      { role: 'system', content: systemPrompt },
      ...recentMessages.map(msg => ({
        role: msg.role,
        content: msg.content
      })),
      { role: 'user', content: newMessage }
    ];

    try {
      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin,
          'X-Title': 'Cord AI Screen Assistant'
        },
        body: JSON.stringify({
          model: 'anthropic/claude-3.5-sonnet',
          messages: openRouterMessages,
          max_tokens: 300, // Reduced from 1000
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('OpenRouter API error:', response.status, errorText);
        throw new Error(`OpenRouter API error: ${response.status} - ${errorText}`);
      }

      const data: OpenRouterResponse = await response.json();
      return data.choices[0]?.message?.content || 'I apologize, but I couldn\'t process your message. Please try again.';
    } catch (error) {
      console.error('OpenRouter API error:', error);
      if (error instanceof Error) {
        throw new Error(`Failed to process message: ${error.message}`);
      }
      throw new Error('Failed to process message. Please check your connection and try again.');
    }
  }

  async extractOCRText(imageData: string): Promise<string> {
    const messages: OpenRouterMessage[] = [
      {
        role: 'system',
        content: 'Extract visible text from the image. Be concise and organized.'
      },
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: 'Extract all visible text from this screenshot.'
          },
          {
            type: 'image_url',
            image_url: {
              url: imageData,
              detail: 'low' // Use low detail for OCR to save tokens
            }
          }
        ]
      }
    ];

    try {
      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin,
          'X-Title': 'Cord AI OCR Service'
        },
        body: JSON.stringify({
          model: 'anthropic/claude-3.5-sonnet',
          messages,
          max_tokens: 200, // Reduced from 1000 for OCR
          temperature: 0.1,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('OpenRouter OCR error:', response.status, errorText);
        return '';
      }

      const data: OpenRouterResponse = await response.json();
      return data.choices[0]?.message?.content || '';
    } catch (error) {
      console.error('OpenRouter OCR error:', error);
      return '';
    }
  }
}

export const openRouterService = new OpenRouterService();