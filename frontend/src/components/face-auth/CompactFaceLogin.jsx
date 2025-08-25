/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import { useState, useRef, useEffect } from 'react';
import * as faceapi from 'face-api.js';
import { toast } from 'react-toastify';
import CryptoJS from 'crypto-js';

const CompactFaceLogin = ({ onLoginSuccess, onClose, onNoFaceRegistered }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [status, setStatus] = useState('initializing'); // initializing, ready, scanning, success, failed

  const videoRef = useRef();
  const streamRef = useRef(null);

  useEffect(() => {
    loadModels();
    return () => {
      stopCamera();
    };
  }, []);

  // Additional cleanup when component closes
  useEffect(() => {
    return () => {
      // Stop stream from ref
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => {
          track.stop();
        });
        streamRef.current = null;
      }
      
      // Stop stream from video element
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach(track => {
          track.stop();
        });
        videoRef.current.srcObject = null;
      }
    };
  }, []);

  const loadModels = async () => {
    try {
      setIsLoading(true);
      setStatus('initializing');
      
      const MODEL_URL = '/models';
      
      await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
      await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
      await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
      
      setModelsLoaded(true);
      setStatus('ready');
      
    } catch (error) {
      setStatus('ready');
      
    } finally {
      setIsLoading(false);
    }
  };

  const startCamera = async () => {
    try {
      // Stop any existing camera first
      stopCamera();
      
      // Mobile-optimized camera settings
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      
      const constraints = {
        video: {
          width: { ideal: isMobile ? 240 : 320 },
          height: { ideal: isMobile ? 180 : 240 },
          facingMode: 'user',
          frameRate: { ideal: isMobile ? 8 : 10, max: isMobile ? 12 : 15 }
        }
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      // Store stream reference
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        
        return new Promise((resolve) => {
          videoRef.current.onloadedmetadata = () => {
            resolve();
          };
        });
      }
    } catch (error) {
      toast.error('Camera access denied');
      setStatus('failed');
      setTimeout(() => {
        stopCamera();
        onClose();
      }, 2000);
    }
  };

  const stopCamera = () => {
    // Stop stream from ref first
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
      });
      streamRef.current = null;
    }
    
    // Stop stream from video element
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => {
        track.stop();
      });
      videoRef.current.srcObject = null;
    }
    
    // Reset video element
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };


  
  const startFaceDetection = async () => {
    setStatus('scanning');
    
    try {
      // Start camera first
      await startCamera();
      
      // Reduced wait time for faster response
      setTimeout(async () => {
        await detectAndAuthenticate();
      }, 1000);
      
    } catch (error) {
      setStatus('failed');
      toast.error('Face detection failed');
      setTimeout(() => {
        stopCamera();
        onClose();
      }, 3000);
    }
  };
  
  const detectAndAuthenticate = async () => {
    try {
      if (!videoRef.current || !modelsLoaded) {
        throw new Error('Camera or models not ready');
      }
      
      console.log('🔍 Detecting face in video...');
      
      // Mobile-optimized face detection
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      
      const detectionOptions = new faceapi.TinyFaceDetectorOptions({
        inputSize: isMobile ? 160 : 224, // Even smaller for mobile
        scoreThreshold: isMobile ? 0.4 : 0.3 // Stricter for mobile security
      });
      
      // Detect face with landmarks and descriptor
      const detection = await faceapi
        .detectSingleFace(videoRef.current, detectionOptions)
        .withFaceLandmarks()
        .withFaceDescriptor();
      
      if (!detection) {
        setStatus('failed');
        toast.error('❌ No face detected! Please position your face in front of camera.');
        setTimeout(() => {
          stopCamera();
          onClose();
        }, 3000);
        return;
      }
      
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${API_URL}/face-auth/login-face`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ faceDescriptor: Array.from(detection.descriptor) }),
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
        
        setStatus('success');
        toast.success(`🎉 Face ID Success! Welcome ${data.user.name}!`);
        
        // Stop camera immediately
        stopCamera();
        
        setTimeout(() => {
          onLoginSuccess(data.user);
        }, 1000);
      } else {
        setStatus('failed');
        
        if (data.message && data.message.includes('not recognized')) {
          toast.error('❌ Face not recognized! Only registered users can login.');
        } else if (data.message && data.message.includes('No registered faces')) {
          toast.error('❌ No faces registered in system. Please register first.');
          setTimeout(() => {
            stopCamera();
            onNoFaceRegistered();
          }, 3000);
          return;
        } else {
          toast.error(data.message || '❌ Face authentication failed!');
        }
        
        setTimeout(() => {
          stopCamera();
          onClose();
        }, 3000);
      }
    } catch (error) {
      setStatus('failed');
      toast.error('❌ Face authentication failed!');
      setTimeout(() => {
        stopCamera();
        onClose();
      }, 3000);
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'initializing':
        return <div className="animate-spin text-2xl">⚙️</div>;
      case 'ready':
        return <div className="text-2xl">👤</div>;
      case 'scanning':
        return <div className="animate-pulse text-2xl">🔍</div>;
      case 'success':
        return <div className="text-2xl text-green-500">✅</div>;
      case 'failed':
        return <div className="text-2xl text-red-500">❌</div>;
      default:
        return <div className="text-2xl">👤</div>;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'initializing':
        return 'Loading Face ID...';
      case 'ready':
        return 'Ready to scan your face';
      case 'scanning':
        return 'Position your face in the camera';
      case 'success':
        return 'Face recognized! Logging in...';
      case 'failed':
        return 'Face not recognized';
      default:
        return 'Face ID';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-3xl shadow-2xl p-6 w-80 text-center border border-gray-200">
        {/* Video for face detection */}
        {status === 'scanning' && (
          <div className="mb-4">
            <video
              ref={videoRef}
              autoPlay
              muted
              className="w-48 h-36 mx-auto rounded-lg border-2 border-[#FDA92D]"
            />
          </div>
        )}
        
        {/* Face ID Icon */}
        <div className="mb-4">
          <div className="w-20 h-20 mx-auto bg-[#FDA92D] rounded-full flex items-center justify-center shadow-lg">
            {getStatusIcon()}
          </div>
        </div>

        {/* Status Text */}
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Face ID</h3>
        <p className="text-sm text-gray-600 mb-6">{getStatusText()}</p>

        {/* Progress indicator */}
        {status === 'scanning' && (
          <div className="mb-4">
            <div className="w-full bg-gray-200 rounded-full h-1">
              <div className="bg-[#FDA92D] h-1 rounded-full animate-pulse" style={{ width: '70%' }}></div>
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex justify-center space-x-4 mb-4">
          {status === 'ready' && (
            <button
              onClick={startFaceDetection}
              className="bg-[#FDA92D] text-white px-6 py-2 rounded-full hover:bg-[#FED680] transition-colors"
            >
              Start Face ID
            </button>
          )}
        </div>

        {/* Cancel button */}
        <button
          onClick={() => {
            stopCamera();
            onClose();
          }}
          className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default CompactFaceLogin;

