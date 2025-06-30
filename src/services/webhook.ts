interface WebhookLoginRequest {
  email: string;
  password: string;
  name?: string;
  action: 'signin' | 'signup';
}

interface WebhookLoginResponse {
  success: boolean;
  user?: {
    id: string;
    email: string;
    name: string;
    avatar?: string;
  };
  token?: string;
  message?: string;
  error?: string;
}

class WebhookService {
  private signinWebhookUrl = 'https://hook.us2.make.com/yk6ty3r6c8cwl4ktuff2xtt95j962m03';
  private signupWebhookUrl = 'https://hook.us2.make.com/cfjre9o4sm03t6oikryr0dmmlm4wmqv6';

  async signIn(email: string, password: string): Promise<WebhookLoginResponse> {
    console.log('🔗 Sending sign in request to webhook...');

    try {
      const response = await fetch(this.signinWebhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          password: password,
          action: 'signin',
          timestamp: new Date().toISOString(),
          source: 'cord-ai-app'
        }),
      });

      console.log('📥 Sign in webhook response status:', response.status);

      if (!response.ok) {
        console.error('❌ Sign in webhook error:', response.status);
        return {
          success: false,
          error: `Authentication failed (${response.status}). Please check your credentials.`
        };
      }

      // Handle both text and JSON responses
      let responseData;
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        responseData = await response.json();
        console.log('✅ Sign in webhook JSON response:', responseData);
      } else {
        const textData = await response.text();
        console.log('✅ Sign in webhook text response:', textData);
        
        // Try to parse as JSON if it looks like JSON
        try {
          responseData = JSON.parse(textData);
        } catch {
          responseData = { message: textData };
        }
      }

      // Check if the response indicates success
      if (responseData.success === false || responseData.error) {
        return {
          success: false,
          error: responseData.error || responseData.message || 'Authentication failed'
        };
      }

      // Create user object from response
      const user = responseData.user || {
        id: responseData.id || email,
        email: responseData.email || email,
        name: responseData.name || responseData.full_name || email.split('@')[0]
      };

      return {
        success: true,
        user: user,
        token: responseData.token,
        message: responseData.message || 'Signed in successfully!'
      };

    } catch (error) {
      console.error('❌ Sign in webhook error:', error);
      return {
        success: false,
        error: 'Network error - please check your connection and try again'
      };
    }
  }

  async signUp(name: string, email: string, password: string): Promise<WebhookLoginResponse> {
    console.log('🔗 Sending sign up request to webhook...');

    try {
      const response = await fetch(this.signupWebhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          full_name: name,
          password: password,
        }),
      });

      console.log('📥 Sign up webhook response status:', response.status);

      // Handle both text and JSON responses
      let responseData;
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        responseData = await response.json();
        console.log('✅ Sign up webhook JSON response:', responseData);
      } else {
        const textData = await response.text();
        console.log('✅ Sign up webhook text response:', textData);
        
        // Check for specific error messages in the response
        if (textData.toLowerCase().includes('email already registered') || 
            textData.toLowerCase().includes('already exists') ||
            textData.toLowerCase().includes('already in use')) {
          return {
            success: false,
            error: 'Email already registered, please log in'
          };
        }
        
        // Try to parse as JSON if it looks like JSON
        try {
          responseData = JSON.parse(textData);
        } catch {
          responseData = { message: textData };
        }
      }

      // Check for error responses
      if (!response.ok) {
        console.error('❌ Sign up webhook error:', response.status);
        
        // Handle specific HTTP status codes
        if (response.status === 409 || response.status === 400) {
          return {
            success: false,
            error: 'Email already registered, please log in'
          };
        }
        
        return {
          success: false,
          error: `Failed to create account (${response.status}). Please try again.`
        };
      }

      // Check if the response data indicates an error
      if (responseData.success === false || responseData.error) {
        const errorMessage = responseData.error || responseData.message || 'Failed to create account';
        
        // Check for email already exists errors in the response
        if (errorMessage.toLowerCase().includes('email already registered') || 
            errorMessage.toLowerCase().includes('already exists') ||
            errorMessage.toLowerCase().includes('already in use') ||
            errorMessage.toLowerCase().includes('duplicate')) {
          return {
            success: false,
            error: 'Email already registered, please log in'
          };
        }
        
        return {
          success: false,
          error: errorMessage
        };
      }

      // Create user object from response
      const user = responseData.user || {
        id: responseData.id || email,
        email: responseData.email || email,
        name: responseData.name || responseData.full_name || name
      };

      return {
        success: true,
        user: user,
        token: responseData.token,
        message: responseData.message || 'Account created successfully!'
      };

    } catch (error) {
      console.error('❌ Sign up webhook error:', error);
      return {
        success: false,
        error: 'Network error - please check your connection and try again'
      };
    }
  }

  async testConnection(): Promise<boolean> {
    // Always return true to avoid blocking the UI
    return true;
  }

  // Legacy method for backward compatibility
  async authenticateUser(request: WebhookLoginRequest): Promise<WebhookLoginResponse> {
    if (request.action === 'signin') {
      return this.signIn(request.email, request.password);
    } else {
      return this.signUp(request.name || '', request.email, request.password);
    }
  }
}

export const webhookService = new WebhookService();