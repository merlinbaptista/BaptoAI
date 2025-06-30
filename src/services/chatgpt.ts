interface ChatGPTMessage {
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

interface ChatGPTResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

class ChatGPTService {
  private apiKey: string;
  private baseURL = 'https://api.openai.com/v1';

  constructor() {
    this.apiKey = import.meta.env.VITE_OPENAI_API_KEY || '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';
    console.log('🤖 ChatGPT 4o-mini API Key loaded:', this.apiKey ? 'Yes' : 'No');
  }

  async analyzeScreenWithVision(imageData: string, userQuery?: string, ocrData?: string, uiElements?: any[]): Promise<string> {
    console.log('🔍 Starting ChatGPT 4o-mini screen analysis...');
    console.log('📸 Image data length:', imageData.length);
    console.log('❓ User query:', userQuery);

    const systemPrompt = `You are Cord AI, an advanced screen guidance assistant powered by ChatGPT 4o-mini. You can see and analyze screenshots with exceptional detail and provide step-by-step guidance.

CURRENT TASK: Analyze the provided screenshot and provide precise, step-by-step guidance.

WHAT YOU CAN SEE:
- Visual elements: buttons, forms, text, images, menus, icons
- Layout and design: colors, positioning, spacing
- Text content: headings, labels, body text, links
- Interactive elements: clickable areas, form fields, navigation
- Application context: what software/website is being used

ANALYSIS APPROACH:
1. 🔍 Examine the screenshot thoroughly
2. 📝 Identify all visible text and UI elements
3. 🎯 Understand the current context and user's goal
4. 📋 Provide specific, actionable step-by-step instructions
5. 🎪 Reference exact element names, colors, and positions

USER'S GOAL: ${userQuery || 'Analyze what I can do on this screen'}

ADDITIONAL CONTEXT:
${ocrData ? `📄 OCR Text Detected: "${ocrData.substring(0, 500)}..."` : '📄 No OCR data available'}
${uiElements ? `🎛️ UI Elements: ${uiElements.length} interactive elements detected` : '🎛️ No UI elements data'}

RESPONSE FORMAT:
1. Start with what you can see on the screen
2. Identify the current application/website
3. Provide step-by-step instructions
4. Be specific about element locations (top-left, center, etc.)
5. Mention colors, text, and visual cues
6. Suggest next logical steps

Please analyze the screenshot now and provide detailed guidance.`;

    const messages: ChatGPTMessage[] = [
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

    console.log('📤 Sending request to ChatGPT 4o-mini API...');

    try {
      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages,
          max_tokens: 2048,
          temperature: 0.4,
        }),
      });

      console.log('📥 ChatGPT 4o-mini API response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ ChatGPT API error:', response.status, errorText);
        throw new Error(`ChatGPT API error: ${response.status} - ${errorText}`);
      }

      const data: ChatGPTResponse = await response.json();
      console.log('✅ ChatGPT 4o-mini API response received');
      
      const content = data.choices?.[0]?.message?.content;
      
      if (!content) {
        console.error('❌ No content in ChatGPT response:', data);
        throw new Error('No content received from ChatGPT API - the response may have been filtered');
      }

      console.log('🎉 ChatGPT 4o-mini analysis completed successfully');
      return content;
    } catch (error) {
      console.error('❌ ChatGPT API error:', error);
      if (error instanceof Error) {
        if (error.message.includes('401')) {
          throw new Error('ChatGPT API access denied. Please check your API key.');
        } else if (error.message.includes('429')) {
          throw new Error('ChatGPT API rate limit exceeded. Please wait a moment and try again.');
        } else if (error.message.includes('400')) {
          throw new Error('Invalid request to ChatGPT API. The image may be too large or in an unsupported format.');
        }
        throw new Error(`Failed to analyze screen with ChatGPT: ${error.message}`);
      }
      throw new Error('Failed to analyze screen with ChatGPT. Please check your connection and try again.');
    }
  }

  async continueConversation(messages: Array<{ role: 'user' | 'assistant'; content: string }>, newMessage: string): Promise<string> {
    console.log('💬 Continuing conversation with ChatGPT 4o-mini...');

    const systemPrompt = `You are Cord AI, an intelligent screen guidance assistant powered by ChatGPT 4o-mini. Continue the conversation naturally while providing helpful guidance. Keep responses concise but informative.`;

    // Convert conversation history to ChatGPT format
    const chatGPTMessages: ChatGPTMessage[] = [
      {
        role: 'system',
        content: systemPrompt
      }
    ];

    // Add recent conversation history (last 4 messages to manage context)
    const recentMessages = messages.slice(-4);
    recentMessages.forEach(msg => {
      chatGPTMessages.push({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content
      });
    });

    // Add new message
    chatGPTMessages.push({
      role: 'user',
      content: newMessage
    });

    try {
      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: chatGPTMessages,
          max_tokens: 1024,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('ChatGPT conversation error:', response.status, errorText);
        throw new Error(`ChatGPT API error: ${response.status} - ${errorText}`);
      }

      const data: ChatGPTResponse = await response.json();
      const content = data.choices?.[0]?.message?.content;
      
      if (!content) {
        throw new Error('No content received from ChatGPT API');
      }

      return content;
    } catch (error) {
      console.error('ChatGPT conversation error:', error);
      if (error instanceof Error) {
        throw new Error(`Failed to process message with ChatGPT: ${error.message}`);
      }
      throw new Error('Failed to process message with ChatGPT. Please check your connection and try again.');
    }
  }

  async extractOCRText(imageData: string): Promise<string> {
    console.log('📝 Extracting OCR text with ChatGPT 4o-mini...');

    const messages: ChatGPTMessage[] = [
      {
        role: 'system',
        content: 'Extract all visible text from this image. Organize the text logically and maintain the reading order. Include button labels, menu items, form fields, headings, and any other text elements you can see. Format the output clearly with line breaks between different sections.'
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
          model: 'gpt-4o-mini',
          messages,
          max_tokens: 1024,
          temperature: 0.1,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('ChatGPT OCR error:', response.status, errorText);
        return '';
      }

      const data: ChatGPTResponse = await response.json();
      const content = data.choices?.[0]?.message?.content;
      
      console.log('✅ OCR extraction completed with ChatGPT 4o-mini');
      return content || '';
    } catch (error) {
      console.error('ChatGPT OCR error:', error);
      return '';
    }
  }

  // Test method to verify API connectivity
  async testConnection(): Promise<boolean> {
    try {
      console.log('🧪 Testing ChatGPT 4o-mini API connection...');
      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'user',
              content: 'Hello, can you see this message?'
            }
          ],
          max_tokens: 50,
        }),
      });

      const isConnected = response.ok;
      console.log(isConnected ? '✅ ChatGPT 4o-mini API connected successfully' : '❌ ChatGPT API connection failed');
      return isConnected;
    } catch (error) {
      console.error('ChatGPT connection test failed:', error);
      return false;
    }
  }
}

export const chatGPTService = new ChatGPTService();