/* eslint-disable react/no-unescaped-entities */
/* eslint-disable react/prop-types */
import { useState, useRef, useEffect } from 'react';
import * as faceapi from 'face-api.js';
import { toast } from 'react-toastify';

const FaceRegistration = ({ userEmail, onClose, onSuccess }) => {
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
      toast.success('Face recognition models loaded');
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

  const registerFace = async () => {
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

      const faceDescriptor = Array.from(detections.descriptor);

      const response = await fetch(`${import.meta.env.VITE_API_URL.replace('/api', '')}/api/face-auth/register-face`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email: userEmail, 
          faceDescriptor 
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Face registered successfully!');
        stopCamera();
        onSuccess();
      } else {
        toast.error(data.message || 'Face registration failed');
      }
    } catch (error) {
      console.error('Face registration error:', error);
      toast.error('Face registration failed');
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
              <span className="text-white text-xl">🔒</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Face Registration</h2>
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

        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Position your face clearly in the camera and click "Register Face" to enable face login.
          </p>

          {!modelsLoaded ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p>Loading face recognition models...</p>
            </div>
          ) : (
            <>
              <div className="relative">
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  className="w-full h-64 bg-gray-200 rounded-lg object-cover"
                />
                <canvas
                  ref={canvasRef}
                  className="absolute top-0 left-0 w-full h-full"
                />
              </div>

              <div className="flex gap-2">
                {!isCapturing ? (
                  <button
                    onClick={startCamera}
                    className="flex-1 bg-[#FDA92D] text-white py-3 rounded-full hover:bg-[#FED680] active:bg-[#B66816] transition relative"
                  >
                    Start Camera
                  </button>
                ) : (
                  <>
                    <button
                      onClick={registerFace}
                      disabled={isLoading}
                      className="flex-1 bg-[#FDA92D] text-white py-3 rounded-full hover:bg-[#FED680] active:bg-[#B66816] transition relative disabled:opacity-50"
                    >
                      {isLoading ? 'Processing...' : 'Register Face'}
                    </button>
                    <button
                      onClick={stopCamera}
                      className="px-4 py-3 bg-gray-500 text-white rounded-full hover:bg-gray-600 transition relative"
                    >
                      Stop
                    </button>
                  </>
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