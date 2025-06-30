interface OpenAIMessage {
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

interface OpenAIResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

class OpenAIService {
  private apiKey: string;
  private baseURL = 'https://api.openai.com/v1';

  constructor() {
    this.apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    if (!this.apiKey) {
      throw new Error('OpenAI API key not found in environment variables');
    }
  }

  async analyzeScreenWithVision(imageData: string, userQuery?: string): Promise<string> {
    const systemPrompt = `You are Cord AI, an intelligent screen guidance assistant. Your role is to analyze screenshots and provide step-by-step guidance to help users complete their tasks.

IMPORTANT GUIDELINES:
1. Analyze the screenshot carefully and identify all visible UI elements
2. Provide specific, actionable guidance based on what you see
3. Break down complex tasks into simple steps
4. Be encouraging and supportive
5. If you see a specific application (like Canva, Photoshop, etc.), provide specialized guidance for that tool
6. Always mention specific buttons, menus, or elements you can see
7. If the user seems stuck, suggest alternative approaches
8. Keep responses conversational but informative

Current user query: ${userQuery || 'Help me with what I see on screen'}

Please analyze the screenshot and provide helpful guidance.`;

    const messages: OpenAIMessage[] = [
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
              detail: 'high'
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
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages,
          max_tokens: 1000,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
      }

      const data: OpenAIResponse = await response.json();
      return data.choices[0]?.message?.content || 'I apologize, but I couldn\'t analyze the screen. Please try again.';
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw new Error('Failed to analyze screen. Please check your connection and try again.');
    }
  }

  async continueConversation(messages: Array<{ role: 'user' | 'assistant'; content: string }>, newMessage: string): Promise<string> {
    const systemPrompt = `You are Cord AI, an intelligent screen guidance assistant. Continue the conversation naturally while providing helpful guidance. Keep your responses concise but informative.`;

    const openAIMessages: OpenAIMessage[] = [
      { role: 'system', content: systemPrompt },
      ...messages.map(msg => ({
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
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: openAIMessages,
          max_tokens: 800,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
      }

      const data: OpenAIResponse = await response.json();
      return data.choices[0]?.message?.content || 'I apologize, but I couldn\'t process your message. Please try again.';
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw new Error('Failed to process message. Please check your connection and try again.');
    }
  }
}

export const openAIService = new OpenAIService();