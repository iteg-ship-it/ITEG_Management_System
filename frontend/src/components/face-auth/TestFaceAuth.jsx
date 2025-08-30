/* eslint-disable react/prop-types */
import { useState } from 'react';
import { toast } from 'react-toastify';
import CryptoJS from 'crypto-js';

const TestFaceAuth = ({ onLoginSuccess, onClose }) => {
  const [isLoading, setIsLoading] = useState(false);

  const testFaceAuth = async () => {
    setIsLoading(true);
    try {
      // Use exact same descriptor generation logic as in testFaceAuth.js
      const seed = 12345; // Fixed seed for consistent results
      const testDescriptor = Array.from({length: 128}, (_, i) => {
        // Simple seeded random number generator
        const x = Math.sin(seed + i) * 10000;
        return (x - Math.floor(x)) * 2 - 1;
      });
      
      console.log('Testing face auth with descriptor length:', testDescriptor.length);
      console.log('First 5 values:', testDescriptor.slice(0, 5));
      
      const response = await fetch('http://localhost:5000/api/face-auth/login-face', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ faceDescriptor: testDescriptor }),
      });

      const data = await response.json();
      console.log('Test API Response:', data);

      if (data.success) {
        const secretKey = "ITEG@123";
        const encryptedToken = CryptoJS.AES.encrypt(data.token, secretKey).toString();
        
        localStorage.setItem('token', encryptedToken);
        localStorage.setItem('role', data.user.role);
        localStorage.setItem('positionRole', data.user.position);
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('userEmail', data.user.email);
        localStorage.setItem('userName', data.user.name);
        
        toast.success(`🎉 Test login successful! Welcome ${data.user.name}!`);
        onLoginSuccess(data.user);
      } else {
        toast.error('Test failed: ' + data.message);
      }
    } catch (error) {
      console.error('Test error:', error);
      toast.error('Test failed: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4">
        <h2 className="text-xl font-bold text-center mb-6">Test Face Authentication</h2>
        
        <div className="space-y-4">
          <button
            onClick={testFaceAuth}
            disabled={isLoading}
            className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 disabled:opacity-50"
          >
            {isLoading ? 'Testing...' : 'Test Face Login'}
          </button>
          
          <button
            onClick={onClose}
            className="w-full bg-gray-500 text-white py-3 rounded-lg hover:bg-gray-600"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default TestFaceAuth;