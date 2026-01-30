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

  // Check if token is valid before starting timeout logic
  let isValidToken = false;
  try {
    const decryptedToken = CryptoJS.AES.decrypt(token, secretKey).toString(CryptoJS.enc.Utf8);
    if (decryptedToken && decryptedToken.includes('.')) {
      const payload = JSON.parse(atob(decryptedToken.split('.')[1]));
      const currentTime = Date.now() / 1000;
      isValidToken = payload.exp > currentTime;
    }
  } catch (error) {
    // Invalid token, don't show timeout modal
    return { showModal: false, handleContinue: () => {}, handleLogout: () => {} };
  }

  if (!isValidToken) {
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
      const refreshToken = decrypt(encryptedRefreshToken);
      
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
        if (!decryptedToken || !decryptedToken.includes('.')) {
          return; // Don't logout, just skip check
        }
        
        const payload = JSON.parse(atob(decryptedToken.split('.')[1]));
        const currentTime = Date.now() / 1000;
        const timeUntilExpiry = payload.exp - currentTime;

        // Only show modal if token expires in exactly 5 minutes (300 seconds)
        // and token is still valid
        if (timeUntilExpiry > 0 && timeUntilExpiry <= 300) {
          setShowModal(true);
        } else if (timeUntilExpiry <= 0) {
          // Auto logout if token expired
          handleLogout();
        }
      } catch (error) {
        // Don't logout on parsing error, just skip
        console.warn('Token parsing skipped:', error.message);
      }
    };

    // Start checking after 50 minutes (3000 seconds) to avoid immediate popup
    const initialDelay = setTimeout(() => {
      checkTokenExpiry();
      // Then check every minute
      const interval = setInterval(checkTokenExpiry, 60000);
      
      // Store interval ID for cleanup
      window.sessionTimeoutInterval = interval;
    }, 3000000); // 50 minutes delay

    return () => {
      clearTimeout(initialDelay);
      if (window.sessionTimeoutInterval) {
        clearInterval(window.sessionTimeoutInterval);
      }
    };
  }, [handleLogout]);

  return {
    showModal,
    handleContinue,
    handleLogout
  };
};