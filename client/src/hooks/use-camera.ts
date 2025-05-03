import { useState, useRef, useEffect } from "react";

interface CameraOptions {
  width?: number;
  height?: number;
  facingMode?: "user" | "environment";
}

interface CameraState {
  stream: MediaStream | null;
  videoRef: React.RefObject<HTMLVideoElement>;
  photo: string | null;
  error: string | null;
  loading: boolean;
}

export function useCamera(options: CameraOptions = {}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const defaultOptions = {
    width: 640,
    height: 480,
    facingMode: "environment" as const,
    ...options,
  };

  const startCamera = async () => {
    setLoading(true);
    setError(null);
    try {
      const constraints = {
        video: {
          width: { ideal: defaultOptions.width },
          height: { ideal: defaultOptions.height },
          facingMode: defaultOptions.facingMode,
        },
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      setError(getCameraErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const takePhoto = () => {
    if (!videoRef.current || !stream) {
      setError("Camera is not initialized");
      return null;
    }

    try {
      const video = videoRef.current;
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        throw new Error("Could not get canvas context");
      }

      // Draw the video frame to the canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Convert to base64 data URL
      const dataUrl = canvas.toDataURL("image/jpeg");
      setPhoto(dataUrl);
      return dataUrl;
    } catch (err) {
      console.error("Error taking photo:", err);
      setError("Failed to capture photo");
      return null;
    }
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return {
    videoRef,
    stream,
    photo,
    error,
    loading,
    startCamera,
    stopCamera,
    takePhoto,
    setPhoto,
  };
}

// Helper function to get a more user-friendly error message
function getCameraErrorMessage(error: any): string {
  if (error.name === "NotAllowedError" || error.name === "PermissionDeniedError") {
    return "Camera access was denied. Please allow camera access in your browser settings.";
  }
  if (error.name === "NotFoundError") {
    return "No camera found. Please connect a camera and try again.";
  }
  if (error.name === "NotReadableError" || error.name === "TrackStartError") {
    return "Camera is already in use by another application.";
  }
  if (error.name === "OverconstrainedError") {
    return "The requested camera settings are not supported.";
  }
  if (error.name === "TypeError") {
    return "No camera available or invalid constraints.";
  }
  return "An error occurred while trying to access the camera: " + (error.message || "Unknown error");
}
