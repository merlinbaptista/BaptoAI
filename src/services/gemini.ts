interface GeminiMessage {
  role: 'user' | 'model';
  parts: Array<{
    text?: string;
    inlineData?: {
      mimeType: string;
      data: string;
    };
  }>;
}

interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
  }>;
}

class GeminiService {
  private apiKey: string;
  private baseURL = 'https://generativelanguage.googleapis.com/v1beta';

  constructor() {
    // Use the updated API key
    this.apiKey = import.meta.env.VITE_GEMINI_API_KEY || 'AIzaSyB0AYZU_54r83xw_vu3Vo0g7PC0z3k9CvI';
    console.log('🚀 Gemini 2.5 Pro API Key loaded:', this.apiKey ? 'Yes' : 'No');
  }

  async analyzeScreenWithVision(imageData: string, userQuery?: string, ocrData?: string, uiElements?: any[]): Promise<string> {
    console.log('🔍 Starting Gemini 2.5 Pro screen analysis...');
    console.log('📸 Image data length:', imageData.length);
    console.log('❓ User query:', userQuery);

    const systemPrompt = `You are Cord AI, an advanced screen guidance assistant powered by Gemini 2.5 Pro. You can see and analyze screenshots with exceptional detail and provide step-by-step guidance.

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

    // Convert base64 image data to the format Gemini expects
    const base64Data = imageData.split(',')[1];
    if (!base64Data) {
      throw new Error('Invalid image data format - no base64 data found');
    }

    console.log('📤 Sending request to Gemini 2.5 Pro API...');

    const requestBody = {
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: systemPrompt
            },
            {
              inlineData: {
                mimeType: 'image/jpeg',
                data: base64Data
              }
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.4,
        topK: 32,
        topP: 0.95,
        maxOutputTokens: 2048,
      },
      safetySettings: [
        {
          category: 'HARM_CATEGORY_HARASSMENT',
          threshold: 'BLOCK_MEDIUM_AND_ABOVE'
        },
        {
          category: 'HARM_CATEGORY_HATE_SPEECH',
          threshold: 'BLOCK_MEDIUM_AND_ABOVE'
        },
        {
          category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
          threshold: 'BLOCK_MEDIUM_AND_ABOVE'
        },
        {
          category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
          threshold: 'BLOCK_MEDIUM_AND_ABOVE'
        }
      ]
    };

    try {
      const response = await fetch(`${this.baseURL}/models/gemini-2.0-flash-exp:generateContent?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      console.log('📥 Gemini 2.5 Pro API response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Gemini API error:', response.status, errorText);
        throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
      }

      const data: GeminiResponse = await response.json();
      console.log('✅ Gemini 2.5 Pro API response received');
      
      const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!content) {
        console.error('❌ No content in Gemini response:', data);
        throw new Error('No content received from Gemini API - the response may have been filtered');
      }

      console.log('🎉 Gemini 2.5 Pro analysis completed successfully');
      return content;
    } catch (error) {
      console.error('❌ Gemini API error:', error);
      if (error instanceof Error) {
        if (error.message.includes('403')) {
          throw new Error('Gemini API access denied. Please check your API key and billing status.');
        } else if (error.message.includes('429')) {
          throw new Error('Gemini API rate limit exceeded. Please wait a moment and try again.');
        } else if (error.message.includes('400')) {
          throw new Error('Invalid request to Gemini API. The image may be too large or in an unsupported format.');
        }
        throw new Error(`Failed to analyze screen with Gemini: ${error.message}`);
      }
      throw new Error('Failed to analyze screen with Gemini. Please check your connection and try again.');
    }
  }

  async continueConversation(messages: Array<{ role: 'user' | 'assistant'; content: string }>, newMessage: string): Promise<string> {
    console.log('💬 Continuing conversation with Gemini 2.5 Pro...');

    const systemPrompt = `You are Cord AI, an intelligent screen guidance assistant powered by Gemini 2.5 Pro. Continue the conversation naturally while providing helpful guidance. Keep responses concise but informative.`;

    // Convert conversation history to Gemini format
    const geminiMessages: GeminiMessage[] = [
      {
        role: 'user',
        parts: [{ text: systemPrompt }]
      }
    ];

    // Add recent conversation history (last 4 messages to manage context)
    const recentMessages = messages.slice(-4);
    recentMessages.forEach(msg => {
      geminiMessages.push({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
      });
    });

    // Add new message
    geminiMessages.push({
      role: 'user',
      parts: [{ text: newMessage }]
    });

    const requestBody = {
      contents: geminiMessages,
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      }
    };

    try {
      const response = await fetch(`${this.baseURL}/models/gemini-2.0-flash-exp:generateContent?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Gemini conversation error:', response.status, errorText);
        throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
      }

      const data: GeminiResponse = await response.json();
      const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!content) {
        throw new Error('No content received from Gemini API');
      }

      return content;
    } catch (error) {
      console.error('Gemini conversation error:', error);
      if (error instanceof Error) {
        throw new Error(`Failed to process message with Gemini: ${error.message}`);
      }
      throw new Error('Failed to process message with Gemini. Please check your connection and try again.');
    }
  }

  async extractOCRText(imageData: string): Promise<string> {
    console.log('📝 Extracting OCR text with Gemini 2.5 Pro...');

    const base64Data = imageData.split(',')[1];
    if (!base64Data) {
      throw new Error('Invalid image data format');
    }

    const requestBody = {
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: 'Extract all visible text from this image. Organize the text logically and maintain the reading order. Include button labels, menu items, form fields, headings, and any other text elements you can see. Format the output clearly with line breaks between different sections.'
            },
            {
              inlineData: {
                mimeType: 'image/jpeg',
                data: base64Data
              }
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 1024,
      }
    };

    try {
      const response = await fetch(`${this.baseURL}/models/gemini-2.0-flash-exp:generateContent?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Gemini OCR error:', response.status, errorText);
        return '';
      }

      const data: GeminiResponse = await response.json();
      const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      console.log('✅ OCR extraction completed with Gemini 2.5 Pro');
      return content || '';
    } catch (error) {
      console.error('Gemini OCR error:', error);
      return '';
    }
  }

  // Test method to verify API connectivity
  async testConnection(): Promise<boolean> {
    try {
      console.log('🧪 Testing Gemini 2.5 Pro API connection...');
      const response = await fetch(`${this.baseURL}/models/gemini-2.0-flash-exp:generateContent?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: 'Hello, can you see this message?' }]
            }
          ],
          generationConfig: {
            maxOutputTokens: 50,
          }
        }),
      });

      const isConnected = response.ok;
      console.log(isConnected ? '✅ Gemini 2.5 Pro API connected successfully' : '❌ Gemini API connection failed');
      return isConnected;
    } catch (error) {
      console.error('Gemini connection test failed:', error);
      return false;
    }
  }
}

export const geminiService = new GeminiService();