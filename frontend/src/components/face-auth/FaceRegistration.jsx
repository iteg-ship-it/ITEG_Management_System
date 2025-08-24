/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import { useState, useRef, useEffect, useCallback } from 'react';
import * as faceapi from 'face-api.js';
import { toast } from 'react-toastify';

const FaceRegistration = ({ email, onRegistrationSuccess, onClose }) => {
  
  const [isLoading, setIsLoading] = useState(false);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [capturedFaces, setCapturedFaces] = useState([]);
  const videoRef = useRef();
  const canvasRef = useRef();
  const detectionInterval = useRef();

  useEffect(() => {
    loadModels();
    return () => {
      stopCamera();
    };
  }, []);

  const loadModels = async () => {
    try {
      setIsLoading(true);
      const MODEL_URL = '/models';
      
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
      ]);
      
      setModelsLoaded(true);
    } catch (error) {
      toast.error('Failed to load face recognition models');
    } finally {
      setIsLoading(false);
    }
  };

  const detectFace = useCallback(async () => {
    if (!modelsLoaded || !videoRef.current) return;

    try {
      // Mobile-optimized face detection
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      
      const detectionOptions = new faceapi.TinyFaceDetectorOptions({
        inputSize: isMobile ? 224 : 416,
        scoreThreshold: isMobile ? 0.3 : 0.5
      });
      
      const detections = await faceapi
        .detectSingleFace(videoRef.current, detectionOptions)
        .withFaceLandmarks();

      if (detections) {
        setFaceDetected(true);
        const canvas = canvasRef.current;
        const displaySize = { width: videoRef.current.videoWidth, height: videoRef.current.videoHeight };
        faceapi.matchDimensions(canvas, displaySize);
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        ctx.strokeStyle = '#10B981';
        ctx.lineWidth = 3;
        const box = detections.detection.box;
        ctx.strokeRect(box.x, box.y, box.width, box.height);
      } else {
        setFaceDetected(false);
        const ctx = canvasRef.current?.getContext('2d');
        if (ctx) ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
    } catch (error) {
      // Silent error handling
    }
  }, [modelsLoaded]);

  const startFaceDetection = useCallback(() => {
    if (detectionInterval.current) clearInterval(detectionInterval.current);
    detectionInterval.current = setInterval(detectFace, 100);
  }, [detectFace]);

  const stopFaceDetection = useCallback(() => {
    if (detectionInterval.current) {
      clearInterval(detectionInterval.current);
      detectionInterval.current = null;
    }
  }, []);

  const startCamera = async () => {
    try {
      // Mobile-optimized camera settings
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      
      const constraints = {
        video: {
          width: { ideal: isMobile ? 480 : 640 },
          height: { ideal: isMobile ? 640 : 480 },
          facingMode: 'user',
          frameRate: { ideal: 15, max: 30 }
        }
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      videoRef.current.srcObject = stream;
      setIsCapturing(true);
      
      videoRef.current.onloadedmetadata = () => {
        startFaceDetection();
      };
    } catch (error) {
      toast.error('Failed to access camera. Please check permissions.');
    }
  };

  const stopCamera = () => {
    stopFaceDetection();
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCapturing(false);
    setFaceDetected(false);
  };

  const captureFace = async () => {
    if (!modelsLoaded || !videoRef.current || !faceDetected) {
      toast.error('Please position your face clearly in the camera');
      return;
    }

    try {
      setIsLoading(true);
      
      // Mobile-optimized face detection for capture
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      
      const detectionOptions = new faceapi.TinyFaceDetectorOptions({
        inputSize: isMobile ? 224 : 416,
        scoreThreshold: isMobile ? 0.3 : 0.5
      });
      
      const detections = await faceapi
        .detectSingleFace(videoRef.current, detectionOptions)
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!detections) {
        toast.error('No face detected during capture');
        return;
      }

      const faceDescriptor = Array.from(detections.descriptor);
      setCapturedFaces(prev => [...prev, faceDescriptor]);
      
      toast.success(`Face ${capturedFaces.length + 1}/3 captured successfully!`);
      
      if (capturedFaces.length >= 2) {
        await registerFaces([...capturedFaces, faceDescriptor]);
      }
    } catch (error) {
      toast.error('Failed to capture face');
    } finally {
      setIsLoading(false);
    }
  };

  const registerFaces = async (faces) => {
    try {
      setIsLoading(true);
      
      // Validate email prop
      if (!email || email.trim() === '') {
        toast.error('Please provide a valid email for face registration');
        return;
      }
      
      // Average the face descriptors for better accuracy
      const avgDescriptor = new Array(128).fill(0);
      faces.forEach(face => {
        face.forEach((val, idx) => {
          avgDescriptor[idx] += val;
        });
      });
      avgDescriptor.forEach((val, idx) => {
        avgDescriptor[idx] = val / faces.length;
      });

      const registrationEmail = email.trim();
      const payload = { 
        email: registrationEmail, 
        faceDescriptor: avgDescriptor 
      };
      
      // Registering face for user

      const response = await fetch('http://localhost:5000/api/face-auth/register-face', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Face registered successfully! You can now use face login.');
        stopCamera();
        onRegistrationSuccess();
      } else {
        toast.error(data.message || 'Face registration failed');
      }
    } catch (error) {
      toast.error('Face registration failed: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-lg w-full mx-4 border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#FDA92D] rounded-full flex items-center justify-center">
              <span className="text-white text-xl">📷</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Register Face</h2>
          </div>
          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 hover:text-gray-800 transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="space-y-6">
          {!modelsLoaded ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#FDA92D] border-t-transparent mx-auto mb-4"></div>
              <p className="text-gray-600 font-medium">Loading Face Recognition...</p>
            </div>
          ) : (
            <>
              <div className="relative overflow-hidden rounded-xl border-4 border-[#FDA92D] shadow-lg">
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  className="w-full h-80 bg-gradient-to-br from-gray-100 to-gray-200 object-cover"
                />
                <canvas
                  ref={canvasRef}
                  className="absolute top-0 left-0 w-full h-full pointer-events-none"
                />
                
                <div className="absolute top-4 left-4 flex gap-2">
                  <div className="bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${isCapturing ? 'bg-red-500 animate-pulse' : 'bg-gray-400'}`}></div>
                    {isCapturing ? 'Live' : 'Offline'}
                  </div>
                  {faceDetected && (
                    <div className="bg-green-500 bg-opacity-90 text-white px-3 py-1 rounded-full text-sm font-medium">
                      ✓ Face Detected
                    </div>
                  )}
                </div>
                
                <div className="absolute top-4 right-4 bg-[#FDA92D] bg-opacity-90 text-white px-3 py-1 rounded-full text-sm font-medium">
                  {capturedFaces.length}/3 Captured
                </div>
              </div>

              <div className="text-center space-y-4">
                {!isCapturing ? (
                  <button
                    onClick={startCamera}
                    className="w-full bg-[#FDA92D] text-white py-3 rounded-full hover:bg-[#FED680] transition"
                  >
                    📹 Start Camera
                  </button>
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm text-gray-600">
                      Capture your face from 3 different angles for better recognition
                    </p>
                    <div className="flex gap-3">
                      <button
                        onClick={captureFace}
                        disabled={isLoading || !faceDetected || capturedFaces.length >= 3}
                        className="flex-1 bg-[#FDA92D] text-white py-3 rounded-full hover:bg-[#FED680] transition disabled:opacity-50"
                      >
                        {isLoading ? '📸 Capturing...' : '📸 Capture Face'}
                      </button>
                      <button
                        onClick={stopCamera}
                        className="px-6 py-3 bg-gray-500 text-white rounded-full hover:bg-gray-600 transition"
                      >
                        ❌ Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default FaceRegistration;