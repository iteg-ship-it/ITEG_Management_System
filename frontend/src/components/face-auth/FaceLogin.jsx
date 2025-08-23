/* eslint-disable react/prop-types */
import { useState, useRef, useEffect } from 'react';
import * as faceapi from 'face-api.js';
import { toast } from 'react-toastify';
import CryptoJS from 'crypto-js';

const FaceLogin = ({ onLoginSuccess, onClose }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const videoRef = useRef();
  const canvasRef = useRef();

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
      console.error('Error loading models:', error);
      toast.error('Failed to load face recognition models');
    } finally {
      setIsLoading(false);
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 640, height: 480 } 
      });
      videoRef.current.srcObject = stream;
      setIsCapturing(true);
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast.error('Failed to access camera');
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCapturing(false);
  };

  const captureAndLogin = async () => {
    if (!modelsLoaded || !videoRef.current) {
      toast.error('Camera or models not ready');
      return;
    }

    try {
      setIsLoading(true);
      
      const detections = await faceapi
        .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!detections) {
        toast.error('No face detected. Please position your face clearly in the camera.');
        return;
      }

      // Liveness detection - check for real face vs photo
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      ctx.drawImage(videoRef.current, 0, 0);
      
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const pixels = imageData.data;
      
      // Check for pixel variation (photos have less variation)
      let variation = 0;
      for (let i = 0; i < pixels.length; i += 4) {
        const r = pixels[i];
        const g = pixels[i + 1];
        const b = pixels[i + 2];
        variation += Math.abs(r - g) + Math.abs(g - b) + Math.abs(b - r);
      }
      
      const avgVariation = variation / (pixels.length / 4);
      if (avgVariation < 10) {
        toast.error('Please use live camera, not a photo!');
        return;
      }

      const faceDescriptor = Array.from(detections.descriptor);

      const response = await fetch(`${import.meta.env.VITE_API_URL.replace('/api', '')}/api/face-auth/login-face`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ faceDescriptor }),
      });

      const data = await response.json();

      if (data.success) {
        const secretKey = "ITEG@123";
        const encryptedToken = CryptoJS.AES.encrypt(data.token, secretKey).toString();
        
        localStorage.setItem('token', encryptedToken);
        localStorage.setItem('role', data.user.role);
        localStorage.setItem('positionRole', data.user.position);
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('userEmail', data.user.email);
        localStorage.setItem('userName', data.user.name);
        
        const roleText = data.user.role === 'superadmin' ? 'Super Admin' : 
                        data.user.role === 'admin' ? 'Admin' : 'Faculty';
        toast.success(`Face login successful! Welcome ${data.user.name} (${roleText})`);
        stopCamera();
        onLoginSuccess(data.user);
      } else {
        toast.error(data.message || 'Face not recognized');
      }
    } catch (error) {
      console.error('Face login error:', error);
      toast.error('Face login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-lg w-full mx-4 border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-[#FDA92D] to-[#FED680] rounded-full flex items-center justify-center">
              <span className="text-white text-xl">👤</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Face Authentication</h2>
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
              <div className="relative">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#FDA92D] border-t-transparent mx-auto mb-4"></div>
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#FDA92D] to-[#FED680] opacity-20 animate-pulse"></div>
              </div>
              <p className="text-gray-600 font-medium">Initializing Face Recognition...</p>
              <p className="text-sm text-gray-500 mt-2">Please wait while we load the AI models</p>
            </div>
          ) : (
            <>
              <div className="relative overflow-hidden rounded-xl border-4 border-gradient-to-r from-[#FDA92D] to-[#FED680] shadow-lg">
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  className="w-full h-80 bg-gradient-to-br from-gray-100 to-gray-200 object-cover"
                />
                <canvas
                  ref={canvasRef}
                  className="absolute top-0 left-0 w-full h-full"
                />
                <div className="absolute top-4 left-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm font-medium">
                  🔴 Live Camera
                </div>
              </div>

              <div className="text-center space-y-4">
                {!isCapturing ? (
                  <button
                    onClick={startCamera}
                    className="w-full bg-[#FDA92D] text-white py-3 rounded-full hover:bg-[#FED680] active:bg-[#B66816] transition relative"
                  >
                    📹 Start Camera
                  </button>
                ) : (
                  <div className="space-y-3">
                    <div className="flex gap-3">
                      <button
                        onClick={captureAndLogin}
                        disabled={isLoading}
                        className="flex-1 bg-[#FDA92D] text-white py-3 rounded-full hover:bg-[#FED680] active:bg-[#B66816] transition relative disabled:opacity-50"
                      >
                        {isLoading ? '🔄 Processing...' : '✅ Authenticate'}
                      </button>
                      <button
                        onClick={stopCamera}
                        className="px-6 py-3 bg-gray-500 text-white rounded-full hover:bg-gray-600 transition relative"
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

export default FaceLogin;