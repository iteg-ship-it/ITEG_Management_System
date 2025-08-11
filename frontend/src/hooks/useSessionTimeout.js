import { useState, useEffect, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { logout } from '../redux/auth/authSlice';
import { authApi } from '../redux/api/authApi';
import CryptoJS from 'crypto-js';

const secretKey = "ITEG@123";
const encrypt = (text) => CryptoJS.AES.encrypt(text, secretKey).toString();
const decrypt = (text) => CryptoJS.AES.decrypt(text, secretKey).toString(CryptoJS.enc.Utf8);

export const useSessionTimeout = () => {
  const [showModal, setShowModal] = useState(false);
  const dispatch = useDispatch();
  
  // Only run on authenticated pages
  const token = localStorage.getItem('token');
  if (!token) {
    return { showModal: false, handleContinue: () => {}, handleLogout: () => {} };
  }

  const handleLogout = useCallback(() => {
    dispatch(logout());
    localStorage.clear();
    setShowModal(false);
    window.location.href = '/login';
  }, [dispatch]);

  const handleContinue = useCallback(async () => {
    const encryptedRefreshToken = localStorage.getItem('refreshToken');
    
    if (!encryptedRefreshToken) {
      handleLogout();
      return;
    }

    try {
      // Decrypt refresh token before sending
      const refreshToken = CryptoJS.AES.decrypt(encryptedRefreshToken, secretKey).toString(CryptoJS.enc.Utf8);
      
      if (!refreshToken) {
        handleLogout();
        return;
      }

      const result = await dispatch(
        authApi.endpoints.refreshToken.initiate({ refreshToken })
      ).unwrap();

      if (result?.accessToken) {
        localStorage.setItem('token', encrypt(result.accessToken));
        setShowModal(false);
        console.log('✅ Token refreshed successfully');
      } else {
        throw new Error('Invalid refresh response');
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      handleLogout();
    }
  }, [dispatch, handleLogout]);

  useEffect(() => {
    const checkTokenExpiry = () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        const decryptedToken = CryptoJS.AES.decrypt(token, secretKey).toString(CryptoJS.enc.Utf8);
        if (!decryptedToken) {
          handleLogout();
          return;
        }
        
        const payload = JSON.parse(atob(decryptedToken.split('.')[1]));
        const currentTime = Date.now() / 1000;
        const timeUntilExpiry = payload.exp - currentTime;

        // Show modal 30 seconds before expiry for testing
        if (timeUntilExpiry <= 30 && timeUntilExpiry > -60) {
          setShowModal(true);
        } else if (timeUntilExpiry <= -60) {
          // Auto logout if token expired more than 1 minute ago
          handleLogout();
        }
      } catch (error) {
        console.error('Token parsing error:', error);
        handleLogout();
      }
    };

    // Check every 30 seconds for more responsive behavior
    const interval = setInterval(checkTokenExpiry, 30000);
    checkTokenExpiry(); // Initial check

    return () => clearInterval(interval);
  }, [handleLogout]);

  return {
    showModal,
    handleContinue,
    handleLogout
  };
};