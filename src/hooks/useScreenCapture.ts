import { useState, useRef, useCallback } from 'react';

export const useScreenCapture = () => {
  const [isCapturing, setIsCapturing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCapture = useCallback(async (): Promise<MediaStream | null> => {
    try {
      setError(null);
      const captureStream = await navigator.mediaDevices.getDisplayMedia({
        video: { 
          mediaSource: 'screen',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false
      });

      streamRef.current = captureStream;
      setStream(captureStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = captureStream;
        videoRef.current.play();
      }

      setIsCapturing(true);

      // Handle stream end
      captureStream.getVideoTracks()[0].addEventListener('ended', () => {
        stopCapture();
      });

      return captureStream;
    } catch (err) {
      setError('Failed to start screen capture. Please ensure you have the necessary permissions.');
      console.error('Screen capture error:', err);
      return null;
    }
  }, []);

  const stopCapture = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setStream(null);
    setIsCapturing(false);
  }, []);

  const captureFrame = useCallback((): Promise<string> => {
    return new Promise((resolve) => {
      if (!videoRef.current) {
        resolve('');
        return;
      }

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve('');
        return;
      }

      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      ctx.drawImage(videoRef.current, 0, 0);
      
      resolve(canvas.toDataURL('image/jpeg', 0.8));
    });
  }, []);

  return {
    isCapturing,
    error,
    stream,
    videoRef,
    startCapture,
    stopCapture,
    captureFrame
  };
};