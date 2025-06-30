interface MousePosition {
  x: number;
  y: number;
  timestamp: number;
}

interface ClickEvent {
  x: number;
  y: number;
  timestamp: number;
  button: 'left' | 'right' | 'middle';
}

class MouseTrackingService {
  private mousePositions: MousePosition[] = [];
  private clickEvents: ClickEvent[] = [];
  private isTracking = false;
  private maxHistoryLength = 100;

  startTracking(): void {
    if (this.isTracking) return;

    this.isTracking = true;
    
    // Track mouse movement
    document.addEventListener('mousemove', this.handleMouseMove);
    
    // Track clicks
    document.addEventListener('click', this.handleClick);
    document.addEventListener('contextmenu', this.handleRightClick);
    document.addEventListener('auxclick', this.handleMiddleClick);
  }

  stopTracking(): void {
    this.isTracking = false;
    
    document.removeEventListener('mousemove', this.handleMouseMove);
    document.removeEventListener('click', this.handleClick);
    document.removeEventListener('contextmenu', this.handleRightClick);
    document.removeEventListener('auxclick', this.handleMiddleClick);
  }

  private handleMouseMove = (event: MouseEvent): void => {
    const position: MousePosition = {
      x: event.clientX,
      y: event.clientY,
      timestamp: Date.now()
    };

    this.mousePositions.push(position);
    
    // Keep only recent positions
    if (this.mousePositions.length > this.maxHistoryLength) {
      this.mousePositions.shift();
    }
  };

  private handleClick = (event: MouseEvent): void => {
    const clickEvent: ClickEvent = {
      x: event.clientX,
      y: event.clientY,
      timestamp: Date.now(),
      button: 'left'
    };

    this.clickEvents.push(clickEvent);
    
    if (this.clickEvents.length > this.maxHistoryLength) {
      this.clickEvents.shift();
    }
  };

  private handleRightClick = (event: MouseEvent): void => {
    const clickEvent: ClickEvent = {
      x: event.clientX,
      y: event.clientY,
      timestamp: Date.now(),
      button: 'right'
    };

    this.clickEvents.push(clickEvent);
    
    if (this.clickEvents.length > this.maxHistoryLength) {
      this.clickEvents.shift();
    }
  };

  private handleMiddleClick = (event: MouseEvent): void => {
    if (event.button === 1) { // Middle mouse button
      const clickEvent: ClickEvent = {
        x: event.clientX,
        y: event.clientY,
        timestamp: Date.now(),
        button: 'middle'
      };

      this.clickEvents.push(clickEvent);
      
      if (this.clickEvents.length > this.maxHistoryLength) {
        this.clickEvents.shift();
      }
    }
  };

  getCurrentPosition(): MousePosition | null {
    return this.mousePositions.length > 0 
      ? this.mousePositions[this.mousePositions.length - 1] 
      : null;
  }

  getRecentPositions(seconds: number = 5): MousePosition[] {
    const cutoffTime = Date.now() - (seconds * 1000);
    return this.mousePositions.filter(pos => pos.timestamp > cutoffTime);
  }

  getRecentClicks(seconds: number = 10): ClickEvent[] {
    const cutoffTime = Date.now() - (seconds * 1000);
    return this.clickEvents.filter(click => click.timestamp > cutoffTime);
  }

  getMousePath(seconds: number = 5): MousePosition[] {
    return this.getRecentPositions(seconds);
  }

  clearHistory(): void {
    this.mousePositions = [];
    this.clickEvents = [];
  }

  getAnalyticsData(): {
    currentPosition: MousePosition | null;
    recentPath: MousePosition[];
    recentClicks: ClickEvent[];
    isActive: boolean;
  } {
    return {
      currentPosition: this.getCurrentPosition(),
      recentPath: this.getRecentPositions(3),
      recentClicks: this.getRecentClicks(5),
      isActive: this.isTracking
    };
  }
}

export const mouseTrackingService = new MouseTrackingService();