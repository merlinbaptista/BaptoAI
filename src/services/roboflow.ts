interface RoboflowDetection {
  x: number;
  y: number;
  width: number;
  height: number;
  confidence: number;
  class: string;
  class_id: number;
}

interface RoboflowResponse {
  predictions: RoboflowDetection[];
  image: {
    width: number;
    height: number;
  };
}

class RoboflowService {
  private apiKey: string;
  private baseURL = 'https://detect.roboflow.com';
  private modelEndpoint = 'ui-elements-detection/1'; // Default UI detection model

  constructor() {
    this.apiKey = import.meta.env.VITE_ROBOFLOW_API_KEY;
    if (!this.apiKey) {
      console.error('Roboflow API key not found in environment variables');
      // Don't throw error, just log it - UI detection is optional
    }
  }

  async detectUIElements(imageData: string): Promise<RoboflowDetection[]> {
    if (!this.apiKey) {
      console.warn('Roboflow API key not available, skipping UI detection');
      return [];
    }

    try {
      // Convert base64 to blob for upload
      const base64Data = imageData.split(',')[1];
      if (!base64Data) {
        throw new Error('Invalid image data format');
      }

      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'image/jpeg' });

      const formData = new FormData();
      formData.append('file', blob, 'screenshot.jpg');

      const response = await fetch(`${this.baseURL}/${this.modelEndpoint}?api_key=${this.apiKey}&confidence=0.3&overlap=0.5`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Roboflow API error:', response.status, errorText);
        return [];
      }

      const data: RoboflowResponse = await response.json();
      console.log('Roboflow detection results:', data.predictions?.length || 0, 'elements detected');
      return data.predictions || [];
    } catch (error) {
      console.error('Roboflow API error:', error);
      return [];
    }
  }

  async detectWithCustomModel(imageData: string, modelEndpoint: string): Promise<RoboflowDetection[]> {
    if (!this.apiKey) {
      console.warn('Roboflow API key not available, skipping UI detection');
      return [];
    }

    try {
      const base64Data = imageData.split(',')[1];
      if (!base64Data) {
        throw new Error('Invalid image data format');
      }

      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'image/jpeg' });

      const formData = new FormData();
      formData.append('file', blob, 'screenshot.jpg');

      const response = await fetch(`${this.baseURL}/${modelEndpoint}?api_key=${this.apiKey}&confidence=0.3&overlap=0.5`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Roboflow API error:', response.status, errorText);
        return [];
      }

      const data: RoboflowResponse = await response.json();
      return data.predictions || [];
    } catch (error) {
      console.error('Roboflow API error:', error);
      return [];
    }
  }

  // Helper method to filter detections by confidence
  filterByConfidence(detections: RoboflowDetection[], minConfidence: number = 0.5): RoboflowDetection[] {
    return detections.filter(detection => detection.confidence >= minConfidence);
  }

  // Helper method to group detections by class
  groupByClass(detections: RoboflowDetection[]): Record<string, RoboflowDetection[]> {
    return detections.reduce((groups, detection) => {
      const className = detection.class;
      if (!groups[className]) {
        groups[className] = [];
      }
      groups[className].push(detection);
      return groups;
    }, {} as Record<string, RoboflowDetection[]>);
  }

  // Get summary of detected elements
  getDetectionSummary(detections: RoboflowDetection[]): string {
    const grouped = this.groupByClass(detections);
    const summary = Object.entries(grouped)
      .map(([className, elements]) => `${elements.length} ${className}(s)`)
      .join(', ');
    
    return summary || 'No UI elements detected';
  }
}

export const roboflowService = new RoboflowService();